import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

const STEPS = [
  { id: "purpose",    label: "Purpose"    },
  { id: "finances",   label: "Finances"   },
  { id: "goals",      label: "Goals"      },
  { id: "categories", label: "Categories" },
  { id: "confirm",    label: "Confirm"    },
];

const CATEGORIES = [
  { id: "food",          label: "Food & Dining",  icon: "🍜" },
  { id: "transport",     label: "Transport",       icon: "🚗" },
  { id: "shopping",      label: "Shopping",        icon: "🛍️" },
  { id: "entertainment", label: "Entertainment",   icon: "🎬" },
  { id: "health",        label: "Health",          icon: "💊" },
  { id: "utilities",     label: "Utilities",       icon: "⚡" },
  { id: "education",     label: "Education",       icon: "📚" },
  { id: "travel",        label: "Travel",          icon: "✈️" },
  { id: "subscriptions", label: "Subscriptions",   icon: "📡" },
  { id: "fitness",       label: "Fitness",         icon: "🏋️" },
  { id: "investments",   label: "Investments",     icon: "📈" },
  { id: "misc",          label: "Miscellaneous",   icon: "📦" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    purpose: "", incomeType: "Monthly", income: "",
    spendingLimit: "", savingGoal: "", savingTarget: "", targetDate: "",
    categories: [],
  });

  const set = (f, v) => setData(d => ({ ...d, [f]: v }));
  const setE = f => e => set(f, e.target.value);

  const toggleCat = id => setData(d => ({
    ...d,
    categories: d.categories.includes(id)
      ? d.categories.filter(c => c !== id)
      : [...d.categories, id],
  }));

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 1400);
  };

  const canNext = [
    !!data.purpose,
    !!data.income && !!data.incomeType,
    !!data.savingGoal && !!data.savingTarget,
    data.categories.length > 0,
    true,
  ][step];

  return (
    <div className="ob-root">
      <div className="auth-glow" />

      {/* Header */}
      <header className="ob-header">
        <div className="auth-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-mark">W</div>
          <span className="logo-text">WalletWise</span>
        </div>
        <p className="ob-header-sub">Let's personalise your experience</p>
      </header>

      {/* Progress */}
      <div className="ob-progress-wrap">
        <div className="ob-step-bar">
          {STEPS.map((s, i) => (
            <div key={s.id} className="ob-step-item">
              <div className={`ob-step-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <span className={`ob-step-label ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`ob-step-line ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Panel */}
      <main className="ob-main">
        <div className="ob-panel" key={step}>

          {/* Step 0: Purpose */}
          {step === 0 && (
            <div className="ob-step-content">
              <h2 className="ob-title">How will you use WalletWise?</h2>
              <p className="ob-desc">This helps us tailor your dashboard.</p>
              <div className="ob-choice-grid">
                {[
                  { id: "personal",  label: "Personal",      desc: "Track my own income & spending",         icon: "👤" },
                  { id: "family",    label: "Family",         desc: "Manage household budget together",        icon: "🏠" },
                  { id: "freelance", label: "Freelancer",     desc: "Client income, project expenses, taxes",  icon: "💼" },
                  { id: "business",  label: "Small Business", desc: "Monitor business cash flow & limits",     icon: "🏢" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`ob-choice-card ${data.purpose === opt.id ? "selected" : ""}`}
                    onClick={() => set("purpose", opt.id)}
                  >
                    <span className="occ-icon">{opt.icon}</span>
                    <span className="occ-label">{opt.label}</span>
                    <span className="occ-desc">{opt.desc}</span>
                    {data.purpose === opt.id && <span className="occ-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Finances */}
          {step === 1 && (
            <div className="ob-step-content">
              <h2 className="ob-title">Your income details</h2>
              <p className="ob-desc">Help us calibrate your spending & savings overview.</p>
              <div className="ob-fields">
                <div className="form-field">
                  <label className="form-label">Income frequency</label>
                  <div className="toggle-row-ob">
                    {["Monthly", "Annual"].map(t => (
                      <button key={t} type="button"
                        className={`toggle-ob-btn ${data.incomeType === t ? "active" : ""}`}
                        onClick={() => set("incomeType", t)}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">{data.incomeType} income (₹)</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">₹</span>
                    <input type="number" className="form-input input-has-prefix"
                      placeholder="e.g. 75000"
                      value={data.income} onChange={setE("income")} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Monthly spending limit (₹)</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">₹</span>
                    <input type="number" className="form-input input-has-prefix"
                      placeholder="e.g. 50000"
                      value={data.spendingLimit} onChange={setE("spendingLimit")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="ob-step-content">
              <h2 className="ob-title">What are you saving towards?</h2>
              <p className="ob-desc">Set a savings goal to track your progress.</p>
              <div className="ob-fields">
                <div className="form-field">
                  <label className="form-label">Goal name</label>
                  <input type="text" className="form-input"
                    placeholder="Emergency fund, new car, vacation..."
                    value={data.savingGoal} onChange={setE("savingGoal")} />
                </div>
                <div className="ob-fields-row">
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Target amount (₹)</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">₹</span>
                      <input type="number" className="form-input input-has-prefix"
                        placeholder="e.g. 200000"
                        value={data.savingTarget} onChange={setE("savingTarget")} />
                    </div>
                  </div>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Target date</label>
                    <input type="date" className="form-input"
                      value={data.targetDate} onChange={setE("targetDate")} />
                  </div>
                </div>
                {data.savingTarget && data.income && (
                  <div className="ob-insight">
                    <span className="insight-icon">💡</span>
                    <span>Saving 20% of your income means reaching your goal in ~{Math.ceil(data.savingTarget / (data.income * 0.2))} months.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <div className="ob-step-content">
              <h2 className="ob-title">Pick your spending categories</h2>
              <p className="ob-desc">Select the ones you spend in. You can add limits later.</p>
              <div className="ob-cat-grid">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`ob-cat-card ${data.categories.includes(cat.id) ? "selected" : ""}`}
                    onClick={() => toggleCat(cat.id)}
                  >
                    <span className="obc-icon">{cat.icon}</span>
                    <span className="obc-label">{cat.label}</span>
                    {data.categories.includes(cat.id) && <span className="obc-check">✓</span>}
                  </button>
                ))}
              </div>
              <p className="ob-cat-count">{data.categories.length} selected</p>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="ob-step-content">
              <h2 className="ob-title">You're all set!</h2>
              <p className="ob-desc">Here's a summary of your profile. You can edit these any time.</p>
              <div className="ob-summary">
                {[
                  { label: "Purpose",        value: data.purpose || "—" },
                  { label: "Income",         value: data.income ? `₹${Number(data.income).toLocaleString()} / ${data.incomeType}` : "—" },
                  { label: "Spending limit", value: data.spendingLimit ? `₹${Number(data.spendingLimit).toLocaleString()} / month` : "—" },
                  { label: "Saving goal",    value: data.savingGoal || "—" },
                  { label: "Target amount",  value: data.savingTarget ? `₹${Number(data.savingTarget).toLocaleString()}` : "—" },
                  { label: "Categories",     value: `${data.categories.length} selected` },
                ].map(r => (
                  <div key={r.label} className="ob-sum-row">
                    <span className="ob-sum-label">{r.label}</span>
                    <span className="ob-sum-value">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="ob-cat-tags">
                {data.categories.map(id => {
                  const c = CATEGORIES.find(x => x.id === id);
                  return <span key={id} className="ob-cat-tag">{c?.icon} {c?.label}</span>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="ob-nav">
          {step > 0 ? (
            <button className="ob-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button className="ob-btn-next" onClick={() => setStep(s => s + 1)} disabled={!canNext}>
              Continue →
            </button>
          ) : (
            <button
              className={`ob-btn-finish ${loading ? "loading" : ""}`}
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : "Launch Dashboard →"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}