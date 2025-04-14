import React, { useState, useEffect } from "react";
import "./DevicePage.css";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiDownload,
  FiPrinter,
  FiMoreVertical,
  FiPlus,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import apiClient from "../api/apiClient";

const DevicePage = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    setLoading(true);

    const fetchDevices = async () => {
      try {
        const response = await apiClient.get("/devices");
        // Handle both response formats - either direct array or nested in data.devices
        const data = response.data;
        const deviceArray = Array.isArray(data)
          ? data
          : data.data && Array.isArray(data.data.devices)
          ? data.data.devices
          : data.data && Array.isArray(data.data)
          ? data.data
          : [];
        setDevices(deviceArray);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError(error.message || "Failed to fetch devices");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Function to toggle device selection
  const toggleDevice = (id) => {
    setSelectedDevice(selectedDevice === id ? null : id);
  };

  // Filter devices based on search input - with null/undefined checks
  const filteredDevices = Array.isArray(devices)
    ? devices.filter(
        (device) =>
          (device.name?.toLowerCase() || "").includes(
            filterValue.toLowerCase()
          ) ||
          (device.model?.toLowerCase() || "").includes(
            filterValue.toLowerCase()
          ) ||
          (device.serialNumber?.toLowerCase() || "").includes(
            filterValue.toLowerCase()
          )
      )
    : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Get primary image for device
  const getDeviceImage = (device) => {
    if (device.images && device.images.length > 0) {
      const primaryImage =
        device.images.find((img) => img.isPrimary) || device.images[0];
      return primaryImage.url;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  const getDeviceUrl = (deviceId) => {
    return `https://hindalco-machine.vercel.app/device-view/${deviceId}`;
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your devices...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="device-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Device Inventory</h1>
          <p className="subtitle">
            Manage and track your industrial equipment portfolio
          </p>
        </div>

        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search devices..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="search-input"
            />
            <FiSearch className="search-icon" />
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-button ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button
              className={`toggle-button ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No devices found</h3>
          <p>
            {filterValue
              ? `No results for "${filterValue}". Try different keywords.`
              : "Add some devices to get started."}
          </p>
          <button className="add-device-button">
            <FiPlus className="button-icon" /> Add New Device
          </button>
        </div>
      ) : (
        <motion.div
          className={`device-container ${viewMode}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
        >
          {filteredDevices.map((device) => (
            <motion.div
              key={device._id}
              className="device-card"
              variants={itemVariants}
              layout
            >
              <div className="card-image">
                <img src={getDeviceImage(device)} alt={device.name} />
              </div>

              <div className="card-header">
                <h3>{device.name}</h3>
                <span className="device-badge">{device.model}</span>
              </div>

              <div className="device-info">
                <div className="info-row">
                  <span className="info-label">Serial</span>
                  <span className="info-value">{device.serialNumber}</span>
                </div>

                {device.manufacturer && (
                  <div className="info-row">
                    <span className="info-label">Manufacturer</span>
                    <span className="info-value">{device.manufacturer}</span>
                  </div>
                )}

                {device.location && (
                  <div className="info-row">
                    <span className="info-label">Location</span>
                    <span className="info-value">
                      {`${device.location.building || ""} ${
                        device.location.room ? `- ${device.location.room}` : ""
                      }`}
                    </span>
                  </div>
                )}

                <div className="info-row">
                  <span className="info-label">Details</span>
                  <span className="info-value details">{device.details}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className={`qr-button ${
                    selectedDevice === device._id ? "active" : ""
                  }`}
                  onClick={() => toggleDevice(device._id)}
                >
                  {selectedDevice === device._id
                    ? "Hide QR Code"
                    : "Show QR Code"}
                </button>

                <button className="options-button">
                  <FiMoreVertical />
                </button>
              </div>

              {selectedDevice === device._id && (
                <motion.div
                  className="qr-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  layout
                >
                  <a
                    href={getDeviceUrl(device._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qr-link"
                  >
                    <img
                      src={`https://hindalco-machine.onrender.com/device/qr/${device._id}`}
                      alt="QR Code"
                      className="qr-image"
                    />
                  </a>
                  <p className="qr-help">
                    Click QR code or scan to view details
                  </p>
                  <div className="qr-actions">
                    <a
                      href={`https://hindalco-machine.onrender.com/device/qr/${device._id}`}
                      download={`qr-${device.name}.png`}
                      onClick={(e) => {
                        e.preventDefault();
                        downloadQRAsPDF(device);
                      }}
                      className="download-link"
                    >
                      <FiDownload className="action-icon" />
                      Download
                    </a>
                    <button className="print-button">
                      <FiPrinter className="action-icon" />
                      Print
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.button
        className="fab-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiPlus />
      </motion.button>
    </div>
  );
};

export default DevicePage;

const downloadQRAsPDF = (device) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  pdf.setFontSize(16);
  pdf.text("Device QR Code", 105, 20, { align: "center" });

  // Add device info
  pdf.setFontSize(12);
  pdf.text(`Device Name: ${device.name}`, 20, 40);
  pdf.text(`Model: ${device.model || "N/A"}`, 20, 50);
  pdf.text(`Serial Number: ${device.serialNumber || "N/A"}`, 20, 60);

  // Add QR code image
  const qrImage = new Image();
  qrImage.src = `https://hindalco-machine.onrender.com/device/qr/${device._id}`;
  qrImage.onload = function () {
    pdf.addImage(qrImage, "PNG", 65, 80, 80, 80);
    pdf.save(`qr-${device.name}.pdf`);
  };
};
