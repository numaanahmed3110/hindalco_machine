import React from "react";
import { Navigate } from "react-router-dom";
import { useClerkAuth } from "./ClerkAuthProvider";

const RoleProtected = ({ children, requiredRole }) => {
  const { isSignedIn, hasRole, isLoading } = useClerkAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleProtected;
