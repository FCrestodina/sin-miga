import { NextResponse } from "next/server";
import { readCache, writeCache, isCacheStale } from "@/lib/cache";
import { fetchGlutenFreeRestaurants } from "@/lib/overpass";

export async function GET() {
  try {
    const cache = readCache();

    if (cache && !isCacheStale(cache)) {
      return NextResponse.json({
        restaurants: cache.restaurants,
        lastSync: cache.lastSync,
        fromCache: true,
      });
    }

    const restaurants = await fetchGlutenFreeRestaurants();
    writeCache(restaurants);

    return NextResponse.json({
      restaurants,
      lastSync: new Date().toISOString(),
      fromCache: false,
    });
  } catch (error) {
    const cache = readCache();
    if (cache) {
      return NextResponse.json({
        restaurants: cache.restaurants,
        lastSync: cache.lastSync,
        fromCache: true,
        error: "Overpass unavailable, serving cached data",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}
