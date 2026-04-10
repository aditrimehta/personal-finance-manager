import { useState } from "react";

export default function AddCategoryModal({ onAdd, onClose }) {
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    localStorage.removeItem("categories_cache");
localStorage.removeItem("categories_cache_time");
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onAdd(name.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Add New Category</h3>
        <p className="modal-desc">This will be added to your category list.</p>
        <input
          className="form-input"
          style={{ margin: "12px 0" }}
          placeholder="e.g. Rent, Pets, Medical..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}