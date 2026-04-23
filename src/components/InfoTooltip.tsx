"use client";

import { useState } from "react";

const INFO: Record<
  string,
  { title: string; desc: string; color: string }
> = {
  tag: {
    title: "Verificado en OSM",
    desc: 'OpenStreetMap es un mapa colaborativo (como Wikipedia). Alguien fue al lugar, comprobó que es apto celíaco y agregó la etiqueta "diet:gluten_free=yes". Es la fuente más confiable.',
    color: "bg-emerald-500",
  },
  menu_tag: {
    title: "Menú sin TACC",
    desc: 'El lugar tiene etiquetado en OSM que su menú incluye opciones sin TACC ("menu:gluten_free=yes"), aunque no todo el local sea 100% sin gluten.',
    color: "bg-blue-500",
  },
  name: {
    title: "Por nombre",
    desc: 'El nombre del local contiene palabras como "sin tacc", "celíaco" o "gluten free". Es una señal fuerte pero no verificada — el local eligió ese nombre pero no hay confirmación explícita en el mapa.',
    color: "bg-amber-500",
  },
  community: {
    title: "Sugerido por la comunidad",
    desc: "Un usuario de Sin Miga sugirió este lugar. Todavía no está verificado en OpenStreetMap. ¡Si fuiste, confirmalo!",
    color: "bg-purple-500",
  },
};

interface Props {
  source: keyof typeof INFO;
}

export default function InfoTooltip({ source }: Props) {
  const [open, setOpen] = useState(false);
  const info = INFO[source];
  if (!info) return null;

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-300 hover:text-gray-400 text-xs leading-none"
        aria-label="Más información"
      >
        ⓘ
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-5 z-20 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${info.color}`} />
              <span className="font-semibold text-gray-800">{info.title}</span>
            </div>
            {info.desc}
          </div>
        </>
      )}
    </span>
  );
}
