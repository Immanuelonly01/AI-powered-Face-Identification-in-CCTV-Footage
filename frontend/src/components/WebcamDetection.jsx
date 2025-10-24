import React, { useState, useRef, useCallback } from "react";
import { FaCamera, FaUpload, FaPlay, FaStop } from "react-icons/fa";
import axios from "axios";
import Webcam from "react-webcam"; // ⬅️ New import

// Set video constraints for the webcam
const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

export default function WebcamDetection() {
  const webcamRef = useRef(null);
  const [referenceImage, setReferenceImage] = useState(null); // Reference image for the target
  const [detecting, setDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Function to capture the image from the webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // You can process this imageSrc (base64 string) or display it here
      console.log("Image captured:", imageSrc.substring(0, 30) + '...');
      // For simplicity, we won't handle live sending yet, but this is your detection frame.
      // You can set it to a state variable or send it directly.
    }
  }, [webcamRef]);
  
  // Handler for uploading the reference image
  const handleReferenceUpload = e => setReferenceImage(e.target.files[0]);

  // Function to send a captured image and the reference image to the backend
  const startLiveDetection = async () => {
    if (!referenceImage) {
        alert("Please upload a reference image first.");
        return;
    }
    
    // In a real-world scenario, you'd set up an interval timer here
    // to continuously call capture() and send the frame to the backend.
    
    setIsCameraActive(true);
    alert("Camera activated. In a full system, detection would start now.");
    
    // Example of a single detection call (simplified for front-end structure)
    // capture(); // Capture the first frame

    // The continuous loop for detection would look something like this:
    /* const detectionInterval = setInterval(() => {
        const frame = webcamRef.current.getScreenshot(); 
        if (frame) sendFrameForDetection(frame, referenceImage); 
    }, 500); // Check every 500ms
    setDetectionInterval(detectionInterval); // Store to clear later
    */
    
    setDetecting(true); // Assuming the 'detecting' state controls the interval
  };

  const stopLiveDetection = () => {
    setIsCameraActive(false);
    setDetecting(false);
    // clearInterval(detectionInterval); // Clear the stored interval
    alert("Detection stopped.");
  };


  return (
    <div className="webcam-container text-center my-5 p-4 card-glow">
      <h2 className="text-light mb-4"><FaCamera className="me-2" /> Live Detection</h2>
      
      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
            <label className="d-block text-start text-light mb-1">Upload Reference Image (Target):</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleReferenceUpload} 
                className="form-control form-control-dark mb-3"
            />
            {referenceImage && <p className="text-muted small">Reference: {referenceImage.name}</p>}
        </div>
      </div>

      {/* Webcam Feed Area */}
      <div className="webcam-feed-wrapper my-4 d-inline-block p-2 card-glow" style={{ position: 'relative' }}>
        {isCameraActive && (
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={videoConstraints.width}
                height={videoConstraints.height}
                videoConstraints={videoConstraints}
                className="rounded"
            />
        )}
        {!isCameraActive && (
             <div className="webcam-placeholder rounded d-flex align-items-center justify-content-center"
                  style={{ width: videoConstraints.width, height: videoConstraints.height, backgroundColor: '#12182b' }}>
                <p className="text-light fs-4 text-muted"><FaCamera /> Press Start to Activate Camera</p>
             </div>
        )}
      </div>

      <div className="d-flex justify-content-center gap-3">
        {!isCameraActive ? (
            <button 
                onClick={startLiveDetection} 
                className="btn btn-neon-primary btn-lg hover-scale" 
                disabled={!referenceImage}
            >
                <FaPlay className="me-2" /> Start Live Detection
            </button>
        ) : (
            <button 
                onClick={stopLiveDetection} 
                className="btn btn-neon-secondary btn-lg hover-scale" 
            >
                <FaStop className="me-2" /> Stop Detection
            </button>
        )}
      </div>
      
    </div>
  );
}