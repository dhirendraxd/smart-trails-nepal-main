import { useEffect, useMemo, useState } from "react";
import { DollarSign, Home, Map, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { destinations } from "@/data/destinations";
import { getBudgetEstimate, parseBudgetRange } from "@/lib/travelFeatureToolkit";

const USD_TO_NPR_FALLBACK = 133.2;
const styleMultipliers = {
  lean: 0.9,
  standard: 1,
  comfort: 1.28,
} as const;

const formatUsd = (value: number) => `$${value.toLocaleString()}`;
const formatNpr = (value: number) => `NPR ${value.toLocaleString()}`;

const BudgetEstimator = () => {
  const fallbackDestination = destinations[0]!;
  const [destinationId, setDestinationId] = useState(fallbackDestination.id);
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState<keyof typeof styleMultipliers>("standard");
  const [usdToNprRate, setUsdToNprRate] = useState(USD_TO_NPR_FALLBACK);
  const [isLiveRate, setIsLiveRate] = useState(false);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? fallbackDestination,
    [destinationId, fallbackDestination],
  );

  const budgetEstimate = useMemo(
    () =>
      getBudgetEstimate({
        destination: selectedDestination,
        days,
        travelers,
        comfortMultiplier: styleMultipliers[travelStyle],
        usdToNprRate,
      }),
    [selectedDestination, days, travelers, travelStyle, usdToNprRate],
  );

  const sourceRange = useMemo(
    () => parseBudgetRange(selectedDestination.budgetPerDayUsd),
    [selectedDestination],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Exchange rate service unavailable.");
        }

        return response.json();
      })
      .then((payload) => {
        const nextRate = Number(payload?.rates?.NPR);

        if (Number.isFinite(nextRate) && nextRate > 0) {
          setUsdToNprRate(nextRate);
          setIsLiveRate(true);
        }
      })
      .catch(() => {
        setUsdToNprRate(USD_TO_NPR_FALLBACK);
        setIsLiveRate(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Budget", href: "#budget", icon: Wallet },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="budget" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                <h1 className="mt-1 text-2xl font-display font-semibold">Budget Estimator</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Calculates trip budget using destination daily range, travelers, trip duration, and live NPR/USD rate.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
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

                <div className="rounded-md border border-border/70 bg-card/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Exchange rate source</p>
                  <p className="mt-1 text-sm font-medium">
                    1 USD = {usdToNprRate.toFixed(2)} NPR ({isLiveRate ? "Live" : "Fallback"})
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Days</label>
                  <Input type="number" min={1} max={30} value={days} onChange={(event) => setDays(Number(event.target.value) || 1)} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Travelers</label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={travelers}
                    onChange={(event) => setTravelers(Number(event.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(styleMultipliers) as Array<keyof typeof styleMultipliers>).map((styleKey) => (
                      <Button
                        key={styleKey}
                        type="button"
                        variant={travelStyle === styleKey ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTravelStyle(styleKey)}
                      >
                        {styleKey}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Estimated total</p>
                  <p className="mt-2 text-lg font-semibold">{formatUsd(budgetEstimate.totalUsdMin)} – {formatUsd(budgetEstimate.totalUsdMax)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatNpr(budgetEstimate.totalNprMin)} – {formatNpr(budgetEstimate.totalNprMax)}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Per day midpoint</p>
                  <p className="mt-2 text-lg font-semibold">{formatUsd(budgetEstimate.perDayUsdMid)} / day</p>
                  <p className="mt-1 text-sm text-muted-foreground">Raw destination range: ${sourceRange.min}–${sourceRange.max}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Calculation summary</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {days} day{days > 1 ? "s" : ""} × {travelers} traveler{travelers > 1 ? "s" : ""} × style multiplier {styleMultipliers[travelStyle].toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default BudgetEstimator;
