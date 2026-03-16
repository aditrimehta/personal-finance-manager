import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const set = f => e => setForm(d => ({ ...d, [f]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="auth-root">
      <div className="auth-glow" />

      {/* Left panel */}
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <div className="logo-mark">W</div>
          <span className="logo-text">WalletWise</span>
        </Link>

        <div className="auth-left-body">
          <h2 className="auth-left-title">Your finances,<br />beautifully organised.</h2>
          <p className="auth-left-sub">Track spending, hit savings goals, and always know where your money is going.</p>

          <div className="auth-left-stats">
            {[
              { icon: "📊", text: "Rich analytics & charts" },
              { icon: "🎯", text: "Savings goal tracking" },
              { icon: "🔔", text: "Category spending limits" },
            ].map(s => (
              <div key={s.text} className="als-row">
                <span className="als-icon">{s.icon}</span>
                <span className="als-text">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-left-footer">Free to use · No credit card required</p>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to your WalletWise account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div className="form-field">
              <div className="label-row">
                <label className="form-label">Password</label>
                <a href="#" className="form-link">Forgot password?</a>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            <div className="form-check-row">
              <label className="check-label">
                <input type="checkbox" className="check-input" />
                <span className="check-box" />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button type="submit" className={`auth-submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-switch-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}