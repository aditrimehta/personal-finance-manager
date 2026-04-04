import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const CATEGORY_COLORS = [
  "#f87171","#fbbf24","#a78bfa","#22d3ee",
  "#34d399","#4f8ef7","#fb923c","#94a3b8",
  "#e879f9","#86efac","#fda4af","#67e8f9",
];

const CATEGORY_ICONS = {
  "Food & Dining": "🍜", "Transport": "🚗", "Shopping": "🛍️",
  "Entertainment": "🎬", "Health": "💊", "Utilities": "⚡",
  "Subscriptions": "📡", "Miscellaneous": "📦", "Fitness": "🏋️",
  "Travel": "✈️", "Education": "📚", "Investments": "📈",
};

export default function Dashboard() {
  const [period, setPeriod]   = useState("Month");
  const [dash, setDash]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token     = localStorage.getItem("access_token");
    const cached    = localStorage.getItem("dashboard_cache");
    const cachedAt  = localStorage.getItem("dashboard_cache_time");

    // Use cache if it exists and is less than 5 minutes old
    // This handles tab switches and back navigation
    const cacheAge  = Date.now() - parseInt(cachedAt || "0");
    const cacheValid = cached && cacheAge < 5 * 60 * 1000;

    if (cacheValid) {
        setDash(JSON.parse(cached));
        setLoading(false);
        return;  // ← skip API call entirely
    }

    // No valid cache — fetch fresh from DB
    fetch("http://localhost:8000/api/transactions/dashboard/", {
        headers: { "Authorization": `Bearer ${token}` },
    })
        .then(res => res.json())
        .then(data => {
            setDash(data);
            setLoading(false);
            // Save to cache
            localStorage.setItem("dashboard_cache", JSON.stringify(data));
            localStorage.setItem("dashboard_cache_time", Date.now().toString());
        })
        .catch(() => setLoading(false));
}, []);

  if (loading) return <AppLayout><div className="dash-page"><p style={{color:"var(--text-2)"}}>Loading...</p></div></AppLayout>;
  if (!dash)   return <AppLayout><div className="dash-page"><p style={{color:"var(--red)"}}>Failed to load data.</p></div></AppLayout>;

  // Attach colors + icons to category data
  const categoryData = dash.categoryData.map((d, i) => ({
    ...d,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    icon:  CATEGORY_ICONS[d.name] || "📦",
  }));

  const savingsData = [
    { name: "Saved", value: dash.totalSaved, color: "#34d399" },
    { name: "Spent", value: dash.totalSpent, color: "#4f8ef7" },
  ];

  const goalPct = dash.goalAmount
    ? ((dash.currentSaved / dash.goalAmount) * 100).toFixed(1)
    : 0;

  return (
    <AppLayout>
      <div className="dash-page">

        {/* Top bar */}
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Financial Overview</p>
          </div>
          <div className="topbar-right">
            <div className="period-toggle">
              {["Week", "Month", "Year"].map(p => (
                <button key={p} className={`period-btn ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-row fade-up">
          <StatCard label="Total Income" value={`₹${dash.monthlyIncome.toLocaleString()}`} sub="This month" color="blue" icon="💼" up />
          <StatCard label="Total Spent"  value={`₹${dash.totalSpent.toLocaleString()}`}   sub="This month" color="red"  icon="💸" up={false} />
          <StatCard label="Total Saved"  value={`₹${dash.totalSaved.toLocaleString()}`}   sub={`${dash.savingsRate}% savings rate`} color="green" icon="🏦" up />
          <StatCard label="Saving Goal"  value={`₹${dash.goalAmount.toLocaleString()}`}   sub={`₹${dash.currentSaved.toLocaleString()} saved so far`} color="purple" icon="🎯" />
        </div>

        {/* Row 2 — Area chart + Savings donut */}
        <div className="dash-row-2 fade-up-1">
          <div className="card chart-card wide">
            <div className="chart-header">
              <div>
                <p className="card-title">Income & Expenses</p>
                <p className="chart-big-num">₹{dash.monthlyIncome.toLocaleString()} <span className="chart-big-label">this month</span></p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dash.monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="income"   name="Income"   stroke="#4f8ef7" strokeWidth={2} fill="url(#gIncome)"  dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#gExpense)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card narrow">
            <p className="card-title">Savings Progress</p>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={savingsData} innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {savingsData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-pct">{dash.savingsRate}%</span>
                <span className="donut-sub">saved</span>
              </div>
            </div>
            <div className="savings-legend">
              {savingsData.map(d => (
                <div key={d.name} className="sl-row">
                  <span className="sl-dot" style={{ background: d.color }} />
                  <span className="sl-label">{d.name}</span>
                  <span className="sl-val">₹{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="goal-progress-bar">
              <div className="gpb-top">
                <span>Goal: ₹{dash.goalAmount.toLocaleString()}</span>
                <span>{goalPct}%</span>
              </div>
              <div className="gpb-track"><div className="gpb-fill" style={{ width: `${goalPct}%` }} /></div>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="dash-row-3 fade-up-2">
          <div className="card chart-card medium">
            <p className="card-title">Spending by Category</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} innerRadius={45} outerRadius={68} dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: "#0e1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="cat-legend-grid">
              {categoryData.map(d => (
                <div key={d.name} className="cl-row">
                  <span className="cl-dot" style={{ background: d.color }} />
                  <span className="cl-name">{d.name}</span>
                  <span className="cl-val">₹{(d.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card chart-card medium">
            <p className="card-title">This Week's Spending</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dash.weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={22}>
                <XAxis dataKey="day" tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip />
                <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]} fill="rgba(79,142,247,0.25)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card medium">
            <p className="card-title">Category Limits</p>
            <div className="limits-list">
              {categoryData.slice(0, 5).map(d => {
                const limit = dash.categoryLimits[d.name] || d.value * 1.4;
                const pct   = Math.round((d.value / limit) * 100);
                const danger = pct >= 85;
                return (
                  <div key={d.name} className="limit-row">
                    <div className="lr-top">
                      <span className="lr-icon">{d.icon}</span>
                      <span className="lr-name">{d.name}</span>
                      <span className="lr-amounts">₹{d.value.toLocaleString()} / ₹{Math.round(limit).toLocaleString()}</span>
                      <span className={`lr-pct ${danger ? "danger" : ""}`}>{pct}%</span>
                    </div>
                    <div className="lr-track">
                      <div className="lr-fill" style={{ width: `${pct}%`, background: danger ? "#f87171" : d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card fade-up-3">
          <div className="recent-header">
            <p className="card-title" style={{ marginBottom: 0 }}>Recent Transactions</p>
            <a href="/details" className="view-all-link">View All →</a>
          </div>
          <div className="recent-list">
            {dash.recentTx.length === 0 && (
              <p style={{ color: "var(--text-3)", padding: "1rem 0" }}>No transactions yet.</p>
            )}
            {dash.recentTx.map(tx => (
              <div key={tx.id} className="tx-row">
                <div className="tx-icon">{CATEGORY_ICONS[tx.cat] || "📦"}</div>
                <div className="tx-info">
                  <span className="tx-name">{tx.name}</span>
                  <span className="tx-cat">{tx.cat} · {tx.date}</span>
                </div>
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === "credit" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

// StatCard unchanged
function StatCard({ label, value, sub, color, icon, up }) {
  const colors = {
    blue:   { bg: "var(--blue-soft)",   text: "var(--blue)",   border: "rgba(79,142,247,0.18)" },
    red:    { bg: "var(--red-soft)",    text: "var(--red)",    border: "rgba(248,113,113,0.18)" },
    green:  { bg: "var(--green-soft)",  text: "var(--green)",  border: "rgba(52,211,153,0.18)" },
    purple: { bg: "var(--purple-soft)", text: "var(--purple)", border: "rgba(167,139,250,0.18)" },
  };
  const c = colors[color];
  return (
    <div className="stat-card card" style={{ borderColor: c.border }}>
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        <div className="sc-icon" style={{ background: c.bg, color: c.text }}>{icon}</div>
      </div>
      <div className="sc-value">{value}</div>
      {sub && (
        <div className="sc-sub" style={{ color: up === undefined ? "var(--text-3)" : up ? "var(--green)" : "var(--red)" }}>
          {up !== undefined && (up ? "↑ " : "↓ ")}{sub}
        </div>
      )}
    </div>
  );
}