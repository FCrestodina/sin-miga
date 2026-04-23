# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (also runs TypeScript check)
npm run lint     # ESLint
```

There are no tests. TypeScript errors surface via `npm run build`.

To force a data refresh from Overpass without waiting for the 24h TTL:
```bash
curl -X POST http://localhost:3000/api/sync
```

## Architecture

**Sin Miga** is a Next.js 16 app (App Router) that maps gluten-free / sin TACC restaurants in CABA using only free data sources.

### Data flow

1. **Source:** Overpass API (OpenStreetMap) — queried server-side, no API key required.
   - CABA area ID: `3603082668` (OSM relation `3082668`; area = relation + 3600000000)
   - The query filters by `diet:gluten_free=yes`, `diet:coeliac=yes`, and name regex matching ("sin tacc", "celiaco", "gluten").
   - Overpass requires `encodeURIComponent` body encoding + explicit `Accept: application/json` + `User-Agent` headers — `URLSearchParams` does not work (returns 406).

2. **Cache:** `data/restaurants.json` — 24h TTL, written by server-side API routes using Node.js `fs`. Stale-on-error: if Overpass is down, the API falls back to cached data.

3. **Client:** `AppShell` loads all three endpoints in parallel on mount (`/api/restaurants`, `/api/suggestions`, `/api/confirmations`) and merges them into a single restaurant list passed to the Map and Sidebar.

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/restaurants` | GET | Returns cached restaurants, auto-refreshes if stale |
| `/api/sync` | POST | Forces fresh fetch from Overpass, updates cache |
| `/api/suggestions` | GET / POST | Community-submitted restaurants (`data/suggestions.json`) |
| `/api/confirmations` | GET / POST | Per-restaurant confirmation counts (`data/confirmations.json`) |

### Key design decisions

- **Map uses dynamic import** — `react-leaflet` / Leaflet can't run server-side. `Map.tsx` wraps `MapClient.tsx` in `next/dynamic` with `ssr: false`. Leaflet marker images are copied to `public/` at setup (not imported via CSS or webpack).
- **glutenFreeSource** — each restaurant is tagged with `"tag"` (explicit OSM diet tag), `"menu_tag"` (menu-level tag), `"name"` (name regex match), or `"community"` (user suggestion). Community suggestions get purple markers on the map vs the default blue.
- **Confirmations use localStorage** to prevent double-counting client-side (`sinmiga-confirmed-{id}`), while the server-side count in `data/confirmations.json` is the source of truth.
- **Suggestions without coordinates** appear only in the sidebar list, not on the map. `suggestionToRestaurant()` in `AppShell` returns `null` if `lat`/`lon` are absent.

### Local data files

`data/` is gitignored except `suggestions.json`, which is tracked so community suggestions survive deploys. `restaurants.json` and `confirmations.json` are regenerated at runtime.
