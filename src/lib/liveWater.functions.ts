import { createServerFn } from "@tanstack/react-start";
import staticData from "@/data/santaMonicaWater.json";

export type Hourly = {
  time: string;
  air_temp_c: number | null;
  water_temp_c: number | null;
  precip_mm: number | null;
  enterococcus_mpn: number;
  status: "safe" | "caution" | "unsafe";
};

export type Daily = {
  date: string;
  air_temp_c_avg: number | null;
  water_temp_c_avg: number | null;
  precip_mm_total: number;
  enterococcus_mpn_max: number;
  enterococcus_mpn_avg: number;
};

export type LiveResponse = {
  station: typeof staticData.station;
  generated_at: string;
  notes: typeof staticData.notes;
  hourly: Hourly[];
  daily: Daily[];
  live: boolean;
  source_status: { ndbc: "ok" | "error"; openmeteo: "ok" | "error" };
  precip_debug?: string;
};

const DEFAULT_STATION = "ICAC1";
const DEFAULT_LAT = 34.008;
const DEFAULT_LON = -118.499;

function classify(mpn: number): "safe" | "caution" | "unsafe" {
  if (mpn > 104) return "unsafe";
  if (mpn > 35) return "caution";
  return "safe";
}

async function fetchNdbc(stationId: string): Promise<Map<string, { air: number | null; water: number | null }>> {
  const res = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${stationId}.txt`, {
    headers: { "User-Agent": "beach-water-tracker" },
  });
  if (!res.ok) throw new Error(`NDBC ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
  const out = new Map<string, { air: number | null; water: number | null }>();
  for (const line of lines) {
    const c = line.trim().split(/\s+/);
    if (c.length < 15) continue;
    const [yy, mm, dd, hh] = c;
    const atmp = parseFloat(c[13]);
    const wtmp = parseFloat(c[14]);
    const iso = `${yy}-${mm}-${dd}T${hh}:00:00Z`;
    if (!out.has(iso)) {
      out.set(iso, {
        air: Number.isFinite(atmp) && atmp < 99 ? atmp : null,
        water: Number.isFinite(wtmp) && wtmp < 99 ? wtmp : null,
      });
    }
  }
  return out;
}

async function fetchPrecip(lat: number, lon: number): Promise<Map<string, number>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&past_days=7&forecast_days=1&timezone=UTC`;
  const res = await fetch(url, {
    headers: { "User-Agent": "beach-water-tracker" },
  });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { hourly: { time: string[]; precipitation: number[] } };
  const out = new Map<string, number>();
  json.hourly.time.forEach((t, i) => {
    out.set(`${t}:00Z`, json.hourly.precipitation[i] ?? 0);
  });
  return out;
}

// Backup rainfall source: National Weather Service hourly observations (LAX).
async function fetchPrecipNws(): Promise<Map<string, number>> {
  const start = new Date(Date.now() - 8 * 24 * 3600_000).toISOString().slice(0, 19) + "Z";
  const res = await fetch(`https://api.weather.gov/stations/KLAX/observations?start=${start}`, {
    headers: { "User-Agent": "beach-water-tracker (smwaterquality.lovable.app)", Accept: "application/geo+json" },
  });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  const json = (await res.json()) as {
    features: { properties: { timestamp: string; precipitationLastHour?: { value: number | null } } }[];
  };
  const out = new Map<string, number>();
  for (const f of json.features) {
    const v = f.properties.precipitationLastHour?.value;
    const d = new Date(f.properties.timestamp);
    d.setUTCMinutes(0, 0, 0);
    const key = d.toISOString().slice(0, 19) + "Z";
    out.set(key, Math.max(out.get(key) ?? 0, v ?? 0));
  }
  return out;
}

let lastPrecipError = "";

async function fetchPrecipWithFallback(lat: number, lon: number): Promise<Map<string, number>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetchPrecip(lat, lon);
    } catch (e) {
      lastPrecipError = e instanceof Error ? e.message : String(e);
    }
  }
  return fetchPrecipNws();
}

export type LiveInput = {
  stationId?: string;
  fallbackStations?: string[];
  lat?: number;
  lon?: number;
  seed?: string;
  beachName?: string;
};

function hasUsableReadings(m: Map<string, { air: number | null; water: number | null }>): boolean {
  if (m.size === 0) return false;
  // Consider usable if any of the last 24 entries has a non-null reading.
  const entries = Array.from(m.values()).slice(-24);
  return entries.some((e) => e.air !== null || e.water !== null);
}

