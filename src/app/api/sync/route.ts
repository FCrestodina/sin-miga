import { NextResponse } from "next/server";
import { fetchGlutenFreeRestaurants } from "@/lib/overpass";
import { writeCache } from "@/lib/cache";

export async function POST() {
  try {
    const restaurants = await fetchGlutenFreeRestaurants();
    writeCache(restaurants);

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", detail: String(error) },
      { status: 500 }
    );
  }
}
