import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import "./DeviceTemplate.css";
import TutorialModal from "./TutorialModal";
import MaintenanceModal from "./MaintenanceModal";
import WarrantyModal from "./WarrantyModal";
import { useAuth } from "../contexts/AuthContext";

const DeviceTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const fetchDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using API client with environment-based URL
        const response = await apiClient.get(`/device/${id}`);
        setDevice(response.data);
        setRetryCount(0);
      } catch (err) {
        console.error("Error fetching device:", err);
        const errorMessage =
          err.response?.status === 500
            ? "Server error occurred. Please try again later."
            : err.response?.status === 404
            ? "Device not found. Please check the device ID."
            : "Failed to load device information. Please check your connection.";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setIsRetrying(false);
      }
    };

    // Check if we have a returnUrl in the query parameters
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("returnUrl")) {
      // User has been redirected back after login, clear the parameter
      navigate(`/device-view/${id}`, { replace: true });
    }

    fetchDevice();
  }, [id, retryCount, navigate]);

  if (loading) {
    return (
      <div className="device-template-loading">
        <div className="loading-spinner"></div>
        <p>Loading device information...</p>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="device-template-error">
        <div className="error-icon">!</div>
        <h2>Error Loading Device</h2>
        <p>{error || "The requested device could not be found"}</p>
        <button
          className="retry-button"
          onClick={() => {
            setIsRetrying(true);
            setRetryCount((prev) => prev + 1);
          }}
          disabled={isRetrying}
        >
          {isRetrying ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get primary image or placeholder
  const getPrimaryImage = () => {
    if (device.images && device.images.length > 0) {
      const primaryImage =
        device.images.find((img) => img.isPrimary) || device.images[0];
      return primaryImage.url;
    }
    return "https://via.placeholder.com/300x200?text=No+Image+Available";
  };

  return (
    <div className="device-template">
      <div className="device-template-header">
        <h1>Device Information</h1>
      </div>

      <div className="device-template-card">
        <div className="device-image-container">
          <img
            src={getPrimaryImage()}
            alt={device.name}
            className="device-image"
          />
        </div>

        <div className="device-template-title">
          <h2>{device.name}</h2>
          <span className="model-badge">{device.model}</span>
          {device.tutorialVideo && (
            <button
              className="tutorial-button"
              onClick={() => setIsTutorialOpen(true)}
            >
              Watch Tutorial
            </button>
          )}
        </div>

        <TutorialModal
          videoUrl={device.tutorialVideo}
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />

        <div className="device-tabs">
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`tab-button ${activeTab === "specs" ? "active" : ""}`}
            onClick={() => setActiveTab("specs")}
          >
            Specifications
          </button>
          <button
            className={`tab-button ${
              activeTab === "maintenance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("maintenance")}
          >
            Maintenance
          </button>
        </div>

        {activeTab === "details" && (
          <div className="device-template-details">
            <div className="detail-item">
              <span className="detail-label">Serial Number</span>
              <span className="detail-value">{device.serialNumber}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Manufacturer</span>
              <span className="detail-value">
                {device.manufacturer || "N/A"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{device.category || "N/A"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">
                {device.location
                  ? `${device.location.building || ""}, ${
                      device.location.room || ""
                    }, ${device.location.floor || ""}`
                  : "N/A"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Description</span>
              <p className="detail-value">
                {device.details || "No details available"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="device-template-details">
            <div className="detail-item">
              <span className="detail-label">Purchase Date</span>
              <span className="detail-value">
                {formatDate(device.purchaseDate)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Warranty Expiration</span>
              <div
                className="detail-value"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {formatDate(device.warrantyExpiration)}
                <button
                  className="warranty-button"
                  onClick={() => {
                    if (!user) {
                      // Redirect to login page with return URL
                      navigate(`/login?returnUrl=/device-view/${id}`);
                      return;
                    }

                    // Check role-based permissions
                    if (role !== "admin") {
                      // Show unauthorized message for non-admin users
                      setAuthMessage(
                        "Only administrators can extend warranty."
                      );
                      setShowAuthModal(true);
                    } else {
                      // Admin can access warranty modal
                      setIsWarrantyModalOpen(true);
                    }
                  }}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Extend Warranty
                </button>
              </div>
            </div>
            <WarrantyModal
              isOpen={isWarrantyModalOpen}
              onClose={() => setIsWarrantyModalOpen(false)}
              deviceId={id}
              onWarrantyUpdate={(updatedDevice) => setDevice(updatedDevice)}
            />

            <div className="detail-item">
              <span className="detail-label">Additional Images</span>
              <div className="image-gallery">
                {device.images && device.images.length > 0 ? (
                  device.images.map((img, index) => (
                    <div key={index} className="gallery-image-container">
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="gallery-image"
                      />
                      <span className="image-caption">{img.caption}</span>
                    </div>
                  ))
                ) : (
                  <p>No additional images available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="device-template-details">
            <h3 className="section-title">Maintenance History</h3>

            <div className="maintenance-actions">
              <button
                className="action-button update-maintenance"
                onClick={() => {
                  if (!user) {
                    // Redirect to login page with return URL
                    navigate(`/login?returnUrl=/device-view/${id}`);
                  } else if (role !== "admin" && role !== "supervisor") {
                    // Show unauthorized message for non-admin/supervisor users
                    setAuthMessage(
                      "Only administrators and supervisors can add maintenance records."
                    );
                    setShowAuthModal(true);
                  } else {
                    // Admin or maintainer can access maintenance modal
                    setIsMaintenanceModalOpen(true);
                  }
                }}
              >
                Add Maintenance Record
              </button>
            </div>

            {device.maintenanceHistory &&
            device.maintenanceHistory.length > 0 ? (
              <div className="maintenance-history">
                {[...device.maintenanceHistory]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record, index) => (
                    <div key={index} className="maintenance-record">
                      <div className="maintenance-date">
                        {formatDate(record.date)}
                      </div>
                      <div className="maintenance-details">
                        <p className="maintenance-description">
                          {record.description}
                        </p>
                        <div className="maintenance-meta">
                          <span className="technician">
                            Technician: {record.name}
                          </span>
                          <span className="cost">
                            Cost: ${record.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-records">No maintenance records available</p>
            )}
          </div>
        )}

        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          deviceId={id}
          onMaintenanceUpdate={(updatedDevice) => setDevice(updatedDevice)}
        />

        {device.tutorialVideo && (
          <TutorialModal
            videoUrl={device.tutorialVideo}
            isOpen={isTutorialOpen}
            onClose={() => setIsTutorialOpen(false)}
          />
        )}
      </div>

      <div className="device-template-footer">
        <p>Scan this device again to access this information in the future</p>
      </div>

      {/* Auth Modal for displaying permission messages */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
      />
    </div>
  );
};

// Add AuthModal component at the end of the file, before the export statement
const AuthModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="maintenance-modal-overlay">
      <div className="maintenance-modal">
        <div className="modal-header">
          <h3>Authentication Required</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="auth-message">
          <p>{message}</p>
          <div className="form-actions">
            <button className="submit-button" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceTemplate;
