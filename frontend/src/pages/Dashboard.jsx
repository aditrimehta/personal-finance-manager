import { useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import "./Dashboard.css";

// ── Mock Data ──
const monthlyData = [
  { month: "Aug", income: 72000, expenses: 41000 },
  { month: "Sep", income: 75000, expenses: 38000 },
  { month: "Oct", income: 75000, expenses: 44000 },
  { month: "Nov", income: 80000, expenses: 36000 },
  { month: "Dec", income: 75000, expenses: 50000 },
  { month: "Jan", income: 78000, expenses: 42000 },
  { month: "Feb", income: 75000, expenses: 39000 },
  { month: "Mar", income: 75000, expenses: 28450 },
];

const categoryData = [
  { name: "Food",          value: 8200,  color: "#f87171", icon: "🍜" },
  { name: "Transport",     value: 3400,  color: "#fbbf24", icon: "🚗" },
  { name: "Shopping",      value: 5800,  color: "#a78bfa", icon: "🛍️" },
  { name: "Entertainment", value: 2100,  color: "#22d3ee", icon: "🎮" },
  { name: "Health",        value: 1800,  color: "#34d399", icon: "💊" },
  { name: "Utilities",     value: 4200,  color: "#4f8ef7", icon: "⚡" },
  { name: "Subscriptions", value: 1950,  color: "#fb923c", icon: "📡" },
  { name: "Others",        value: 1000,  color: "#94a3b8", icon: "📦" },
];

const savingsData = [
  { name: "Saved", value: 46550, color: "#34d399" },
  { name: "Spent", value: 28450, color: "#4f8ef7" },
];

const weeklySpend = [
  { day: "Mon", amount: 1200 },
  { day: "Tue", amount: 3400 },
  { day: "Wed", amount: 800 },
  { day: "Thu", amount: 2200 },
  { day: "Fri", amount: 4100 },
  { day: "Sat", amount: 5600 },
  { day: "Sun", amount: 1150 },
];

const recentTx = [
  { id: 1, name: "Swiggy", cat: "Food", icon: "🍜", type: "debit",  amount: 450,   date: "Today, 1:24 PM" },
  { id: 2, name: "Salary",  cat: "Income", icon: "💼", type: "credit", amount: 75000, date: "Mar 1" },
  { id: 3, name: "Uber",    cat: "Transport", icon: "🚗", type: "debit", amount: 180, date: "Mar 13" },
  { id: 4, name: "Netflix", cat: "Subscriptions", icon: "📡", type: "debit", amount: 649, date: "Mar 12" },
  { id: 5, name: "Pharmacy",cat: "Health",  icon: "💊", type: "debit", amount: 920, date: "Mar 11" },
];

const totalIncome  = 75000;
const totalSpent   = 28450;
const totalSaved   = totalIncome - totalSpent;
const savingsRate  = Math.round((totalSaved / totalIncome) * 100);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [period, setPeriod] = useState("Month");

  return (
    <AppLayout>
      <div className="dash-page">
        {/* Top bar */}
        <div className="dash-topbar">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">March 2025 · Financial Overview</p>
          </div>
          <div className="topbar-right">
            <div className="period-toggle">
              {["Week", "Month", "Year"].map(p => (
                <button key={p} className={`period-btn ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
            <div className="avatar-btn">AK</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-row fade-up">
          <StatCard label="Total Income" value="₹75,000" sub="+0% vs last month" color="blue" icon="💼" up />
          <StatCard label="Total Spent"  value="₹28,450" sub="-10.2% vs last month" color="red"  icon="💸" up={false} />
          <StatCard label="Total Saved"  value={`₹${totalSaved.toLocaleString()}`} sub={`${savingsRate}% savings rate`} color="green" icon="🏦" up />
          <StatCard label="Saving Goal"  value="₹2,00,000" sub="₹46,550 saved so far" color="purple" icon="🎯" />
        </div>

        {/* Row 2 */}
        <div className="dash-row-2 fade-up-1">
          {/* Income vs Expenses area chart */}
          <div className="card chart-card wide">
            <div className="chart-header">
              <div>
                <p className="card-title">Income & Expenses</p>
                <p className="chart-big-num">₹{totalIncome.toLocaleString()} <span className="chart-big-label">this month</span></p>
              </div>
              <div className="chart-legend-row">
                <span className="legend-dot" style={{ background: "#4f8ef7" }} /> Income
                <span className="legend-dot" style={{ background: "#f87171", marginLeft: 14 }} /> Expenses
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#4f8ef7" strokeWidth={2} fill="url(#gIncome)" dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#gExpense)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Savings donut */}
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
                <span className="donut-pct">{savingsRate}%</span>
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
                <span>Goal: ₹2,00,000</span>
                <span>23.3%</span>
              </div>
              <div className="gpb-track"><div className="gpb-fill" style={{ width: "23.3%" }} /></div>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="dash-row-3 fade-up-2">
          {/* Category pie */}
          <div className="card chart-card medium">
            <p className="card-title">Spending by Category</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} innerRadius={45} outerRadius={68} dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: "#0e1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
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

          {/* Weekly bar */}
          <div className="card chart-card medium">
            <p className="card-title">This Week's Spending</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklySpend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={22}>
                <XAxis dataKey="day" tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4e5f80", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]}>
                  {weeklySpend.map((_, i) => (
                    <Cell key={i} fill={i === 5 ? "#4f8ef7" : "rgba(79,142,247,0.25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="week-summary">
              <div className="ws-item">
                <span className="ws-label">Highest Day</span>
                <span className="ws-val">Sat · ₹5,600</span>
              </div>
              <div className="ws-item">
                <span className="ws-label">Daily Avg</span>
                <span className="ws-val">₹{Math.round(weeklySpend.reduce((a,d) => a + d.amount, 0) / 7).toLocaleString()}</span>
              </div>
              <div className="ws-item">
                <span className="ws-label">Week Total</span>
                <span className="ws-val">₹{weeklySpend.reduce((a,d) => a + d.amount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Category limits */}
          <div className="card chart-card medium">
            <p className="card-title">Category Limits</p>
            <div className="limits-list">
              {categoryData.slice(0, 5).map(d => {
                const limit = d.value * 1.4;
                const pct = Math.round((d.value / limit) * 100);
                const danger = pct >= 85;
                return (
                  <div key={d.name} className="limit-row">
                    <div className="lr-top">
                      <span className="lr-icon">{d.icon}</span>
                      <span className="lr-name">{d.name}</span>
                      <span className="lr-amounts">
                        ₹{d.value.toLocaleString()} / ₹{Math.round(limit).toLocaleString()}
                      </span>
                      <span className={`lr-pct ${danger ? "danger" : ""}`}>{pct}%</span>
                    </div>
                    <div className="lr-track">
                      <div className="lr-fill" style={{
                        width: `${pct}%`,
                        background: danger ? "#f87171" : d.color
                      }} />
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
            {recentTx.map(tx => (
              <div key={tx.id} className="tx-row">
                <div className="tx-icon">{tx.icon}</div>
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