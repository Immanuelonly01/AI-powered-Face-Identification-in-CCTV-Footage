import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChartLine, FaSpinner } from "react-icons/fa";

export default function Dashboard() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/dashboard-data")
      .then(res => {
        setDetections(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-container my-5">
      <h2 className="text-light mb-4"><FaChartLine className="me-2" /> Detection Dashboard</h2>
      
      {loading ? (
        <div className="text-center p-5">
          <FaSpinner className="fa-spin text-light" size={40} />
          <p className="text-light mt-3">Loading detection data...</p>
        </div>
      ) : (
        <>
          <p className="text-light">Total Detections Found: <span className="neon-text">{detections.length}</span></p>
          <div className="table-responsive card-glow p-3">
            <table className="table table-dark table-striped table-hover">
              <thead>
                <tr>
                  <th>Frame ID</th>
                  <th>Timestamp</th>
                  <th>Similarity Score</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {detections.length > 0 ? (
                  detections.map((d, i) => (
                    <tr key={i}>
                      <td>{d.frame}</td>
                      <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
                      <td className={d.similarity > 0.9 ? 'text-success' : 'text-warning'}>{d.similarity.toFixed(4)}</td>
                      <td><img src={`http://localhost:5000/${d.image}`} width={80} alt={`Frame ${d.frame} detection`} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No detections recorded yet. Start by uploading a video or using live detection!</td>
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