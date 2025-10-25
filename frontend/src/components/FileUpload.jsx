import React, { useState } from "react";
import axios from "axios";
import { FaUpload, FaSpinner } from "react-icons/fa";
import DetectionResults from "./DetectionResults.jsx"; // Assuming DetectionResults is imported

export default function FileUpload() {
    const [videoFile, setVideoFile] = useState(null);
    const [refImageFile, setRefImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [videoFilename, setVideoFilename] = useState('');

    const handleSearchStart = () => {
        setLoading(true);
        setResults(null);
        setError(null);
    };

    const handleSearchComplete = (data, errMsg = null) => {
        setLoading(false);
        if (errMsg) {
            setError(errMsg);
            setResults(null);
        } else if (data && data.results) {
            setResults(data.results);
            setVideoFilename(data.video_filename);
            setError(null);
        }
    };


    const handleUploadAndSearch = async (e) => {
        e.preventDefault();
        if (!videoFile || !refImageFile) {
            alert("Please select both a video and a reference image.");
            return;
        }

        handleSearchStart();
        setLoading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("video", videoFile); 
        formData.append("reference_image", refImageFile); 

        try {
            const response = await axios.post("/api/upload_and_search", formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });
            
            handleSearchComplete(response.data);

        } catch (error) {
            console.error('Search failed:', error);
            const errMsg = error.response?.data?.error || 'An unexpected error occurred during search.';
            handleSearchComplete(null, errMsg);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="text-white">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-cyan-400 neon-text">File Upload Console</h1>
                <p className="text-lg text-gray-400">Upload video footage and a reference image to begin the automated search.</p>
            </header>
            <form onSubmit={handleUploadAndSearch} className="upload-container text-center my-5 p-6 bg-gray-800 rounded-lg shadow-2xl">
                <h2 className="text-2xl text-white mb-6 font-semibold"><FaUpload className="inline me-2" /> Video & Reference Upload</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="d-block text-start text-gray-300 mb-1">CCTV Video Footage (.mp4):</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={e => setVideoFile(e.target.files[0])}
                            className="form-control form-control-dark w-full p-2 bg-gray-700 border-gray-600 rounded text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="d-block text-start text-gray-300 mb-1">Reference Image (Face):</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setRefImageFile(e.target.files[0])}
                            className="form-control form-control-dark w-full p-2 bg-gray-700 border-gray-600 rounded text-white"
                            required
                        />
                    </div>
                </div>

                {(loading || progress > 0) && (
                    <div className="mb-4 text-white">
                        <p className="text-sm text-cyan-400 mb-1">{progress < 100 ? `Uploading: ${progress}%` : "Processing video with Deep Learning..."}</p>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div className="bg-cyan-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={!videoFile || !refImageFile || loading}
                    className="w-full py-3 px-4 mt-4 text-lg text-white font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin me-2" /> Running Detection...
                        </>
                    ) : (
                        <>
                            <FaUpload className="me-2" /> Upload & Start Search
                        </>
                    )}
                </button>
            </form>
            
            {error && (
                <div className="mt-8 p-4 bg-red-900/50 border border-red-600 text-red-300 rounded-lg shadow-lg">
                    <h3 className="font-bold">Error Processing Video:</h3>
                    <p>{error}</p>
                </div>
            )}
            {results && (
                <DetectionResults results={results} videoFilename={videoFilename} />
            )}
        </div>
    );
}