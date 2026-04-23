"use client";

import type { Restaurant } from "@/lib/types";
import ConfirmButton from "./ConfirmButton";
import InfoTooltip from "./InfoTooltip";

const SOURCE_LABELS: Record<Restaurant["glutenFreeSource"], string> = {
  tag: "Verificado OSM",
  menu_tag: "Menú sin TACC",
  name: "Por nombre",
  community: "Comunidad",
};

const SOURCE_COLORS: Record<Restaurant["glutenFreeSource"], string> = {
  tag: "bg-emerald-100 text-emerald-700",
  menu_tag: "bg-blue-100 text-blue-700",
  name: "bg-amber-100 text-amber-700",
  community: "bg-purple-100 text-purple-700",
};

interface Props {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  confirmationCount: number;
}

export default function RestaurantCard({
  restaurant: r,
  isSelected,
  onClick,
  confirmationCount,
}: Props) {
  return (
    <div
      className={`border-b border-gray-100 ${
        isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
      }`}
    >
      <button onClick={onClick} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{r.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{r.address}</p>

            {r.openingHours && (
              <p className="text-xs text-gray-400 mt-1 truncate">🕐 {r.openingHours}</p>
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

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[r.glutenFreeSource]}`}
            >
              {SOURCE_LABELS[r.glutenFreeSource]}
            </span>
            <InfoTooltip source={r.glutenFreeSource} />
          </div>
        </div>
      </button>

      {/* Confirmations row */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <ConfirmButton
          restaurantId={r.id}
          serverCount={confirmationCount}
        />
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-emerald-600 hover:underline"
          >
            Sitio web ↗
          </a>
        )}
      </div>
    </div>
  );
}
