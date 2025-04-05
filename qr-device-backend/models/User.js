const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "maintainer", "administrator"],
      default: "user",
    },
    firstName: String,
    lastName: String,
    lastLogin: Date,
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Devices",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
