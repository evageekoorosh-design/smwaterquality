import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/bacteria-thresholds")({
  component: BacteriaThresholds,
});

function Cite({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className="ml-1 align-middle text-[10px] font-normal">
      {children}
    </Badge>
  );
}

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

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bacteria values are now synthesized with realistic baseline noise
          (5–18 MPN) plus rain-correlated spikes that decay over the 72-hour
          storm-drain advisory window — so dry weeks stay low and post-rain
          hours actually climb (potentially into caution/unsafe territory if
          rainfall ≥0.1mm hits).
        </div>

        {/* The Core Numbers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">The Core Numbers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              California uses four <strong>single-sample criteria</strong> (per 100 ml): 104 enterococcus, 10,000 total coliforms (TC), 400 fecal coliforms (FC), or 1,000 TC if the TC/FC ratio is &lt;10. It also uses three <strong>geometric mean standards</strong> (based on at least five weekly samples over a 30-day period): 35 enterococcus, 200 FC, or 1,000 TC.
              <Cite>CA</Cite>
            </p>
            <p>
              So CA actually operates on multiple indicators simultaneously — not just one number — which is already more complex than many states.
            </p>
          </CardContent>
        </Card>

        {/* Why They're Different */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Why They're Different: The Key Reasons
          </h2>
          <div className="space-y-4">
            {/* 1 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">1.</span>
                  California Has Its Own State Law (AB 411)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  AB 411, chaptered into law in 1997, added Sections 115880–115915 to the California Health and Safety Code. It established California's beach water quality monitoring program, which samples fecal indicator bacteria and provides public notification at 476 California coastal and San Francisco Bay saltwater beaches. This predates and operates independently of federal EPA standards.
                  <Cite>CA</Cite>
                </p>
              </CardContent>
            </Card>

            {/* 2 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">2.</span>
                  The Federal Framework Sets a Floor, Not a Ceiling
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  The EPA's bacteria rule established health-based federal bacteria standards for states and territories that had not yet adopted standards as protective as EPA's own criteria. States that already had equivalent or stricter standards were excluded from the federal rule. California's AB 411 framework meant it was already covered.
                  <Cite>US EPA</Cite>
                </p>
              </CardContent>
            </Card>

            {/* 3 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">3.</span>
                  California Tracks Multiple Indicators (Not Just Enterococcus)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Most states default to enterococcus alone. California analyzes samples for three indicators: enterococcus, total coliform (TC), and fecal coliform (FC) bacteria — and a beach can be flagged if any one of them exceeds its respective threshold. This multi-indicator approach reflects California's older, more expansive regulatory history.
                  <Cite>CA</Cite>
                </p>
              </CardContent>
            </Card>

            {/* 4 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">4.</span>
                  The 2018 Standards Update — and the Controversy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  The last major modification before 2018 occurred in the late 1990s with AB 411. Since then, the EPA adopted new (and some argue weaker) standards in 2012, and a number of California-specific epidemiological studies were published. When California updated its standards in 2018, it largely aligned with the EPA rather than incorporating those California-specific studies — drawing criticism from groups like Heal the Bay.
                  <Cite>Heal the Bay</Cite>
                </p>
                <p>
                  Environmental advocates argued that California, known for setting stricter standards than federal regulators, should base its thresholds on research performed along California's unique coastline and watersheds rather than simply using the EPA as the gold standard.
                  <Cite>Heal the Bay</Cite>
                </p>
              </CardContent>
            </Card>

            {/* 5 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">5.</span>
                  The Testing Method Itself Has Evolved in CA
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  In May 2022, San Diego County became the first federally and state-approved coastal county in the nation to begin using droplet digital polymerase chain reaction (ddPCR) testing, which offers more rapid results. For enterococcus, the ddPCR threshold value of 1,413 DNA copies per 100 ml is used. This is equivalent to the culture-based 104 CFU standard but measured differently — which is why you may see different-looking numbers in NOAA or state data depending on the testing method used.
                  <Cite>CA</Cite>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Thresholds Differ Across States Generally */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Why Thresholds Differ Across States Generally
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>A few structural reasons:</p>
            <ul className="space-y-3 list-none ml-0">
              <li className="flex gap-3">
                <span className="text-sky-600 font-semibold shrink-0">State sovereignty</span>
                <span>
                  — The Clean Water Act lets states set their own standards as long as they're at least as protective as EPA criteria. States that had existing programs (like CA) kept their own frameworks.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 font-semibold shrink-0">Beach use intensity</span>
                <span>
                  — EPA criteria vary by usage level: "designated bathing beach" gets the most protective (lowest) threshold, while "infrequent use" areas get less stringent ones, because more people are likely to become ill at heavily used areas if thresholds are exceeded.
                  <Cite>Federal Register</Cite>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 font-semibold shrink-0">Indicator organism choice</span>
                <span>
                  — Some states use E. coli (more common for freshwater), others use enterococcus (better for saltwater), and older programs like California's also track total and fecal coliforms.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 font-semibold shrink-0">Funding and monitoring capacity</span>
                <span>
                  — Despite federal BEACH Act funding, not all beaches are covered, and many states stop testing during cooler off-season months due to funding and staffing restrictions.
                  <Cite>Beachapedia</Cite>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
