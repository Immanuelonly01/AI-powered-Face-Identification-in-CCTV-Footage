import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import WebcamDetection from "./components/WebcamDetection";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import FileUpload from "./components/FileUpload"; // The upload component is on its own route

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar at the top */}
        <Navbar />

        {/* Main content wrapper */}
        <div className="main-content container-fluid">
          <div className="container p-4 p-md-5"> {/* Inner container for main content */}
            <Routes>
              {/* Home now acts as the primary landing page */}
              <Route path="/" element={<Home />} /> 
              {/* File Upload route for videos */}
              <Route path="/upload" element={<FileUpload />} /> 
              {/* Live Detection route for webcam */}
              <Route path="/live" element={<WebcamDetection />} /> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>

        {/* Footer at the bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;