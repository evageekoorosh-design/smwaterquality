import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import data from "@/data/santaMonicaWater.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, CartesianGrid,
} from "recharts";
import { Droplets, Thermometer, CloudRain, FlaskConical, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

type Hourly = {
  time: string;
  air_temp_c: number | null;
  water_temp_c: number | null;
  precip_mm: number | null;
  enterococcus_mpn: number;
  status: "safe" | "caution" | "unsafe";
};

const statusStyles: Record<string, { label: string; bg: string; text: string; ring: string }> = {
  safe:    { label: "Safe",    bg: "bg-emerald-500",  text: "text-emerald-50",  ring: "ring-emerald-200" },
  caution: { label: "Caution", bg: "bg-amber-500",    text: "text-amber-50",    ring: "ring-amber-200" },
  unsafe:  { label: "Unsafe",  bg: "bg-rose-600",     text: "text-rose-50",     ring: "ring-rose-200" },
};

function Index() {
  const hourly = data.hourly as Hourly[];
  const daily = data.daily as Array<{
    date: string; air_temp_c_avg: number | null; water_temp_c_avg: number | null;
    precip_mm_total: number; enterococcus_mpn_max: number; enterococcus_mpn_avg: number;
  }>;

  const latest = useMemo(() => {
    for (let i = hourly.length - 1; i >= 0; i--) {
      const r = hourly[i];
      if (r.air_temp_c !== null || r.water_temp_c !== null) return r;
    }
    return hourly[hourly.length - 1];
  }, [hourly]);

  const chartData = hourly.map(h => ({
    t: new Date(h.time).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" }),
    air: h.air_temp_c,
    water: h.water_temp_c,
    precip: h.precip_mm ?? 0,
    bact: h.enterococcus_mpn,
  }));

  const s = statusStyles[latest.status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-600 text-white grid place-items-center">
              <Droplets className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Beach Water Quality Tracker</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> {data.station.name} · NOAA Station {data.station.id}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Last 7 days · generated {new Date(data.generated_at).toLocaleString()}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Status hero */}
        <Card className={`overflow-hidden ring-2 ${s.ring}`}>
          <div className={`${s.bg} ${s.text} px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div>
              <p className="text-sm uppercase tracking-wider opacity-90">Current beach status</p>
              <p className="text-5xl font-bold mt-1">{s.label}</p>
              <p className="text-sm mt-2 opacity-90">
                Enterococcus {latest.enterococcus_mpn} MPN/100mL · CA threshold 104
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat icon={<Thermometer className="size-4" />} label="Water" value={latest.water_temp_c != null ? `${latest.water_temp_c}°C` : "—"} />
              <Stat icon={<Thermometer className="size-4" />} label="Air"   value={latest.air_temp_c   != null ? `${latest.air_temp_c}°C`   : "—"} />
              <Stat icon={<CloudRain className="size-4" />}   label="Rain (1h)" value={`${(latest.precip_mm ?? 0).toFixed(1)}mm`} />
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Temperature" icon={<Thermometer className="size-4" />} subtitle="Hourly air & water (°C)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval={23} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="water" stroke="#0284c7" dot={false} name="Water" strokeWidth={2} />
                <Line type="monotone" dataKey="air"   stroke="#f59e0b" dot={false} name="Air"   strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rainfall" icon={<CloudRain className="size-4" />} subtitle="Hourly precipitation (mm)">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval={23} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="precip" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Bacteria (Enterococcus)"
            icon={<FlaskConical className="size-4" />}
            subtitle="MPN/100mL · red line = CA unsafe threshold (104)"
            full
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval={23} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={104} stroke="#e11d48" strokeDasharray="4 4" label={{ value: "Unsafe", fontSize: 10, fill: "#e11d48" }} />
                <ReferenceLine y={35}  stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Caution", fontSize: 10, fill: "#f59e0b" }} />
                <Line type="monotone" dataKey="bact" stroke="#0f766e" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Daily table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Air (°C)</th>
                  <th className="py-2 pr-4">Water (°C)</th>
                  <th className="py-2 pr-4">Rain (mm)</th>
                  <th className="py-2 pr-4">Bact avg</th>
                  <th className="py-2 pr-4">Bact max</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {daily.map(d => {
                  const st = d.enterococcus_mpn_max > 104 ? "unsafe" : d.enterococcus_mpn_max > 35 ? "caution" : "safe";
                  const ss = statusStyles[st];
                  return (
                    <tr key={d.date} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{d.date}</td>
                      <td className="py-2 pr-4">{d.air_temp_c_avg ?? "—"}</td>
                      <td className="py-2 pr-4">{d.water_temp_c_avg ?? "—"}</td>
                      <td className="py-2 pr-4">{d.precip_mm_total.toFixed(1)}</td>
                      <td className="py-2 pr-4">{d.enterococcus_mpn_avg}</td>
                      <td className="py-2 pr-4">{d.enterococcus_mpn_max}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ss.bg} ${ss.text}`}>{ss.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Data sources */}
        <Card className="bg-slate-50/50">
          <CardHeader><CardTitle className="text-base">Data sources & notes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p><b>Air & water temperature:</b> {data.notes.air_temp_c} (real).</p>
            <p><b>Rainfall:</b> {data.notes.precip_mm} (real).</p>
            <p><b>Bacteria:</b> {data.notes.enterococcus_mpn}</p>
            <p><b>Thresholds:</b> {data.notes.status_threshold}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/15 rounded-lg px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-center gap-1 text-xs opacity-90">{icon}{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, children, full }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; full?: boolean }) {
  return (
    <Card className={full ? "lg:col-span-2" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">{icon}{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
