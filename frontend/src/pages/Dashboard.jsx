import "./Dashboard.css";
import Navbar from "../components/Navbar";
function Dashboard() {
  return (

    <div className="dashboard">
<Navbar />
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid">

        <div className="card">
          <h3>Spend This Month (Per Category)</h3>
          <p>Food: ₹5000</p>
          <p>Transport: ₹1200</p>
          <p>Shopping: ₹3000</p>
        </div>

        <div className="card">
          <h3>Income Distribution</h3>
          <p>Pie Chart goes here</p>
        </div>

        <div className="card wide">
          <h3>Limit Left Per Category</h3>
          <p>Food: ₹2000 left</p>
          <p>Transport: ₹800 left</p>
          <p>Shopping: ₹1000 left</p>
        </div>

        <div className="card small">
          <h3>Money Received</h3>
          <p>₹20,000</p>
        </div>

        <div className="card small">
          <h3>Money Spent</h3>
          <p>₹11,500</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;