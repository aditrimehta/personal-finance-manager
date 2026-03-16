import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-glow" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">W</div>
          <span className="logo-text">WalletWise</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/signup" className="nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Personal Finance Manager
          </div>

          <h1 className="hero-heading">
            Take control of<br />
            <span className="hero-accent">your finances</span>
          </h1>

          <p className="hero-desc">
            Track spending, set savings goals, and understand where your money
            goes — all in one beautifully simple dashboard.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn-primary-landing">
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/login" className="btn-ghost-landing">Sign in</Link>
          </div>

          <div className="hero-stats">
            <div className="hs-item">
              <span className="hs-num">128K+</span>
              <span className="hs-label">Users</span>
            </div>
            <div className="hs-sep" />
            <div className="hs-item">
              <span className="hs-num">₹2.4B+</span>
              <span className="hs-label">Tracked monthly</span>
            </div>
            <div className="hs-sep" />
            <div className="hs-item">
              <span className="hs-num">Free</span>
              <span className="hs-label">Always</span>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="hero-preview">
          <div className="preview-card-main">
            <div className="pc-header">
              <span className="pc-label">March 2025</span>
              <span className="badge badge-green-sm">On track ↑</span>
            </div>

            <div className="pc-big">₹75,000</div>
            <p className="pc-sub">Total income this month</p>

            <div className="pc-bars">
              {[
                { label: "Saved", pct: 62, color: "#34d399" },
                { label: "Spent", pct: 38, color: "#4f8ef7" },
              ].map(b => (
                <div key={b.label} className="pcb-row">
                  <span className="pcb-label">{b.label}</span>
                  <div className="pcb-track">
                    <div className="pcb-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className="pcb-pct">{b.pct}%</span>
                </div>
              ))}
            </div>

            <div className="pc-tx-list">
              {[
                { icon: "🍜", name: "Swiggy",  cat: "Food",   amt: "−₹450",   credit: false },
                { icon: "💼", name: "Salary",  cat: "Income", amt: "+₹75,000", credit: true  },
                { icon: "📡", name: "Netflix", cat: "Subs",   amt: "−₹649",   credit: false },
              ].map(t => (
                <div key={t.name} className="pc-tx-row">
                  <span className="pc-tx-icon">{t.icon}</span>
                  <div className="pc-tx-info">
                    <span className="pc-tx-name">{t.name}</span>
                    <span className="pc-tx-cat">{t.cat}</span>
                  </div>
                  <span className="pc-tx-amt" style={{ color: t.credit ? "#34d399" : "var(--text-1)" }}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="float-card fc-1">
            <span className="fc-icon">🏦</span>
            <div>
              <p className="fc-val">62%</p>
              <p className="fc-lbl">Savings rate</p>
            </div>
          </div>
          <div className="float-card fc-2">
            <span className="fc-icon">🎯</span>
            <div>
              <p className="fc-val">₹46,550</p>
              <p className="fc-lbl">Goal progress</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="landing-features">
        {[
          { icon: "📊", title: "Rich Analytics",  desc: "Visual charts for spending patterns, category breakdowns, and income trends." },
          { icon: "🎯", title: "Savings Goals",   desc: "Set targets and track your progress with a clear visual milestone tracker." },
          { icon: "🔔", title: "Spending Limits", desc: "Set category limits and get alerted before you overspend." },
        ].map(f => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}