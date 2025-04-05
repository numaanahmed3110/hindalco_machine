import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./App.css";
import DeviceTemplate from "./Components/DeviceTemplate";
import LandingPage from "./Components/Auth/LandingPage";
import DeviceInventory from "./Components/DeviceInventory";
import { ClerkAuthProvider } from "./Components/Auth/ClerkAuthProvider";
import RoleProtected from "./Components/Auth/RoleProtected";

// Create an Unauthorized component
const Unauthorized = () => (
  <div className="unauthorized">
    <h1>Unauthorized Access</h1>
    <p>You don't have permission to access this page.</p>
    <a href="/">Return to Home</a>
  </div>
);

function App() {
  return (
    <ClerkProvider publishableKey="pk_test_YWJvdmUtbWFtbW90aC0yNS5jbGVyay5hY2NvdW50cy5kZXYk">
      <ClerkAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/inventory"
              element={
                <RoleProtected requiredRole="user">
                  <DeviceInventory />
                </RoleProtected>
              }
            />
            <Route
              path="/device-view/:id"
              element={
                <RoleProtected requiredRole="user">
                  <DeviceTemplate />
                </RoleProtected>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/inventory" replace />} />
          </Routes>
        </Router>
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}

export default App;
