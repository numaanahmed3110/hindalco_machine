import React, { useState } from "react";
import axios from "axios";
import "./MaintenanceModal.css";

const MaintenanceModal = ({
  isOpen,
  onClose,
  deviceId,
  onMaintenanceUpdate,
}) => {
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
      const response = await axios.post(
        `https://hindalco-machine.onrender.com/device/${deviceId}/maintenance`,
        {
          name: formData.name,
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

  if (!isOpen) return null;

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
