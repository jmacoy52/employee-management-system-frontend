import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { toast } from "react-hot-toast"; // toast for notifications
import { saveSession } from "../../auth/session";
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

      // save JWT and the user returned by the server
      const { token, user } = res.data;
      saveSession(token, user);

      // an admin-issued temporary password must be replaced first
      if (user.mustChangePassword) {
        navigate(PATHS.changePassword);
        toast("Please set a new password to continue.");
        return;
      }

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
              Contacting the server… if it has been asleep this can take up to
              a minute.
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
