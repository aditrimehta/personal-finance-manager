import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import "./Details.css";

const ALL_TX = [
  { id: 1,  name: "Swiggy",          cat: "Food",            icon: "🍜", type: "debit",  amount: 450,   date: "Mar 15, 2025", note: "Dinner" },
  { id: 2,  name: "Salary",          cat: "Income",          icon: "💼", type: "credit", amount: 75000, date: "Mar 1, 2025",  note: "Monthly salary" },
  { id: 3,  name: "Uber",            cat: "Transport",       icon: "🚗", type: "debit",  amount: 180,   date: "Mar 13, 2025", note: "" },
  { id: 4,  name: "Netflix",         cat: "Subscriptions",   icon: "📡", type: "debit",  amount: 649,   date: "Mar 12, 2025", note: "Monthly plan" },
  { id: 5,  name: "Pharmacy",        cat: "Health",          icon: "💊", type: "debit",  amount: 920,   date: "Mar 11, 2025", note: "Medicine" },
  { id: 6,  name: "D-Mart",          cat: "Shopping",        icon: "🛍️", type: "debit",  amount: 3200,  date: "Mar 10, 2025", note: "Monthly groceries" },
  { id: 7,  name: "Electricity",     cat: "Utilities",       icon: "⚡", type: "debit",  amount: 1840,  date: "Mar 9, 2025",  note: "" },
  { id: 8,  name: "Freelance",       cat: "Income",          icon: "💻", type: "credit", amount: 12000, date: "Mar 8, 2025",  note: "React project" },
  { id: 9,  name: "Spotify",         cat: "Subscriptions",   icon: "🎵", type: "debit",  amount: 119,   date: "Mar 8, 2025",  note: "" },
  { id: 10, name: "Ola",             cat: "Transport",       icon: "🚗", type: "debit",  amount: 95,    date: "Mar 7, 2025",  note: "" },
  { id: 11, name: "Zomato",          cat: "Food",            icon: "🍜", type: "debit",  amount: 320,   date: "Mar 6, 2025",  note: "Lunch" },
  { id: 12, name: "Gym",             cat: "Health",          icon: "🏋️", type: "debit",  amount: 1500,  date: "Mar 5, 2025",  note: "Monthly membership" },
  { id: 13, name: "Amazon",          cat: "Shopping",        icon: "📦", type: "debit",  amount: 2599,  date: "Mar 4, 2025",  note: "Earphones" },
  { id: 14, name: "Interest",        cat: "Income",          icon: "🏦", type: "credit", amount: 840,   date: "Mar 3, 2025",  note: "FD interest" },
  { id: 15, name: "Movie tickets",   cat: "Entertainment",   icon: "🎬", type: "debit",  amount: 480,   date: "Mar 2, 2025",  note: "BookMyShow" },
];

const CATS = ["All", "Food", "Transport", "Shopping", "Entertainment", "Health", "Utilities", "Subscriptions", "Income"];

export default function Details() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [txList, setTxList] = useState(ALL_TX);

  const filtered = txList.filter(t => {
    if (filter !== "All" && t.cat !== filter) return false;
    if (typeFilter === "Credit" && t.type !== "credit") return false;
    if (typeFilter === "Debit"  && t.type !== "debit")  return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCredit = filtered.filter(t => t.type === "credit").reduce((a, t) => a + t.amount, 0);
  const totalDebit  = filtered.filter(t => t.type === "debit").reduce((a, t) => a + t.amount, 0);

  const confirmDelete = (id) => {
    setTxList(p => p.filter(t => t.id !== id));
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <div className="details-page">
        {/* Header */}
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Last 30 days · {filtered.length} entries</p>
          </div>
          <button className="add-tx-btn" onClick={() => navigate("/add")}>
            + Add Transaction
          </button>
        </div>

        {/* Summary strip */}
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
          <div className="tss-item blue">
            <span className="tss-label">Net</span>
            <span className="tss-val" style={{ color: (totalCredit - totalDebit) >= 0 ? "var(--green)" : "var(--red)" }}>
              {(totalCredit - totalDebit) >= 0 ? "+" : ""}₹{(totalCredit - totalDebit).toLocaleString()}
            </span>
          </div>
          <div className="tss-divider" />
          <div className="tss-item">
            <span className="tss-label">Transactions</span>
            <span className="tss-val" style={{ color: "var(--text-1)" }}>{filtered.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar fade-up-1">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="type-toggle">
            {["All", "Credit", "Debit"].map(t => (
              <button key={t} className={`type-btn ${typeFilter === t ? "active" : ""}`} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="cat-chips fade-up-1">
          {CATS.map(c => (
            <button key={c} className={`cat-chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        {/* Table */}
        <div className="card tx-table-card fade-up-2">
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
                <tr><td colSpan={6} className="empty-row">No transactions found</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="tx-tr">
                  <td>
                    <div className="tx-name-cell">
                      <span className="tx-ico">{tx.icon}</span>
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
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete confirm */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">Delete Transaction?</h3>
              <p className="modal-desc">This action cannot be undone.</p>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="modal-confirm" onClick={() => confirmDelete(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}