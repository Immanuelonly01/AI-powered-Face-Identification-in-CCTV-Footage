import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer mt-5 p-4 bg-gray-800 text-white">
      <div className="container text-center">
        {/* Quick Links */}
        <div className="footer-links mb-3">
          <a href="/" className="text-gray-400 hover:text-cyan-400 mx-2">Home</a> | 
          <a href="/live" className="text-gray-400 hover:text-cyan-400 mx-2">Live Detection</a> | 
          <a href="/dashboard" className="text-gray-400 hover:text-cyan-400 mx-2">Dashboard</a> | 
          <a href="/about" className="text-gray-400 hover:text-cyan-400 mx-2">About</a>
        </div>

        {/* Social Icons */}
        <div className="social-icons mb-2 text-2xl space-x-4">
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white"><FaGithub /></a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white"><FaLinkedin /></a>
          <a href="mailto:example@gmail.com" className="text-gray-400 hover:text-white"><FaEnvelope /></a>
          <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white"><FaTwitter /></a>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 small mt-3">
          &copy; {new Date().getFullYear()} Person Search AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}