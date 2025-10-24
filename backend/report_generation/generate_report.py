# AutomatedPersonSearch/backend/report_generation/generate_report.py
import csv
import time
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from ..config import REPORTS_FOLDER
from ..database_module import get_logs_by_video

def generate_report(video_filename, report_type):
    """Fetches logs and generates CSV or PDF report, returning path and mimetype."""
    logs = get_logs_by_video(video_filename)
    
    if not logs:
        return None, "No logs found for this video."

    data_rows = [{
        'ID': log.id,
        'Video Filename': log.video_filename,
        'Frame Number': log.frame_number,
        'Timestamp (s)': f"{log.timestamp:.2f}",
        'Similarity': f"{log.similarity:.4f}",
        'Image Path': log.image_path
    } for log in logs]

    report_path = REPORTS_FOLDER / f"{video_filename.split('.')[0]}_report_{int(time.time())}.{report_type}"
    
    if report_type == 'csv':
        keys = data_rows[0].keys()
        with open(str(report_path), 'w', newline='', encoding='utf-8') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(data_rows)
        return str(report_path), "text/csv"
        
    elif report_type == 'pdf':
        doc = SimpleDocTemplate(str(report_path), pagesize=letter)
        styles = getSampleStyleSheet()
        story = [Paragraph(f"Person Search Report: {video_filename}", styles['h1'])]

        # Prepare table data
        table_data = [list(data_rows[0].keys())] + [list(row.values()) for row in data_rows]

        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E90FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black)
        ]))

        story.append(table)
        doc.build(story)
        return str(report_path), "application/pdf"
        
    return None, "Invalid report type."