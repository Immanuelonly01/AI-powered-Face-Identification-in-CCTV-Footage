import os
import time
import cv2
import numpy as np # Needed for cv2.imdecode in live_detect
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS 

# --- IMPORTS USING CORRECT RELATIVE PATHS ---
from .config import UPLOAD_FOLDER, CROPS_FOLDER, FLASK_SECRET_KEY
from .database_module import create_tables, log_detection
from .video_processing.video_utils import get_reference_embedding, process_video_and_search
from .video_processing.video_utils import detector, embedder # Import initialized model instances
from .report_generation.generate_report import generate_report
from .similarity_matching.cosine_match import calculate_cosine_similarity, check_match

# --- APP SETUP ---
# Configure static folder to serve 'static/crops' for preview images
app = Flask(__name__, static_url_path='/static', static_folder=str(CROPS_FOLDER.parent.parent / 'static')) 
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.secret_key = FLASK_SECRET_KEY
CORS(app) 

# Initialize database
create_tables() 

# --- API ROUTES ---

@app.route('/api/upload_and_search', methods=['POST'])
def upload_and_search():
    """Handles video file upload and frame-by-frame search."""
    if 'video' not in request.files or 'reference_image' not in request.files:
        return jsonify({"error": "Missing video or reference image file"}), 400

    video_file = request.files['video']
    ref_file = request.files['reference_image']

    video_filename = secure_filename(video_file.filename)
    unique_video_filename = f"{time.time()}_{video_filename}" 

    video_path = UPLOAD_FOLDER / unique_video_filename
    ref_path = UPLOAD_FOLDER / secure_filename(ref_file.filename)
    
    video_file.save(str(video_path))
    ref_file.save(str(ref_path))

    try:
        ref_embedding = get_reference_embedding(str(ref_path))
        results = process_video_and_search(video_path, ref_embedding, unique_video_filename)

        return jsonify({
            "message": "Search complete",
            "video_filename": unique_video_filename,
            "detections_count": len(results),
            "results": results
        })

    except Exception as e:
        print(f"Error during processing: {e}")
        return jsonify({"error": f"Processing failed. Check server logs for details. ({str(e)})"}), 500

@app.route('/api/live_detect', methods=['POST'])
def live_detect():
    """Handles single frame upload from the webcam for live matching."""
    if 'frame' not in request.files or 'reference_image' not in request.files:
        return jsonify({"error": "Missing frame or reference image"}), 400

    frame_file = request.files['frame']
    ref_file = request.files['reference_image']
    
    match_found = False
    detection_data = None
    
    # 1. Get Reference Embedding (Needs to be robust against multi-frame call)
    try:
        # Read file data into memory
        ref_img_data = ref_file.read()
        # Decode image data using numpy and cv2
        ref_img = cv2.imdecode(np.frombuffer(ref_img_data, np.uint8), cv2.IMREAD_COLOR)
        if ref_img is None: raise ValueError("Invalid reference image format.")
        
        ref_detections = detector.detect_faces(ref_img)
        if not ref_detections: raise ValueError("No face detected in reference image.")
            
        ref_embedding = embedder.generate_embedding(ref_detections[0]['cropped_img'])

    except Exception as e:
        return jsonify({"error": f"Reference image processing failed: {str(e)}"}), 400

    # 2. Process Live Frame
    try:
        frame_img_data = frame_file.read()
        frame_img = cv2.imdecode(np.frombuffer(frame_img_data, np.uint8), cv2.IMREAD_COLOR)
        if frame_img is None: raise ValueError("Invalid frame image format.")

        detections = detector.detect_faces(frame_img)
        
        for det in detections:
            det_embedding = embedder.generate_embedding(det['cropped_img'])
            similarity = calculate_cosine_similarity(ref_embedding, det_embedding)
            
            if check_match(similarity):
                timestamp = time.time()
                crop_filename = f"live_{timestamp:.0f}_{similarity:.4f}.jpg"
                crops_dir = CROPS_FOLDER / 'live_feed'
                os.makedirs(crops_dir, exist_ok=True)
                
                crop_relative_path = os.path.join("static/crops/live_feed", crop_filename).replace(os.path.sep, '/') 
                cv2.imwrite(str(crops_dir / crop_filename), det['cropped_img'])
                
                log_entry = log_detection({
                    'video_filename': 'LIVE_WEBCAM',
                    'frame_number': 0, 
                    'timestamp': timestamp,
                    'similarity': similarity,
                    'image_path': crop_relative_path
                })
                
                match_found = True
                detection_data = {
                    'id': log_entry.id,
                    'similarity': log_entry.similarity,
                    'image_url': f"/{log_entry.image_path}"
                }
                break 

        return jsonify({
            "match_found": match_found,
            "detection_log": detection_data,
            "similarity": similarity if 'similarity' in locals() else 0.0
        })

    except Exception as e:
        return jsonify({"error": f"Live frame processing failed: {str(e)}"}), 500


@app.route('/api/report/<video_filename>/<report_type>', methods=['GET'])
def download_report(video_filename, report_type):
    """Generates and serves CSV or PDF reports."""
    from .report_generation.generate_report import generate_report
    
    report_path, mime_type = generate_report(video_filename, report_type)
    
    if report_path and os.path.exists(report_path):
        return send_file(report_path, 
                         as_attachment=True, 
                         mimetype=mime_type, 
                         download_name=os.path.basename(report_path))
    else:
        return jsonify({"error": mime_type if mime_type else "Report generation failed."}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
