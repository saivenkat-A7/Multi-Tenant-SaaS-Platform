import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const ProtectedRoute = ({ children }) => {
  const { authData } = useContext(AuthContext); // ✅ use authData
  const token = authData?.token;               // ✅ extract token safely
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      try {
        // ✅ Add no-cache header to avoid 304
        await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });
        setIsAuth(true);
      } catch (err) {
        console.error(err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;