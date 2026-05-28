## Goal

Turn the current Santa Monica dashboard into a per-beach detail page, and add a new landing page at `/` showing preview cards for a handful of LA-area beaches. Visitors click a card → detail page.

## Beaches (LA-area set)

Each beach gets a slug, display name, and a nearest NOAA station for air/water temp + precipitation:

- `santa-monica` — Santa Monica Pier (current station, keep as-is)
- `venice` — Venice Beach
- `malibu-surfrider` — Malibu Surfrider
- `manhattan-beach` — Manhattan Beach
- `hermosa-beach` — Hermosa Beach
- `redondo-beach` — Redondo Beach

Bacteria values stay synthesized (same rain-correlated model already in `liveWater.functions.ts`), seeded per-beach so each card shows a different but plausible value.

## Routes

```
src/routes/
  index.tsx                  -> NEW landing page (beach grid)
  beach.$slug.tsx            -> moved current dashboard, reads slug
  bacteria-thresholds.tsx    -> unchanged
  why-rainfall.tsx           -> unchanged
  why-temperature.tsx        -> unchanged
```

`/` → landing. `/beach/santa-monica` → current dashboard view. Unknown slug → notFound.

## Landing page

Hero header (site title + tagline), then a responsive grid of **beach preview cards**. Each card shows:

- Colored status bar (Safe / Caution / Unsafe) using existing `statusStyles`
- Beach name + short location line
- Three compact stats: Water temp, Bacteria MPN, Last 1h rain
- Subtle "View details →" affordance
- Whole card is a `<Link to="/beach/$slug" params={{ slug }}>`

Favorites (localStorage, no login):
- Star icon in the top-right of each card toggles favorite
- Favorited beaches render in a "⭐ Favorites" section pinned above the rest
- Stored as `string[]` under `beach-favorites` key; hydration-safe (read in `useEffect`)

Below the grid: small footer with data sources blurb (reuse copy from current page).

## Detail page (`/beach/$slug.tsx`)

- Same layout as current `index.tsx`
- Reads `slug` via `Route.useParams()`, looks up beach metadata, calls `getLiveWaterData({ stationId, seed: slug })`
- Back link to `/` in the header ("← All beaches")
- 404 via `notFoundComponent` if slug unknown
- `head()` sets per-beach title/description/og tags

## Server function changes

`src/lib/liveWater.functions.ts`:
- Accept optional `{ stationId?: string, seed?: string }` input via `inputValidator`
- Default to current Santa Monica station when omitted
- Use `seed` to make the synthesized bacteria noise deterministic per beach (so cards don't flicker between refreshes)
- Return same `LiveResponse` shape; `station.name` reflects the requested beach

Landing page fetches all 6 beaches in parallel using `useQueries` with a 10-min refetch interval (same cadence as today).

## Shared pieces

- `src/data/beaches.ts` — array of beach metadata (slug, name, stationId, location label)
- `src/components/BeachCard.tsx` — preview card used on landing
- `src/hooks/useFavorites.ts` — localStorage favorites hook (SSR-safe)

## Technical notes

- TanStack Router file convention: `beach.$slug.tsx` → `/beach/$slug`, `createFileRoute("/beach/$slug")`
- Keep `defaultPreloadStaleTime: 0` so React Query owns freshness
- Detail page loader stays client-side (`useQuery` in component) to avoid SSR'ing 6 stations on the landing page; landing uses `useQueries` client-side too
- All new color usage goes through existing `statusStyles` tokens — no raw color classes added
- No backend/auth needed; favorites are localStorage only

## Out of scope

- Real bacteria measurements (still synthesized)
- User accounts / cloud-synced favorites
- Adding/removing beaches from the UI (the list is hardcoded in `beaches.ts`)
