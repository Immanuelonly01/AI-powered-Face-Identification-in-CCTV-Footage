import React, { useState } from "react";
import axios from "axios";
import { FaUpload } from "react-icons/fa";

export default function FileUpload({ onUpload }) {
  const [video, setVideo] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("video", video);
    formData.append("reference", image);
    try {
      // NOTE: onUpload isn't defined here but assumes it's passed from a parent component (App or Home)
      const res = await axios.post("http://localhost:5000/upload", formData);
      onUpload && onUpload(res.data);
      alert("Detection successful! Check dashboard.");
    } catch (err) {
      console.error(err);
      alert("Upload failed. See console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="upload-container text-center my-5 p-4 card-glow">
      <h2 className="text-light mb-4">Upload Video & Reference Image</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <label className="d-block text-start text-light mb-1">Select Video File:</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideo(e.target.files[0])}
            className="form-control form-control-dark mb-3"
          />
        </div>
        <div className="col-md-8">
          <label className="d-block text-start text-light mb-1">Select Reference Image (Target):</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
            className="form-control form-control-dark mb-4"
          />
        </div>
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!video || !image || loading}
        className="btn btn-neon-primary btn-lg hover-scale"
      >
        <FaUpload /> {loading ? "Processing..." : "Upload & Detect"}
      </button>
    </div>
  );
}