import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  Backpack,
  Clock3,
  Compass,
  Flame,
  Gem,
  HeartPulse,
  Map as MapIcon,
  MapPinned,
  Mountain,
  MoveDown,
  MoveUp,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import type { Destination, DestinationWithDistance } from "@/data/destinations";
import { destinations } from "@/data/destinations";
import { getLocalExploreForDestination } from "@/data/localExplore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getBudgetEstimate,
  getDailyBriefing,
  getDestinationForecast,
  getHiddenGemSuggestions,
  getPackingList,
  getPermitProfile,
  getSafetyProfile,
  getSmartInsight,
  getWeatherCodeLabel,
  type DestinationForecast,
} from "@/lib/travelFeatureToolkit";
import { cn } from "@/lib/utils";

type LivePopularPlace = {
  destinationId: string;
  approxDistanceKm: number;
  place: {
    name: string;
    duration: string;
    note: string;
  };
};

type ExploreFeatureKey = "forecast" | "insights" | "budget" | "alternatives" | "safety" | "offline" | "planner";

const FEATURE_SECTION_BY_KEY: Record<ExploreFeatureKey, "heatmap" | "insights" | "budget" | "safety"> = {
  forecast: "heatmap",
  insights: "insights",
  budget: "budget",
  alternatives: "budget",
  safety: "safety",
  offline: "safety",
  planner: "safety",
};

const FEATURE_LABEL_BY_KEY: Record<ExploreFeatureKey, string> = {
  forecast: "Tourist Flow Forecast",
  insights: "Smart Travel Insights",
  budget: "Budget Estimator",
  alternatives: "Alternative Destination Suggestions",
  safety: "Smart SOS Safety",
  offline: "Offline Travel Package",
  planner: "Multi-Stop Trip Planner",
};

type ExploreFeaturePanelProps = {
  selectedDestination: Destination | null;
  fromDestination: Destination | null;
  nearbyDestinations: DestinationWithDistance[];
  liveNearbyDestinations: DestinationWithDistance[];
  livePopularPlaces: LivePopularPlace[];
  activeFeature: ExploreFeatureKey | null;
  isHeatmapEnabled: boolean;
  onToggleHeatmap: () => void;
  onSelectDestination: (destinationId: string) => void;
};

type WeatherSnapshot = {
  summary: string;
  currentTempC: number;
  apparentTempC: number;
  isDay: boolean;
  daily: Array<{
    label: string;
    tempMaxC: number;
    tempMinC: number;
    precipitationChance: number;
    summary: string;
  }>;
};

const USD_TO_NPR_FALLBACK = 133.2;
const SAFETY_STORAGE_KEY = "smart-trails-safety-demo";
const styleMultipliers = {
  lean: 0.9,
  standard: 1,
  comfort: 1.28,
} as const;

const formatUsd = (value: number) => `$${value.toLocaleString()}`;
const formatNpr = (value: number) => `NPR ${value.toLocaleString()}`;
const toDayLabel = (value: string) => new Date(value).toLocaleDateString("en-US", { weekday: "short" });

const getTrendBadgeClass = (trend: DestinationForecast["trend"]) => {
  if (trend === "Busier") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (trend === "Quieter") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
};

const getRiskBadgeClass = (risk: "Low" | "Moderate" | "High") => {
  if (risk === "High") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (risk === "Moderate") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};

