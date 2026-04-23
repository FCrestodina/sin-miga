"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "@/lib/types";

const verifiedIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Purple marker for community suggestions
const communityIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#a855f7;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

function FlyToSelected({ selected }: { selected: Restaurant | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lon], 16, { duration: 0.8 });
    }
  }, [selected, map]);
  return null;
}

interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
}

export default function MapClient({ restaurants, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[-34.6037, -58.3816]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected selected={selected} />
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lon]}
          icon={r.glutenFreeSource === "community" ? communityIcon : verifiedIcon}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          <Popup>
            <div className="min-w-44">
              <div className="flex items-center gap-1.5 mb-1">
                {r.glutenFreeSource === "community" && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                    Sugerido
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm">{r.name}</p>
              <p className="text-xs text-gray-500 mt-1">{r.address}</p>
              {r.phone && (
                <p className="text-xs mt-1">
                  <a href={`tel:${r.phone}`} className="text-emerald-600">{r.phone}</a>
                </p>
              )}
              {r.openingHours && (
                <p className="text-xs text-gray-400 mt-1">🕐 {r.openingHours}</p>
              )}
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 underline mt-1 block"
                >
                  Sitio web ↗
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
