const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const qr = require("qr-image");
const auth = require("../middleware/auth");

// Get all devices (Admin and Maintainer only)
router.get("/", auth(["admin", "maintainer"]), async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching devices" });
  }
});

// Get a single device by ID (Public route - no authentication required)
router.get("/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Device not found" });
    res.json(device);
  } catch (err) {
    res.status(500).json({ message: "Error fetching device" });
  }
});

// Generate QR Code for a device (including details) - Protected route
router.get("/qr/:id", auth(["admin", "maintainer"]), async (req, res) => {
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
router.put("/:id/warranty", auth(["admin"]), async (req, res) => {
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
router.post(
  "/:id/maintenance",
  auth(["admin", "maintainer"]),
  async (req, res) => {
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
  }
);

// Update device tutorial video
router.patch(
  "/:id/tutorial-video",
  auth(["admin"]), // Keep your auth middleware if needed
  async (req, res) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: "Video URL is required" });
    }

    try {
      const device = await Device.findById(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      device.tutorialVideo = videoUrl;
      await device.save();

      res.status(200).json({
        message: "Tutorial video updated successfully",
        device,
      });
    } catch (error) {
      console.error("Error updating tutorial video:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
