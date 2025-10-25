import React from "react";
import { FaInfoCircle } from "react-icons/fa";

export default function About() {
    return (
        <div className="about-container text-white my-5 p-6 bg-gray-800 rounded-lg shadow-2xl">
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-5"><FaInfoCircle className="me-2" /> About This Project</h1>
            <p className="text-gray-300 mb-4">
                This **Final Year Project** implements an end-to-end Automated Person Search system. 
                It leverages a high-performance deep learning pipeline hosted on a Python/Flask backend.
            </p>
            <h3 className="text-xl font-semibold mb-3 text-cyan-400">Technology Stack:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>**Backend:** Python, Flask, SQLAlchemy (Database ORM).</li>
                <li>**Deep Learning:** YOLOv5 (Face Detection) and ArcFace (Face Embedding/Verification).</li>
                <li>**Frontend:** React (Vite), Axios, React Router.</li>
                <li>**Database:** SQLite/MySQL.</li>
            </ul>
        </div>
    );
}