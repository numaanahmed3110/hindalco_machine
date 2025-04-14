import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdcnsmxvhelkvtoivdki.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkY25zbXh2aGVsa3Z0b2l2ZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njk1NzEsImV4cCI6MjA1OTU0NTU3MX0.p5QAeEshIHKmJln9clEw-jNAb3vifmWUZUPL3__ntyY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const signUpWithEmail = async (email, password, role) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role, // Store user role in Supabase user metadata
      },
    },
  });
  return { data, error };
};

export const signInWithEmail = async (email, password) => {
  if (!email || !password) {
    return { error: new Error("Email and password are required") };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase auth error:", error);
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return {
          error: new Error(
            "Invalid email or password. Please check your credentials and try again."
          ),
        };
      } else if (error.message.includes("Email not confirmed")) {
        return {
          error: new Error("Please verify your email before logging in."),
        };
      } else if (error.message.includes("Too many requests")) {
        return {
          error: new Error("Too many login attempts. Please try again later."),
        };
      }
      return { error: new Error("Authentication failed. Please try again.") };
    }

    if (!data?.user) {
      return { error: new Error("No user data received. Please try again.") };
    }

    // Store session expiry time for validation checks
    if (data.session) {
      localStorage.setItem("sessionExpiresAt", data.session.expires_at);
      console.log("Session stored with expiry:", data.session.expires_at);
    }

    return { data, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: new Error("An unexpected error occurred. Please try again later."),
    };
  }
};

export const signOut = async () => {
  // Clear any stored session data
  localStorage.removeItem("sessionExpiresAt");

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during sign out:", error);
  } else {
    console.log("User signed out successfully");
  }

  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserRole = async () => {
  const { user, error } = await getCurrentUser();
  const userRole = user?.user_metadata?.role;
  return {
    role: userRole === "admin" || userRole === "maintainer" ? userRole : null,
    error,
  };
};
