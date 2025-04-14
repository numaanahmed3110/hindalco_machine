const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://hdcnsmxvhelkvtoivdki.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25zbXh2aGVsa3Z0b2l2ZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njk1NzEsImV4cCI6MjA1OTU0NTU3MX0.p5QAeEshIHKmJln9clEw-jNAb3vifmWUZUPL3__ntyY";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res
          .status(401)
          .json({ message: "No token, authorization denied" });
      }

      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        console.error("Supabase auth error:", error);
        return res.status(401).json({ message: "Token is not valid" });
      }

      // Add user from Supabase to request
      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "user",
      };

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Access denied. Insufficient permissions." });
      }

      next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      res.status(401).json({ message: "Token is not valid" });
    }
  };
};

module.exports = auth;
