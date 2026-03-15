import { useState, useMemo, useCallback } from "react";
import { Calculator, Calendar, MapPin, ArrowRightLeft, Loader2, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { nepalRegions } from "@/data/regions";
import { getHotelSuggestions } from "@/data/hotelSuggestions";
import { getTransportSuggestions } from "@/data/transportSuggestions";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";

const FALLBACK_RATE = 133.5;

type Currency = "USD" | "NPR";

const ACCOMMODATION_TYPES = [
  { id: "budget", label: "Budget Hostel", dailyRate: 8 },
  { id: "mid", label: "Mid-Range Hotel", dailyRate: 35 },
  { id: "premium", label: "Premium Resort", dailyRate: 90 },
  { id: "luxury", label: "Luxury Lodge", dailyRate: 180 },
] as const;

const TRANSPORT_TYPES = [
  { id: "local-bus", label: "Local Bus", dailyRate: 5 },
  { id: "tourist-bus", label: "Tourist Bus", dailyRate: 15 },
  { id: "luxury-bus", label: "Luxury Bus", dailyRate: 28 },
  { id: "private-car", label: "Private Car", dailyRate: 45 },
  { id: "domestic-flight", label: "Domestic Flight", dailyRate: 80 },
] as const;

const BudgetEstimator = () => {
  const [destinationId, setDestinationId] = useState(nepalRegions[0].id);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [days, setDays] = useState(5);
  const [accommodationId, setAccommodationId] = useState<string>("mid");
  const [transportId, setTransportId] = useState<string>("tourist-bus");
  const [currency, setCurrency] = useState<Currency>("USD");

  const { rate: liveRate, loading: rateLoading, source: rateSource } = useExchangeRate();

  const destination = nepalRegions.find((r) => r.id === destinationId)!;
  const accommodation = ACCOMMODATION_TYPES.find((a) => a.id === accommodationId)!;
  const transport = TRANSPORT_TYPES.find((t) => t.id === transportId)!;

  const nprRate = rateLoading ? FALLBACK_RATE : liveRate;
  const rate = currency === "NPR" ? nprRate : 1;
  const sym = currency === "NPR" ? "Rs" : "$";

  const fmt = useCallback(
    (usdValue: number) => {
      const converted = Math.round(usdValue * rate);
      return `${sym}${converted.toLocaleString()}`;
    },
    [rate, sym]
  );

  const breakdown = useMemo(() => {
    const food = destination.avgCost * days;
    const stay = accommodation.dailyRate * days;
    const travel = transport.dailyRate * days;
    const misc = Math.round((food + stay + travel) * 0.12);
    const total = food + stay + travel + misc;
    return { food, stay, travel, misc, total };
  }, [destination, accommodation, transport, days]);

  const filteredRegions = useMemo(() => {
    const query = destinationQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return nepalRegions.filter((region) => {
      const searchableText = `${region.name} ${region.category}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [destinationQuery]);

  const hotelSuggestions = useMemo(
    () => getHotelSuggestions(destinationId, accommodationId as "budget" | "mid" | "premium" | "luxury"),
    [destinationId, accommodationId]
  );

  const transportSuggestions = useMemo(
    () => getTransportSuggestions(destinationId, transportId as "local-bus" | "tourist-bus" | "luxury-bus" | "private-car" | "domestic-flight"),
    [destinationId, transportId]
  );

  return (
    <PageLayout>
      <div className="container py-8 max-w-5xl">
        <PageHeader
          icon={Calculator}
          title="Budget Estimator"
          description="A quick estimate with only the essentials."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-semibold">Trip details</h2>
              <p className="text-sm text-muted-foreground">Choose a destination, trip length, stay, and transport.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Destination
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  placeholder="Search destinations"
                  className="pl-9 rounded-xl"
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{destination.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{destination.category}</p>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">{fmt(destination.avgCost)}/day</span>
              </div>

              {destinationQuery.trim() && (
                filteredRegions.length ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredRegions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => {
                          setDestinationId(region.id);
                          setDestinationQuery("");
                        }}
                        className="w-full rounded-xl border border-border px-3 py-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-secondary/50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{region.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{region.category}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(region.avgCost)}/day</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-4 text-sm text-center text-muted-foreground">
                    No destinations found.
                  </div>
                )
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Duration
                  </label>
                  <span className="text-sm font-semibold">{days} days</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </div>

              <div className="rounded-2xl border border-border p-4 space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <button
                  onClick={() => setCurrency((c) => (c === "USD" ? "NPR" : "USD"))}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium border border-border hover:border-primary/30 bg-background hover:bg-accent px-3 py-2.5 rounded-xl transition-all"
                  title="Toggle currency"
                >
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                  <span>{currency === "USD" ? "Show in NPR" : "Show in USD"}</span>
                </button>
                <div className="h-4 text-[11px] text-muted-foreground">
                  {rateLoading ? (
                    <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Updating rate…</span>
                  ) : currency === "NPR" ? (
                    <span>{rateSource === "fallback" ? "Rate" : "Live rate"}: 1 USD = {nprRate.toFixed(1)} NPR</span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4 space-y-2">
                <label className="text-sm font-medium">Accommodation</label>
                <Select value={accommodationId} onValueChange={setAccommodationId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOMMODATION_TYPES.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label} · {fmt(option.dailyRate)}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-3 rounded-2xl border border-border bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Well-reviewed stays</p>
                      <p className="text-xs text-muted-foreground">Suggestions for {destination.name}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {accommodation.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {hotelSuggestions.map((hotel) => (
                      <div
                        key={hotel.name}
                        className="rounded-xl bg-background border border-border px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{hotel.name}</p>
                            <p className="text-xs text-muted-foreground">{hotel.area}</p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-semibold">{hotel.reviewScore}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-2">
                          <p className="text-xs text-muted-foreground">{hotel.note}</p>
                          <span className="text-xs font-medium whitespace-nowrap">From {fmt(hotel.nightlyFrom)}/night</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4 space-y-2">
                <label className="text-sm font-medium">Transport</label>
                <Select value={transportId} onValueChange={setTransportId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSPORT_TYPES.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label} · {fmt(option.dailyRate)}/day
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-3 rounded-2xl border border-border bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Recommended transport</p>
                      <p className="text-xs text-muted-foreground">Providers for {destination.name}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {transport.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {transportSuggestions.map((option) => (
                      <div
                        key={option.name}
                        className="rounded-xl bg-background border border-border px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{option.name}</p>
                            <p className="text-xs text-muted-foreground">{option.type}</p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-semibold">{option.reviewScore}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-2">
                          <p className="text-xs text-muted-foreground">{option.note}</p>
                          <span className="text-xs font-medium whitespace-nowrap">From {fmt(option.fareFrom)}/day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 h-fit">
            <div className="bg-primary text-primary-foreground rounded-3xl p-6">
              <p className="text-sm opacity-80">Estimated total</p>
              <p className="font-display font-bold text-4xl mt-2">{fmt(breakdown.total)}</p>
              <p className="text-sm opacity-70 mt-2">{destination.name} · {days} days</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs opacity-70">Per day</p>
                  <p className="font-semibold mt-1">{fmt(Math.round(breakdown.total / days))}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs opacity-70">Stay</p>
                  <p className="font-semibold mt-1">{accommodation.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BudgetEstimator;
