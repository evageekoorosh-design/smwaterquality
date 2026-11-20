import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Star } from "lucide-react";
import { BEACHES } from "@/data/beaches";
import { BeachCard } from "@/components/BeachCard";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LA Beach Water Quality — Pick a Beach" },
      {
        name: "description",
        content:
          "Live water quality at popular Los Angeles beaches. Check status, temperature, rainfall, and bacteria levels before you go.",
      },
      { property: "og:title", content: "LA Beach Water Quality — Pick a Beach" },
      {
        property: "og:description",
        content:
          "Live water quality at popular Los Angeles beaches. Check status, temperature, rainfall, and bacteria levels before you go.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { isFavorite, toggle, favorites, hydrated } = useFavorites();

  const favBeaches = hydrated ? BEACHES.filter((b) => favorites.includes(b.slug)) : [];
  const otherBeaches = hydrated ? BEACHES.filter((b) => !favorites.includes(b.slug)) : BEACHES;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-600 text-white grid place-items-center">
            <Droplets className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Beach Water Quality Tracker</h1>
            <p className="text-xs text-muted-foreground">Live conditions at LA-area beaches</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Pick a beach</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap any beach to see hourly temperature, rainfall, and bacteria readings. Tap the star to pin favorites.
          </p>
        </section>

        {favBeaches.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Favorites</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favBeaches.map((b) => (
                <BeachCard key={b.slug} beach={b} isFavorite onToggleFavorite={toggle} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          {favBeaches.length > 0 && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All beaches</h3>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherBeaches.map((b) => (
              <BeachCard key={b.slug} beach={b} isFavorite={isFavorite(b.slug)} onToggleFavorite={toggle} />
            ))}
          </div>
        </section>

        <footer className="text-xs text-muted-foreground border-t pt-6">
          <p>
            <b>Data sources:</b> Air & water temperature from NOAA NDBC. Rainfall from National Weather Service observations at LAX (Open-Meteo as backup). Bacteria values are synthesized with realistic baseline noise plus rain-correlated spikes that decay over the 72-hour storm-drain advisory window.
          </p>
        </footer>
      </main>
    </div>
  );
}
