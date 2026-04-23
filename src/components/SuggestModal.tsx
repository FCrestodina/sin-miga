"use client";

import { useState } from "react";
import type { Suggestion } from "@/lib/types";

interface Props {
  onClose: () => void;
  onSuccess: (s: Suggestion) => void;
}

const EMPTY = { name: "", address: "", neighborhood: "", phone: "", website: "", notes: "" };

export default function SuggestModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Sugerí un restaurante</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Lo revisaremos y lo agregamos al mapa
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-3">
          <Field label="Nombre del local *" required>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Ej: Café Sin TACC Palermo"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Dirección *" required>
            <input
              type="text"
              value={form.address}
              onChange={set("address")}
              placeholder="Ej: Av. Santa Fe 1234"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Barrio">
            <input
              type="text"
              value={form.neighborhood}
              onChange={set("neighborhood")}
              placeholder="Ej: Palermo, Recoleta..."
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+54 11..."
                className={inputCls}
              />
            </Field>
            <Field label="Sitio web">
              <input
                type="url"
                value={form.website}
                onChange={set("website")}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="¿Por qué es sin TACC?">
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              placeholder="Ej: Tienen menú 100% sin TACC, la dueña es celíaca, cocinan en ambiente separado..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-300";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-emerald-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
