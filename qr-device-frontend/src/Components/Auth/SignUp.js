import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../../supabase/supabaseClient";
import "./Auth.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("maintainer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const validatePassword = (password) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters long" },
      { regex: /[0-9]/, text: "Contains a number" },
      { regex: /[a-z]/, text: "Contains a lowercase letter" },
      { regex: /[A-Z]/, text: "Contains an uppercase letter" },
      { regex: /[^A-Za-z0-9]/, text: "Contains a special character" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(password),
      text: req.text,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUpWithEmail(email, password, role);
      if (error) throw error;

      showToast("Please check your email for verification.", "success");
      navigate("/login");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = validatePassword(password);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
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
            <div className="password-requirements">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`password-requirement ${req.met ? "met" : ""}`}
                >
                  {req.met ? "✓" : "○"} {req.text}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Admin</option>
              <option value="maintainer">Maintainer</option>
            </select>
            <div className="helper-text">
              Select your role in the organization
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : "Sign Up"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
