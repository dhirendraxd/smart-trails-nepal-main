import { useState } from "react";
import { type Region, getDensityLevel, getDensityColor, nepalRegions } from "@/data/regions";
import { regionTravelData } from "@/data/regionTravelData";
import { useAuth } from "@/contexts/AuthContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useWikipediaSummary } from "@/hooks/useWikipediaSummary";
import { useWeeklyForecast } from "@/hooks/useWeeklyForecast";
import WeeklyForecastChart from "@/components/WeeklyForecastChart";
import PackingSuggestions from "@/components/PackingSuggestions";
import {
  CloudSun, AlertTriangle, Users, TrendingUp, X, Compass, ArrowRight,
  Lock, Backpack, ScrollText, Lightbulb, MapPin, Calendar, Shield, Mountain, PlusCircle, CheckCircle2, Heart,
  Wind, Droplets, ExternalLink, BookOpen, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  region: Region;
  onClose: () => void;
  onSelectRegion?: (region: Region) => void;
  expanded?: boolean;
}

const mockTrend = (base: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    count: Math.max(0, base + Math.round(Math.sin(i / 4) * base * 0.15 + (Math.random() - 0.5) * base * 0.1)),
  }));

function getAlternatives(region: Region): { region: Region; reasons: string[] }[] {
  const level = getDensityLevel(region);
  if (level !== "high" && level !== "overcrowded") return [];

  return nepalRegions
    .filter((r) => r.id !== region.id)
    .map((r) => {
      const rLevel = getDensityLevel(r);
      const reasons: string[] = [];
      const sameCategory = r.category === region.category;
      const lowerCrowd = r.touristCount / r.capacity < region.touristCount / region.capacity;
      const betterWeather = (r.weatherCondition === "clear" || r.weatherCondition === "cloudy") && (region.weatherCondition === "storm" || region.weatherCondition === "rain");
      const cheaperCost = r.avgCost < region.avgCost;

      if (!lowerCrowd) return null;
      if (sameCategory) reasons.push("Same category");
      if (lowerCrowd) reasons.push("Less crowded");
      if (betterWeather) reasons.push("Better weather");
      if (cheaperCost) reasons.push(`$${region.avgCost - r.avgCost}/day cheaper`);

      return { region: r, reasons, score: (sameCategory ? 3 : 0) + (betterWeather ? 2 : 0) + (cheaperCost ? 1 : 0) + (rLevel === "low" ? 2 : rLevel === "moderate" ? 1 : 0) };
    })
    .filter(Boolean)
    .sort((a, b) => (b as any).score - (a as any).score)
    .slice(0, 3)
    .map(({ region, reasons }: any) => ({ region, reasons }));
}

type Tab = "overview" | "requirements" | "itinerary" | "tips";

const difficultyColor: Record<string, string> = {
  Easy: "#22c55e",
  Moderate: "#eab308",
  Challenging: "#f97316",
  Extreme: "#ef4444",
};

function LoginGate({ feature }: { feature: string }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-xl p-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold mb-1">Sign in to unlock</p>
      <p className="text-xs text-muted-foreground mb-4">{feature} is available for registered users.</p>
      <Button asChild size="sm" className="rounded-xl">
        <Link to="/login">Sign In</Link>
      </Button>
    </div>
  );
}

function BookmarkButton({ regionId }: { regionId: string }) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const saved = isBookmarked(regionId);

  return (
    <button
      onClick={() => toggleBookmark(regionId)}
      className={`p-1.5 rounded-lg transition-colors ${
        saved ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:bg-secondary"
      }`}
      title={saved ? "Remove from saved" : "Save destination"}
    >
      <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}

