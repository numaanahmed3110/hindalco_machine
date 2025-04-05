const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const qr = require("qr-image");
const { requireAuth, roles } = require("../middleware/auth");

// Generate QR Code for a device (including details)
router.get("/qr/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Device not found" });

    // Create a URL that points to our template website with device ID
    const qrData = `https://hindalco-machine.vercel.app/device-view/${device._id}`;

    // Generate QR image
    const qrCode = qr.image(qrData, { type: "png" });

    res.setHeader("Content-Type", "image/png");
    qrCode.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "QR generation failed" });
  }
});

// Update device warranty expiration (Admin only)
router.put(
  "/:id/warranty",
  requireAuth,
  roles.requireAdmin,
  async (req, res) => {
    try {
      const device = await Device.findById(req.params.id);
      if (!device) return res.status(404).json({ message: "Device not found" });

      device.warrantyExpiration = req.body.warrantyExpiration;
      await device.save();

      res.json(device);
    } catch (err) {
      res.status(500).json({ message: "Error updating warranty expiration" });
    }
  }
);

// Add maintenance record (Maintainer and Admin)
router.post(
  "/:id/maintenance",
  requireAuth,
  roles.requireMaintainer,
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

module.exports = router;
