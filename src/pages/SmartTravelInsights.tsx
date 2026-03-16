import { useEffect, useMemo, useState } from "react";
import { Backpack, CloudSun, Home, Map, RefreshCw, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { destinations } from "@/data/destinations";
import {
  getDailyBriefing,
  getDestinationForecast,
  getHiddenGemSuggestions,
  getPackingList,
  getSmartInsight,
  getWeatherCodeLabel,
} from "@/lib/travelFeatureToolkit";

type WeatherSnapshot = {
  summary: string;
  currentTempC: number;
  apparentTempC: number;
  isDay: boolean;
};

const SmartTravelInsights = () => {
  const fallbackDestination = destinations[0]!;
  const [destinationId, setDestinationId] = useState(fallbackDestination.id);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? fallbackDestination,
    [destinationId, fallbackDestination],
  );

  const forecast = useMemo(() => getDestinationForecast(selectedDestination), [selectedDestination]);
  const hiddenGems = useMemo(() => getHiddenGemSuggestions(selectedDestination, 3), [selectedDestination]);
  const packingList = useMemo(() => getPackingList(selectedDestination), [selectedDestination]);

  const smartInsight = useMemo(
    () => getSmartInsight(selectedDestination, forecast, hiddenGems, 0),
    [selectedDestination, forecast, hiddenGems],
  );

  const briefing = useMemo(
    () => getDailyBriefing(selectedDestination, forecast, weather?.summary ?? null),
    [selectedDestination, forecast, weather],
  );

  useEffect(() => {
    const controller = new AbortController();

    setWeatherLoading(true);
    setWeatherError(null);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${selectedDestination.coords[0]}&longitude=${selectedDestination.coords[1]}&current=temperature_2m,apparent_temperature,is_day,weather_code&timezone=auto`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Weather service unavailable.");
        }

        return response.json();
      })
      .then((payload) => {
        setWeather({
          summary: `${getWeatherCodeLabel(payload.current.weather_code)} around ${Math.round(payload.current.temperature_2m)}°C`,
          currentTempC: Math.round(payload.current.temperature_2m),
          apparentTempC: Math.round(payload.current.apparent_temperature),
          isDay: Boolean(payload.current.is_day),
        });
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") {
          return;
        }

        setWeather(null);
        setWeatherError("Live weather unavailable. Using destination forecast logic.");
      })
      .finally(() => {
        setWeatherLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedDestination]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "Insights", href: "#insights", icon: Sparkles },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="insights" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Feature page</p>
                <h1 className="mt-1 text-2xl font-display font-semibold">Smart Travel Insights</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Real-time weather snapshot + data-driven packing, briefing, and crowd-aware suggestions.
                </p>
              </div>

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

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-sky-500" />
                    <p className="text-sm font-semibold">Live weather snapshot</p>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                    {weatherLoading ? "Syncing" : weather ? "Live" : "Fallback"}
                  </Badge>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {weatherLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading weather data...
                    </span>
                  ) : weather ? (
                    <>
                      <p>{weather.summary}</p>
                      <p className="mt-1">Feels like {weather.apparentTempC}°C · {weather.isDay ? "Daytime" : "Nighttime"}</p>
                    </>
                  ) : (
                    <p>{weatherError ?? "Weather unavailable."}</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <p className="text-sm font-semibold">Smart recommendation</p>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{smartInsight}</p>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex items-center gap-2">
                  <Backpack className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-semibold">Packing checklist</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {packingList.map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full bg-background/80">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <p className="text-sm font-semibold">{briefing.headline}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {briefing.bullets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-foreground/80">Food tip: {briefing.foodTip}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default SmartTravelInsights;
