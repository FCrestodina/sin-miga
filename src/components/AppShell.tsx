"use client";

import { useState, useEffect, useCallback } from "react";
import type { Restaurant, Suggestion } from "@/lib/types";
import Map from "./Map";
import Sidebar from "./Sidebar";
import SuggestModal from "./SuggestModal";

interface ApiResponse {
  restaurants: Restaurant[];
  lastSync: string;
  fromCache: boolean;
  error?: string;
}

type ConfirmationStore = Record<string, { count: number; lastConfirmed: string }>;

function suggestionToRestaurant(s: Suggestion): Restaurant | null {
  if (!s.lat || !s.lon) return null;
  return {
    id: s.id,
    name: s.name,
    lat: s.lat,
    lon: s.lon,
    address: s.address,
    phone: s.phone,
    website: s.website,
    glutenFreeSource: "community",
    tags: {},
  };
}

export default function AppShell() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationStore>({});
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, sugData, confData] = await Promise.all([
        fetch("/api/restaurants").then((r) => r.json() as Promise<ApiResponse>),
        fetch("/api/suggestions").then((r) => r.json() as Promise<Suggestion[]>),
        fetch("/api/confirmations").then((r) => r.json() as Promise<ConfirmationStore>),
      ]);
      setRestaurants(resData.restaurants ?? []);
      setLastSync(resData.lastSync ?? null);
      setSuggestions(sugData ?? []);
      setConfirmations(confData ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await fetchAll();
    } finally {
      setSyncing(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleSuggestionSuccess(s: Suggestion) {
    setSuggestions((prev) => [...prev, s]);
    setShowSuggestModal(false);
  }

  // Merge verified + community suggestions that have coordinates
  const allRestaurants: Restaurant[] = [
    ...restaurants,
    ...suggestions.map(suggestionToRestaurant).filter(Boolean) as Restaurant[],
  ];

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          restaurants={restaurants}
          suggestions={suggestions}
          confirmations={confirmations}
          selected={selected}
          onSelect={setSelected}
          lastSync={lastSync}
          loading={loading}
          onSync={sync}
          syncing={syncing}
          onSuggest={() => setShowSuggestModal(true)}
        />
        <main className="flex-1 relative">
          <Map
            restaurants={allRestaurants}
            selected={selected}
            onSelect={setSelected}
          />
        </main>
      </div>

      {showSuggestModal && (
        <SuggestModal
          onClose={() => setShowSuggestModal(false)}
          onSuccess={handleSuggestionSuccess}
        />
      )}
    </>
  );
}
