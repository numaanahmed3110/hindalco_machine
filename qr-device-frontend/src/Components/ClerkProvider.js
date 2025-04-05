import {
  ClerkProvider as BaseClerkProvider,
  useUser,
  Protect,
} from "@clerk/clerk-react";
import React from "react";

export const ClerkProvider = ({ children }) => {
  return (
    <BaseClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </BaseClerkProvider>
  );
};

export const useUserRole = () => {
  const { user } = useUser();
  return user?.publicMetadata?.role || "user";
};

export const withRoleCheck = (WrappedComponent, requiredRole) => {
  return function WithRoleCheckComponent(props) {
    const role = useUserRole();
    const roleHierarchy = {
      administrator: 3,
      maintainer: 2,
      user: 1,
    };

    if (!role || roleHierarchy[role] < roleHierarchy[requiredRole]) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export const ProtectResource = ({ children, role, permission, fallback }) => {
  return (
    <Protect
      role={role}
      permission={permission}
      fallback={
        fallback || (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this resource.</p>
          </div>
        )
      }
    >
      {children}
    </Protect>
  );
};
