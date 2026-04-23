import type { OverpassResponse, OverpassElement, Restaurant } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const GLUTEN_FREE_NAME_REGEX =
  /sin\s+tacc|celiaco|celiaca|cel[ií]ac[ao]|gluten[\s-]?free|sin\s+gluten|apto\s+celiaco/i;

const QUERY = `
[out:json][timeout:60];
area["name"="Ciudad Autónoma de Buenos Aires"]["boundary"="administrative"]->.caba;
(
  node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:gluten_free"="yes"](area.caba);
  node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:coeliac"="yes"](area.caba);
  node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"sin tacc|celiaco|celiaca|celíac|gluten free|sin gluten|apto celiaco",i](area.caba);
  way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:gluten_free"="yes"](area.caba);
  way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:coeliac"="yes"](area.caba);
  way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"sin tacc|celiaco|celiaca|celíac|gluten free|sin gluten|apto celiaco",i](area.caba);
);
out body center;
`;

function buildAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags["addr:street"]) {
    parts.push(tags["addr:street"]);
    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  }
  if (tags["addr:neighbourhood"]) parts.push(tags["addr:neighbourhood"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  return parts.join(", ") || "Buenos Aires, CABA";
}

function detectSource(
  tags: Record<string, string>
): Restaurant["glutenFreeSource"] {
  if (tags["diet:gluten_free"] === "yes" || tags["diet:coeliac"] === "yes") {
    return "tag";
  }
  if (tags["menu:gluten_free"] === "yes") {
    return "menu_tag";
  }
  return "name";
}

function elementToRestaurant(el: OverpassElement): Restaurant | null {
  const tags = el.tags ?? {};
  const name = tags["name"];
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  return {
    id: `${el.type}-${el.id}`,
    name,
    lat,
    lon,
    address: buildAddress(tags),
    phone: tags["phone"] ?? tags["contact:phone"],
    website: tags["website"] ?? tags["contact:website"],
    openingHours: tags["opening_hours"],
    cuisine: tags["cuisine"],
    glutenFreeSource: detectSource(tags),
    tags,
  };
}

export async function fetchGlutenFreeRestaurants(): Promise<Restaurant[]> {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(QUERY)}`,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data: OverpassResponse = await response.json();

  const seen = new Set<string>();
  const restaurants: Restaurant[] = [];

  for (const el of data.elements) {
    const restaurant = elementToRestaurant(el);
    if (!restaurant) continue;

    // Deduplicate by name + approximate coords
    const key = `${restaurant.name.toLowerCase()}-${restaurant.lat.toFixed(3)}-${restaurant.lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Double-check: must match tag or name pattern
    const hasTag =
      el.tags?.["diet:gluten_free"] === "yes" ||
      el.tags?.["diet:coeliac"] === "yes" ||
      el.tags?.["menu:gluten_free"] === "yes";
    const nameMatches = GLUTEN_FREE_NAME_REGEX.test(restaurant.name);

    if (hasTag || nameMatches) {
      restaurants.push(restaurant);
    }
  }

  return restaurants.sort((a, b) => a.name.localeCompare(b.name));
}
