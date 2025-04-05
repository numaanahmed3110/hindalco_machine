import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useUserRole } from "./ClerkProvider";
import {
  FiGrid,
  FiSearch,
  FiDownload,
  FiPrinter,
  FiPlus,
  FiShield,
  FiList,
  FiX,
} from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import "./DeviceInventory.css";

const DeviceInventory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const userRole = useUserRole();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        if (!user) throw new Error("No authenticated user");
        const token = await getToken();
        if (!token) throw new Error("Failed to get authentication token");

        const response = await axios.get(
          "https://hindalco-machine.onrender.com/devices",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDevices(response.data);
      } catch (error) {
        console.error("Error fetching devices:", error.message);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user, getToken]);

  const filteredDevices = devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <h1>DeviceTrack</h1>
          <span className="tagline">Industrial Equipment Management</span>
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
          {userRole && (
            <div className="role-indicator">
              <FiShield /> {userRole}
            </div>
          )}
          {(userRole === "administrator" || userRole === "maintainer") && (
            <>
              <button className="action-button">
                <FiDownload /> Export
              </button>
              <button className="action-button">
                <FiPrinter /> Print
              </button>
            </>
          )}
        </div>
      </header>

      <div className="content-header">
        <h2>Device Inventory</h2>
        <div className="view-controls">
          <button
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <FiGrid /> Grid
          </button>
          <button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <FiList /> List
          </button>
          {userRole === "administrator" && (
            <button className="add-device-button">
              <FiPlus /> Add Device
            </button>
          )}
        </div>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading devices...</div>
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
