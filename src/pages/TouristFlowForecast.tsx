import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CloudSun, Home, Map } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { destinations } from "@/data/destinations";
import { getDestinationForecast, type DestinationForecast } from "@/lib/travelFeatureToolkit";
import { cn } from "@/lib/utils";

const getTrendBadgeClass = (trend: DestinationForecast["trend"]) => {
  if (trend === "Busier") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (trend === "Quieter") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
};

const TouristFlowForecast = () => {
  const fallbackDestination = destinations[0]!;
  const [destinationId, setDestinationId] = useState(fallbackDestination.id);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? fallbackDestination,
    [destinationId, fallbackDestination],
  );

  const selectedForecast = useMemo(
    () => getDestinationForecast(selectedDestination),
    [selectedDestination],
  );

  const allForecasts = useMemo(
    () =>
      destinations.map((destination) => ({
        destination,
        forecast: getDestinationForecast(destination),
      })),
    [],
  );

  const busiestNext = useMemo(
    () =>
      [...allForecasts]
        .sort((first, second) => second.forecast.crowdIndex[2] - first.forecast.crowdIndex[2])
        .slice(0, 4),
    [allForecasts],
  );

  const quietestNext = useMemo(
    () =>
      [...allForecasts]
        .sort((first, second) => first.forecast.crowdIndex[2] - second.forecast.crowdIndex[2])
        .slice(0, 4),
    [allForecasts],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Forecast", href: "#forecast", icon: CloudSun },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="forecast" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                  <h1 className="mt-1 text-2xl font-display font-semibold">Tourist Flow Forecast</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Predicts if a destination will get busier or quieter over the next 3 weeks.
                  </p>
                </div>
                <Badge variant="outline" className={cn("rounded-full", getTrendBadgeClass(selectedForecast.trend))}>
                  {selectedForecast.trend}
                </Badge>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Destination
                </label>
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

              <div className="grid grid-cols-3 gap-2">
                {selectedForecast.crowdIndex.map((value, index) => (
                  <div key={`${selectedDestination.id}-${index}`} className="rounded-lg border border-border/70 bg-card/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Week {index + 1}</p>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          value >= 75 ? "bg-rose-500" : value >= 50 ? "bg-amber-500" : "bg-emerald-500",
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{value}/100</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <p className="text-sm font-semibold">{selectedForecast.headline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{selectedForecast.reason}</p>
                <p className="mt-2 text-sm text-foreground/90">Action: {selectedForecast.action}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-rose-500" />
                  <p className="text-sm font-semibold">Likely busiest next</p>
                </div>
                <div className="space-y-2">
                  {busiestNext.map((item) => (
                    <div key={item.destination.id} className="rounded-md border border-border/70 bg-card/70 px-3 py-2">
                      <p className="text-sm font-medium">{item.destination.name}</p>
                      <p className="text-xs text-muted-foreground">Week 3 index: {item.forecast.crowdIndex[2]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold">Likely quieter next</p>
                </div>
                <div className="space-y-2">
                  {quietestNext.map((item) => (
                    <div key={item.destination.id} className="rounded-md border border-border/70 bg-card/70 px-3 py-2">
                      <p className="text-sm font-medium">{item.destination.name}</p>
                      <p className="text-xs text-muted-foreground">Week 3 index: {item.forecast.crowdIndex[2]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TouristFlowForecast;
