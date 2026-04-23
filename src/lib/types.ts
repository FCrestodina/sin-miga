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
  glutenFreeSource: "tag" | "name" | "menu_tag" | "community";
  tags: Record<string, string>;
}

export interface Suggestion {
  id: string;
  name: string;
  address: string;
  neighborhood?: string;
  phone?: string;
  website?: string;
  notes?: string;
  lat?: number;
  lon?: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface Confirmation {
  restaurantId: string;
  confirmedAt: string;
  note?: string;
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