const ExploreFeaturePanel = ({
  selectedDestination,
  fromDestination,
  nearbyDestinations,
  liveNearbyDestinations,
  livePopularPlaces,
  activeFeature,
  isHeatmapEnabled,
  onToggleHeatmap,
  onSelectDestination,
}: ExploreFeaturePanelProps) => {
  const focusDestination = selectedDestination ?? nearbyDestinations[0] ?? destinations[0];
  const [tripDays, setTripDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState<keyof typeof styleMultipliers>("standard");
  const [usdToNprRate, setUsdToNprRate] = useState(USD_TO_NPR_FALLBACK);
  const [isLiveRate, setIsLiveRate] = useState(false);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [safetyTimerHours, setSafetyTimerHours] = useState(6);
  const [safetyDeadline, setSafetyDeadline] = useState<number | null>(null);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [tripStops, setTripStops] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<string[]>(["heatmap", "insights"]);

  const focusForecast = useMemo(() => getDestinationForecast(focusDestination), [focusDestination]);
  const hiddenGems = useMemo(() => getHiddenGemSuggestions(focusDestination), [focusDestination]);
  const packingList = useMemo(() => getPackingList(focusDestination), [focusDestination]);
  const permitProfile = useMemo(() => getPermitProfile(focusDestination), [focusDestination]);
  const safetyProfile = useMemo(() => getSafetyProfile(focusDestination), [focusDestination]);
  const smartInsight = useMemo(
    () => getSmartInsight(focusDestination, focusForecast, hiddenGems, liveNearbyDestinations.length),
    [focusDestination, focusForecast, hiddenGems, liveNearbyDestinations.length],
  );
  const briefing = useMemo(
    () => getDailyBriefing(focusDestination, focusForecast, weather?.summary ?? null),
    [focusDestination, focusForecast, weather],
  );

  const allForecasts = useMemo(
    () =>
      destinations.map((destination) => ({
        destination,
        forecast: getDestinationForecast(destination),
      })),
    [],
  );

  const busiestOutlook = useMemo(
    () => [...allForecasts].sort((first, second) => second.forecast.crowdIndex[2] - first.forecast.crowdIndex[2]).slice(0, 3),
    [allForecasts],
  );

  const quietMomentum = useMemo(
    () =>
      [...allForecasts]
        .filter((item) => item.forecast.trend !== "Busier")
        .sort((first, second) => first.forecast.crowdIndex[2] - second.forecast.crowdIndex[2])
        .slice(0, 3),
    [allForecasts],
  );

  const budgetEstimate = useMemo(
    () =>
      getBudgetEstimate({
        destination: focusDestination,
        days: tripDays,
        travelers,
        comfortMultiplier: styleMultipliers[travelStyle],
        usdToNprRate,
      }),
    [focusDestination, tripDays, travelers, travelStyle, usdToNprRate],
  );

  const quickAddDestinations = useMemo(() => {
    const byId = new Map<string, Destination>();
    [
      focusDestination,
      ...(fromDestination ? [fromDestination] : []),
      ...nearbyDestinations.map((destination) => destination),
      ...hiddenGems.map((item) => item.destination),
    ].forEach((destination) => {
      if (!byId.has(destination.id)) {
        byId.set(destination.id, destination);
      }
    });

    return [...byId.values()].slice(0, 6);
  }, [focusDestination, fromDestination, nearbyDestinations, hiddenGems]);

  const itineraryDestinations = useMemo(
    () => tripStops.map((id) => destinations.find((destination) => destination.id === id)).filter(Boolean) as Destination[],
    [tripStops],
  );

  const itineraryPermitSummary = useMemo(() => {
    const permits = new Set<string>();
    const gear = new Set<string>();

    itineraryDestinations.forEach((destination) => {
      const profile = getPermitProfile(destination);
      profile.permits.forEach((permit) => permits.add(permit));
      profile.gear.forEach((item) => gear.add(item));
    });

    return {
      permits: [...permits],
      gear: [...gear],
    };
  }, [itineraryDestinations]);

  const timeRemainingMs = safetyDeadline ? Math.max(0, safetyDeadline - timerNow) : 0;
  const safetyTimerExpired = Boolean(safetyDeadline && timeRemainingMs === 0);
  const timeRemainingLabel = safetyDeadline
    ? `${Math.floor(timeRemainingMs / 3_600_000)}h ${Math.floor((timeRemainingMs % 3_600_000) / 60_000)}m`
    : "No timer active";
  const focusedFeatureLabel = activeFeature ? FEATURE_LABEL_BY_KEY[activeFeature] : null;

  useEffect(() => {
    if (!activeFeature) {
      return;
    }

    const nextSection = FEATURE_SECTION_BY_KEY[activeFeature];
    setOpenSections([nextSection]);
  }, [activeFeature]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem(SAFETY_STORAGE_KEY) ?? "{}");
      setEmergencyName(typeof saved.emergencyName === "string" ? saved.emergencyName : "");
      setEmergencyPhone(typeof saved.emergencyPhone === "string" ? saved.emergencyPhone : "");
      setTripStops(Array.isArray(saved.tripStops) ? saved.tripStops.filter((value: unknown) => typeof value === "string") : []);
      setSafetyDeadline(typeof saved.safetyDeadline === "number" ? saved.safetyDeadline : null);
    } catch {
      // Ignore invalid local storage state.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      SAFETY_STORAGE_KEY,
      JSON.stringify({
        emergencyName,
        emergencyPhone,
        tripStops,
        safetyDeadline,
      }),
    );
  }, [emergencyName, emergencyPhone, tripStops, safetyDeadline]);

  useEffect(() => {
    const controller = new AbortController();

    setWeatherLoading(true);
    setWeatherError(null);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${focusDestination.coords[0]}&longitude=${focusDestination.coords[1]}&current=temperature_2m,apparent_temperature,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=3&timezone=auto`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Weather service unavailable.");
        }

        return response.json();
      })
      .then((payload) => {
        const weatherSnapshot: WeatherSnapshot = {
          summary: `${getWeatherCodeLabel(payload.current.weather_code)} around ${Math.round(payload.current.temperature_2m)}°C right now.`,
          currentTempC: Math.round(payload.current.temperature_2m),
          apparentTempC: Math.round(payload.current.apparent_temperature),
          isDay: Boolean(payload.current.is_day),
          daily: payload.daily.time.slice(0, 3).map((day: string, index: number) => ({
            label: toDayLabel(day),
            tempMaxC: Math.round(payload.daily.temperature_2m_max[index]),
            tempMinC: Math.round(payload.daily.temperature_2m_min[index]),
            precipitationChance: Math.round(payload.daily.precipitation_probability_max[index]),
            summary: getWeatherCodeLabel(payload.daily.weather_code[index]),
          })),
        };

        setWeather(weatherSnapshot);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setWeather(null);
        setWeatherError("Live weather is unavailable, so the trip companion is using forecast logic only.");
      })
      .finally(() => {
        setWeatherLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [focusDestination]);

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

  useEffect(() => {
    if (!safetyDeadline) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [safetyDeadline]);

  const addStop = (destinationId: string) => {
    setTripStops((currentStops) => (currentStops.includes(destinationId) ? currentStops : [...currentStops, destinationId]));
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    setTripStops((currentStops) => {
      const nextStops = [...currentStops];
      const swapIndex = index + direction;

      if (swapIndex < 0 || swapIndex >= nextStops.length) {
        return currentStops;
      }

      [nextStops[index], nextStops[swapIndex]] = [nextStops[swapIndex], nextStops[index]];
      return nextStops;
    });
  };

  const removeStop = (destinationId: string) => {
    setTripStops((currentStops) => currentStops.filter((stopId) => stopId !== destinationId));
  };

  const startSafetyTimer = () => {
    const nextDeadline = Date.now() + safetyTimerHours * 3_600_000;
    setSafetyDeadline(nextDeadline);
    setTimerNow(Date.now());
    toast.success(`Safety timer started for ${safetyTimerHours} hours.`);
  };

  const clearSafetyTimer = () => {
    setSafetyDeadline(null);
    toast.success("Safety timer cleared.");
  };

  const downloadOfflinePackage = () => {
    const itineraryLines = itineraryDestinations.length
      ? itineraryDestinations.map((destination, index) => `${index + 1}. ${destination.name} — ${destination.area}`).join("\n")
      : "1. Add destinations to the trip planner for a custom route.";

    const packageText = [
      `Smart Trails Nepal — Offline Demo Pack`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Focus destination: ${focusDestination.name}`,
      `Region: ${focusDestination.area}`,
      `Category: ${focusDestination.category}`,
      `Altitude: ${focusDestination.altitudeM} m`,
      `Forecast: ${focusForecast.headline}`,
      `Weather: ${weather?.summary ?? weatherError ?? "Live weather unavailable"}`,
      `Budget range: ${formatUsd(budgetEstimate.totalUsdMin)}–${formatUsd(budgetEstimate.totalUsdMax)} | ${formatNpr(budgetEstimate.totalNprMin)}–${formatNpr(budgetEstimate.totalNprMax)}`,
      "",
      `Permits`,
      ...permitProfile.permits.map((permit) => `- ${permit}`),
      "",
      `Packing`,
      ...packingList.map((item) => `- ${item}`),
      "",
      `Safety`,
      `- Risk level: ${safetyProfile.risk}`,
      `- Emergency hub: ${safetyProfile.emergencyHub}`,
      `- Warning: ${safetyProfile.warning}`,
      ...safetyProfile.checklist.map((item) => `- ${item}`),
      "",
      `Emergency contact`,
      `- ${emergencyName || "Not set"}`,
      `- ${emergencyPhone || "Not set"}`,
      "",
      `Trip planner`,
      itineraryLines,
      "",
      `Hidden gem ideas`,
      ...hiddenGems.map((item) => `- ${item.destination.name}: ${item.reason}`),
      "",
      `Map reference`,
      `- Latitude: ${focusDestination.coords[0]}`,
      `- Longitude: ${focusDestination.coords[1]}`,
    ].join("\n");

    const blob = new Blob([packageText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${focusDestination.id}-offline-pack.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Offline package downloaded.");
  };

  const downloadItineraryPdf = () => {
    const itineraryStops = itineraryDestinations.length > 0 ? itineraryDestinations : [focusDestination];
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 42;
    const marginY = 42;
    const maxTextWidth = pageWidth - marginX * 2;
    let cursorY = marginY;

    const ensurePageSpace = (requiredHeight: number) => {
      if (cursorY + requiredHeight > pageHeight - marginY) {
        pdf.addPage();
        cursorY = marginY;
      }
    };

    const writeText = (text: string, options?: { size?: number; bold?: boolean; gapAfter?: number }) => {
      const size = options?.size ?? 10;
      const bold = options?.bold ?? false;
      const lineHeight = Math.max(14, size + 3);
      const lines = pdf.splitTextToSize(text, maxTextWidth) as string[];

      ensurePageSpace(lines.length * lineHeight + (options?.gapAfter ?? 0));

      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);

      lines.forEach((line) => {
        pdf.text(line, marginX, cursorY);
        cursorY += lineHeight;
      });

      cursorY += options?.gapAfter ?? 0;
    };

    writeText("Smart Trails Nepal - Itinerary", { size: 16, bold: true, gapAfter: 2 });
    writeText(`Generated: ${new Date().toLocaleString()}`);
    writeText(`Stops in itinerary: ${itineraryStops.length}`);

    if (itineraryDestinations.length === 0) {
      writeText("No planner stops selected. Generated from the current focus destination.", { gapAfter: 4 });
    }

    itineraryStops.forEach((destination, index) => {
      const localExplore = getLocalExploreForDestination(destination.id);
      const forecast = getDestinationForecast(destination);
      const permitProfile = getPermitProfile(destination);
      const safety = getSafetyProfile(destination);
      const placeItems = localExplore.places.slice(0, 4);
      const activityItems = [...localExplore.hikes.slice(0, 2), ...localExplore.trails.slice(0, 2)];

      writeText(`${index + 1}. ${destination.name}`, { size: 13, bold: true, gapAfter: 1 });
      writeText(`${destination.area} | ${destination.category} | Altitude ${destination.altitudeM} m`);
      writeText(`Best season: ${destination.bestSeason} | Budget/day: ${destination.budgetPerDayUsd} (${destination.budgetPerDayNpr})`);
      writeText(`Forecast: ${forecast.headline}`);
      writeText(`Safety: ${safety.risk} risk | Emergency hub: ${safety.emergencyHub}`, { gapAfter: 2 });

      writeText("Places", { bold: true });
      if (placeItems.length === 0) {
        writeText("- No place information available.");
      } else {
        placeItems.forEach((item) => {
          writeText(`- ${item.name} (${item.duration}) - ${item.note}`);
        });
      }

      writeText("Hikes and trails", { bold: true });
      if (activityItems.length === 0) {
        writeText("- No hike or trail information available.");
      } else {
        activityItems.forEach((item) => {
          const difficultyLabel = item.difficulty ? `, ${item.difficulty}` : "";
          writeText(`- ${item.name} (${item.duration}${difficultyLabel}) - ${item.note}`);
        });
      }

      writeText("Permit and gear", { bold: true });
      const permitItems = permitProfile.permits.slice(0, 4);
      const gearItems = permitProfile.gear.slice(0, 5);

      if (permitItems.length === 0) {
        writeText("- Permit: None listed");
      } else {
        permitItems.forEach((permit) => writeText(`- Permit: ${permit}`));
      }

      if (gearItems.length === 0) {
        writeText("- Gear: None listed", { gapAfter: 6 });
      } else {
        gearItems.forEach((item, itemIndex) =>
          writeText(`- Gear: ${item}`, { gapAfter: itemIndex === gearItems.length - 1 ? 6 : 0 }),
        );
      }
    });

    pdf.save(`itinerary-${focusDestination.id}.pdf`);
    toast.success("Itinerary PDF downloaded.");
  };

  const styleOptions: Array<{ key: keyof typeof styleMultipliers; label: string }> = [
    { key: "lean", label: "Lean" },
    { key: "standard", label: "Standard" },
    { key: "comfort", label: "Comfort" },
  ];

  return (
    <div id="features-panel" className="rounded-xl border border-border/70 bg-background/70">
      <div className="flex flex-col gap-3 border-b border-border/70 px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Functional feature tools</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="rounded-full bg-background/80">
              8/8 core features
            </Badge>
            {focusedFeatureLabel && (
              <Badge variant="secondary" className="rounded-full">
                Opened: {focusedFeatureLabel}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100">
            <MapIcon className="mr-1 h-3.5 w-3.5" />
            Heatmap
          </Badge>
          <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">
            <Compass className="mr-1 h-3.5 w-3.5" />
            Forecast
          </Badge>
          <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Wallet className="mr-1 h-3.5 w-3.5" />
            Budget
          </Badge>
          <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
            Safety + Offline
          </Badge>
          <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            AI companion
          </Badge>
        </div>
      </div>

      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="px-3">
        <AccordionItem value="heatmap" className="border-border/70">
          <AccordionTrigger className="py-3 text-sm">Tourist Flow Forecast</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-3">
              <div>
                <p className="text-sm font-semibold">Tourism heatmap overlay</p>
                <p className="text-xs text-muted-foreground">The map now paints crowd intensity across every destination in the Nepal dataset.</p>
              </div>
              <Button type="button" variant={isHeatmapEnabled ? "default" : "outline"} size="sm" onClick={onToggleHeatmap}>
                {isHeatmapEnabled ? "Heatmap on" : "Heatmap off"}
              </Button>
            </div>

            <Card className="border-border/70 bg-card/70 shadow-none">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{focusForecast.headline}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{focusForecast.reason}</p>
                  </div>
                  <Badge variant="outline" className={cn("rounded-full", getTrendBadgeClass(focusForecast.trend))}>
                    {focusForecast.trend}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {focusForecast.crowdIndex.map((value, index) => (
                    <div key={`${focusDestination.id}-${index}`} className="rounded-lg border border-border/70 bg-background/70 p-2">
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

                <p className="text-xs text-muted-foreground">{focusForecast.action}</p>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-500" />
                    <p className="text-sm font-semibold">Likely busiest next</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {busiestOutlook.map((item) => (
                      <button
                        key={item.destination.id}
                        type="button"
                        onClick={() => onSelectDestination(item.destination.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left hover:bg-accent/40"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.destination.name}</p>
                          <p className="text-[11px] text-muted-foreground">Week 3 crowd index {item.forecast.crowdIndex[2]}</p>
                        </div>
                        <ArrowUp className="h-4 w-4 text-rose-500" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold">Best quieter windows</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {quietMomentum.map((item) => (
                      <button
                        key={item.destination.id}
                        type="button"
                        onClick={() => onSelectDestination(item.destination.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left hover:bg-accent/40"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.destination.name}</p>
                          <p className="text-[11px] text-muted-foreground">Week 3 crowd index {item.forecast.crowdIndex[2]}</p>
                        </div>
                        <ArrowDown className="h-4 w-4 text-emerald-500" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="insights" className="border-border/70">
          <AccordionTrigger className="py-3 text-sm">Smart Travel Insights</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <Card className="border-border/70 bg-card/70 shadow-none">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <p className="text-sm font-semibold">AI-style crowd explainer</p>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{smartInsight}</p>
                <div className="flex flex-wrap gap-2">
                  {packingList.map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full bg-background/80">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="space-y-3 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Live trip companion</p>
                      <p className="text-xs text-muted-foreground">Weather, crowd logic, and food tips for the current focus place.</p>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-background/80">
                      {weatherLoading ? "Syncing" : weather ? "Live" : "Fallback"}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    {weatherLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Pulling fresh weather from Open-Meteo…
                      </div>
                    ) : weather ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold">{weather.currentTempC}°C</p>
                            <p className="text-xs text-muted-foreground">Feels like {weather.apparentTempC}°C · {weather.isDay ? "Daytime" : "Nighttime"}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full bg-background/80">
                            {weather.summary}
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {weather.daily.map((day) => (
                            <div key={day.label} className="rounded-lg border border-border/70 bg-card/70 p-2">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{day.label}</p>
                              <p className="mt-1 text-sm font-semibold">{day.tempMaxC}° / {day.tempMinC}°</p>
                              <p className="text-[11px] text-muted-foreground">{day.summary}</p>
                              <p className="mt-1 text-[11px] text-muted-foreground">Rain {day.precipitationChance}%</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{weatherError ?? "Live weather is not available right now."}</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    <p className="text-sm font-semibold">{briefing.headline}</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {briefing.bullets.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs font-medium text-foreground/80">Food tip: {briefing.foodTip}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="space-y-3 p-3">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-sky-500" />
                    <p className="text-sm font-semibold">Nearby live context</p>
                  </div>

                  {livePopularPlaces.length > 0 ? (
                    <div className="space-y-2">
                      {livePopularPlaces.slice(0, 3).map((item) => (
                        <div key={`${item.destinationId}-${item.place.name}`} className="rounded-lg border border-sky-200/70 bg-sky-50/70 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-sky-950">{item.place.name}</p>
                              <p className="text-[11px] text-sky-900/70">Near {item.destinationId} · about {Math.round(item.approxDistanceKm)} km</p>
                            </div>
                            <Badge variant="outline" className="rounded-full border-sky-200 bg-white/70 text-sky-700">
                              {item.place.duration}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-sky-950/80">{item.place.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : liveNearbyDestinations.length > 0 ? (
                    <div className="space-y-2">
                      {liveNearbyDestinations.slice(0, 3).map((destination) => (
                        <button
                          key={destination.id}
                          type="button"
                          onClick={() => onSelectDestination(destination.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-background/75 px-3 py-2 text-left hover:bg-accent/40"
                        >
                          <div>
                            <p className="text-sm font-medium">{destination.name}</p>
                            <p className="text-[11px] text-muted-foreground">{Math.round(destination.distance)} km from your live area</p>
                          </div>
                          <Compass className="h-4 w-4 text-sky-500" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Enable location for nearby live suggestions, or use the AI guide for place comparison.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="budget" className="border-border/70">
          <AccordionTrigger className="py-3 text-sm">Budget Estimator + Alternative Destination Suggestions</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <Card className="border-border/70 bg-card/70 shadow-none">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Budget estimator</p>
                    <p className="text-xs text-muted-foreground">Uses the destination's daily range and a live NPR/USD rate when available.</p>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                    {isLiveRate ? `Live rate ${usdToNprRate.toFixed(2)}` : `Fallback rate ${usdToNprRate.toFixed(2)}`}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Days</label>
                    <Input type="number" min={1} max={30} value={tripDays} onChange={(event) => setTripDays(Number(event.target.value) || 1)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Travelers</label>
                    <Input type="number" min={1} max={8} value={travelers} onChange={(event) => setTravelers(Number(event.target.value) || 1)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {styleOptions.map((option) => (
                        <Button
                          key={option.key}
                          type="button"
                          variant={travelStyle === option.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTravelStyle(option.key)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Estimated total</p>
                    <p className="mt-2 text-lg font-semibold">{formatUsd(budgetEstimate.totalUsdMin)} – {formatUsd(budgetEstimate.totalUsdMax)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatNpr(budgetEstimate.totalNprMin)} – {formatNpr(budgetEstimate.totalNprMax)}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Daily planning anchor</p>
                    <p className="mt-2 text-lg font-semibold">{formatUsd(budgetEstimate.perDayUsdMid)} / day</p>
                    <p className="mt-1 text-sm text-muted-foreground">Comfort style factor applied: ×{styleMultipliers[travelStyle].toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 shadow-none">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center gap-2">
                  <Gem className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold">Hidden gems finder</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {hiddenGems.map((item) => (
                    <button
                      key={item.destination.id}
                      type="button"
                      onClick={() => onSelectDestination(item.destination.id)}
                      className="rounded-xl border border-border/70 bg-background/75 p-3 text-left transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{item.destination.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{item.destination.category}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                          {item.crowdReductionPercent}% fewer crowds
                        </Badge>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{item.reason}</p>
                      <p className="mt-3 text-xs font-medium text-foreground/80">Daily budget: {item.destination.budgetPerDayUsd}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety" className="border-border/70">
          <AccordionTrigger className="py-3 text-sm">Smart SOS + Offline Package + Multi-Stop Trip Planner</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="space-y-3 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">SOS safety companion</p>
                      <p className="text-xs text-muted-foreground">Altitude warnings, emergency hub, and a simple check-in timer.</p>
                    </div>
                    <Badge variant="outline" className={cn("rounded-full", getRiskBadgeClass(safetyProfile.risk))}>
                      {safetyProfile.risk} risk
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-semibold">{focusDestination.altitudeM.toLocaleString()} m altitude</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{safetyProfile.warning}</p>
                    <p className="mt-2 text-xs text-foreground/80">Emergency hub: {safetyProfile.emergencyHub}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{safetyProfile.helicopterSupport}</p>
                  </div>

                  <div className="space-y-2">
                    {safetyProfile.checklist.map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/75 px-3 py-2 text-sm text-muted-foreground">
                        <HeartPulse className="mt-0.5 h-4 w-4 text-rose-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Emergency contact</label>
                      <Input value={emergencyName} onChange={(event) => setEmergencyName(event.target.value)} placeholder="Name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Phone</label>
                      <Input value={emergencyPhone} onChange={(event) => setEmergencyPhone(event.target.value)} placeholder="Phone number" />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Check-in timer</p>
                        <p className="text-xs text-muted-foreground">Use this demo timer to simulate a remote trekking safety check-in.</p>
                      </div>
                      <Badge variant="outline" className="rounded-full bg-background/80">
                        {timeRemainingLabel}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[2, 6, 12].map((hours) => (
                        <Button
                          key={hours}
                          type="button"
                          size="sm"
                          variant={safetyTimerHours === hours ? "default" : "outline"}
                          onClick={() => setSafetyTimerHours(hours)}
                        >
                          {hours}h
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={startSafetyTimer}>
                        <Clock3 className="h-4 w-4" />
                        Start timer
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={clearSafetyTimer}>
                        Clear
                      </Button>
                    </div>

                    {safetyTimerExpired && (
                      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        <div className="flex items-center gap-2 font-semibold">
                          <AlertTriangle className="h-4 w-4" />
                          Demo SOS trigger active
                        </div>
                        <p className="mt-1 text-xs">Contact {emergencyName || "your emergency person"} and use {safetyProfile.emergencyHub} as the next escalation point.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70 shadow-none">
                <CardContent className="space-y-3 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Offline package + trip planner</p>
                      <p className="text-xs text-muted-foreground">Build a multi-stop route, review permits and gear, then download a lightweight offline guide.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button type="button" size="sm" variant="outline" onClick={downloadItineraryPdf}>
                        <ArrowDownToLine className="h-4 w-4" />
                        Download itinerary PDF
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={downloadOfflinePackage}>
                        <ArrowDownToLine className="h-4 w-4" />
                        Download pack
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Quick add stops</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickAddDestinations.map((destination) => (
                        <Button key={destination.id} type="button" size="sm" variant="outline" onClick={() => addStop(destination.id)}>
                          {destination.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {itineraryDestinations.length > 0 ? (
                    <div className="space-y-2">
                      {itineraryDestinations.map((destination, index) => (
                        <div key={destination.id} className="rounded-lg border border-border/70 bg-background/75 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">Day {index + 1} stop — {destination.name}</p>
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
                    <div className="rounded-lg border border-dashed border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                      Add destinations here to build the multi-stop itinerary demo.
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                      <div className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Permit snapshot</p>
                      </div>
                      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                        {(itineraryPermitSummary.permits.length > 0 ? itineraryPermitSummary.permits : permitProfile.permits).map((permit) => (
                          <li key={permit}>• {permit}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background/75 p-3">
                      <div className="flex items-center gap-2">
                        <Backpack className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Gear snapshot</p>
                      </div>
                      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                        {(itineraryPermitSummary.gear.length > 0 ? itineraryPermitSummary.gear : permitProfile.gear).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ExploreFeaturePanel;