function AddToTripButton({ regionId, region }: { regionId: string; region: Region }) {
  const { addStop, removeStop, isInTrip } = useTripPlanner();
  const inTrip = isInTrip(regionId);

  return (
    <button
      onClick={() => (inTrip ? removeStop(regionId) : addStop(region))}
      className={`p-1.5 rounded-lg transition-colors ${
        inTrip ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive" : "hover:bg-secondary text-muted-foreground"
      }`}
      title={inTrip ? "Remove from trip" : "Add to trip"}
    >
      {inTrip ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
    </button>
  );
}

const RegionInfoPanel = ({ region, onClose, onSelectRegion, expanded = false }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { isLoggedIn } = useAuth();
  const level = getDensityLevel(region);
  const color = getDensityColor(level);
  const trend = mockTrend(region.touristCount);
  const max = Math.max(...trend.map((t) => t.count));
  const alternatives = getAlternatives(region);
  const travelData = regionTravelData[region.id];
  const { weather, loading: weatherLoading } = useWeatherData();
  const { data: wikiData, loading: wikiLoading } = useWikipediaSummary(region.id);
  const liveWeather = weather.find((w) => w.regionId === region.id);
  const { forecast, loading: forecastLoading } = useWeeklyForecast(region.id);

  const weatherLabel: Record<string, string> = {
    clear: "☀️ Clear skies",
    cloudy: "☁️ Partly cloudy",
    rain: "🌧️ Rainy",
    storm: "⛈️ Storm warning",
  };

  const travelSafe = region.weatherCondition === "clear" || region.weatherCondition === "cloudy";

  const tabs: { id: Tab; label: string; icon: React.ReactNode; locked: boolean }[] = [
    { id: "overview", label: "Overview", icon: <MapPin className="w-3.5 h-3.5" />, locked: false },
    { id: "requirements", label: "Permits & Gear", icon: <Shield className="w-3.5 h-3.5" />, locked: false },
    { id: "itinerary", label: "Itinerary", icon: <ScrollText className="w-3.5 h-3.5" />, locked: !isLoggedIn },
    { id: "tips", label: "Tips", icon: <Lightbulb className="w-3.5 h-3.5" />, locked: !isLoggedIn },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={region.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-lg">{region.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: color + "20", color }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)} density
              </span>
              {travelData && (
                <span
                  className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: difficultyColor[travelData.difficulty] + "20", color: difficultyColor[travelData.difficulty] }}
                >
                  {travelData.difficulty}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isLoggedIn && (
              <BookmarkButton regionId={region.id} />
            )}
            {isLoggedIn && (
              <AddToTripButton regionId={region.id} region={region} />
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
            </button>
          ))}
        </div>

        <div className={`p-4 sm:p-5 space-y-5 ${expanded ? "" : "sm:max-h-[calc(100vh-320px)]"} overflow-y-auto`}>
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === "overview" && (
            <div className={expanded ? "grid md:grid-cols-2 gap-6" : "contents"}>
              {/* Column 1: Stats, Trend, Weather, Forecast */}
              <div className="space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Users className="w-3.5 h-3.5" /> Current
                    </div>
                    <p className="font-display font-bold text-lg">{region.touristCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Capacity
                    </div>
                    <p className="font-display font-bold text-lg">{region.capacity.toLocaleString()}</p>
                  </div>
                </div>

                {/* Mini trend chart */}
                <div>
                  <p className="text-xs font-semibold mb-2">30-Day Predicted Trend</p>
                  <div className="flex items-end gap-[2px] h-16">
                    {trend.map((t, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${(t.count / max) * 100}%`,
                          backgroundColor: color,
                          opacity: 0.4 + (t.count / max) * 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Weather — live data from Open-Meteo */}
                <div className="bg-secondary/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <CloudSun className="w-3.5 h-3.5" /> Live Weather
                  </div>
                  {weatherLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Fetching live data…</span>
                    </div>
                  ) : liveWeather ? (
                    <>
                      <p className="font-medium text-sm">
                        {liveWeather.temperature}°C — {liveWeather.icon} {liveWeather.label}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{liveWeather.windSpeed} km/h</span>
                        <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{liveWeather.humidity}%</span>
                      </div>
                      <p className={`text-xs mt-1.5 font-medium ${
                        liveWeather.label === "Clear" || liveWeather.label === "Cloudy" ? "text-highlight" : "text-destructive"
                      }`}>
                        {liveWeather.label === "Clear" || liveWeather.label === "Cloudy" ? "✓ Safe to travel" : "⚠ Exercise caution"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-sm">{region.temperature}°C — {weatherLabel[region.weatherCondition]}</p>
                      <p className={`text-xs mt-1 font-medium ${travelSafe ? "text-highlight" : "text-destructive"}`}>
                        {travelSafe ? "✓ Safe to travel" : "⚠ Exercise caution"}
                      </p>
                    </>
                  )}
                </div>

                {/* 7-Day Forecast */}
                <WeeklyForecastChart forecast={forecast} loading={forecastLoading} />

                {/* Smart Packing Suggestions */}
                <PackingSuggestions forecast={forecast} loading={forecastLoading} regionName={region.name} />
              </div>

              {/* Column 2: Risk, Wiki, Cost, Alternatives */}
              <div className="space-y-5">
                {region.riskAlert && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-xs text-destructive leading-relaxed">{region.riskAlert}</p>
                  </div>
                )}

                {/* Wikipedia summary */}
                {wikiLoading ? (
                  <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading description…</span>
                  </div>
                ) : wikiData ? (
                  <div className="bg-secondary/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> About
                    </div>
                    {wikiData.thumbnail && (
                      <img
                        src={wikiData.thumbnail}
                        alt={wikiData.title}
                        className={`w-full object-cover rounded-lg mb-2 ${expanded ? "h-40" : "h-28"}`}
                        loading="lazy"
                      />
                    )}
                    <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-4"}`}>
                      {wikiData.extract}
                    </p>
                    <a
                      href={wikiData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2"
                    >
                      Read more on Wikipedia <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : null}

                {/* Cost & Season */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. daily cost</span>
                    <span className="font-display font-bold">${region.avgCost}</span>
                  </div>
                  {travelData && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best season</span>
                      <span className="font-display font-semibold text-xs">{travelData.bestSeason}</span>
                    </div>
                  )}
                </div>

                {/* Alternatives */}
                {alternatives.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      <p className="text-xs font-semibold">Suggested Alternatives</p>
                    </div>
                    <div className={`${expanded ? "grid grid-cols-1 lg:grid-cols-2 gap-2" : "space-y-2"}`}>
                      {alternatives.map(({ region: alt, reasons }) => {
                        const altLevel = getDensityLevel(alt);
                        const altColor = getDensityColor(altLevel);
                        return (
                          <motion.button
                            key={alt.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelectRegion?.(alt)}
                            className="w-full text-left bg-secondary/40 hover:bg-secondary/70 rounded-xl p-3 transition-colors group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium">{alt.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs text-muted-foreground">
                                {alt.touristCount.toLocaleString()} / {alt.capacity.toLocaleString()}
                              </span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: altColor, color: altColor }}>
                                {altLevel}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {reasons.map((r) => (
                                <span key={r} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{r}</span>
                              ))}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── REQUIREMENTS TAB ─── */}
          {activeTab === "requirements" && travelData && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Permits Required</p>
                </div>
                <div className="space-y-2">
                  {travelData.permits.map((permit) => (
                    <div key={permit} className="bg-secondary/60 rounded-xl p-3 text-sm flex items-start gap-2">
                      <ScrollText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span>{permit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Backpack className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Essential Gear</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {travelData.essentialGear.map((item) => (
                    <span key={item} className="text-xs bg-secondary/80 border border-border px-3 py-1.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {travelData.nearbyAttractions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Mountain className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Nearby Attractions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {travelData.nearbyAttractions.map((place) => {
                      const linked = nepalRegions.find((r) => r.name.toLowerCase().includes(place.toLowerCase()));
                      return linked ? (
                        <button
                          key={place}
                          onClick={() => onSelectRegion?.(linked)}
                          className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                        >
                          {place} →
                        </button>
                      ) : (
                        <span key={place} className="text-xs bg-secondary/80 border border-border px-3 py-1.5 rounded-full">{place}</span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── ITINERARY TAB (LOGIN GATED) ─── */}
          {activeTab === "itinerary" && (
            <>
              {!isLoggedIn ? (
                <LoginGate feature="Detailed itinerary and day-by-day planning" />
              ) : travelData ? (
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Suggested Itinerary</p>
                  </div>
                  <div className="relative space-y-0">
                    {travelData.itinerary.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3 pb-4"
                      >
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          {i < travelData.itinerary.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="bg-secondary/60 rounded-xl p-3 flex-1">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{item.day}</p>
                          <p className="text-sm font-semibold mt-0.5">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No itinerary data available.</p>
              )}
            </>
          )}

          {/* ─── TIPS TAB (LOGIN GATED) ─── */}
          {activeTab === "tips" && (
            <>
              {!isLoggedIn ? (
                <LoginGate feature="Expert travel tips and insider advice" />
              ) : travelData ? (
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Travel Tips</p>
                  </div>
                  <div className="space-y-3">
                    {travelData.tips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-secondary/60 rounded-xl p-3 flex items-start gap-3"
                      >
                        <span className="text-sm mt-0.5">💡</span>
                        <p className="text-xs leading-relaxed">{tip}</p>
                      </motion.div>
                    ))}
                  </div>

                  {travelData.nearbyAttractions.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <p className="text-xs font-semibold mb-2">Don't Miss Nearby</p>
                      <div className="flex flex-wrap gap-2">
                        {travelData.nearbyAttractions.map((place) => (
                          <span key={place} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">{place}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tips available.</p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegionInfoPanel;
