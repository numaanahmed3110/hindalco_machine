import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";
import DeviceTemplate from "./Components/DeviceTemplate";
import { jsPDF } from "jspdf";
import {
  FiGrid,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiPlus,
} from "react-icons/fi";

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://hindalco-machine.onrender.com/devices")
      .then((response) => {
        setDevices(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setLoading(false);
      });
  }, []);

  // Filter devices based on search
  const filteredDevices = devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeviceUrl = (deviceId) => {
    return `https://hindalco-machine.onrender.com/device-view/${deviceId}`;
  };

  return (
    <Router>
      <Routes>
        <Route path="/device-view/:id" element={<DeviceTemplate />} />
        <Route
          path="/"
          element={
            <div className="app-container">
              <header className="app-header">
                <div className="logo-container">
                  <h1>DeviceTrack</h1>
                  <span className="tagline">
                    Industrial Equipment Management
                  </span>
                </div>
                <div className="search-container">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="header-actions">
                  <button className="action-button">
                    <FiFilter /> Filter
                  </button>
                  <button className="action-button">
                    <FiDownload /> Export
                  </button>
                  <button className="action-button">
                    <FiPrinter /> Print
                  </button>
                </div>
              </header>

              <div className="content-header">
                <h2>Device Inventory</h2>
                <div className="view-controls">
                  <button
                    className={`view-button ${
                      viewMode === "grid" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <FiGrid /> Grid
                  </button>
                  <button
                    className={`view-button ${
                      viewMode === "list" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <FiGrid /> List
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading devices...</p>
                </div>
              ) : (
                <div className={`device-grid ${viewMode}`}>
                  {filteredDevices.map((device) => (
                    <div key={device._id} className="device-card">
                      <div className="device-card-header">
                        <h3 className="device-name">{device.name}</h3>
                        <p className="device-model">{device.model}</p>
                      </div>

                      <div className="device-details">
                        <div className="detail-row">
                          <span className="detail-label">Serial:</span>
                          <span className="detail-value">
                            {device.serialNumber}
                          </span>
                        </div>
                        {device.manufacturer && (
                          <div className="detail-row">
                            <span className="detail-label">Manufacturer:</span>
                            <span className="detail-value">
                              {device.manufacturer}
                            </span>
                          </div>
                        )}
                        {device.location && (
                          <div className="detail-row">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">
                              {device.location.building}{" "}
                              {device.location.room &&
                                `- ${device.location.room}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="device-actions">
                        <button
                          className="qr-btn"
                          onClick={() =>
                            setSelectedDevice(
                              selectedDevice === device._id ? null : device._id
                            )
                          }
                        >
                          {selectedDevice === device._id
                            ? "Hide QR"
                            : "Show QR"}
                        </button>
                        {selectedDevice === device._id && (
                          <button
                            onClick={() => {
                              const pdf = new jsPDF({
                                orientation: "portrait",
                                unit: "mm",
                                format: "a4",
                              });

                              // Add title
                              pdf.setFontSize(16);
                              pdf.text("Device QR Code", 105, 20, {
                                align: "center",
                              });

                              // Add device info
                              pdf.setFontSize(12);
                              pdf.text(`Device Name: ${device.name}`, 20, 40);
                              pdf.text(
                                `Model: ${device.model || "N/A"}`,
                                20,
                                50
                              );
                              pdf.text(
                                `Serial Number: ${
                                  device.serialNumber || "N/A"
                                }`,
                                20,
                                60
                              );

                              // Add QR code image
                              const qrImage = new Image();
                              qrImage.src = `https://hindalco-machine.onrender.com/devices/qr/${device._id}`;
                              qrImage.onload = function () {
                                pdf.addImage(qrImage, "PNG", 65, 80, 80, 80);
                                pdf.save(`qr-${device.name}.pdf`);
                              };
                            }}
                            className="qr-btn download-btn"
                            style={{ textDecoration: "none" }}
                          >
                            <FiDownload /> Download QR
                          </button>
                        )}
                      </div>

                      {selectedDevice === device._id && (
                        <div className="qr-container">
                          <h4>Scan or click to view device details</h4>
                          <a
                            href={getDeviceUrl(device._id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`https://hindalco-machine.onrender.com/devices/qr/${device._id}`}
                              alt="QR Code"
                              className="qr-image"
                            />
                          </a>
                          <p className="qr-help">
                            Point your device camera or click the QR code
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button className="add-device-fab">
                <FiPlus />
              </button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
