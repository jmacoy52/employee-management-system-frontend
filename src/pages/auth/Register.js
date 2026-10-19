import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Info } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { toast } from "react-hot-toast"; //toast for notifications

// Public sign-up creates employee accounts only. HR and admin accounts are
// created by existing admins; the backend enforces the same rule.
const PUBLIC_ROLE = "employee";
const MIN_PASSWORD_LENGTH = 8;

// Returns the first problem with a password, or "" when it is acceptable.
export function passwordProblem(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return "";
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: PUBLIC_ROLE,
  });

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "password" && passwordError) setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const problem = passwordProblem(formData.password);
    if (problem) {
      setPasswordError(problem);
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
    <AuthLayout
      title="Create your account"
      subtitle="Register to get an employee account."
      footer={
        <span>
          Already have an account? <Link to="/login">Login</Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            name="username"
            placeholder="e.g. Ama Mensah"
            autoComplete="name"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="register-password">Password</label>
          <PasswordInput
            id="register-password"
            name="password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={Boolean(passwordError)}
            aria-describedby="register-password-help"
            required
          />
          {passwordError ? (
            <p id="register-password-help" className="field-error error" role="alert">
              {passwordError}
            </p>
          ) : (
            <p id="register-password-help" className="field-hint">
              Use {MIN_PASSWORD_LENGTH}+ characters with at least one letter and one number.
            </p>
          )}
        </div>
        <p className="auth-hint waking">
          <Info size={16} aria-hidden="true" />
          You will get an employee account. HR and admin accounts are created
          by your administrator.
        </p>
        {loading && (
          <p className="auth-hint waking" role="status">
            <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            Contacting the server… if it has been asleep this can take up to
            a minute.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <SubmitButton loading={loading} loadingText="Creating account…" className="btn-register">
          Register
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Register;
