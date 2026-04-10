import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useUserCategories } from "../hooks/useUserCategories";
import "./Details.css";

const CATEGORY_ICONS = {
  "Food & Dining": "🍜", Transport: "🚗", Shopping: "🛍️",
  Entertainment: "🎬", Health: "💊", Utilities: "⚡",
  Subscriptions: "📡", Miscellaneous: "📦", Fitness: "🏋️",
  Travel: "✈️", Education: "📚", Investments: "📈",
  Income: "💼", Uncategorized: "📦",
};

export default function Details() {
  const navigate = useNavigate();
  const { categories: userCats, addCategory } = useUserCategories();

  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const cacheKey = `tx_cache_${days}`;
    const cacheTimeKey = `tx_cache_time_${days}`;

    const cached   = localStorage.getItem(cacheKey);
    const cachedAt = localStorage.getItem(cacheTimeKey);

    const cacheAge   = Date.now() - parseInt(cachedAt || "0");
    const cacheValid = cached && cacheAge < 2 * 60 * 1000; // 2 min

    if (cacheValid) {
      setTxList(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:8000/api/transactions/list/?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const tx = data.transactions || [];
        setTxList(tx);
        setLoading(false);

        localStorage.setItem(cacheKey, JSON.stringify(tx));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      })
      .catch(() => setLoading(false));
  }, [days]);

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/transactions/delete/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Failed to delete.");
        return;
      }

      setTxList(prev => prev.filter(t => t.id !== id));
      setDeleteId(null);

      // 🔥 invalidate dashboard
      localStorage.removeItem("dashboard_cache");
      localStorage.removeItem("dashboard_cache_time");

      // 🔥 invalidate ALL tx cache
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("tx_cache")) {
          localStorage.removeItem(key);
        }
      });

    } catch {
      alert("Could not connect to server.");
    }
  };

  const cats = ["All", ...userCats.map(c => c.name)];

  const filtered = txList.filter((t) => {
    if (filter !== "All" && t.cat !== filter) return false;
    if (typeFilter === "Credit" && t.type !== "credit") return false;
    if (typeFilter === "Debit" && t.type !== "debit") return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCredit = filtered
    .filter(t => t.type === "credit")
    .reduce((a, t) => a + t.amount, 0);

  const totalDebit = filtered
    .filter(t => t.type === "debit")
    .reduce((a, t) => a + t.amount, 0);

  const net = totalCredit - totalDebit;

  return (
    <AppLayout>
      <div className="details-page">

        {/* Header */}
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">
              Last {days} days · {filtered.length} entries
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="type-toggle">
              {[30, 90].map((d) => (
                <button
                  key={d}
                  className={`type-btn ${days === d ? "active" : ""}`}
                  onClick={() => {
                    setDays(d);
                    setFilter("All");
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>


            <button
              className="add-tx-btn"
              onClick={() => navigate("/add")}
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="tx-summary-strip fade-up">
          <div className="tss-item green">
            <span>Total Incoming</span>
            <span>+₹{totalCredit.toLocaleString()}</span>
          </div>

          <div className="tss-item red">
            <span>Total Outgoing</span>
            <span>−₹{totalDebit.toLocaleString()}</span>
          </div>

          <div className="tss-item">
            <span>Net</span>
            <span style={{ color: net >= 0 ? "var(--green)" : "var(--red)" }}>
              {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input
            className="search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="type-toggle">
            {["All", "Credit", "Debit"].map((t) => (
              <button
                key={t}
                className={`type-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="cat-chips">
          {cats.map((c) => (
            <button
              key={c}
              className={`cat-chip ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <table className="tx-table">
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>{CATEGORY_ICONS[tx.cat] || "📦"} {tx.name}</td>
                    <td>{tx.cat}</td>
                    <td>{tx.date}</td>
                    <td>{tx.note || "—"}</td>
                    <td className={tx.type}>
                      {tx.type === "credit" ? "+" : "−"}₹{tx.amount}
                    </td>
                    <td>
                      <button className="del-btn" onClick={() => setDeleteId(tx.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Modal */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Transaction?</h3>
              <button className="del-btn" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}