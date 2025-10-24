# AutomatedPersonSearch/backend/app.py
import os
import time
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS 

from .config import UPLOAD_FOLDER, CROPS_FOLDER, REPORTS_FOLDER, FLASK_SECRET_KEY
from .database_module import create_tables
from .video_processing.video_utils import get_reference_embedding, process_video_and_search
from .report_generation.generate_report import generate_report

# --- APP SETUP ---
# Configure static folder to serve 'static/crops' for preview images
app = Flask(__name__, static_url_path='/static', static_folder=str(CROPS_FOLDER.parent.parent / 'static')) 
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.secret_key = FLASK_SECRET_KEY
CORS(app) # Enable CORS for React frontend on a different port

# Initialize database
create_tables() 

# --- API ROUTES ---

@app.route('/api/upload_and_search', methods=['POST'])
def upload_and_search():
    """Handles file upload, starts the search, and returns results."""
    if 'video' not in request.files or 'reference_image' not in request.files:
        return jsonify({"error": "Missing video or reference image file"}), 400

    video_file = request.files['video']
    ref_file = request.files['reference_image']

    video_filename = secure_filename(video_file.filename)
    # Append timestamp to prevent name collision
    unique_video_filename = f"{time.time()}_{video_filename}" 

    # Save files
    video_path = UPLOAD_FOLDER / unique_video_filename
    ref_path = UPLOAD_FOLDER / secure_filename(ref_file.filename)
    
    video_file.save(str(video_path))
    ref_file.save(str(ref_path))

    try:
        # 1. Get Reference Embedding
        ref_embedding = get_reference_embedding(str(ref_path))
        
        # 2. Process Video and Search
        results = process_video_and_search(video_path, ref_embedding, unique_video_filename)

        return jsonify({
            "message": "Search complete",
            "video_filename": unique_video_filename,
            "detections_count": len(results),
            "results": results
        })

    except Exception as e:
        # Log the error on the server side
        print(f"Error during processing: {e}")
        return jsonify({"error": f"Processing failed. Check server logs for details. ({str(e)})"}), 500

@app.route('/api/report/<video_filename>/<report_type>', methods=['GET'])
def download_report(video_filename, report_type):
    """Generates and serves CSV or PDF reports."""
    report_path, mime_type = generate_report(video_filename, report_type)
    
    if report_path and os.path.exists(report_path):
        # send_file requires absolute path
        return send_file(report_path, 
                         as_attachment=True, 
                         mimetype=mime_type, 
                         download_name=os.path.basename(report_path))
    else:
        return jsonify({"error": mime_type if mime_type else "Report generation failed."}), 404

if __name__ == '__main__':
    # Flask will run on http://127.0.0.1:5000
    app.run(debug=True, port=5000)