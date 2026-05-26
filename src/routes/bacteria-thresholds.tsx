import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/bacteria-thresholds")({
  component: BacteriaThresholds,
});

function BacteriaThresholds() {
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
            Why California's Beach Bacteria Thresholds Differ
          </h1>
          <p className="text-muted-foreground mt-2">
            A deeper look at how California sets and enforces water-quality
            safety limits for coastal recreation.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coming soon</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This page will cover topics such as:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>How the 104 MPN/100mL Enterococcus threshold was established</li>
              <li>Differences between California and federal EPA standards</li>
              <li>Regional variations by county and monitoring program</li>
              <li>How rainfall, runoff, and seasonal patterns influence local thresholds</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
