import React from "react";
import { FaVideo, FaUserCheck, FaChartLine, FaBolt, FaUpload, FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section text-center mb-5 p-4 p-md-5">
        <h1>Automated Person Search AI 🤖</h1>
        <p className="lead mt-3 mb-4 text-light">
          Harnessing **YOLOv5** and **ArcFace** for instant, high-accuracy target detection in video surveillance and live feeds.
        </p>
        <div className="hero-buttons d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/upload" className="btn btn-neon-primary btn-lg hover-scale">
            <FaUpload className="me-2" /> Upload Video
          </Link>
          <Link to="/live" className="btn btn-neon-secondary btn-lg hover-scale">
            <FaCamera className="me-2" /> Live Detection
          </Link>
        </div>
      </section>

      {/* Feature Cards Section - The core functionality */}
      <section className="features-section">
        <h2 className="text-center mb-5">Core System Capabilities</h2>
        <div className="features-container">
          
          <div className="feature-card">
            <FaVideo className="feature-icon" />
            <h3>Video Processing</h3>
            <p>Upload large video files for frame-by-frame analysis and target tracking using deep learning models.</p>
          </div>

          <div className="feature-card">
            <FaUserCheck className="feature-icon" />
            <h3>High-Accuracy ID</h3>
            <p>Utilizes the robust **ArcFace** algorithm for biometric verification against a reference image.</p>
          </div>

          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Real-time Dashboard</h3>
            <p>Visualize all detection events, including timestamps, frames, and similarity scores, in an interactive panel.</p>
          </div>

          <div className="feature-card">
            <FaBolt className="feature-icon" />
            <h3>Instant Alerts</h3>
            <p>Configure automated notifications via **Email or Telegram** upon successful target identification.</p>
          </div>
        </div>
      </section>

      {/* Highlight/Technology Section */}
      <section className="highlight-section my-5 p-4">
        <h2>Deep Learning Power: YOLOv5 + ArcFace</h2>
        <p className="text-center text-light">Our system combines industry-leading models for unparalleled performance and reliability.</p>
        <ul className="list-unstyled tech-list">
          <li>💡 **YOLOv5** for rapid and accurate object (face) detection.</li>
          <li>🚀 **ArcFace** for generating highly discriminative face embeddings.</li>
          <li>📊 Interactive dashboard to track all detections instantly.</li>
          <li>✅ Easy to use, secure, and scalable API-driven architecture.</li>
        </ul>
      </section>
    </div>
  );
}