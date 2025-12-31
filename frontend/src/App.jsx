import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from  "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Tenants from "./pages/Tenants";
import Users from "./pages/Users";


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>


        <Routes>
          {/* 🔓 Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <Navbar />
                <ProjectDetails />
              </ProtectedRoute>
            }
          />


          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Navbar />
                <Projects />
              </ProtectedRoute>
            }


          />
           <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Navbar />
                <Tasks />
              </ProtectedRoute>
            }


          />
           <Route
            path="/tenants"
            element={
              <ProtectedRoute>
                <Navbar />
                <Tenants />
              </ProtectedRoute>
            }


          />
           <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Navbar />
                <Users />
              </ProtectedRoute>
            }


          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;