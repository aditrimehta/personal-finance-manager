import { Link } from "react-router-dom";
import "./Landing.css";
import { useEffect } from "react";
import { clearAllCache } from "../utils/cache";
  
import "./Landing.css";
 
export default function Landing() {
useEffect(() => {
    clearAllCache();
  }, []);

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

              Start for free →
</Link>
<Link to="/login" className="btn-ghost-landing">Sign in</Link>
</div>
</div>
</main>
 
      {/* Features */}
<section className="landing-features">

        {[

          { icon: "📊", title: "Rich Analytics", desc: "Visual charts for spending patterns, category breakdowns, and income trends." },

          { icon: "🎯", title: "Savings Goals", desc: "Set targets and track your progress with a clear visual milestone tracker." },

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
 