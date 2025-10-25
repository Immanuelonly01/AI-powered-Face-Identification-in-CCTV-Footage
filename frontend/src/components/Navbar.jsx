import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUpload, FaCamera, FaTachometerAlt, FaInfoCircle } from "react-icons/fa"; 

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg">
      <div className="container">
        <Link className="navbar-brand neon-text" to="/">Person Search AI</Link>
        
        <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            
            <li className="nav-item"><Link className="nav-link" to="/"><FaHome className="me-1" /> Home</Link></li>
            
            <li className="nav-item"><Link className="nav-link" to="/upload"><FaUpload className="me-1" /> File Upload</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/live"><FaCamera className="me-1" /> Live Detection</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/dashboard"><FaTachometerAlt className="me-1" /> Dashboard</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about"><FaInfoCircle className="me-1" /> About</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}