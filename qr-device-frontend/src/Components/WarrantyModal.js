import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import "./MaintenanceModal.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const WarrantyModal = ({ isOpen, onClose, deviceId, onWarrantyUpdate }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [newWarrantyDate, setNewWarrantyDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.put(`/devices/${deviceId}/warranty`, {
        warrantyExpiration: newWarrantyDate,
      });

      onWarrantyUpdate(response.data);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error updating warranty:", error);
      setError("Failed to update warranty expiration date");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check authentication when modal is opened
    if (isOpen) {
      if (!user) {
        // Redirect to login page with return URL
        navigate(`/login?returnUrl=/device/${deviceId}/warranty`);
        onClose();
      } else if (role !== "admin") {
        // Show unauthorized message for non-admin users
        setAuthMessage("Only administrators can update warranty information.");
        setShowAuthMessage(true);
      }
    }
  }, [isOpen, user, role, deviceId, navigate, onClose]);

  // Handle auth message close
  const handleAuthMessageClose = () => {
    setShowAuthMessage(false);
    onClose();
  };

  if (!isOpen) return null;
  
  // Show auth message if user doesn't have permission
  if (showAuthMessage) {
    return (
      <div className="maintenance-modal-overlay">
        <div className="maintenance-modal">
          <div className="modal-header">
            <h3>Authentication Required</h3>
            <button className="close-button" onClick={handleAuthMessageClose}>
              &times;
            </button>
          </div>
          <div className="auth-message">
            <p>{authMessage}</p>
            <div className="form-actions">
              <button className="submit-button" onClick={handleAuthMessageClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-modal-overlay">
      <div className="maintenance-modal">
        <div className="modal-header">
          <h3>Extend Warranty</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="maintenance-form">
          <div className="form-group">
            <label htmlFor="warrantyDate">New Warranty Expiration Date</label>
            <input
              type="date"
              id="warrantyDate"
              value={newWarrantyDate}
              onChange={(e) => setNewWarrantyDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Warranty"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarrantyModal;
