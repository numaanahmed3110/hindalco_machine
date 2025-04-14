import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Components
import DeviceTemplate from "./Components/DeviceTemplate";
import DeviceInventory from "./Components/DeviceInventory";
import Login from "./Components/Auth/Login";
import SignUp from "./Components/Auth/SignUp";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

// Context
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Public Route for Device View - No Authentication Required */}
          <Route path="/device-view/:id" element={<DeviceTemplate />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["admin", "maintainer"]}>
                <DeviceInventory />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
