import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAllCache } from "../utils/cache";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAllCache();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="nav-left">
        <span className="brandname">WalletWise</span><br />
        Your Personal Finance Manager
      </div>

      <div className="nav-center">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/details">Details</Link>
      </div>

      <div className="nav-right">
        <div className="profile-container">
          <span className="profile-icon" onClick={() => setOpen(!open)}>
            👤
          </span>

          {open && (
            <div className="profile-dropdown">
              <p><Link to="/profile" onClick={() => setOpen(false)}>User Profile</Link></p>
              <p onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</p>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
}

export default Navbar;