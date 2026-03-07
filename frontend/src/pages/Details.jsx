import "./Details.css";
import { useState } from "react";

function Details() {

  const [showPopup, setShowPopup] = useState(false);

  const transactions = [
    { id: 1, name: "Groceries", category: "Food", type: "Debit", amount: 1200 },
    { id: 2, name: "Salary", category: "Income", type: "Credit", amount: 30000 },
    { id: 3, name: "Uber", category: "Transport", type: "Debit", amount: 350 }
  ];

  return (
    <div className="details-page">

      <div className="details-header">
        <h1>Transaction Details</h1>

        <button
          className="add-btn"
          onClick={() => setShowPopup(true)}
        >
          + Add Transaction
        </button>
      </div>

      <h2>Last 30 Days</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.type}</td>
              <td>{t.category}</td>
              <td>₹{t.amount}</td>
              <td>
                <button>Edit</button>
                <button className="delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* POPUP */}

      {showPopup && (
        <div className="popup-overlay">

          <div className="popup">

            <h2>Add Transaction</h2>

            <input type="text" placeholder="Name of Spend" />

            <select>
              <option>Debit</option>
              <option>Credit</option>
            </select>

            <input type="text" placeholder="Category" />

            <input type="number" placeholder="Amount" />

            <div className="popup-buttons">
              <button>Add</button>
              <button onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Details;