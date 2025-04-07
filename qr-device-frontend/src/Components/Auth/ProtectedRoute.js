import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-spinner">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If user's role is not in the allowed roles, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
