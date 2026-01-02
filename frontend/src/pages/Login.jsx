import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
 
const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ use login

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    subdomain: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccessMsg("");

    if (!formData.email || !formData.password ) {
      setErrors("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
        tenantSubdomain: formData.subdomain,
      });

      if (res.data.success) {
        setSuccessMsg("Login successful! Redirecting...");
        login(res.data.data.token);
        navigate("/dashboard");
        // ✅ IMPORTANT
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient">
      <div className="form-card">
        <h2>Login</h2>
        <p>Enter your credentials to continue</p>

        {errors && <div className="alert-error">{errors}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Email", name: "email", type: "email", autocomplete: "username" },
            { label: "Password", name: "password", type: "password", autocomplete: "current-password" },
            { label: "Tenant Subdomain", name: "subdomain", type: "text", autocomplete: "organization" },
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input-field"
                autoComplete={field.autocomplete} // ✅ added
              />
            </div>
          ))}

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </div>

          <button type="submit" className="bg-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