export const getLiveWaterData = createServerFn({ method: "GET" })
  .inputValidator((data?: LiveInput) => data ?? {})
  .handler(async ({ data }): Promise<LiveResponse> => {
    const primaryStation = data.stationId ?? DEFAULT_STATION;
    const stationChain = [primaryStation, ...(data.fallbackStations ?? [])];
    const lat = data.lat ?? DEFAULT_LAT;
    const lon = data.lon ?? DEFAULT_LON;
    const seedKey = data.seed ?? "default";
    const sourceStatus = { ndbc: "ok", openmeteo: "ok" } as LiveResponse["source_status"];

    // Try each station in order; use the first that returns usable readings.
    let ndbc: Map<string, { air: number | null; water: number | null }> = new Map();
    let usedStation = primaryStation;
    let anyNdbcSuccess = false;
    for (const sid of stationChain) {
      try {
        const result = await fetchNdbc(sid);
        anyNdbcSuccess = true;
        if (hasUsableReadings(result)) {
          ndbc = result;
          usedStation = sid;
          break;
        }
        // Keep first successful (even if empty) as a baseline.
        if (ndbc.size === 0) {
          ndbc = result;
          usedStation = sid;
        }
      } catch {
        // try next
      }
    }
    if (!anyNdbcSuccess) sourceStatus.ndbc = "error";

    const precipRes = await Promise.allSettled([fetchPrecipWithFallback(lat, lon)]);
    const precip = precipRes[0].status === "fulfilled" ? precipRes[0].value : new Map<string, number>();
    if (precipRes[0].status === "rejected") sourceStatus.openmeteo = "error";

    const now = new Date();
    now.setUTCMinutes(0, 0, 0);
    const hours: string[] = [];
    for (let i = 7 * 24 - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600_000);
      hours.push(d.toISOString().replace(".000Z", "Z").slice(0, 19) + "Z");
    }

    const staticByTime = new Map(
      (staticData.hourly as Hourly[]).map((h) => [h.time, h]),
    );

    const seeded = (key: string) => {
      let h = 2166136261;
      const k = seedKey + "|" + key;
      for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 16777619);
      return ((h >>> 0) % 10000) / 10000;
    };

    const precipByHour = new Map<string, number>();
    for (const t of hours) precipByHour.set(t, precip.get(t) ?? 0);

    const hourly: Hourly[] = hours.map((time, idx) => {
      const live = ndbc.get(time);
      const p = precip.get(time);
      const fallback = staticByTime.get(time);

      let rain72 = 0;
      for (let j = Math.max(0, idx - 71); j <= idx; j++) {
        rain72 += precipByHour.get(hours[j]) ?? 0;
      }

      const r = seeded(time);
      const baseline = 5 + r * 10;
      const rainSpike = rain72 >= 0.1 ? rain72 * 35 * Math.exp(-((idx % 72) / 36)) : 0;
      const mpn = Math.round((baseline + rainSpike + r * 3) * 10) / 10;

      return {
        time,
        air_temp_c: live?.air ?? fallback?.air_temp_c ?? null,
        water_temp_c: live?.water ?? fallback?.water_temp_c ?? null,
        precip_mm: p ?? fallback?.precip_mm ?? 0,
        enterococcus_mpn: mpn,
        status: classify(mpn),
      };
    });

    const byDay = new Map<string, Hourly[]>();
    for (const h of hourly) {
      const day = h.time.slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(h);
    }
    const avg = (xs: number[]) =>
      xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null;
    const daily: Daily[] = Array.from(byDay.entries()).map(([date, rows]) => {
      const airs = rows.map((r) => r.air_temp_c).filter((v): v is number => v != null);
      const waters = rows.map((r) => r.water_temp_c).filter((v): v is number => v != null);
      const bacts = rows.map((r) => r.enterococcus_mpn);
      return {
        date,
        air_temp_c_avg: avg(airs),
        water_temp_c_avg: avg(waters),
        precip_mm_total: Math.round(rows.reduce((a, r) => a + (r.precip_mm ?? 0), 0) * 10) / 10,
        enterococcus_mpn_max: Math.max(...bacts),
        enterococcus_mpn_avg: avg(bacts) ?? 0,
      };
    });

    const station = data.beachName
      ? { ...staticData.station, name: data.beachName, id: usedStation }
      : { ...staticData.station, id: usedStation };

    return {
      station,
      generated_at: new Date().toISOString(),
      notes: staticData.notes,
      hourly,
      daily,
      live: true,
      source_status: sourceStatus,
      precip_debug: lastPrecipError,
    };
  });
