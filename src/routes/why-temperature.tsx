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
            <CardTitle className="text-base">Coming soon</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              This page will soon include detailed information about why water
              temperature is an important indicator for beachgoers, including
              its relationship to bacteria growth, marine ecosystem health, and
              swimmer comfort and safety.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
