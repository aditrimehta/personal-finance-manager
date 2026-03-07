import "./AddTransaction.css";

function AddTransaction() {
  return (
    <div className="add-transaction">

      <h1>Add Transaction</h1>

      <form>

        <label>Name of Spend</label>
        <input type="text" placeholder="Enter transaction name" />

        <label>Debit / Credit</label>
        <select>
          <option>Debit</option>
          <option>Credit</option>
        </select>

        <label>Category</label>
        <input type="text" placeholder="Food, Transport, Shopping..." />

        <label>Amount</label>
        <input type="number" placeholder="Enter amount" />

        <button type="submit">Add Transaction</button>

      </form>

    </div>
  );
}

export default AddTransaction;