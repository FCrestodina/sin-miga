export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  cuisine?: string;
  glutenFreeSource: "tag" | "name" | "menu_tag";
  tags: Record<string, string>;
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface RestaurantCache {
  lastSync: string;
  restaurants: Restaurant[];
}
