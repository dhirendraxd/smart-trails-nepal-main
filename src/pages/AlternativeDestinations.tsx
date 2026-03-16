import { useMemo, useState } from "react";
import { Compass, Home, Map, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { destinations } from "@/data/destinations";
import { getHiddenGemSuggestions } from "@/lib/travelFeatureToolkit";

const AlternativeDestinations = () => {
  const fallbackDestination = destinations.find((destination) => destination.crowd === "Busy") ?? destinations[0]!;
  const [destinationId, setDestinationId] = useState(fallbackDestination.id);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? fallbackDestination,
    [destinationId, fallbackDestination],
  );

  const alternatives = useMemo(
    () => getHiddenGemSuggestions(selectedDestination, 6),
    [selectedDestination],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Alternatives", href: "#alternatives", icon: Compass },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="alternatives" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                <h1 className="mt-1 text-2xl font-display font-semibold">Alternative Destination Suggestions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a destination and get lower-crowd alternatives with similar travel profile.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current destination</label>
                <select
                  value={selectedDestination.id}
                  onChange={(event) => setDestinationId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <p className="text-sm font-semibold">Base destination</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedDestination.name} · {selectedDestination.category} · Crowd level: {selectedDestination.crowd}
                </p>
              </div>

              {alternatives.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {alternatives.map((item) => (
                    <div key={item.destination.id} className="rounded-xl border border-border/70 bg-card/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{item.destination.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.destination.category} · {item.destination.area}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                          -{item.crowdReductionPercent}% crowd
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span>Difficulty: {item.destination.difficulty}</span>
                        <span>Altitude: {item.destination.altitudeM} m</span>
                        <span>Budget: {item.destination.budgetPerDayUsd}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/70 bg-card/50 p-3 text-sm text-muted-foreground">
                  No alternatives found for this destination.
                </div>
              )}

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <p className="text-sm font-semibold">How this works</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Suggestions are ranked by crowd reduction and category/difficulty similarity with the selected destination.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AlternativeDestinations;
