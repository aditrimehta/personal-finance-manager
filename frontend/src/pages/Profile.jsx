import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import "./Profile.css";
import { useUserCategories } from "../hooks/useUserCategories";
import AddCategoryModal from "../components/AddCategoryModal";

const API = "http://localhost:8000/api/users";
const PREF_API = "http://localhost:8000/api/preferences";

export default function Profile() {
  const [editing, setEditing]         = useState(false);
  const [user, setUser]               = useState(null);
  const [draft, setDraft]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saved, setSaved]             = useState(false);
  const [showAddCat, setShowAddCat]   = useState(false);

  // Category limits state
  const [catLimits, setCatLimits]     = useState({});       // { "Food & Dining": 5000, ... }
  const [editingLimits, setEditingLimits] = useState(false);
  const [limitDraft, setLimitDraft]   = useState({});
  const [savingLimits, setSavingLimits] = useState(false);

  const { categories, addCategory } = useUserCategories();
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  // Fetch profile on load (with caching)
  useEffect(() => {
    const cached   = localStorage.getItem("profile_cache");
    const cachedAt = localStorage.getItem("profile_cache_time");
    const cacheAge = Date.now() - parseInt(cachedAt || "0");
    const cacheValid = cached && cacheAge < 5 * 60 * 1000;

    if (cacheValid) {
      const data = JSON.parse(cached);
      setUser(data);
      setDraft(data);
      // Restore category limits from cache if present
      if (data.categoryLimits) setCatLimits(data.categoryLimits);
      setLoading(false);
      return;
    }

    fetch(`${API}/profile/`, { headers })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setDraft(data);
        if (data.categoryLimits) setCatLimits(data.categoryLimits);
        setLoading(false);
        localStorage.setItem("profile_cache", JSON.stringify(data));
        localStorage.setItem("profile_cache_time", Date.now().toString());
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch category limits separately (they may not be in profile response yet)
  useEffect(() => {
    if (!token) return;
    fetch(`${PREF_API}/category-limit/`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.limits) setCatLimits(data.limits);
      })
      .catch(() => {});
  }, []);

  const upd = f => e => setDraft(d => ({ ...d, [f]: e.target.value }));

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/profile/update/`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          fname:         draft.fname,
          lname:         draft.lname,
          dob:           draft.dob,
          incomeType:    draft.monthlyIncome ? "Monthly" : "Annual",
          income:        draft.monthlyIncome || draft.annualIncome,
          spendingLimit: draft.spendingLimit,
          savingTarget:  draft.savingTarget,
        }),
      });

      if (!res.ok) { alert("Failed to save."); return; }

      const updatedData = { ...draft, categoryLimits: catLimits };
      localStorage.setItem("profile_cache", JSON.stringify(updatedData));
      localStorage.setItem("profile_cache_time", Date.now().toString());
      localStorage.removeItem("dashboard_cache");
      localStorage.removeItem("dashboard_cache_time");

      setUser(draft);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Could not connect to server.");
    }
  };

  const handleSaveLimits = async () => {
    setSavingLimits(true);
    try {
      // Save each changed limit (only non-empty ones)
      const entries = Object.entries(limitDraft).filter(([, v]) => v !== "" && v !== null);
      for (const [category, limit] of entries) {
        await fetch(`${PREF_API}/category-limit/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ category, limit: Number(limit) }),
        });
      }

      const merged = { ...catLimits, ...Object.fromEntries(entries.map(([k, v]) => [k, Number(v)])) };
      setCatLimits(merged);

      // Update profile cache to include new limits
      const cached = localStorage.getItem("profile_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const updated = { ...parsed, categoryLimits: merged };
        localStorage.setItem("profile_cache", JSON.stringify(updated));
        localStorage.setItem("profile_cache_time", Date.now().toString());
      }
      // Invalidate dashboard cache so limits refresh there too
      localStorage.removeItem("dashboard_cache");
      localStorage.removeItem("dashboard_cache_time");

      setEditingLimits(false);
      setLimitDraft({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Could not connect to server.");
    }
    setSavingLimits(false);
  };

  if (loading) return <AppLayout><div className="profile-page"><p style={{color:"var(--text-2)"}}>Loading...</p></div></AppLayout>;
  if (!user)   return <AppLayout><div className="profile-page"><p style={{color:"var(--red)"}}>Failed to load profile.</p></div></AppLayout>;

  const savingsPct = user.savingTarget ? Math.round((user.savedSoFar / user.savingTarget) * 100) : 0;
  const spentPct   = user.spendingLimit ? Math.round((user.totalSpent / user.spendingLimit) * 100) : 0;
  const income     = user.monthlyIncome || user.annualIncome;
  const incomeType = user.monthlyIncome ? "Monthly" : "Annual";
  const initials   = `${user.fname?.[0] || ""}${user.lname?.[0] || ""}`.toUpperCase();

  const CATEGORY_ICONS = {
    "Food & Dining": "🍜", "Transport": "🚗", "Shopping": "🛍️",
    "Entertainment": "🎬", "Health": "💊", "Utilities": "⚡",
    "Subscriptions": "📡", "Miscellaneous": "📦", "Fitness": "🏋️",
    "Travel": "✈️", "Education": "📚", "Investments": "📈",
    "Income": "💼", "Uncategorized": "📦",
  };

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

        {saved && <div className="save-toast fade-up">✓ Saved successfully</div>}

        <div className="profile-grid">

          {/* Identity */}
          <div className="card identity-card fade-up">
            <div className="avatar-large">{initials}</div>
            <div className="identity-info">
              <h2 className="prof-name">{user.fname} {user.lname}</h2>
              <p className="prof-email">{user.email}</p>
              <div className="prof-tags">
                <span className="badge badge-amber">Member since {user.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="profile-stats fade-up-1">
            {[
              { label: "Monthly Income",   val: `₹${income.toLocaleString()}`,            icon: "💼", color: "blue"   },
              { label: "Spending Limit",   val: `₹${user.spendingLimit.toLocaleString()}`, icon: "🎯", color: "amber"  },
              { label: "Savings Goal",     val: `₹${user.savingTarget.toLocaleString()}`,  icon: "🏦", color: "green"  },
              { label: "Saved So Far",     val: `₹${user.savedSoFar.toLocaleString()}`,    icon: "📈", color: "purple" },
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
              <DetailField label="First Name" value={user.fname} editing={editing}
                input={<input className="form-input" value={draft.fname} onChange={upd("fname")} />} />
              <DetailField label="Last Name" value={user.lname} editing={editing}
                input={<input className="form-input" value={draft.lname} onChange={upd("lname")} />} />
              <DetailField label="Email Address" value={user.email} editing={editing}
                input={<input className="form-input" type="email" value={draft.email} onChange={upd("email")} disabled />} />
              <DetailField label="Date of Birth"
                value={user.dob ? new Date(user.dob).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }) : "—"}
                editing={editing}
                input={<input className="form-input" type="date" value={draft.dob} onChange={upd("dob")} />} />
            </div>
          </div>

          {/* Financial preferences */}
          <div className="card fade-up-3">
            <p className="card-title">Financial Preferences</p>
            <div className="detail-grid">
              <DetailField label="Income Type" value={incomeType} editing={editing}
                input={
                  <select className="form-input" value={draft.monthlyIncome ? "Monthly" : "Annual"}
                    onChange={e => {
                      const v = e.target.value;
                      setDraft(d => ({
                        ...d,
                        monthlyIncome: v === "Monthly" ? (d.monthlyIncome || d.annualIncome) : null,
                        annualIncome:  v === "Annual"  ? (d.annualIncome  || d.monthlyIncome) : null,
                      }));
                    }}>
                    <option>Monthly</option>
                    <option>Annual</option>
                  </select>
                } />
              <DetailField label={`${incomeType} Income`} value={`₹${income.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number"
                  value={draft.monthlyIncome || draft.annualIncome}
                  onChange={e => {
                    const v = e.target.value;
                    setDraft(d => ({
                      ...d,
                      monthlyIncome: d.monthlyIncome != null ? v : null,
                      annualIncome:  d.annualIncome  != null ? v : null,
                    }));
                  }} />} />
              <DetailField label="Monthly Spending Limit" value={`₹${user.spendingLimit.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number" value={draft.spendingLimit} onChange={upd("spendingLimit")} />} />
              <DetailField label="Saving Target" value={`₹${user.savingTarget.toLocaleString()}`} editing={editing}
                input={<input className="form-input" type="number" value={draft.savingTarget} onChange={upd("savingTarget")} />} />
            </div>
          </div>

          {/* Progress */}
          <div className="card fade-up-3">
            <p className="card-title">This Month's Progress</p>
            <div className="progress-items">
              <ProgressItem label="Savings Goal"
                sub={`₹${user.savedSoFar.toLocaleString()} of ₹${user.savingTarget.toLocaleString()}`}
                pct={savingsPct} color="#34d399" />
              <ProgressItem label="Spending Limit"
                sub={`₹${user.totalSpent.toLocaleString()} of ₹${user.spendingLimit.toLocaleString()}`}
                pct={spentPct} color={spentPct > 80 ? "#f87171" : "#4f8ef7"} />
            </div>
          </div>

          {/* Categories */}
          <div className="card fade-up-4">
            <p className="card-title">My Spending Categories</p>
            <div className="cat-chips-prof">
              {categories.map((c) => (
                <span key={c.id} className="cat-chip-prof">
                  {c.name}
                </span>
              ))}
              {editing && (
                <button
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "10px 10px" }}
                  onClick={() => setShowAddCat(true)}
                >
                  Add a New Category
                </button>
              )}
            </div>
          </div>

          {/* Category Limits */}
          <div className="card fade-up-4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p className="card-title" style={{ marginBottom: 0 }}>Category Limits</p>
              {!editingLimits ? (
                <button className="edit-btn" style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => { setLimitDraft({}); setEditingLimits(true); }}>
                  Edit Limits
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="cancel-btn" style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() => { setEditingLimits(false); setLimitDraft({}); }}>
                    Cancel
                  </button>
                  <button className="save-btn" style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={handleSaveLimits} disabled={savingLimits}>
                    {savingLimits ? "Saving…" : "Save Limits"}
                  </button>
                </div>
              )}
            </div>
            <div className="cat-limits-grid">
              {categories.length === 0 && (
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>No categories yet.</p>
              )}
              {categories.map(c => {
                const current = catLimits[c.name];
                const draft   = limitDraft[c.name];
                return (
                  <div key={c.name} className="cat-limit-row">
                    <span className="clr-name">{c.name}</span>
                    {editingLimits ? (
                      <input
                        className="form-input clr-input"
                        type="number"
                        min="0"
                        placeholder={current ? `₹${current.toLocaleString()}` : "No limit"}
                        value={draft !== undefined ? draft : (current || "")}
                        onChange={e => setLimitDraft(prev => ({ ...prev, [c.name]: e.target.value }))}
                      />
                    ) : (
                      <span className="clr-val">
                        {current ? `₹${Number(current).toLocaleString()}` : <span style={{ color: "var(--text-3)" }}>Not set</span>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {!editingLimits && (
              <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 12 }}>
                These monthly limits are shown on your Dashboard's Category Limits card.
              </p>
            )}
          </div>

        </div>
      </div>

      {showAddCat && (
        <AddCategoryModal
          onAdd={addCategory}
          onClose={() => setShowAddCat(false)}
        />
      )}
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