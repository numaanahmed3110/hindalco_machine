const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const qr = require("qr-image");

// Get all devices
router.get("/", async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching devices" });
  }
});

// Generate QR Code for a device (including details)
router.get("/qr/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Device not found" });

    // Hardcoded frontend URL instead of using environment variables
    const frontendUrl =
      "https://hindalco-machine.vercel.app" || "http://localhost:5173";
    const qrData = `${frontendUrl}/device-view/${device._id}`;

    // Generate QR image
    const qrCode = qr.image(qrData, { type: "png" });

    res.setHeader("Content-Type", "image/png");
    qrCode.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "QR generation failed" });
  }
});

// Update device warranty expiration (Admin only)
router.put("/:id/warranty", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Device not found" });

    device.warrantyExpiration = req.body.warrantyExpiration;
    await device.save();

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: "Error updating warranty expiration" });
  }
});

// Add maintenance record (Maintainer and Admin)
router.post("/:id/maintenance", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Device not found" });

    const maintenanceRecord = {
      date: new Date(),
      description: req.body.description,
      technician: req.body.technician,
      cost: req.body.cost,
    };

    device.maintenanceHistory.push(maintenanceRecord);
    await device.save();

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: "Error adding maintenance record" });
  }
});

module.exports = router;
