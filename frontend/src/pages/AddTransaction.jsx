import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AddCategoryModal from "../components/AddCategoryModal";
import { useUserCategories } from "../hooks/useUserCategories";
import "./AddTransaction.css";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { categories, loading: catsLoading, addCategory } = useUserCategories();
  const [showAddCat, setShowAddCat] = useState(false);
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

  const set = (f) => (e) => setForm((d) => ({ ...d, [f]: e.target.value }));

  // Filter categories by transaction type
  const visibleCats = categories;

  const selectedCat = categories.find((c) => c.name === form.category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return;
    setLoading(true);

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://localhost:8000/api/transactions/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type === "debit" ? "Debit" : "Credit",
          amount: form.amount,
          date: form.date,
          note: form.note,
          category: form.category, // already the full name
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed.");
        return;
      }

      localStorage.removeItem("dashboard_cache");
      localStorage.removeItem("dashboard_cache_time");
      setSubmitted(true);
    } catch {
      alert("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({
      type: "debit",
      name: "",
      amount: "",
      category: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setSubmitted(false);
  };

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
              {form.type === "credit" ? "+" : "−"}₹
              {Number(form.amount).toLocaleString()} · {selectedCat?.name}
            </p>
            <div className="success-btns">
              <button className="btn-outline" onClick={reset}>
                Add Another
              </button>
              <button
                className="btn-primary-add"
                onClick={() => navigate("/details")}
              >
                View Transactions
              </button>
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
          {/* Left — form */}
          <div className="add-form-col">
            <form onSubmit={handleSubmit} className="add-form">
              <div className="form-section">
                <label className="form-label">Transaction Type</label>
                <div className="type-toggle-big">
                  <button
                    type="button"
                    className={`ttb-btn ${form.type === "debit" ? "active-debit" : ""}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, type: "debit", category: "" }))
                    }
                  >
                    <span className="ttb-icon">💸</span>
                    <span className="ttb-label">Expense</span>
                    <span className="ttb-sub">Money going out</span>
                  </button>
                  <button
                    type="button"
                    className={`ttb-btn ${form.type === "credit" ? "active-credit" : ""}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, type: "credit", category: "" }))
                    }
                  >
                    <span className="ttb-icon">💰</span>
                    <span className="ttb-label">Income</span>
                    <span className="ttb-sub">Money coming in</span>
                  </button>
                </div>
              </div>

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
                    ₹{Number(form.amount).toLocaleString()} ·{" "}
                    {form.type === "credit" ? "Incoming" : "Outgoing"}
                  </p>
                )}
              </div>

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

              <div className="form-section">
                <label className="form-label">
                  Note <span className="optional">(optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Any additional details..."
                  rows={3}
                  value={form.note}
                  onChange={set("note")}
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""} ${form.type === "credit" ? "credit" : ""}`}
                disabled={!form.category || loading}
              >
                {loading ? (
                  <span className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  `Save ${form.type === "credit" ? "Income" : "Expense"}`
                )}
              </button>
            </form>
          </div>

          {/* Right — category picker */}
          <div className="category-col">
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Select Category{" "}
                  {!form.category && (
                    <span className="optional">· required</span>
                  )}
                </label>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "10px 10px",margin:"10px" }}
                  onClick={() => setShowAddCat(true)}
                >
                  Add a New Category
                </button>
              </div>

              {catsLoading ? (
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                  Loading categories...
                </p>
              ) : (
                <div className="cat-grid-add">
                  {visibleCats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-card-add ${form.category === cat.name ? "selected" : ""}`}
                      style={
                        form.category === cat.name
                          ? {
                              borderColor: cat.color,
                              background: cat.color + "18",
                            }
                          : {}
                      }
                      onClick={() =>
                        setForm((f) => ({ ...f, category: cat.name }))
                      }
                    >
                      <span className="cca-icon">{cat.icon}</span>
                      <span className="cca-label">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {form.amount && form.name && form.category && (
              <div className="preview-card fade-up">
                <p className="preview-label">Preview</p>
                <div className="preview-row">
                  <div className="preview-icon">{selectedCat?.icon}</div>
                  <div className="preview-info">
                    <span className="preview-name">{form.name}</span>
                    <span className="preview-cat">
                      {selectedCat?.name} · {form.date}
                    </span>
                  </div>
                  <span className={`preview-amount ${form.type}`}>
                    {form.type === "credit" ? "+" : "−"}₹
                    {Number(form.amount).toLocaleString()}
                  </span>
                </div>
                {form.note && <p className="preview-note">"{form.note}"</p>}
              </div>
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
