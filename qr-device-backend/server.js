const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const QRCode = require("qrcode");
const { Clerk } = require("@clerk/clerk-sdk-node");
const Device = require("./models/Device");
const User = require("./models/User");
const { requireAuth, roles } = require("./middleware/auth");

// Initialize Clerk
const clerk = new Clerk(process.env.CLERK_SECRET_KEY);

const app = express();
// CORS configuration with proper credentials handling
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://hindalco-machine.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://hindalco-machine.onrender.com",
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(
          new Error(
            "The CORS policy for this site does not allow access from the specified Origin."
          ),
          false
        );
      }
      return callback(null, true);
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Webhook endpoint for Clerk user creation
app.post("/webhook/clerk", async (req, res) => {
  try {
    const evt = req.body;
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const newUser = new User({
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        role: "user", // Default role
      });

      await newUser.save();
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://affanpics:affanaffan@cluster0.jafgy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/test"
    );
    console.log("Connected to MongoDB");

    app.listen(7349, () => {
      console.log(`Server running on port 7349`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

startServer();

app.post("/add-device", requireAuth, roles.requireAdmin, async (req, res) => {
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
    // IMPORTANT: Change this URL to your production URL when deployed
    const qrCodeData = `https://hindalco-machine.vercel.app/device-tools/view/${newDevice._id}`;

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Store QR code in database
    newDevice.qrCode = qrCodeImage;
    await newDevice.save();

    res.json({ success: true, qrCodeUrl: qrCodeImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/devices", requireAuth, roles.requireUser, async (req, res) => {
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
app.get("/device/:id", requireAuth, roles.requireUser, async (req, res) => {
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
