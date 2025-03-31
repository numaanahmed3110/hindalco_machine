import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./DeviceTools.css";

const DeviceViewer = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://hindalco-machine.onrender.com/device/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Device not found");
        }
        return res.json();
      })
      .then((data) => {
        setDevice(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching device:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <div className="loading">Loading device information...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!device) return <div className="error">No device found</div>;

  return (
    <div className="device-viewer">
      <div className="device-viewer-card">
        <div className="device-header">
          <h2>{device.name}</h2>
          <span className="model-badge">{device.model}</span>
        </div>

        <div className="device-details">
          <div className="detail-row">
            <span className="detail-label">Serial Number:</span>
            <span className="detail-value">{device.serialNumber}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Details:</span>
            <span className="detail-value">{device.details}</span>
          </div>
        </div>

        <div className="device-actions">
          <a href="#" className="action-button">
            Maintenance History
          </a>
          <a href="#" className="action-button">
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeviceViewer;
