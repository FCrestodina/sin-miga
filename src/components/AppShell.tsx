"use client";

import { useState, useEffect, useCallback } from "react";
import type { Restaurant } from "@/lib/types";
import Map from "./Map";
import Sidebar from "./Sidebar";

interface ApiResponse {
  restaurants: Restaurant[];
  lastSync: string;
  fromCache: boolean;
  error?: string;
}

export default function AppShell() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurants");
      const data: ApiResponse = await res.json();
      setRestaurants(data.restaurants ?? []);
      setLastSync(data.lastSync ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await fetchRestaurants();
    } finally {
      setSyncing(false);
    }
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        restaurants={restaurants}
        selected={selected}
        onSelect={setSelected}
        lastSync={lastSync}
        loading={loading}
        onSync={sync}
        syncing={syncing}
      />
      <main className="flex-1 relative">
        <Map
          restaurants={restaurants}
          selected={selected}
          onSelect={setSelected}
        />
      </main>
    </div>
  );
}
