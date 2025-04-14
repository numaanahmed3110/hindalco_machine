import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import "./DeviceTools.css";
import { useAuth } from "../contexts/AuthContext";
import MaintenanceModal from "../Components/MaintenanceModal";
import WarrantyModal from "../Components/WarrantyModal";
import { supabase } from "../supabase/supabaseClient";

const DeviceViewer = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await apiClient.get(`/devices/${id}`);
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

  // Set up token expiration timer
  useEffect(() => {
    // Check if we have a session expiry time
    const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");

    if (sessionExpiresAt) {
      const expiryTime = parseInt(sessionExpiresAt) * 1000;
      setTokenExpiryTime(expiryTime);

      // Set a timer to check token expiration every minute
      const tokenTimer = setInterval(() => {
        const now = Date.now();
        // If token has expired, clear it
        if (expiryTime < now) {
          console.log("Token expired, clearing session");
          localStorage.removeItem("sessionExpiresAt");
          supabase.auth.signOut();
          setTokenExpiryTime(null);
          clearInterval(tokenTimer);
        }
      }, 60000); // Check every minute

      return () => clearInterval(tokenTimer);
    }
  }, []);

  // Handle page close/refresh to clear token
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear token when page is closed or refreshed
      localStorage.removeItem("sessionExpiresAt");
      supabase.auth.signOut();
    };

    // Add event listener for page close/refresh
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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

          {tokenExpiryTime && (
            <div className="detail-row">
              <span className="detail-label">Session Expires:</span>
              <span className="detail-value">
                {new Date(tokenExpiryTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <div className="device-actions">
          <button
            onClick={() => navigate(`/device/${id}/maintenance`)}
            className="action-button"
          >
            Maintenance History
          </button>
          <button
            onClick={() => {
              if (!user) {
                // Redirect to login page with return URL
                navigate(`/login?returnUrl=/device-tools/device/${id}`);
                return;
              }

              if (role !== "admin" && role !== "maintainer") {
                // Show unauthorized message
                setAuthMessage(
                  "Only administrators and maintainers can update maintenance records."
                );
                setShowAuthModal(true);
              } else {
                // User has proper role, show maintenance modal
                setIsMaintenanceModalOpen(true);
              }
            }}
            className="action-button"
          >
            Update Maintenance
          </button>
          <button
            onClick={() => {
              if (!user) {
                // Redirect to login page with return URL
                navigate(`/login?returnUrl=/device-tools/device/${id}`);
                return;
              }

              if (role !== "admin") {
                // Show unauthorized message
                setAuthMessage(
                  "Only administrators can update warranty information."
                );
                setShowAuthModal(true);
              } else {
                // User is admin, show warranty modal
                setIsWarrantyModalOpen(true);
              }
            }}
            className="action-button"
          >
            Update Warranty
          </button>
          <button
            onClick={() => navigate(`/device/${id}/docs`)}
            className="action-button"
          >
            Documentation
          </button>
        </div>

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="maintenance-modal-overlay">
            <div className="maintenance-modal">
              <div className="modal-header">
                <h3>Authentication Required</h3>
                <button
                  className="close-button"
                  onClick={() => setShowAuthModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="auth-message">
                <p>{authMessage}</p>
                <div className="form-actions">
                  <button
                    className="submit-button"
                    onClick={() => setShowAuthModal(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Modal */}
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          deviceId={id}
          onMaintenanceUpdate={(updatedDevice) => setDevice(updatedDevice)}
        />

        {/* Warranty Modal */}
        <WarrantyModal
          isOpen={isWarrantyModalOpen}
          onClose={() => setIsWarrantyModalOpen(false)}
          deviceId={id}
          onWarrantyUpdate={(updatedDevice) => setDevice(updatedDevice)}
        />
      </div>
    </div>
  );
};

export default DeviceViewer;
