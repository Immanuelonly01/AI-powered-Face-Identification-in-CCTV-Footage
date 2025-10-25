import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'; 

// CRITICAL FIX: All local imports now use the explicit .jsx extension
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./components/Home.jsx";
import WebcamDetection from "./components/WebcamDetection.jsx";
import Dashboard from "./components/Dashboard.jsx";
import About from "./components/About.jsx";
import FileUpload from "./components/FileUpload.jsx"; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />

        <main className="main-content max-w-6xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} /> 
            <Route path="/upload" element={<FileUpload />} /> 
            <Route path="/live" element={<WebcamDetection />} /> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;