import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChartLine, FaSpinner, FaDatabase } from "react-icons/fa";

export default function Dashboard() {
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetches all logs from Flask backend /api/logs
        axios.get("/api/logs")
          .then(res => {
            setDetections(res.data);
            setLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch dashboard data:", err);
            setLoading(false);
          });
    }, []);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Timestamp is stored as a float (seconds since epoch) in DB.
        return new Date(timestamp * 1000).toLocaleTimeString();
    };

    return (
        <div className="dashboard-container text-white my-5 p-6 bg-gray-900 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-extrabold text-cyan-400 mb-5"><FaChartLine className="me-2" /> Detection Dashboard</h2>
            
            {loading ? (
                <div className="text-center p-5">
                    <FaSpinner className="animate-spin text-light" size={40} />
                    <p className="text-light mt-3">Loading detection data from database...</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-300">Total Detections Found: <span className="text-cyan-400 font-bold">{detections.length}</span></p>
                    
                    <div className="table-responsive card-glow p-3 mt-4 overflow-y-auto max-h-[70vh]">
                        <table className="table table-dark table-striped table-hover min-w-full">
                            <thead>
                                <tr className="text-sm uppercase">
                                    <th><FaDatabase /> ID</th>
                                    <th>Frame # / Type</th>
                                    <th>Match Time</th>
                                    <th>Similarity Score</th>
                                    <th>Preview</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detections.length > 0 ? (
                                    detections.map((d) => (
                                        <tr key={d.id} className="text-sm">
                                            <td>{d.id}</td>
                                            <td>{d.video_filename === 'LIVE_WEBCAM' ? 'LIVE' : d.frame_number}</td>
                                            <td>{formatTimestamp(d.timestamp)}</td>
                                            <td className={d.similarity > 0.7 ? 'text-success font-semibold' : 'text-warning'}>
                                                {d.similarity.toFixed(4)}
                                            </td>
                                            <td>
                                                <img src={`/${d.image_path}`} width={80} alt={`Frame ${d.frame_number} detection`} 
                                                     className="rounded-md border border-gray-600"/>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">No detections recorded yet. Start the search via the File Upload or Live Detection pages.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}