import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { toast } from "react-hot-toast"; // toast for notifications
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle field change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/users/login", formData);

      // save JWT
      const token = res.data.token;
      localStorage.setItem("token", token);

      // decode token to get user info
      const decoded = jwtDecode(token);
      const user = { id: decoded.id, email: decoded.email, role: decoded.role };
      localStorage.setItem("user", JSON.stringify(user));

      // redirect based on role (unknown roles fall back to the employee page)
      navigate(ROLE_HOME[user.role] || PATHS.employee);
      toast.success("Login successful!");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  //  UI
  return (
    <PageLayout>
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {loading && (
            <p className="auth-hint">
              Contacting the server… this can take up to 20 seconds if it is
              waking up.
            </p>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Don't have an account? Register</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
