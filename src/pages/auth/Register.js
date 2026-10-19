import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { toast } from "react-hot-toast"; //toast for notifications
import "./Login.css";
import "./Register.css";

// Public sign-up creates employee accounts only. HR and admin accounts are
// created by existing admins; the backend enforces the same rule.
const PUBLIC_ROLE = "employee";
const MIN_PASSWORD_LENGTH = 8;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: PUBLIC_ROLE,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/users/register", formData);

      if (response.status === 201) {
        toast.success("Registration successful!");
        navigate("/login"); // redirect to login
      }
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder={`Password (min. ${MIN_PASSWORD_LENGTH} characters)`}
            value={formData.password}
            onChange={handleChange}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <p className="auth-hint">
            You will get an employee account. HR and admin accounts are created
            by your administrator.
          </p>
          {loading && (
            <p className="auth-hint">
              Contacting the server… if it has been asleep this can take up to
              a minute.
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
