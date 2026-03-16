import { useMemo, useState } from "react";
import { Download, Home, Map, MoveDown, MoveUp, Route, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { destinations, type Destination } from "@/data/destinations";
import { getPermitProfile, parseBudgetRange } from "@/lib/travelFeatureToolkit";

const formatUsd = (value: number) => `$${value.toLocaleString()}`;

const MultiStopTripPlanner = () => {
  const fallbackDestination = destinations[0]!;
  const [destinationToAddId, setDestinationToAddId] = useState(fallbackDestination.id);
  const [tripStops, setTripStops] = useState<string[]>([]);
  const [daysPerStop, setDaysPerStop] = useState(2);

  const itineraryDestinations = useMemo(
    () =>
      tripStops
        .map((destinationId) => destinations.find((destination) => destination.id === destinationId))
        .filter(Boolean) as Destination[],
    [tripStops],
  );

  const permitSummary = useMemo(() => {
    const permits = new Set<string>();
    const gear = new Set<string>();

    itineraryDestinations.forEach((destination) => {
      const permitProfile = getPermitProfile(destination);
      permitProfile.permits.forEach((permit) => permits.add(permit));
      permitProfile.gear.forEach((item) => gear.add(item));
    });

    return {
      permits: [...permits],
      gear: [...gear],
    };
  }, [itineraryDestinations]);

  const totalDays = Math.max(1, daysPerStop) * itineraryDestinations.length;

  const estimatedBudgetUsdMid = useMemo(
    () =>
      itineraryDestinations.reduce((total, destination) => {
        const range = parseBudgetRange(destination.budgetPerDayUsd);
        const mid = (range.min + range.max) / 2;
        return total + mid * Math.max(1, daysPerStop);
      }, 0),
    [itineraryDestinations, daysPerStop],
  );

  const addStop = () => {
    setTripStops((currentStops) =>
      currentStops.includes(destinationToAddId) ? currentStops : [...currentStops, destinationToAddId],
    );
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    setTripStops((currentStops) => {
      const swapIndex = index + direction;

      if (swapIndex < 0 || swapIndex >= currentStops.length) {
        return currentStops;
      }

      const nextStops = [...currentStops];
      [nextStops[index], nextStops[swapIndex]] = [nextStops[swapIndex], nextStops[index]];
      return nextStops;
    });
  };

  const removeStop = (destinationId: string) => {
    setTripStops((currentStops) => currentStops.filter((stopId) => stopId !== destinationId));
  };

  const clearStops = () => {
    setTripStops([]);
  };

  const downloadItinerary = () => {
    if (itineraryDestinations.length === 0) {
      toast.error("Add at least one stop before downloading.");
      return;
    }

    const itineraryText = [
      "Smart Trails Nepal - Multi-Stop Planner",
      `Generated: ${new Date().toLocaleString()}`,
      `Days per stop: ${Math.max(1, daysPerStop)}`,
      `Total trip days: ${totalDays}`,
      `Estimated budget (mid): ${formatUsd(Math.round(estimatedBudgetUsdMid))}`,
      "",
      "Stops",
      ...itineraryDestinations.map(
        (destination, index) => `${index + 1}. ${destination.name} (${destination.area}) - ${destination.category}`,
      ),
      "",
      "Permits",
      ...(permitSummary.permits.length > 0 ? permitSummary.permits.map((permit) => `- ${permit}`) : ["- None"]),
      "",
      "Gear",
      ...(permitSummary.gear.length > 0 ? permitSummary.gear.map((item) => `- ${item}`) : ["- None"]),
    ].join("\n");

    const blob = new Blob([itineraryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "multi-stop-itinerary.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Itinerary downloaded.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Planner", href: "#planner", icon: Route },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="planner" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                <h1 className="mt-1 text-2xl font-display font-semibold">Multi-Stop Trip Planner</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add stops, reorder them, and get permit + gear summary with an estimated total budget.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Add destination</label>
                  <div className="flex gap-2">
                    <select
                      value={destinationToAddId}
                      onChange={(event) => setDestinationToAddId(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                    <Button type="button" onClick={addStop}>Add</Button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Days per stop</label>
                  <Input
                    type="number"
                    min={1}
                    max={14}
                    value={daysPerStop}
                    onChange={(event) => setDaysPerStop(Number(event.target.value) || 1)}
                  />
                </div>
              </div>

              {itineraryDestinations.length > 0 ? (
                <div className="space-y-2">
                  {itineraryDestinations.map((destination, index) => (
                    <div key={destination.id} className="rounded-lg border border-border/70 bg-card/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">Stop {index + 1} - {destination.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{destination.area} · {destination.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveStop(index, -1)}>
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveStop(index, 1)}>
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeStop(destination.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/70 bg-card/60 p-3 text-sm text-muted-foreground">
                  No stops yet. Add destinations to build the itinerary.
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Trip summary</p>
                  <p className="mt-2 text-sm">Stops: {itineraryDestinations.length}</p>
                  <p className="text-sm">Total days: {totalDays}</p>
                  <p className="text-sm">Estimated mid budget: {formatUsd(Math.round(estimatedBudgetUsdMid))}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Permit snapshot</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(permitSummary.permits.length > 0 ? permitSummary.permits : ["No permits listed"]).map((permit) => (
                      <Badge key={permit} variant="outline" className="rounded-full bg-background/80">
                        {permit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Gear snapshot</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(permitSummary.gear.length > 0 ? permitSummary.gear : ["No gear listed"]).map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full bg-background/80">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={downloadItinerary}>
                  <Download className="h-4 w-4" />
                  Download itinerary
                </Button>
                <Button type="button" variant="outline" onClick={clearStops}>
                  Clear all
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default MultiStopTripPlanner;
