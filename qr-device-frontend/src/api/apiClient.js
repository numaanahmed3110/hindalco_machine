import axios from "axios";
import { supabase } from "../supabase/supabaseClient";

// Use environment variables for API base URL
const API_BASE_URL = "https://hindalco-machine.onrender.com";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Add response interceptor to handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("API request failed:", error.message);

    // Handle network errors or timeout errors
    if (!error.response) {
      console.error("Network error or timeout occurred");
    }

    return Promise.reject(error);
  }
);

// Add request interceptor to include auth token in all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const { data } = await supabase.auth.getSession();

      // If we have a session with a valid access token, add it to the request headers
      if (data?.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`;
        console.log("Added auth token to request");
      } else {
        // Try to refresh the session if no token is available
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token) {
          config.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
          console.log("Added refreshed auth token to request");
        } else {
          console.warn("No auth token available for request");
        }
      }
    } catch (error) {
      console.error("Error adding auth token to request:", error);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
