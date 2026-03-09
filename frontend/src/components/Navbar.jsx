import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

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
          <span
            className="profile-icon"
            onClick={() => setOpen(!open)}
          >
            👤
          </span>

          {open && (
            <div className="profile-dropdown">
              <p>User Profile</p>
              <p><Link to="/">Logout</Link></p>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
}

export default Navbar;