import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Listings({ user }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (min) params.set("min", min);
    if (max) params.set("max", max);

    try {
      const res = await fetch(
        (process.env.REACT_APP_API_URL || "http://localhost:4000") +
          "/items?" +
          params.toString()
      );
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Products</h2>

    
      <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-2xl">
        <input
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          placeholder="Min Price"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          placeholder="Max Price"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={load}
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded transition"
        >
          Apply
        </button>
      </div>

     
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.length > 0 ? (
          items.map((item) => <ProductCard key={item.id} item={item} user={user} />)
        ) : (
          <p className="text-gray-500 col-span-full text-center">No products found.</p>
        )}
      </div>
    </div>
  );
}
