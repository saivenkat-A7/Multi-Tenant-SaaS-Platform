import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [authData, setAuthData] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token, user: null } : null;
  });

  const getTokenExpiry = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  };

  const fetchUser = async (token) => {
    try {
      const res = await api.get("/api/auth/me", {
        headers: {
          Authorization:` Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      setAuthData({ token, user: res.data.data });
    } catch {
      logout();
    }
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuthData({ token, user: null });
    fetchUser(token);        // ✅ IMPORTANT
    navigate("/dashboard");  // ✅ redirect works
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthData(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!authData?.token) return;

    const expiryTime = getTokenExpiry(authData.token);
    if (!expiryTime || expiryTime <= Date.now()) {
      logout();
      return;
    }

    if (!authData.user) {
      fetchUser(authData.token); // ✅ reload user on refresh
    }

    const timer = setTimeout(logout, expiryTime - Date.now());
    return () => clearTimeout(timer);
  }, [authData?.token]);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};