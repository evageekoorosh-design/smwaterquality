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
            <CardTitle className="text-base">Rainfall</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              This is the biggest real-world modifier. After a rainstorm, bacteria levels usually exceed state standards for recreational water use due to untreated storm drain flows that may contact motor oil, pet waste, pesticides, and trash. Beachapedia
            </p>
            <p>
              California actually has a standing advisory system built around this:
            </p>
            <div className="space-y-2 pl-4 border-l-2 border-sky-200">
              <p>
                Most coastal counties automatically post rain advisories at beaches near storm drains after significant rainfall (typically ≥0.1 inches in 24 hours), without even waiting for test results
              </p>
              <p>
                The standard guidance is to avoid ocean contact for 72 hours after rain near storm drains and creek mouths
              </p>
              <p>
                This is essentially an implicit, temporary lowering of the "safe" threshold — officials treat the water as unsafe preemptively
              </p>
            </div>
            <p>
              So for your tracker, rainfall isn't just a correlating metric — it's operationally used as a proxy closure trigger independent of measured bacteria levels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
