import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { authData, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const role = authData?.user?.role;

  // 🔑 Close mobile menu
  const closeMobileMenu = () => setOpen(false);

  return (
    <nav className="navbar">
      {/* ✅ Logo */}
      <div className="logo" onClick={closeMobileMenu}>
        Multi-Tenant SaaS
      </div>

      {/* ✅ Hamburger */}
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* ✅ Nav Links */}
      <ul className={`nav-links ${open ? "open" : ""}`}>
        <li>
          <Link to="/dashboard" onClick={closeMobileMenu}>
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/projects" onClick={closeMobileMenu}>
            Projects
          </Link>
        </li>

        {(role === "tenant_admin" || role === "super_admin") && (
          <li>
            <Link to="/tasks" onClick={closeMobileMenu}>
              Tasks
            </Link>
          </li>
        )}

        {role === "tenant_admin" && (
          <li>
            <Link to="/users" onClick={closeMobileMenu}>
              Users
            </Link>
          </li>
        )}

        {role === "super_admin" && (
          <li>
            <Link to="/tenants" onClick={closeMobileMenu}>
              Tenants
            </Link>
          </li>
        )}
      </ul>

      {/* ✅ User Dropdown */}
      <div
        className="user-menu"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}  
      >
        <span>
          {authData?.user?.fullName} ({role})
        </span>

        {menuOpen && (
          <div className="dropdown">
            <Link to="/profile" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <Link to="/settings" onClick={() => setMenuOpen(false)}>
              Settings
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;