import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useUserRole } from "./ClerkProvider";

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const userRole = useUserRole();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is loaded and authenticated
        if (!userLoaded) return;

        if (!user) {
          // Redirect to sign-in if no user
          navigate("/sign-in", {
            replace: true,
            state: { returnUrl: window.location.pathname },
          });
          return;
        }

        // Get auth token
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        // Check user role
        if (!userRole) {
          throw new Error("User role not available");
        }

        // Role-based access control
        const allowedRoles = ["administrator", "maintainer", "viewer"];
        if (!allowedRoles.includes(userRole)) {
          throw new Error("Insufficient permissions");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Redirect to sign-in on auth failure
        navigate("/sign-in", {
          replace: true,
          state: { returnUrl: window.location.pathname },
        });
      }
    };

    checkAuth();
  }, [user, userLoaded, getToken, userRole, navigate]);

  // Show loading state while checking auth
  if (!userLoaded) {
    return <div className="loading">Checking authentication...</div>;
  }

  // Render children only if auth check passes
  return children;
};

export default AuthCheck;
