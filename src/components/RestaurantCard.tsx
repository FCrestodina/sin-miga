"use client";

import type { Restaurant } from "@/lib/types";

const SOURCE_LABELS: Record<Restaurant["glutenFreeSource"], string> = {
  tag: "Verificado en OSM",
  menu_tag: "Menú sin TACC",
  name: "Nombre",
};

const SOURCE_COLORS: Record<Restaurant["glutenFreeSource"], string> = {
  tag: "bg-emerald-100 text-emerald-700",
  menu_tag: "bg-blue-100 text-blue-700",
  name: "bg-amber-100 text-amber-700",
};

interface Props {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
}

export default function RestaurantCard({
  restaurant: r,
  isSelected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{r.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{r.address}</p>

          {r.openingHours && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              🕐 {r.openingHours}
            </p>
          )}
          {r.phone && (
            <p className="text-xs text-gray-400 mt-0.5">📞 {r.phone}</p>
          )}
          {r.cuisine && (
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              🍽️ {r.cuisine.replace(/_/g, " ")}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[r.glutenFreeSource]}`}
        >
          {SOURCE_LABELS[r.glutenFreeSource]}
        </span>
      </div>
    </button>
  );
}
