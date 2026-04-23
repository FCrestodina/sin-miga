import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Suggestion } from "@/lib/types";

const SUGGESTIONS_PATH = path.join(process.cwd(), "data", "suggestions.json");

function readSuggestions(): Suggestion[] {
  try {
    if (!fs.existsSync(SUGGESTIONS_PATH)) return [];
    return JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeSuggestions(suggestions: Suggestion[]): void {
  const dir = path.dirname(SUGGESTIONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SUGGESTIONS_PATH, JSON.stringify(suggestions, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readSuggestions());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, address, neighborhood, phone, website, notes } = body;

  if (!name?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Nombre y dirección son obligatorios" }, { status: 400 });
  }

  const suggestion: Suggestion = {
    id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    address: address.trim(),
    neighborhood: neighborhood?.trim() || undefined,
    phone: phone?.trim() || undefined,
    website: website?.trim() || undefined,
    notes: notes?.trim() || undefined,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  const suggestions = readSuggestions();
  suggestions.push(suggestion);
  writeSuggestions(suggestions);

  return NextResponse.json(suggestion, { status: 201 });
}
