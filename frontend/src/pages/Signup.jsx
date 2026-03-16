import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", dob: "", password: "", confirm: "",
  });

  const set = f => e => setForm(d => ({ ...d, [f]: e.target.value }));

  const pwdLen    = form.password.length;
  const pwdStrength = pwdLen === 0 ? 0 : pwdLen <= 5 ? 1 : pwdLen <= 9 ? 2 : 3;
  const pwdLabel  = ["", "Weak", "Medium", "Strong"][pwdStrength];
  const pwdColor  = ["", "var(--red)", "var(--amber)", "var(--green)"][pwdStrength];

  const handleNext = e => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/onboarding");
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
          <h2 className="auth-left-title">Start your financial journey today.</h2>
          <p className="auth-left-sub">Join thousands who've already taken control of their money with WalletWise.</p>

          <div className="auth-left-stats">
            {[
              { icon: "🔒", text: "Your data stays private" },
              { icon: "📱", text: "Works on any device" },
              { icon: "✨", text: "Set up in under 2 minutes" },
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

      {/* Right */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-sub">Step {step} of 2 — {step === 1 ? "Personal details" : "Set your password"}</p>
          </div>

          {/* Step bar */}
          <div className="step-bar">
            <div className={`sb-item ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
              <div className="sb-dot">{step > 1 ? "✓" : "1"}</div>
              <span className="sb-label">Details</span>
            </div>
            <div className={`sb-line ${step > 1 ? "done" : ""}`} />
            <div className={`sb-item ${step >= 2 ? "active" : ""}`}>
              <div className="sb-dot">2</div>
              <span className="sb-label">Security</span>
            </div>
          </div>

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleNext}>
              <div className="form-field">
                <label className="form-label">Full name</label>
                <input type="text" className="form-input" placeholder="Aryan Kapoor"
                  value={form.name} onChange={set("name")} required />
              </div>

              <div className="form-field">
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={set("email")} required />
              </div>

              <div className="form-field">
                <label className="form-label">Date of birth</label>
                <input type="date" className="form-input"
                  value={form.dob} onChange={set("dob")} required />
              </div>

              <button type="submit" className="auth-submit-btn">
                Continue
                <svg style={{ marginLeft: 8 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <button type="button" className="auth-back-btn" onClick={() => setStep(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>

              <div className="form-field">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="At least 8 characters"
                  value={form.password} onChange={set("password")} required minLength={6} />
                {form.password && (
                  <div className="pwd-strength">
                    <div className="pwd-bars">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`pwd-bar ${pwdStrength >= i ? `active-${pwdLabel.toLowerCase()}` : ""}`}
                          style={pwdStrength >= i ? { background: pwdColor } : {}} />
                      ))}
                    </div>
                    <span className="pwd-label" style={{ color: pwdColor }}>{pwdLabel}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="form-label">Confirm password</label>
                <input type="password" className="form-input"
                  placeholder="Repeat your password"
                  value={form.confirm} onChange={set("confirm")} required />
                {form.confirm && form.confirm !== form.password && (
                  <p className="field-error">Passwords don't match</p>
                )}
              </div>

              <div className="form-check-row">
                <label className="check-label">
                  <input type="checkbox" className="check-input" required />
                  <span className="check-box" />
                  <span>I agree to the <a href="#" className="form-link">Terms</a> and <a href="#" className="form-link">Privacy Policy</a></span>
                </label>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${loading ? "loading" : ""}`}
                disabled={loading || form.confirm !== form.password}
              >
                {loading ? <span className="btn-spinner" /> : "Create account"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}