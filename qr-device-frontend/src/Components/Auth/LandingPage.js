import React, { useState } from "react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const { isSignedIn } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  if (isSignedIn) {
    return <Navigate to="/inventory" replace />;
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="landing-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>DeviceTrack</h1>
          <p>Industrial Equipment Management System</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        {isSignUp && (
          <div className="role-selector">
            <h3>Select your role:</h3>
            <div className="role-buttons">
              <button
                className={`role-button ${
                  selectedRole === "user" ? "active" : ""
                }`}
                onClick={() => handleRoleSelect("user")}
              >
                User
              </button>
              <button
                className={`role-button ${
                  selectedRole === "maintainer" ? "active" : ""
                }`}
                onClick={() => handleRoleSelect("maintainer")}
              >
                Maintainer
              </button>
              <button
                className={`role-button ${
                  selectedRole === "administrator" ? "active" : ""
                }`}
                onClick={() => handleRoleSelect("administrator")}
              >
                Administrator
              </button>
            </div>
          </div>
        )}

        <div className="auth-form">
          {isSignUp ? (
            <SignUp
              afterSignUpUrl="/inventory"
              signInUrl="/"
              unsafeMetadata={{ role: selectedRole }}
              appearance={{
                elements: {
                  formButtonPrimary: "button primary-button",
                  formFieldInput: "input-field",
                },
              }}
            />
          ) : (
            <SignIn
              afterSignInUrl="/inventory"
              signUpUrl="/"
              appearance={{
                elements: {
                  formButtonPrimary: "button primary-button",
                  formFieldInput: "input-field",
                },
              }}
              signInMode="popup"
              identifierType={["email", "phone_number"]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
