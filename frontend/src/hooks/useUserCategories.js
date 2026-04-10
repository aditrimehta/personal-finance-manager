import { useState, useEffect } from "react";

const CATEGORY_ICONS = {
  "Food & Dining": "🍜", "Transport": "🚗", "Shopping": "🛍️",
  "Entertainment": "🎬", "Health": "💊", "Utilities": "⚡",
  "Subscriptions": "📡", "Miscellaneous": "📦", "Fitness": "🏋️",
  "Travel": "✈️", "Education": "📚", "Investments": "📈",
  "Income": "💼", "Uncategorized": "📦",
};

const CATEGORY_COLORS = [
  "#f87171","#fbbf24","#a78bfa","#22d3ee","#34d399",
  "#4f8ef7","#fb923c","#e879f9","#10b981","#6366f1","#94a3b8",
];

export function useUserCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const token = localStorage.getItem("access_token");

  const fetchCategories = () => {
    const cached   = localStorage.getItem("categories_cache");
    const cachedAt = localStorage.getItem("categories_cache_time");

    const cacheAge   = Date.now() - parseInt(cachedAt || "0");
    const cacheValid = cached && cacheAge < 10 * 60 * 1000; // 10 min

    // ✅ USE CACHE
    if (cacheValid) {
      setCategories(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // ❌ NO CACHE → FETCH
    fetch("http://localhost:8000/api/users/categories/", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const enriched = (data.categories || []).map((cat, i) => ({
          ...cat,
          icon:  CATEGORY_ICONS[cat.name] || "📦",
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));

        setCategories(enriched);
        setLoading(false);

        // ✅ SAVE CACHE
        localStorage.setItem("categories_cache", JSON.stringify(enriched));
        localStorage.setItem("categories_cache_time", Date.now().toString());
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async (name) => {
    const res = await fetch("http://localhost:8000/api/users/categories/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add category.");

    const newCat = {
      id:    data.id,
      name:  data.name,
      icon:  CATEGORY_ICONS[data.name] || "📦",
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
    };

    const updated = [...categories, newCat];

    // ✅ update UI instantly
    setCategories(updated);

    // ✅ update cache ALSO
    localStorage.setItem("categories_cache", JSON.stringify(updated));
    localStorage.setItem("categories_cache_time", Date.now().toString());

    // ✅ invalidate related caches
    localStorage.removeItem("profile_cache");
    localStorage.removeItem("profile_cache_time");

    return newCat;
  };

  return { categories, loading, addCategory };
}