import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import AuthCheck from "../Components/AuthCheck";
import "./DeviceTools.css";

const DeviceViewer = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchDevice = async () => {
      if (!userLoaded) return;

      if (!user) {
        navigate("/sign-in", {
          replace: true,
          state: { returnUrl: `/device-view/${id}` },
        });
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication token not available");
        }
        setIsAuthenticated(true);

        const response = await axios.get(
          `https://hindalco-machine.onrender.com/device/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDevice(response.data);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchDevice();
  }, [id, getToken, user, userLoaded]);

  if (!userLoaded || loading) {
    return <div className="loading">Loading device information...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <div className="error">Please sign in to view device details</div>;
  }

  if (!device) {
    return <div className="error">No device found</div>;
  }

  return (
    <AuthCheck>
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
    </AuthCheck>
  );
};

export default DeviceViewer;
