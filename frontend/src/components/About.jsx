import React from "react";

export default function About() {
  return (
    <div className="about-container">
      <h2 className="text-light mb-3">About This Project</h2>
      <p className="text-light">
        This project uses deep learning (YOLOv5 + ArcFace) to detect a specific person in video footage or live webcam.
        Upload video files, use live webcam for detection, and track progress in the interactive dashboard.
      </p>
      <p className="text-light">
        Features:
        <ul>
          <li>Video and reference image upload</li>
          <li>Live webcam detection</li>
          <li>Dashboard with detailed detection stats</li>
          <li>CSV/PDF report generation</li>
          <li>Email or Telegram alert notifications</li>
        </ul>
      </p>
    </div>
  );
}
