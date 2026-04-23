"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/types";
import RestaurantCard from "./RestaurantCard";

interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
  lastSync: string | null;
  loading: boolean;
  onSync: () => void;
  syncing: boolean;
}

export default function Sidebar({
  restaurants,
  selected,
  onSelect,
  lastSync,
  loading,
  onSync,
  syncing,
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

  const formattedSync = lastSync
    ? new Date(lastSync).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">
              Sin Miga
            </h1>
            <p className="text-xs text-gray-500">Comé sin miedo en Buenos Aires</p>
          </div>
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
          {loading ? "Cargando..." : `${filtered.length} restaurantes`}
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
            Consultando Overpass API...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            {search ? "Sin resultados para esa búsqueda." : "No hay datos aún. Actualizá para buscar."}
          </div>
        )}
        {filtered.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            isSelected={selected?.id === r.id}
            onClick={() => onSelect(r)}
          />
        ))}
      </div>

      {/* Footer */}
      {formattedSync && (
        <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400">
          Última sync: {formattedSync} · Datos: OpenStreetMap
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2">
        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          Verificado en OSM
        </span>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          Menú sin TACC
        </span>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          Por nombre
        </span>
      </div>
    </aside>
  );
}
