import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmail, supabase } from "../../supabase/supabaseClient";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [returnUrl, setReturnUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract returnUrl from query parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const returnUrlParam = queryParams.get("returnUrl");
    if (returnUrlParam) {
      setReturnUrl(returnUrlParam);
    }
  }, [location]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter both email and password", "error");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        if (error.message.includes("verify your email")) {
          showToast(
            "Please check your email for verification link. Click here to resend verification email.",
            "warning"
          );
          // Add click handler to the toast message
          const toastElement = document.querySelector(".warning");
          if (toastElement) {
            toastElement.style.cursor = "pointer";
            toastElement.onclick = async () => {
              try {
                const { error: resendError } = await supabase.auth.resend({
                  type: "signup",
                  email: email,
                });
                if (resendError) throw resendError;
                showToast("Verification email resent successfully!", "success");
              } catch (err) {
                showToast(
                  "Failed to resend verification email. Please try again.",
                  "error"
                );
              }
            };
          }
          return;
        }
        showToast(error.message, "error");
        return;
      }

      if (data?.user) {
        showToast("You have successfully logged in.", "success");
        // If returnUrl is set, navigate to that URL instead of the default inventory page
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          // Default navigation to inventory page
          navigate("/inventory");
        }
      }
    } catch (error) {
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        {toast.message && (
          <div className={`error-message ${toast.type}`}>{toast.message}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  width: "auto",
                  padding: "4px",
                  color: "#666",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : "Log In"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
