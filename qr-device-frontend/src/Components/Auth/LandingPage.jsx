import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import "./LandingPage.css";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("user");

  const roles = [
    { id: "user", label: "User" },
    { id: "maintainer", label: "Maintainer" },
    { id: "administrator", label: "Administrator" },
  ];

  return (
    <div className="landing-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>DeviceTrack</h1>
          <p>Industrial Equipment Management System</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "signin" ? "active" : ""}`}
            onClick={() => setActiveTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "signup" && (
          <div className="role-selector">
            <h3>Select your role:</h3>
            <div className="role-buttons">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`role-button ${
                    selectedRole === role.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="auth-form">
          {activeTab === "signin" ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignUpUrl="/sign-up"
              redirectUrl="/sign-up"
              appearance={{
                elements: {
                  rootBox: "cl-component",
                  card: "",
                  form: "",
                  formButtonPrimary: "button primary-button",
                  formFieldInput: "input-field",
                },
              }}
              afterSignInUrl="/dashboard"
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  rootBox: "cl-component",
                  card: "",
                  form: "",
                  formButtonPrimary: "button primary-button",
                  formFieldInput: "input-field",
                },
              }}
              initialValues={{
                role: selectedRole,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
