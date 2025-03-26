import React, { useState } from 'react';
import './MaintenanceModal.css';

const MaintenanceModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    designation: '',
    cost: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const maintenanceData = {
      ...formData,
      date: new Date().toISOString(),
      cost: parseFloat(formData.cost)
    };
    onSubmit(maintenanceData);
    setFormData({ designation: '', cost: '', description: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="maintenance-modal-overlay">
      <div className="maintenance-modal">
        <div className="modal-header">
          <h3>Update Maintenance</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="maintenance-form">
          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              type="text"
              id="designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
              placeholder="Enter designation"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cost">Cost ($)</label>
            <input
              type="number"
              id="cost"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter maintenance summary"
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-button">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;