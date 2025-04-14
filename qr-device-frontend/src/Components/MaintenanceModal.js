import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import "./MaintenanceModal.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MaintenanceModal = ({
  isOpen,
  onClose,
  deviceId,
  onMaintenanceUpdate,
}) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post(
        `/devices/${deviceId}/maintenance`,
        {
          technician: formData.name,
          cost: parseFloat(formData.cost),
          description: formData.description,
          date: formData.date,
        }
      );

      // Update the parent component with the new device data
      onMaintenanceUpdate(response.data);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error submitting maintenance:", error);
      setError("Failed to submit maintenance record");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check authentication when modal is opened
    if (isOpen) {
      if (!user) {
        // Redirect to login page with return URL
        navigate(`/login?returnUrl=/device/${deviceId}/maintenance`);
        onClose();
      } else if (role !== "admin" && role !== "maintainer") {
        // Show unauthorized message for users without proper role
        setAuthMessage(
          "Only administrators and maintainers can update maintenance records."
        );
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
              <button
                className="submit-button"
                onClick={handleAuthMessageClose}
              >
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
          <h3>Update Maintenance</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="maintenance-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter maintainers name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cost">Cost ($)</label>
            <input
              type="number"
              id="cost"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              required
              min="0"
              step="0.01"
              placeholder="Enter cost"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Summary</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Enter maintenance summary"
              rows="4"
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
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

export default MaintenanceModal;
