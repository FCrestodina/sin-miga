"use client";

import dynamic from "next/dynamic";
import type { Restaurant } from "@/lib/types";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-sm">Cargando mapa...</span>
    </div>
  ),
});

interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
}

export default function Map(props: Props) {
  return <MapClient {...props} />;
}
