const express = require("express");
const router = express.Router();

// Simple CORS test route without authentication
router.get("/", (req, res) => {
  res.json({
    message: "CORS is working",
    origin: req.headers.origin || "No origin header",
    headers: req.headers,
  });
});

module.exports = router;
