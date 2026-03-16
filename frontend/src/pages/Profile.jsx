import { useState } from "react";
import AppLayout from "../components/AppLayout";
import "./Profile.css";

const MOCK_USER = {
  name: "Khushi Maru",
  email: "khushi@walletwise.io",
  dob: "2002-05-14",
  initials: "KM",
  joinDate: "January 2025",
  purpose: "Personal Use",
  incomeType: "Monthly",
  income: 75000,
  savingGoal: "Emergency Fund",
  savingTarget: 200000,
  savedSoFar: 46550,
  spendingLimit: 55000,
  categories: ["Food & Dining", "Transport", "Shopping", "Subscriptions", "Health", "Utilities"],
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [draft, setDraft] = useState(MOCK_USER);
  const [saved, setSaved] = useState(false);

  const upd = f => e => setDraft(d => ({ ...d, [f]: e.target.value }));

  const handleSave = () => {
    setUser(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savingsPct = Math.round((user.savedSoFar / user.savingTarget) * 100);
  const spentPct   = Math.round((28450 / user.spendingLimit) * 100);

  return (
    <AppLayout>
      <div className="profile-page">
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
          </div>
          {!editing ? (
            <button className="edit-btn" onClick={() => { setDraft(user); setEditing(true); }}>Edit Profile</button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>

        {saved && (
          <div className="save-toast fade-up">✓ Profile saved successfully</div>
        )}

        <div className="profile-grid">
          {/* Identity card */}
          <div className="card identity-card fade-up">
            <div className="avatar-large">{user.initials}</div>
            <div className="identity-info">
              {editing ? (
                <input className="form-input prof-name-input" value={draft.name} onChange={upd("name")} />
              ) : (
                <h2 className="prof-name">{user.name}</h2>
              )}
              <p className="prof-email">{user.email}</p>
              <div className="prof-tags">
                <span className="badge badge-blue">{user.purpose}</span>
                <span className="badge badge-amber">Member since {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="profile-stats fade-up-1">
            {[
              { label: "Monthly Income",   val: `₹${user.income.toLocaleString()}`,      icon: "💼", color: "blue" },
              { label: "Spending Limit",   val: `₹${user.spendingLimit.toLocaleString()}`, icon: "🎯", color: "amber" },
              { label: "Savings Goal",     val: `₹${user.savingTarget.toLocaleString()}`, icon: "🏦", color: "green" },
              { label: "Saved So Far",     val: `₹${user.savedSoFar.toLocaleString()}`,   icon: "📈", color: "purple" },
            ].map(s => (
              <div key={s.label} className={`card ps-card ps-${s.color}`}>
                <span className="ps-icon">{s.icon}</span>
                <span className="ps-val">{s.val}</span>
                <span className="ps-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Personal details */}
          <div className="card fade-up-2">
            <p className="card-title">Personal Information</p>
            <div className="detail-grid">
              <DetailField label="Full Name" value={user.name} editing={editing}
                input={<input className="form-input" value={draft.name} onChange={upd("name")} />} />
              <DetailField label="Email Address" value={user.email} editing={editing}
                input={<input className="form-input" type="email" value={draft.email} onChange={upd("email")} />} />
              <DetailField label="Date of Birth" value={new Date(user.dob).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })} editing={editing}
                input={<input className="form-input" type="date" value={draft.dob} onChange={upd("dob")} />} />
              <DetailField label="Account Purpose" value={user.purpose} editing={editing}
                input={
                  <select className="form-input" value={draft.purpose} onChange={upd("purpose")}>
                    {["Personal Use","Family Finance","Freelancer","Small Business"].map(o => <option key={o}>{o}</option>)}
                  </select>
                } />
            </div>
          </div>

          {/* Financial preferences */}
          <div className="card fade-up-3">
            <p className="card-title">Financial Preferences</p>
            <div className="detail-grid">
              <DetailField label="Income Type" value={user.incomeType} editing={editing}
                input={
                  <select className="form-input" value={draft.incomeType} onChange={upd("incomeType")}>
                    <option>Monthly</option><option>Annual</option>
                  </select>
                } />
              <DetailField label="Monthly Income" value={`₹${user.income.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number" value={draft.income} onChange={upd("income")} />} />
              <DetailField label="Monthly Spending Limit" value={`₹${user.spendingLimit.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number" value={draft.spendingLimit} onChange={upd("spendingLimit")} />} />
              <DetailField label="Saving Goal Name" value={user.savingGoal} editing={editing}
                input={<input className="form-input" value={draft.savingGoal} onChange={upd("savingGoal")} />} />
              <DetailField label="Saving Target" value={`₹${user.savingTarget.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number" value={draft.savingTarget} onChange={upd("savingTarget")} />} />
            </div>
          </div>

          {/* Progress */}
          <div className="card fade-up-3">
            <p className="card-title">This Month's Progress</p>
            <div className="progress-items">
              <ProgressItem label="Savings Goal" sub={`₹${user.savedSoFar.toLocaleString()} of ₹${user.savingTarget.toLocaleString()}`} pct={savingsPct} color="#34d399" />
              <ProgressItem label="Spending Limit" sub={`₹28,450 of ₹${user.spendingLimit.toLocaleString()}`} pct={spentPct} color={spentPct > 80 ? "#f87171" : "#4f8ef7"} />
            </div>
          </div>

          {/* Categories */}
          <div className="card fade-up-4">
            <p className="card-title">My Spending Categories</p>
            <div className="cat-chips-prof">
              {user.categories.map(c => (
                <span key={c} className="cat-chip-prof">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DetailField({ label, value, editing, input }) {
  return (
    <div className="detail-field">
      <span className="df-label">{label}</span>
      {editing ? input : <span className="df-value">{value}</span>}
    </div>
  );
}

function ProgressItem({ label, sub, pct, color }) {
  return (
    <div className="prog-item">
      <div className="prog-top">
        <span className="prog-label">{label}</span>
        <span className="prog-pct" style={{ color }}>{pct}%</span>
      </div>
      <p className="prog-sub">{sub}</p>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}