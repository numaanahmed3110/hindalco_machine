import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeviceTools.css";

const DeviceViewer = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await axios.get(
          `https://hindalco-machine.onrender.com/device/${id}`
        );
        setDevice(response.data);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading device information...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!device) {
    return <div className="error">No device found</div>;
  }

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
          <button
            onClick={() => navigate(`/device/${id}/maintenance`)}
            className="action-button"
          >
            Maintenance History
          </button>
          <button
            onClick={() => navigate(`/device/${id}/docs`)}
            className="action-button"
          >
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceViewer;
