import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  supabase,
  getCurrentUser,
  getUserRole,
  signOut,
} from "../supabase/supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Function to update user state with session data
  const updateUserState = useCallback(
    async (session) => {
      try {
        if (session) {
          console.log("Updating user state with session", session.user.id);
          const { user: currentUser } = await getCurrentUser();
          const { role: userRole } = await getUserRole();
          setUser(currentUser);
          setRole(userRole);

          // Store session expiry time for validation checks
          localStorage.setItem("sessionExpiresAt", session.expires_at);
        } else {
          // Clear user state when no session exists
          console.log("No session available, clearing user state");
          setUser(null);
          setRole(null);
          localStorage.removeItem("sessionExpiresAt");
        }
      } catch (error) {
        console.error("Error updating user state:", error.message);
        // Handle authentication errors by clearing state
        setUser(null);
        setRole(null);
        localStorage.removeItem("sessionExpiresAt");
      }
    },
    [setUser, setRole]
  );

  // Handle user logout
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await signOut();
      if (error) throw error;
      // State will be updated by the auth state change listener
    } catch (error) {
      console.error("Error signing out:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        // Check for existing session in localStorage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        // Check if we have a session but it might be expired
        const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
        const isSessionExpired =
          sessionExpiresAt && parseInt(sessionExpiresAt) * 1000 < Date.now();

        if (session) {
          console.log("Found existing session", session.user.id);
          if (isSessionExpired) {
            console.log("Session appears expired, attempting refresh");
            try {
              const { data: refreshData, error: refreshError } =
                await supabase.auth.refreshSession();
              if (refreshError) throw refreshError;
              if (refreshData.session) {
                console.log("Session refreshed successfully");
                await updateUserState(refreshData.session);
              }
            } catch (refreshErr) {
              console.error("Failed to refresh session:", refreshErr);
              setUser(null);
              setRole(null);
              localStorage.removeItem("sessionExpiresAt");
            }
          } else {
            console.log("Found valid existing session", session);
            await updateUserState(session);
          }
        } else {
          // No session exists
          console.log("No existing session found");
          setUser(null);
          setRole(null);
          localStorage.removeItem("sessionExpiresAt");
        }
      } catch (error) {
        console.error("Error initializing auth:", error.message);
        setUser(null);
        setRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event);

      // Handle specific auth events
      if (event === "SIGNED_IN") {
        await updateUserState(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRole(null);
      } else if (event === "TOKEN_REFRESHED") {
        // Update user state when token is refreshed
        console.log("Token refreshed event received", session);
        if (session) {
          console.log("Updating state with refreshed token");
          await updateUserState(session);
        } else {
          console.warn("Token refresh event received but no session available");
          // Attempt to get a fresh session
          try {
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData?.session) {
              await updateUserState(refreshData.session);
            }
          } catch (refreshErr) {
            console.error(
              "Failed to refresh session after TOKEN_REFRESHED event:",
              refreshErr
            );
            setUser(null);
            setRole(null);
            localStorage.removeItem("sessionExpiresAt");
          }
        }
      } else {
        // For other events, update based on session existence
        await updateUserState(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [updateUserState]);

  // Function to check and refresh token if needed
  const checkAndRefreshToken = useCallback(async () => {
    try {
      const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
      // If session expires in less than 5 minutes (300 seconds), refresh it
      const shouldRefresh =
        sessionExpiresAt &&
        parseInt(sessionExpiresAt) * 1000 - Date.now() < 300000;

      if (shouldRefresh) {
        console.log("Token expiring soon, refreshing...");
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        if (data?.session) {
          await updateUserState(data.session);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }, [updateUserState]);

  // Set up periodic token refresh check and handle page visibility
  useEffect(() => {
    if (!user) return;

    // Check token every minute
    const tokenCheckInterval = setInterval(() => {
      checkAndRefreshToken();
    }, 60000);

    // Handle page visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User switched away from the tab - start a session timeout
        const timeoutId = setTimeout(() => {
          // If user doesn't return within 30 minutes, clear the session
          console.log("Session timeout due to inactivity");
          localStorage.removeItem("sessionExpiresAt");
          signOut();
        }, 30 * 60 * 1000); // 30 minutes timeout

        setSessionTimeout(timeoutId);
      } else if (document.visibilityState === "visible") {
        // User returned to the tab - clear the timeout
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
          setSessionTimeout(null);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(tokenCheckInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [user, checkAndRefreshToken, sessionTimeout]);

  // Handle page unload (close/refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Store a flag indicating the page is being closed
      sessionStorage.setItem("pageClosing", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const value = {
    user,
    role,
    loading,
    sessionChecked,
    logout, // Expose logout function to components
    checkAndRefreshToken, // Expose token refresh function
  };

  return (
    <AuthContext.Provider value={value}>
      {(!loading || sessionChecked) && children}
    </AuthContext.Provider>
  );
};
