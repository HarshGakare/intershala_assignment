import React from "react";
import { request } from "../api";

export default function ProductCard({ item, user }) {
  async function add() {
    if (user) {
      await request("/cart/add", {
        method: "POST",
        body: JSON.stringify({ itemId: item.id, qty: 1 }),
      });
    } else {
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      const found = local.find((l) => l.itemId === item.id);
      if (found) found.qty++;
      else local.push({ itemId: item.id, qty: 1 });
      localStorage.setItem("localCart", JSON.stringify(local));
    }
    alert("Added to cart");
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 flex flex-col justify-between">
    
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}

     
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
         <p className="text-gray-700 font-semi mb-4">Category: {item.category}</p>
        <p className="text-gray-700 font-medium mb-4">${item.price.toFixed(2)}</p>
      </div>

    
      <button
        className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-2 rounded transition"
        onClick={add}
      >
        Add to Cart
      </button>
    </div>
  );
}
