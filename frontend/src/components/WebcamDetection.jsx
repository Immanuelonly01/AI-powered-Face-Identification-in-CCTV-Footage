import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaCamera, FaPlay, FaStop, FaSpinner } from "react-icons/fa";
import axios from "axios";
import Webcam from "react-webcam"; // Make sure you have installed react-webcam

// Set video constraints for the webcam
const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
};

// Global variable to hold the detection interval ID
let detectionInterval = null;
const DETECTION_INTERVAL_MS = 1000; // Check every 1 second

// Helper function to convert Base64 string to a File object
const base64StringtoFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export default function WebcamDetection() {
    const webcamRef = useRef(null);
    const [referenceImage, setReferenceImage] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detectionResults, setDetectionResults] = useState([]);
    const [status, setStatus] = useState("Ready");

    // Function to handle continuous API calls
    const sendFrameForDetection = useCallback(async (referenceImg) => {
        if (webcamRef.current) {
            const base64Img = webcamRef.current.getScreenshot();
            if (!base64Img) return;

            // Convert screenshot data URL to File object
            const frameFile = base64StringtoFile(base64Img, `frame_${Date.now()}.jpeg`);

            const formData = new FormData();
            formData.append("frame", frameFile); // New frame from webcam
            formData.append("reference_image", referenceImg); // Reference image uploaded by user

            try {
                // Use the proxied API endpoint /api/live_detect (You would need to implement this endpoint in Flask)
                const response = await axios.post("/api/live_detect", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.data.match_found) {
                    // Prepend new detection to results list
                    setDetectionResults(prev => [response.data.detection_log, ...prev]);
                    setStatus("MATCH FOUND!");
                } else {
                    setStatus("No match found in current frame.");
                }

            } catch (error) {
                console.error("Live detection failed:", error);
                setStatus("API Error. Check console.");
            }
        }
    }, [webcamRef]);

    // Cleanup interval when component unmounts
    useEffect(() => {
        return () => {
            if (detectionInterval) {
                clearInterval(detectionInterval);
            }
        };
    }, []);

    const startLiveDetection = () => {
        if (!referenceImage) {
            alert("Please upload a reference image first.");
            return;
        }

        setIsCameraActive(true);
        setIsDetecting(true);
        setStatus("Activating camera and starting detection...");

        // Start the continuous detection loop
        detectionInterval = setInterval(() => {
            sendFrameForDetection(referenceImage);
        }, DETECTION_INTERVAL_MS);
    };

    const stopLiveDetection = () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
        }
        setIsCameraActive(false);
        setIsDetecting(false);
        setStatus("Detection stopped.");
    };

    return (
        <div className="webcam-container text-center text-white my-5 p-6 bg-gray-800 rounded-lg shadow-2xl">
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-5"><FaCamera className="me-2" /> Live Detection</h1>
            
            <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                    <label className="d-block text-start text-gray-300 mb-1">Upload Reference Image (Target):</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleReferenceUpload} 
                        className="form-control form-control-dark w-full p-2 bg-gray-700 border-gray-600 rounded text-white"
                    />
                    {referenceImage && <p className="text-gray-500 small mt-2">Reference: {referenceImage.name}</p>}
                </div>
            </div>

            {/* Webcam Feed Area */}
            <div className="webcam-feed-wrapper my-4 inline-block p-2 bg-gray-900 rounded-lg shadow-inner" style={{ position: 'relative' }}>
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
                        <p className="text-gray-500 fs-4"><FaCamera /> Press Start to Activate Camera</p>
                      </div>
                )}
                {isDetecting && (
                    <div className="status-overlay text-white bg-red-600/70 p-1 rounded-b" style={{ position: 'absolute', bottom: 10, left: 0, right: 0 }}>
                        {status === "MATCH FOUND!" ? <span className="font-bold">🚨 {status} 🚨</span> : <FaSpinner className="animate-spin me-2" /> }
                        {!detectionResults.length && status !== "MATCH FOUND!" && <span className="ms-2">{status}</span>}
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-center gap-3 mt-4">
                {!isCameraActive ? (
                    <button 
                        onClick={startLiveDetection} 
                        className="btn btn-neon-primary btn-lg hover-scale bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" 
                        disabled={!referenceImage}
                    >
                        <FaPlay className="me-2" /> Start Live Detection
                    </button>
                ) : (
                    <button 
                        onClick={stopLiveDetection} 
                        className="btn btn-neon-secondary btn-lg hover-scale bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" 
                    >
                        <FaStop className="me-2" /> Stop Detection
                    </button>
                )}
            </div>
            
            {/* Display Live Results */}
            <h2 className="text-2xl text-cyan-400 mt-8 mb-4">Live Matches</h2>
            <div className="live-results-list max-h-64 overflow-y-auto bg-gray-900 p-3 rounded-lg border border-gray-700">
                {detectionResults.length === 0 ? (
                    <p className="text-gray-500">No matches found yet.</p>
                ) : (
                    <ul className="list-unstyled text-start space-y-2">
                        {detectionResults.map((result, index) => (
                            <li key={index} className="bg-gray-700 p-2 rounded flex justify-between items-center text-sm">
                                <span>Match {index + 1}: Similarity **{result.similarity.toFixed(4)}**</span>
                                <span className="text-xs text-green-400">@ {new Date().toLocaleTimeString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}