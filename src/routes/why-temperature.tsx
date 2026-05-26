import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/why-temperature")({
  component: WhyTemperature,
});

function WhyTemperature() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to tracker
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Why Beach Water Temperature Matters
          </h1>
          <p className="text-muted-foreground mt-2">
            Understanding how water temperature affects beach safety, marine
            life, and your swimming experience.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              Temperature affects bacteria in two competing ways that are worth modeling separately:
            </p>
            <div className="space-y-3">
              <p>
                <strong className="text-foreground">Warmer water = bacterial growth</strong> — Higher water temps accelerate the reproduction of fecal indicator bacteria and pathogens. Enterococcus in particular survives and multiplies more readily in warm, shallow nearshore water. This means a reading of, say, 80 CFU/100ml at 75°F carries more risk than the same reading at 58°F, because the bacteria population is more likely growing rather than dying off.
              </p>
              <p>
                <strong className="text-foreground">Warmer air = more beach use</strong> — Higher temps bring more swimmers, surfers, and waders — increasing the number of people exposed to any given bacteria level. This is actually baked into EPA's use-intensity framework (heavily used beaches get stricter effective thresholds).
              </p>
              <p>
                <strong className="text-foreground">Colder water = slower die-off, but less exposure</strong> — Cold water slows bacterial die-off too, so contamination from a spill or rain event can persist longer — but fewer people are in the water.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
