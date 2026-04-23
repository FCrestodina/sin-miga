import type { OverpassResponse, OverpassElement, Restaurant } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const GLUTEN_FREE_NAME_REGEX =
  /sin\s+tacc|celiaco|celiaca|cel[ií]ac[ao]|gluten[\s-]?free|sin\s+gluten|apto\s+celiaco/i;

// OSM area for CABA: relation 3082668 → area ID = 3600000000 + 3082668 = 3603082668
function buildQuery(): string {
  return (
    "[out:json][timeout:60];" +
    "area(3603082668)->.caba;" +
    "(" +
    'node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:gluten_free"="yes"](area.caba);' +
    'node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:coeliac"="yes"](area.caba);' +
    'node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"sin tacc",i](area.caba);' +
    'node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"celiaco|celiaca",i](area.caba);' +
    'node["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"gluten",i](area.caba);' +
    'way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:gluten_free"="yes"](area.caba);' +
    'way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["diet:coeliac"="yes"](area.caba);' +
    'way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"sin tacc",i](area.caba);' +
    'way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"celiaco|celiaca",i](area.caba);' +
    'way["amenity"~"restaurant|cafe|fast_food|bar|bakery"]["name"~"gluten",i](area.caba);' +
    ");" +
    "out body center;"
  );
}

async function runQuery(): Promise<OverpassElement[]> {
  const body = "data=" + encodeURIComponent(buildQuery());

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "SinMiga/1.0 (gluten-free restaurant map CABA)",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Overpass API error: ${response.status} — ${text.slice(0, 200)}`);
  }

  const data: OverpassResponse = await response.json();
  return data.elements;
}

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
  const elements = await runQuery();

  const seen = new Set<string>();
  const restaurants: Restaurant[] = [];

  for (const el of elements) {
    const restaurant = elementToRestaurant(el);
    if (!restaurant) continue;

    const key = `${restaurant.lat.toFixed(4)}-${restaurant.lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const hasTag =
      el.tags?.["diet:gluten_free"] === "yes" ||
      el.tags?.["diet:coeliac"] === "yes";
    const nameMatches = GLUTEN_FREE_NAME_REGEX.test(restaurant.name);

    if (hasTag || nameMatches) {
      restaurants.push(restaurant);
    }
  }

  return restaurants.sort((a, b) => a.name.localeCompare(b.name));
}
