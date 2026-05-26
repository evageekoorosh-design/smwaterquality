import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/why-rainfall")({
  component: WhyRainfall,
});

function WhyRainfall() {
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
            Why Rainfall Matters for Beach Water Quality
          </h1>
          <p className="text-muted-foreground mt-2">
            Understanding how rain and stormwater runoff affect bacteria levels
            and swimming safety at the beach.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Content about rainfall's impact on beach water quality will be
              added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
