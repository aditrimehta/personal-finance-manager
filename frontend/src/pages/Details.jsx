import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useUserCategories } from "../hooks/useUserCategories";
import "./Details.css";

const CACHE_KEY      = "transactions_cache_all";
const CACHE_TIME_KEY = "transactions_cache_time_all";
const CACHE_TTL      = 5 * 60 * 1000;

export default function Details() {
  const navigate = useNavigate();
  const { categories: userCats } = useUserCategories();

  const [txList, setTxList]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch]         = useState("");
  const [deleteId, setDeleteId]     = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const cached     = localStorage.getItem(CACHE_KEY);
    const cachedAt   = localStorage.getItem(CACHE_TIME_KEY);
    const cacheAge   = Date.now() - parseInt(cachedAt || "0");
    const cacheValid = cached && cacheAge < CACHE_TTL;

    if (cacheValid) {
      setTxList(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8000/api/transactions/list/`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const txs = data.transactions || [];
        setTxList(txs);
        setLoading(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(txs));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/transactions/delete/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) { alert("Failed to delete."); return; }

      const newList = txList.filter(t => t.id !== id);
      setTxList(newList);
      setDeleteId(null);

      localStorage.setItem(CACHE_KEY, JSON.stringify(newList));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      localStorage.removeItem("dashboard_cache");
      localStorage.removeItem("dashboard_cache_time");

    } catch {
      alert("Could not connect to server.");
    }
  };

  const cats = ["All", ...userCats.map(c => c.name)];

  const filtered = txList.filter(t => {
    if (filter !== "All" && t.cat !== filter) return false;
    if (typeFilter === "Credit" && t.type !== "credit") return false;
    if (typeFilter === "Debit"  && t.type !== "debit")  return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCredit = filtered.filter(t => t.type === "credit").reduce((a, t) => a + t.amount, 0);
  const totalDebit  = filtered.filter(t => t.type === "debit").reduce((a, t) => a + t.amount, 0);
  const net         = totalCredit - totalDebit;

  return (
    <AppLayout>
      <div className="details-page">

        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">{filtered.length} entries</p>
          </div>
          <button className="add-tx-btn" onClick={() => navigate("/add")}>
            + Add Transaction
          </button>
        </div>

        <div className="tx-summary-strip fade-up">
          <div className="tss-item green">
            <span className="tss-label">Total Incoming</span>
            <span className="tss-val">+₹{totalCredit.toLocaleString()}</span>
          </div>
          <div className="tss-divider" />
          <div className="tss-item red">
            <span className="tss-label">Total Outgoing</span>
            <span className="tss-val">−₹{totalDebit.toLocaleString()}</span>
          </div>
          <div className="tss-divider" />
          <div className="tss-item">
            <span className="tss-label">Net</span>
            <span className="tss-val" style={{ color: net >= 0 ? "var(--green)" : "var(--red)" }}>
              {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
            </span>
          </div>
          <div className="tss-divider" />
          <div className="tss-item">
            <span className="tss-label">Transactions</span>
            <span className="tss-val" style={{ color: "var(--text-1)" }}>{filtered.length}</span>
          </div>
        </div>

        <div className="filters-bar fade-up-1">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" placeholder="Search transactions..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="type-toggle">
            {["All", "Credit", "Debit"].map(t => (
              <button key={t} className={`type-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="cat-chips fade-up-1">
          {cats.map(c => (
            <button key={c} className={`cat-chip ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        <div className="card tx-table-card fade-up-2">
          {loading ? (
            <p style={{ color: "var(--text-2)", padding: "2rem" }}>Loading transactions...</p>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      {txList.length === 0 ? "No transactions yet — add your first one!" : "No transactions match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map(tx => (
                    <tr key={tx.id} className="tx-tr">
                      <td>
                        <div className="tx-name-cell">
                          <span className="tx-n">{tx.name}</span>
                        </div>
                      </td>
                      <td><span className="cat-tag">{tx.cat}</span></td>
                      <td className="date-cell">{tx.date}</td>
                      <td className="note-cell">{tx.note || <span className="no-note">—</span>}</td>
                      <td>
                        <span className={`amount-cell ${tx.type}`}>
                          {tx.type === "credit" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <button className="del-btn" onClick={() => setDeleteId(tx.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">Delete Transaction?</h3>
              <p className="modal-desc">This action cannot be undone.</p>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="modal-confirm" onClick={() => handleDelete(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}