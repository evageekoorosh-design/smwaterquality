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
};

const STATION = "ICAC1";
const LAT = 34.008;
const LON = -118.499;

function classify(mpn: number): "safe" | "caution" | "unsafe" {
  if (mpn > 104) return "unsafe";
  if (mpn > 35) return "caution";
  return "safe";
}

// Parse NDBC realtime2 .txt — space-separated, two header lines starting with '#'.
async function fetchNdbc(): Promise<Map<string, { air: number | null; water: number | null }>> {
  const res = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${STATION}.txt`, {
    headers: { "User-Agent": "beach-water-tracker" },
  });
  if (!res.ok) throw new Error(`NDBC ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
  const out = new Map<string, { air: number | null; water: number | null }>();
  // Columns: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP ...
  for (const line of lines) {
    const c = line.trim().split(/\s+/);
    if (c.length < 15) continue;
    const [yy, mm, dd, hh, mn] = c;
    const atmp = parseFloat(c[13]);
    const wtmp = parseFloat(c[14]);
    // Bucket to the hour (drop minutes)
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

async function fetchPrecip(): Promise<Map<string, number>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=precipitation&past_days=7&forecast_days=1&timezone=UTC`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as { hourly: { time: string[]; precipitation: number[] } };
  const out = new Map<string, number>();
  json.hourly.time.forEach((t, i) => {
    // open-meteo returns "2026-05-19T23:00" (UTC); normalize to ISO with seconds + Z
    out.set(`${t}:00Z`, json.hourly.precipitation[i] ?? 0);
  });
  return out;
}

export const getLiveWaterData = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveResponse> => {
    const sourceStatus = { ndbc: "ok", openmeteo: "ok" } as LiveResponse["source_status"];

    const [ndbcRes, precipRes] = await Promise.allSettled([fetchNdbc(), fetchPrecip()]);
    const ndbc = ndbcRes.status === "fulfilled" ? ndbcRes.value : new Map();
    if (ndbcRes.status === "rejected") sourceStatus.ndbc = "error";
    const precip = precipRes.status === "fulfilled" ? precipRes.value : new Map();
    if (precipRes.status === "rejected") sourceStatus.openmeteo = "error";

    // Build trailing 7-day hourly window ending at current hour (UTC)
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

    // Deterministic pseudo-random (so values are stable for a given hour, not jumpy each refetch)
    const seeded = (key: string) => {
      let h = 2166136261;
      for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
      return ((h >>> 0) % 10000) / 10000;
    };

    // Precompute cumulative rainfall in the prior 72h for each hour (storm-drain advisory window)
    const precipByHour = new Map<string, number>();
    for (const t of hours) precipByHour.set(t, precip.get(t) ?? 0);

    const hourly: Hourly[] = hours.map((time, idx) => {
      const live = ndbc.get(time);
      const p = precip.get(time);
      const fallback = staticByTime.get(time);

      // Sum rainfall in trailing 72h
      let rain72 = 0;
      for (let j = Math.max(0, idx - 71); j <= idx; j++) {
        rain72 += precipByHour.get(hours[j]) ?? 0;
      }

      // Synthetic Enterococcus (MPN/100mL):
      //   - baseline 4-15 with diurnal noise
      //   - spike that decays exponentially over ~72h after rain ≥0.1mm
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

    // Recompute daily summary from hourly
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

    return {
      station: staticData.station,
      generated_at: new Date().toISOString(),
      notes: staticData.notes,
      hourly,
      daily,
      live: true,
      source_status: sourceStatus,
    };
  },
);
