import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Thermometer, FlaskConical, CloudRain, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getLiveWaterData, type LiveResponse } from "@/lib/liveWater.functions";
import type { Beach } from "@/data/beaches";

const statusStyles: Record<string, { label: string; bg: string; text: string; ring: string }> = {
  safe:    { label: "Safe",    bg: "bg-emerald-500", text: "text-emerald-50", ring: "ring-emerald-200" },
  caution: { label: "Caution", bg: "bg-amber-500",   text: "text-amber-50",   ring: "ring-amber-200" },
  unsafe:  { label: "Unsafe",  bg: "bg-rose-600",    text: "text-rose-50",    ring: "ring-rose-200" },
};

export function BeachCard({
  beach,
  isFavorite,
  onToggleFavorite,
}: {
  beach: Beach;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  const fetchLive = useServerFn(getLiveWaterData);
  const { data, isLoading } = useQuery<LiveResponse>({
    queryKey: ["live-water", beach.slug],
    queryFn: () =>
      fetchLive({
        data: {
          stationId: beach.ndbcStation,
          fallbackStations: beach.fallbackStations,
          lat: beach.lat,
          lon: beach.lon,
          seed: beach.slug,
          beachName: beach.name,
        },
      }),
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const latest = data
    ? [...data.hourly].reverse().find((h) => h.air_temp_c !== null || h.water_temp_c !== null) ??
      data.hourly[data.hourly.length - 1]
    : null;

  const status = latest?.status ?? "safe";
  const s = statusStyles[status];

  return (
    <Card className={`relative overflow-hidden ring-2 ${s.ring} transition-transform hover:-translate-y-0.5 hover:shadow-lg`}>
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(beach.slug);
        }}
        className="absolute top-2 right-2 z-10 size-8 grid place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
      >
        <Star className={`size-4 ${isFavorite ? "fill-yellow-300 text-yellow-300" : "text-white"}`} />
      </button>

      <Link
        to="/beach/$slug"
        params={{ slug: beach.slug }}
        className="block"
      >
        <div className={`${s.bg} ${s.text} px-5 pt-5 pb-4`}>
          <p className="text-xs uppercase tracking-wider opacity-90">Current status</p>
          <p className="text-3xl font-bold mt-0.5">{isLoading ? "…" : s.label}</p>
          <p className="text-base font-semibold mt-3 leading-tight">{beach.name}</p>
          <p className="text-xs opacity-90">{beach.location}</p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
          <Stat
            icon={<Thermometer className="size-3.5" />}
            label="Water"
            value={latest?.water_temp_c != null ? `${latest.water_temp_c}°C` : "—"}
          />
          <Stat
            icon={<FlaskConical className="size-3.5" />}
            label="Bacteria"
            value={latest ? `${latest.enterococcus_mpn}` : "—"}
            sub="MPN"
          />
          <Stat
            icon={<CloudRain className="size-3.5" />}
            label="Rain"
            value={`${(latest?.precip_mm ?? 0).toFixed(1)}mm`}
            sub="1h"
          />
        </div>

        <div className="px-5 py-2.5 bg-slate-50/80 text-xs text-sky-700 flex items-center justify-end gap-1 font-medium">
          View details <ArrowRight className="size-3" />
        </div>
      </Link>
    </Card>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="px-2 py-3 text-center min-w-0">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">
        {icon}<span>{label}</span>
      </div>
      <div className="text-sm font-semibold leading-tight mt-1 whitespace-nowrap">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground whitespace-nowrap">{sub}</div>}
    </div>
  );
}
