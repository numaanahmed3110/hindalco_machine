import axios from "axios";

// Use environment variables for API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://hindalco-machine.onrender.com";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
