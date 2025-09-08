import React, { useEffect, useState } from "react";
import { request } from "../api";

export default function CartPage({ user }) {
  const [cart, setCart] = useState({ items: [] });

  async function load() {
    if (user) {
      const res = await request("/cart");
      setCart(res);
    } else {
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      let items = [];
      if (local.length) {
        const all = await fetch(
          (process.env.REACT_APP_API_URL || "http://localhost:4000") + "/items"
        );
        const list = await all.json();
        items = local.map((l) => ({
          ...l,
          item: list.find((it) => it.id === l.itemId),
        }));
      }
      setCart({ items });
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  async function remove(itemId) {
    if (user) {
      await request("/cart/remove", { method: "POST", body: JSON.stringify({ itemId }) });
      load();
    } else {
      const local = JSON.parse(localStorage.getItem("localCart") || "[]");
      const filtered = local.filter((l) => l.itemId !== itemId);
      localStorage.setItem("localCart", JSON.stringify(filtered));
      load();
    }
  }

  const total = cart.items.reduce((sum, ci) => sum + (ci.item?.price || 0) * ci.qty, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h2>

      {cart.items.length === 0 ? (
        <p className="text-gray-500 text-center">No items in your cart.</p>
      ) : (
        <>
        <ul className="space-y-4">
  {cart.items.map((ci) => (
    <li
      key={ci.itemId}
      className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition"
    >
     
      {ci.item?.image && (
        <img
          src={ci.item.image}
          alt={ci.item.name}
          className="w-24 h-24 object-cover rounded-md mr-4 mb-2 sm:mb-0"
        />
      )}

      <div className="flex-1">
        <p className="font-semibold text-gray-800">{ci.item?.name || ci.itemId}</p>
        <p className="text-gray-500">Quantity: {ci.qty}</p>
        {ci.item?.price && (
          <p className="text-gray-700 font-medium">
            ${(ci.item.price * ci.qty).toFixed(2)}
          </p>
        )}
      </div>

      <button
        className="mt-2 sm:mt-0 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition"
        onClick={() => remove(ci.itemId)}
      >
        Remove
      </button>
    </li>
  ))}
</ul>


         
          <div className="mt-6 text-right text-xl font-semibold text-gray-800">
            Total: ${total.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
}
