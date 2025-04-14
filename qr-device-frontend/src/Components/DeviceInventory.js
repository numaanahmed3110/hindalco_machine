import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
// import { useNavigate } from "react-router-dom";
import "./DeviceInventory.css";
import { FiSearch, FiGrid, FiList, FiX } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";

const DeviceInventory = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [error, setError] = useState(null);
  const { role } = useAuth();

  // const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching devices...");
        const response = await apiClient.get("/devices");
        if (isMounted) {
          console.log("Devices fetched successfully:", response.data.length);
          setDevices(response.data);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
        if (isMounted) {
          setError(
            error.message || "Failed to load devices. Please try again."
          );
          setDevices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDevices();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDevices = devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Device Inventory</h1>
            <div className="role-badge">{role}</div>
          </div>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions"></div>
        </div>
      </header>

      <div className="content-header">
        <h2>Device Inventory</h2>
        <div className="view-controls">
          <button
            className={`view-button modern ${
              viewMode === "grid" ? "active" : ""
            }`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <FiGrid />
          </button>
          <button
            className={`view-button modern ${
              viewMode === "list" ? "active" : ""
            }`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <FiList />
          </button>
        </div>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading devices...</div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className={`device-grid ${viewMode}`}>
            {filteredDevices.map((device) => (
              <div
                key={device._id}
                className="device-card"
                onClick={() => {
                  setSelectedDevice(device);
                  setShowQRModal(true);
                }}
              >
                <h3>{device.name}</h3>
                <p>Model: {device.model}</p>
                <p>Serial: {device.serialNumber}</p>
                <p>Status: {device.status}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showQRModal && selectedDevice && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <button
              className="close-button"
              onClick={() => setShowQRModal(false)}
            >
              <FiX />
            </button>
            <h3>{selectedDevice.name} - QR Code</h3>
            <div className="qr-code-container">
              <QRCodeSVG
                value={`https://hindalco-machine.vercel.app/device-view/${selectedDevice._id}`}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <button
              className="download-button"
              onClick={() => {
                const svgElement = document.querySelector(
                  ".qr-code-container svg"
                );
                if (svgElement) {
                  const svgData = new XMLSerializer().serializeToString(
                    svgElement
                  );
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.download = `${selectedDevice.name}-QR.png`;
                    link.href = url;
                    link.click();
                  };
                  img.src =
                    "data:image/svg+xml;base64," +
                    btoa(unescape(encodeURIComponent(svgData)));
                }
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceInventory;
