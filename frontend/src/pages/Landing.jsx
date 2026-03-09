import "./Landing.css";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-container">

      <h1 className="landing-title">WalletWise</h1>
      <p className="landing-subtitle">
        Your Personal Finance Manager
      </p>

      <div className="landing-buttons">
        <Link to="/dashboard">
          <button className="landing-btn">Login</button>
        </Link>

        <Link to="/dashboard">
          <button className="landing-btn">Sign Up</button>
        </Link>
      </div>

    </div>
  );
}

export default Landing;