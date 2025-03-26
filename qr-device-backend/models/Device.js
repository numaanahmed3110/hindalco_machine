const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    name: String,
    model: String,
    serialNumber: String,
    details: String,
    // Add image support
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    // Additional device details
    manufacturer: String,
    purchaseDate: Date,
    warrantyExpiration: Date,
    category: String,
    location: {
        building: String,
        room: String,
        floor: String
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired', 'lost'],
        default: 'active'
    },
    maintenanceHistory: [{
        date: Date,
        description: String,
        technician: String,
        cost: Number
    }],
    qrCode: String, // Store the generated QR code URL or data
    tutorialVideo: String // Store YouTube video URL for machine operation tutorial
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Devices", deviceSchema);
