import { useMemo, useState } from "react";
import { Copy, Download, Home, Map, Package } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { destinations } from "@/data/destinations";
import {
  getDestinationForecast,
  getHiddenGemSuggestions,
  getPackingList,
  getPermitProfile,
  getSafetyProfile,
} from "@/lib/travelFeatureToolkit";

const OfflineTravelPackage = () => {
  const fallbackDestination = destinations[0]!;
  const [destinationId, setDestinationId] = useState(fallbackDestination.id);
  const [travelerName, setTravelerName] = useState("");
  const [tripDays, setTripDays] = useState(5);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? fallbackDestination,
    [destinationId, fallbackDestination],
  );

  const forecast = useMemo(() => getDestinationForecast(selectedDestination), [selectedDestination]);
  const safety = useMemo(() => getSafetyProfile(selectedDestination), [selectedDestination]);
  const permits = useMemo(() => getPermitProfile(selectedDestination), [selectedDestination]);
  const packing = useMemo(() => getPackingList(selectedDestination), [selectedDestination]);
  const hiddenGems = useMemo(() => getHiddenGemSuggestions(selectedDestination, 3), [selectedDestination]);

  const packageText = useMemo(
    () =>
      [
        "Smart Trails Nepal - Offline Package",
        `Generated: ${new Date().toLocaleString()}`,
        `Traveler: ${travelerName || "Not set"}`,
        `Trip length: ${Math.max(1, tripDays)} day(s)`,
        "",
        `Destination: ${selectedDestination.name}`,
        `Area: ${selectedDestination.area}`,
        `Category: ${selectedDestination.category}`,
        `Altitude: ${selectedDestination.altitudeM} m`,
        `Forecast: ${forecast.headline}`,
        "",
        "Permits",
        ...permits.permits.map((item) => `- ${item}`),
        "",
        "Packing",
        ...packing.map((item) => `- ${item}`),
        "",
        "Safety",
        `- Risk: ${safety.risk}`,
        `- Emergency hub: ${safety.emergencyHub}`,
        `- Warning: ${safety.warning}`,
        ...safety.checklist.map((item) => `- ${item}`),
        "",
        "Alternative destinations",
        ...hiddenGems.map((item) => `- ${item.destination.name}: ${item.reason}`),
      ].join("\n"),
    [travelerName, tripDays, selectedDestination, forecast, permits, packing, safety, hiddenGems],
  );

  const copyPackage = async () => {
    try {
      await navigator.clipboard.writeText(packageText);
      toast.success("Offline package copied.");
    } catch {
      toast.error("Could not copy package on this browser.");
    }
  };

  const downloadPackage = () => {
    const blob = new Blob([packageText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `offline-package-${selectedDestination.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Offline package downloaded.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Offline", href: "#offline", icon: Package },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="offline" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                <h1 className="mt-1 text-2xl font-display font-semibold">Offline Travel Package</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generates a concrete offline TXT package with permits, gear, safety, and alternatives.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Destination</label>
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
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Traveler</label>
                  <Input value={travelerName} onChange={(event) => setTravelerName(event.target.value)} placeholder="Name" />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Days</label>
                  <Input type="number" min={1} max={30} value={tripDays} onChange={(event) => setTripDays(Number(event.target.value) || 1)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={copyPackage}>
                  <Copy className="h-4 w-4" />
                  Copy package
                </Button>
                <Button type="button" variant="outline" onClick={downloadPackage}>
                  <Download className="h-4 w-4" />
                  Download TXT
                </Button>
              </div>

              <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-card/70 p-3 text-xs text-foreground/90">
                {packageText}
              </pre>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default OfflineTravelPackage;
