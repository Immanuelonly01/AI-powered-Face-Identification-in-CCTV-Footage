import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container text-center">
        {/* Quick Links */}
        <div className="footer-links mb-3">
          <a href="/">Home</a> | 
          <a href="/live">Live Detection</a> | 
          <a href="/dashboard">Dashboard</a> | 
          <a href="/about">About</a>
        </div>

        {/* Social Icons */}
        <div className="social-icons mb-2">
          <a href="https://github.com/" target="_blank" rel="noreferrer"><FaGithub /></a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer"><FaLinkedin /></a>
          <a href="mailto:example@gmail.com"><FaEnvelope /></a>
          <a href="https://twitter.com/" target="_blank" rel="noreferrer"><FaTwitter /></a>
        </div>

        {/* Copyright */}
        <div className="text-light small">
          &copy; {new Date().getFullYear()} Person Search AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
