"use client";

import { useState, useEffect } from "react";

interface Props {
  restaurantId: string;
  serverCount: number;
}

const STORAGE_KEY = (id: string) => `sinmiga-confirmed-${id}`;

export default function ConfirmButton({ restaurantId, serverCount }: Props) {
  const [count, setCount] = useState(serverCount);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setConfirmed(localStorage.getItem(STORAGE_KEY(restaurantId)) === "1");
  }, [restaurantId]);

  async function handleConfirm() {
    if (confirmed || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/confirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setConfirmed(true);
        localStorage.setItem(STORAGE_KEY(restaurantId), "1");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={confirmed || loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${
        confirmed
          ? "bg-emerald-100 text-emerald-700 cursor-default"
          : "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      <span>{confirmed ? "✓" : "+"}</span>
      <span>{confirmed ? "Confirmado" : "Confirmar sin TACC"}</span>
      {count > 0 && (
        <span className="font-semibold">· {count}</span>
      )}
    </button>
  );
}
