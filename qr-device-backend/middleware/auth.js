const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");

// Middleware to require authentication
const requireAuth = ClerkExpressRequireAuth();

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ clerkId: req.auth.userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (allowedRoles.includes(user.role)) {
        req.user = user; // Attach user to request object
        next();
      } else {
        res
          .status(403)
          .json({ message: "Access denied. Insufficient permissions." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error checking user role", error: error.message });
    }
  };
};

// Role-based middleware shortcuts
const roles = {
  requireUser: checkRole(["user", "maintainer", "administrator"]),
  requireMaintainer: checkRole(["maintainer", "administrator"]),
  requireAdmin: checkRole(["administrator"]),
};

module.exports = {
  requireAuth,
  checkRole,
  roles,
};
