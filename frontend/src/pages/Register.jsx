import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);


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

    if (
     
     
      !formData.adminEmail ||
      !formData.adminFullName ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrors("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setErrors("Please accept the terms and conditions.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/register-tenant", {
        tenantName: formData.organizationName.trim(),
        subdomain: formData.subdomain.trim().toLowerCase(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminPassword: formData.password,
        adminFullName: formData.adminFullName.trim(),
      });


      if (res.data.success) {
        setSuccessMsg("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setErrors(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient px-4">
      <div className="form-card">
        <h2>Create Tenant</h2>
        <p>Start managing your organization</p>

        {errors && <div className="alert-error">{errors}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label>Subdomain</label>
            <input
              type="text"
              placeholder="subdomain.yourapp.com"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label>Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label>Admin Full Name</label>
            <input
              type="text"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="pass">
            <label>Password</label>
            <input
              type={showPassword?"text":"password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <span style={{ marginLeft: "8px", fontSize: "14px" }}>
              I agree to the terms & conditions
            </span>
          </div>

          <button
            type="submit"
            className="bg-primary"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-center">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
