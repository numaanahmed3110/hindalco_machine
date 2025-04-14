const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const QRCode = require("qrcode");
const Device = require("./models/Device");

const app = express();

// CORS configuration with proper credentials handling
// Load environment variables
require("dotenv").config();

// CORS configuration with environment-based origin
// CORS configuration with support for multiple origins including localhost
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Define allowed origins
      const allowedOrigins = [
        "https://hindalco-machine.vercel.app",
        "http://localhost:3000",
      ];

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Import routes
const corsTestRoutes = require("./routes/corsTest");
const deviceRoutes = require("./routes/deviceRoutes");

// Mount routes
app.use("/cors-test", corsTestRoutes);
app.use("/devices", deviceRoutes);

const startServer = async () => {
  try {
    const MONGODB_URI =
      // process.env.MONGODB_URI ||
      "mongodb+srv://affanpics:affanaffan@cluster0.jafgy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/test";
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    app.listen(7349, () => {
      console.log(`Server running on port 7349`);
      console.log("CORS test endpoint available at /cors-test");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

startServer();

app.post("/add-device", async (req, res) => {
  try {
    const { name, model, serialNumber, details, tutorialVideo } = req.body;

    // Create a new device entry
    const newDevice = new Device({
      name,
      model,
      serialNumber,
      details,
      tutorialVideo,
    });

    // Generate a QR code that points to our frontend device viewer
    // Use FRONTEND_URL from environment variables for flexibility between environments
    const frontendUrl = "https://hindalco-machine.vercel.app";
    const qrCodeData = `${frontendUrl}/device-tools/view/${newDevice._id}`;

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Store QR code in database
    newDevice.qrCode = qrCodeImage;
    await newDevice.save();

    res.json({ success: true, qrCodeUrl: qrCodeImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/devices", async (req, res) => {
  try {
    const devices = await Device.find();
    // Fetch all devices from MongoDB
    console.log(devices);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new route to get a single device by ID
app.get("/device/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a PATCH route to update a device by ID
app.patch("/device/:id", async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      details,
      tutorialVideo,
      manufacturer,
      category,
      status,
      location,
    } = req.body;

    // Find the device first
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Update only the fields that are provided in the request
    if (name) device.name = name;
    if (model) device.model = model;
    if (serialNumber) device.serialNumber = serialNumber;
    if (details) device.details = details;
    if (tutorialVideo !== undefined) device.tutorialVideo = tutorialVideo;
    if (manufacturer) device.manufacturer = manufacturer;
    if (category) device.category = category;
    if (status) device.status = status;
    if (location) device.location = location;

    // Save the updated device
    await device.save();

    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route is already registered above
// app.use("/devices", require("./routes/deviceRoutes"));
// Add this dedicated route for tutorial video updates to your server.js
// app.patch("/update-tutorial-video/:id", async (req, res) => {
//   try {
//     const { videoUrl } = req.body;

//     if (!videoUrl) {
//       return res.status(400).json({ error: "Video URL is required" });
//     }

//     console.log(`Updating device ${req.params.id} with video URL: ${videoUrl}`);

//     const device = await Device.findById(req.params.id);

//     if (!device) {
//       return res.status(404).json({ error: "Device not found" });
//     }

//     device.tutorialVideo = videoUrl;
//     await device.save();

//     console.log("Device updated successfully");
//     res.json({ success: true, device });
//   } catch (error) {
//     console.error("Error updating tutorial video:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
