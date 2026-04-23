"use client";

import { useState } from "react";
import type { Restaurant, Suggestion } from "@/lib/types";
import RestaurantCard from "./RestaurantCard";

type ConfirmationStore = Record<string, { count: number; lastConfirmed: string }>;

interface Props {
  restaurants: Restaurant[];
  suggestions: Suggestion[];
  confirmations: ConfirmationStore;
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
  lastSync: string | null;
  loading: boolean;
  onSync: () => void;
  syncing: boolean;
  onSuggest: () => void;
}

export default function Sidebar({
  restaurants,
  suggestions,
  confirmations,
  selected,
  onSelect,
  lastSync,
  loading,
  onSync,
  syncing,
  onSuggest,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.address.toLowerCase().includes(search.toLowerCase()) ||
          r.cuisine?.toLowerCase().includes(search.toLowerCase())
      )
    : restaurants;

  const filteredSuggestions = search.trim()
    ? suggestions.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.address.toLowerCase().includes(search.toLowerCase()) ||
          s.neighborhood?.toLowerCase().includes(search.toLowerCase())
      )
    : suggestions;

  const formattedSync = lastSync
    ? new Date(lastSync).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  const total = filtered.length + filteredSuggestions.length;

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Sin Miga</h1>
              <p className="text-xs text-gray-500">Comé sin miedo en Buenos Aires</p>
            </div>
          </div>
          <button
            onClick={onSuggest}
            className="text-xs font-medium bg-emerald-500 text-white px-3 py-1.5 rounded-full hover:bg-emerald-600 transition-colors"
          >
            + Sugerir
          </button>
        </div>

        <input
          type="search"
          placeholder="Buscar restaurante o barrio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Count + sync */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs text-gray-500">
          {loading ? "Cargando..." : `${total} lugares`}
        </span>
        <button
          onClick={onSync}
          disabled={syncing}
          className="text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
        >
          {syncing ? "Sincronizando..." : "↻ Actualizar"}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-sm text-gray-400">
            Consultando OpenStreetMap...
          </div>
        )}

        {/* Verified section */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Verificados · {filtered.length}
              </span>
            </div>
            {filtered.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                isSelected={selected?.id === r.id}
                onClick={() => onSelect(r)}
                confirmationCount={confirmations[r.id]?.count ?? 0}
              />
            ))}
          </>
        )}

        {/* Suggestions section */}
        {!loading && filteredSuggestions.length > 0 && (
          <>
            <div className="px-4 py-2 bg-purple-50 border-b border-gray-100 border-t border-t-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-400">
                Sugeridos por la comunidad · {filteredSuggestions.length}
              </span>
            </div>
            {filteredSuggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </>
        )}

        {!loading && total === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            {search
              ? "Sin resultados. Probá otro nombre o barrio."
              : "No hay datos. Actualizá para buscar en OpenStreetMap."}
          </div>
        )}
      </div>

      {/* Footer */}
      {formattedSync && (
        <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400">
          Última sync: {formattedSync} · Datos: OpenStreetMap contributors
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2">
        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Verificado OSM</span>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Menú sin TACC</span>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Por nombre</span>
        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Comunidad</span>
      </div>
    </aside>
  );
}

function SuggestionCard({ suggestion: s }: { suggestion: Suggestion }) {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{s.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{s.address}</p>
          {s.neighborhood && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {s.neighborhood}</p>
          )}
          {s.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {s.phone}</p>}
          {s.notes && (
            <p className="text-xs text-gray-500 mt-1.5 italic line-clamp-2">"{s.notes}"</p>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
          Pendiente
        </span>
      </div>
      {s.website && (
        <a
          href={s.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:underline mt-1 block"
        >
          Sitio web ↗
        </a>
      )}
    </div>
  );
}
