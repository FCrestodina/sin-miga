import fs from "fs";
import path from "path";
import type { Restaurant, RestaurantCache } from "./types";

const CACHE_PATH = path.join(process.cwd(), "data", "restaurants.json");
const CACHE_TTL_HOURS = 24;

export function readCache(): RestaurantCache | null {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    return JSON.parse(raw) as RestaurantCache;
  } catch {
    return null;
  }
}

export function writeCache(restaurants: Restaurant[]): void {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const cache: RestaurantCache = {
    lastSync: new Date().toISOString(),
    restaurants,
  };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export function isCacheStale(cache: RestaurantCache): boolean {
  const lastSync = new Date(cache.lastSync);
  const ageHours = (Date.now() - lastSync.getTime()) / 1000 / 60 / 60;
  return ageHours > CACHE_TTL_HOURS;
}
