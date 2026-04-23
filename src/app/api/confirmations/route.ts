import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIRMATIONS_PATH = path.join(process.cwd(), "data", "confirmations.json");

type ConfirmationStore = Record<string, { count: number; lastConfirmed: string }>;

function readConfirmations(): ConfirmationStore {
  try {
    if (!fs.existsSync(CONFIRMATIONS_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIRMATIONS_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeConfirmations(data: ConfirmationStore): void {
  const dir = path.dirname(CONFIRMATIONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIRMATIONS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readConfirmations());
}

export async function POST(req: NextRequest) {
  const { restaurantId } = await req.json();
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId requerido" }, { status: 400 });
  }

  const store = readConfirmations();
  const existing = store[restaurantId];
  store[restaurantId] = {
    count: (existing?.count ?? 0) + 1,
    lastConfirmed: new Date().toISOString(),
  };
  writeConfirmations(store);

  return NextResponse.json(store[restaurantId]);
}
