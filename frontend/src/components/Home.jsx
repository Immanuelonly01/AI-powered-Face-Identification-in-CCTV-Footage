import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaVideo, FaUserCheck, FaChartLine, FaBolt, FaUpload, FaCamera } from "react-icons/fa";

export default function Home() {
    return (
        <div className="home-container">
            <section className="hero-section text-center mb-5 p-4 p-md-5 bg-gray-800 rounded-lg shadow-xl">
                <h1 className="text-4xl font-extrabold text-cyan-400 neon-text">Automated Person Search AI 🤖</h1>
                <p className="lead mt-3 mb-4 text-gray-300">
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

            <section className="features-section mt-10">
                <h2 className="text-center text-white mb-5 text-3xl font-bold">Core System Capabilities</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
                    
                    <div className="feature-card bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <FaVideo className="feature-icon text-cyan-400 text-4xl mb-3" />
                        <h3 className="text-xl font-semibold mb-2">Video Processing</h3>
                        <p className="text-sm text-gray-400">Upload large video files for frame-by-frame analysis and target tracking using deep learning models.</p>
                    </div>

                    <div className="feature-card bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <FaUserCheck className="feature-icon text-cyan-400 text-4xl mb-3" />
                        <h3 className="text-xl font-semibold mb-2">High-Accuracy ID</h3>
                        <p className="text-sm text-gray-400">Utilizes the robust **ArcFace** algorithm for biometric verification against a reference image.</p>
                    </div>

                    <div className="feature-card bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <FaChartLine className="feature-icon text-cyan-400 text-4xl mb-3" />
                        <h3 className="text-xl font-semibold mb-2">Real-time Dashboard</h3>
                        <p className="text-sm text-gray-400">Visualize all detection events, including timestamps, frames, and similarity scores, in an interactive panel.</p>
                    </div>

                    <div className="feature-card bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <FaBolt className="feature-icon text-cyan-400 text-4xl mb-3" />
                        <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
                        <p className="text-sm text-gray-400">Configure automated notifications via **Email or Telegram** upon successful target identification.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}