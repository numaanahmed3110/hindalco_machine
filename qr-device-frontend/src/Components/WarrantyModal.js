import React, { useState } from "react";
import axios from "axios";
import "./MaintenanceModal.css";

const WarrantyModal = ({ isOpen, onClose, deviceId, onWarrantyUpdate }) => {
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
      const response = await axios.put(
        `https://hindalco-machine.onrender.com/device/${deviceId}/warranty`,
        {
          warrantyExpiration: newWarrantyDate,
        }
      );

      onWarrantyUpdate(response.data);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error updating warranty:", error);
      setError("Failed to update warranty expiration date");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
