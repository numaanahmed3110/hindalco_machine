// const express = require("express");
// const router = express.Router();
// const Device = require("../models/Device");
// const qr = require("qr-image");

// // Generate QR Code for a device
// router.get("/qr/:id", async (req, res) => {
//     try {
//         const device = await Device.findById(req.params.id);
//         if (!device) return res.status(404).json({ message: "Device not found" });

//         // QR Code contains URL to fetch device details
//         const qrData = `http://localhost:3000/device/${device._id}`;
//         const qrCode = qr.image(qrData, { type: "png" });

//         res.type("png");
//         qrCode.pipe(res);
//     } catch (err) {
//         res.status(500).json({ message: "QR generation failed" });
//     }
// });

// // Get device details when scanned
// router.get("/:id", async (req, res) => {
//     try {
//         const device = await Device.findById(req.params.id);
//         if (!device) return res.status(404).json({ message: "Device not found" });

//         res.json(device);
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching device" });
//     }
// });

// // Update device warranty expiration
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

module.exports = router;
const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const qr = require("qr-image");

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

// Update device warranty expiration
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

module.exports = router;
