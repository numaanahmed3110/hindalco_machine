import React from "react";
import { FiExternalLink } from "react-icons/fi";
import apiClient from "../api/apiClient";

function QRGenerator({ deviceId }) {
  const deviceUrl = `https://hindalco-machine.vercel.app/device-view/${deviceId}`;

  return (
    <div className="qr-generator">
      <h3>Scan or Click the QR Code</h3>
      <a href={deviceUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={`${apiClient.defaults.baseURL}/devices/qr/${deviceId}`}
          alt="QR Code"
          className="qr-code-image"
        />
      </a>
      <p>Click the QR code or scan with your device</p>

      <a
        href={deviceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="direct-link-button"
      >
        <FiExternalLink className="link-icon" />
        Open Device Details
      </a>
    </div>
  );
}

export default QRGenerator;
