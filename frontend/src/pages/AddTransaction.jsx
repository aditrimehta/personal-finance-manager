import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import "./AddTransaction.css";

const CATEGORIES = [
  { id: "food",          label: "Food & Dining",    icon: "🍜", color: "#f87171" },
  { id: "transport",     label: "Transport",         icon: "🚗", color: "#fbbf24" },
  { id: "shopping",      label: "Shopping",          icon: "🛍️", color: "#a78bfa" },
  { id: "entertainment", label: "Entertainment",     icon: "🎬", color: "#22d3ee" },
  { id: "health",        label: "Health",            icon: "💊", color: "#34d399" },
  { id: "utilities",     label: "Utilities",         icon: "⚡", color: "#4f8ef7" },
  { id: "education",     label: "Education",         icon: "📚", color: "#fb923c" },
  { id: "travel",        label: "Travel",            icon: "✈️", color: "#e879f9" },
  { id: "subscriptions", label: "Subscriptions",     icon: "📡", color: "#f97316" },
  { id: "fitness",       label: "Fitness",           icon: "🏋️", color: "#10b981" },
  { id: "investments",   label: "Investments",       icon: "📈", color: "#6366f1" },
  { id: "income",        label: "Income",            icon: "💼", color: "#34d399" },
  { id: "misc",          label: "Miscellaneous",     icon: "📦", color: "#94a3b8" },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "debit",
    name: "",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const reset = () => {
    setForm({ type: "debit", name: "", amount: "", category: "", date: new Date().toISOString().slice(0, 10), note: "" });
    setSubmitted(false);
  };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  if (submitted) {
    return (
      <AppLayout>
        <div className="add-page">
          <div className="success-card">
            <div className="success-icon">
              {form.type === "credit" ? "💰" : "💸"}
            </div>
            <h2 className="success-title">Transaction Added!</h2>
            <p className="success-sub">
              {form.type === "credit" ? "+" : "−"}₹{Number(form.amount).toLocaleString()} · {selectedCat?.label}
            </p>
            <div className="success-btns">
              <button className="btn-outline" onClick={reset}>Add Another</button>
              <button className="btn-primary-add" onClick={() => navigate("/details")}>View Transactions</button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="add-page">
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Add Transaction</h1>
            <p className="page-subtitle">Record an income or expense</p>
          </div>
        </div>

        <div className="add-layout fade-up">
          {/* Form */}
          <div className="add-form-col">
            <form onSubmit={handleSubmit} className="add-form">

              {/* Type toggle */}
              <div className="form-section">
                <label className="form-label">Transaction Type</label>
                <div className="type-toggle-big">
                  <button
                    type="button"
                    className={`ttb-btn ${form.type === "debit" ? "active-debit" : ""}`}
                    onClick={() => setForm(f => ({ ...f, type: "debit" }))}
                  >
                    <span className="ttb-icon">💸</span>
                    <span className="ttb-label">Expense</span>
                    <span className="ttb-sub">Money going out</span>
                  </button>
                  <button
                    type="button"
                    className={`ttb-btn ${form.type === "credit" ? "active-credit" : ""}`}
                    onClick={() => setForm(f => ({ ...f, type: "credit" }))}
                  >
                    <span className="ttb-icon">💰</span>
                    <span className="ttb-label">Income</span>
                    <span className="ttb-sub">Money coming in</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="form-section">
                <label className="form-label">Amount</label>
                <div className="amount-input-wrap">
                  <span className="amount-prefix">₹</span>
                  <input
                    type="number"
                    className="amount-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={set("amount")}
                    required
                    min="1"
                  />
                </div>
                {form.amount && (
                  <p className="amount-words">
                    ₹{Number(form.amount).toLocaleString()} · {form.type === "credit" ? "Incoming" : "Outgoing"}
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="form-section">
                <label className="form-label">Name of Transaction</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Swiggy, Salary, Amazon..."
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>

              {/* Date */}
              <div className="form-section">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input date-input"
                  value={form.date}
                  onChange={set("date")}
                  required
                />
              </div>

              {/* Note */}
              <div className="form-section">
                <label className="form-label">Note <span className="optional">(optional)</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Any additional details..."
                  rows={3}
                  value={form.note}
                  onChange={set("note")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""} ${form.type === "credit" ? "credit" : ""}`}
                disabled={!form.category || loading}
              >
                {loading ? (
                  <span className="loading-dots"><span /><span /><span /></span>
                ) : (
                  `Save ${form.type === "credit" ? "Income" : "Expense"}`
                )}
              </button>
            </form>
          </div>

          {/* Category picker */}
          <div className="category-col">
            <div className="card">
              <label className="form-label" style={{ marginBottom: 14, display: "block" }}>
                Select Category {!form.category && <span className="optional">· required</span>}
              </label>
              <div className="cat-grid-add">
                {CATEGORIES.filter(c => form.type === "credit" ? c.id === "income" || c.id === "investments" || c.id === "misc" : c.id !== "income").map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-card-add ${form.category === cat.id ? "selected" : ""}`}
                    style={form.category === cat.id ? { borderColor: cat.color, background: cat.color + "18" } : {}}
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  >
                    <span className="cca-icon">{cat.icon}</span>
                    <span className="cca-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview card */}
            {form.amount && form.name && form.category && (
              <div className="preview-card fade-up">
                <p className="preview-label">Preview</p>
                <div className="preview-row">
                  <div className="preview-icon">{selectedCat?.icon}</div>
                  <div className="preview-info">
                    <span className="preview-name">{form.name}</span>
                    <span className="preview-cat">{selectedCat?.label} · {form.date}</span>
                  </div>
                  <span className={`preview-amount ${form.type}`}>
                    {form.type === "credit" ? "+" : "−"}₹{Number(form.amount).toLocaleString()}
                  </span>
                </div>
                {form.note && <p className="preview-note">"{form.note}"</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}