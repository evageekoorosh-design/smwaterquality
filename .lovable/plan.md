## Per-beach NOAA stations + El Porto rename + station fallback

### 1. `src/data/beaches.ts` — real stations per beach

Update the `ndbcStation` for each beach and rename Manhattan Beach card to El Porto:

| Slug | Name | Station |
|---|---|---|
| `santa-monica` | Santa Monica Pier | `ICAC1` |
| `venice` | Venice Beach | `ICAC1` |
| `malibu-surfrider` | Malibu Surfrider | `SMOC1` |
| `manhattan-beach` | **El Porto, Manhattan Beach** | `46221` |
| `hermosa-beach` | Hermosa Beach | `46221` |
| `redondo-beach` | Redondo Beach | `RDNC1` |

Slug stays `manhattan-beach` (no URL break); only `name` changes to `"El Porto, Manhattan Beach"`. `location` stays `"Manhattan Beach, CA"`.

### 2. `src/lib/liveWater.functions.ts` — station fallback chain

Add an optional `fallbackStations: string[]` field per beach (in `beaches.ts`) and pass it to `getLiveWaterData`.

In the handler:
- Try primary `stationId` first
- If the NDBC realtime2 response is missing/empty or all recent hours have null `air_temp_c` and `water_temp_c`, walk through `fallbackStations` in order
- Use whichever returns usable readings; surface the actual station used in `station.id` / `station.name` so the detail page header reflects reality
- If all fail, return nulls (existing behavior) — cards already show "—"

Fallback chains:
- `SMOC1` → `[ICAC1]`
- `RDNC1` → `[46221, ICAC1]`
- `46221` → `[ICAC1]`
- `ICAC1` → `[SMOC1]`

### 3. Rainfall — unchanged

Open-Meteo already uses per-beach `lat`/`lon`, so rainfall is already accurate per location.

### Out of scope

- Changing the slug `manhattan-beach` (would break any existing links/bookmarks)
- Adding more beaches
- Caching station-health results between requests
