const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const QRCode = require("qrcode");
const Device = require("./models/Device");

const app = express();
// CORS configuration with proper credentials handling
app.use(
  cors({
    origin: "*",
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
    await mongoose.connect(
      "mongodb+srv://affanpics:affanpics@cluster0.jafgy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/test"
    );
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
    // Hardcoded frontend URL instead of using environment variables
    const frontendUrl =
      "https://hindalco-machine.vercel.app" || "http://localhost:5173";
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

app.use("/devices", require("./routes/deviceRoutes"));
