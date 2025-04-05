import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const ClerkAuthContext = createContext();

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error("useClerkAuth must be used within a ClerkAuthProvider");
  }
  return context;
};

export const ClerkAuthProvider = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUserRole = async () => {
      if (isSignedIn && user) {
        try {
          // Get the user's role from metadata
          const role = user.publicMetadata.role || "user";
          setUserRole(role);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user"); // Default to user role if there's an error
        }
      }
      setIsLoading(false);
    };

    initializeUserRole();
  }, [isSignedIn, user]);

  const hasRole = (requiredRole) => {
    if (!userRole) return false;

    // Role hierarchy: administrator > maintainer > user
    const roleHierarchy = {
      administrator: 3,
      maintainer: 2,
      user: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const value = {
    isSignedIn,
    user,
    userRole,
    isLoading,
    hasRole,
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
};
