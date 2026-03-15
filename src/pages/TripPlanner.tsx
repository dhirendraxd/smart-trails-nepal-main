import { Link } from "react-router-dom";
import { Trash2, ChevronUp, ChevronDown, MapPin, Calendar, DollarSign, Route, Plus, X } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useAuth } from "@/contexts/AuthContext";
import { regionTravelData } from "@/data/regionTravelData";
import { getDensityLevel, getDensityColor } from "@/data/regions";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const TripPlanner = () => {
  const { stops, removeStop, reorderStops, updateStop, clearTrip, totalDays, totalCost } = useTripPlanner();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Route className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Trip Planner</h1>
            <p className="text-muted-foreground mb-6">Sign in to create custom multi-destination itineraries, track costs, and plan your perfect Nepal trip.</p>
            <Button asChild className="rounded-xl" size="lg">
              <Link to="/login">Sign In to Get Started</Link>
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8 max-w-4xl">
        <PageHeader
          icon={Route}
          title="Trip Planner"
          description="Combine destinations into a custom multi-stop itinerary"
          actions={
            stops.length > 0 ? (
              <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:text-destructive" onClick={clearTrip}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear All
              </Button>
            ) : undefined
          }
        />

        {stops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-display font-semibold mb-2">No stops yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Go to the map and click "Add to Trip" on any destination to start building your itinerary.
            </p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard">
                <MapPin className="w-4 h-4 mr-1.5" />
                Explore Destinations
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
            {/* Stops list */}
            <div className="space-y-0">
              <AnimatePresence>
                {stops.map((stop, index) => {
                  const level = getDensityLevel(stop.region);
                  const color = getDensityColor(level);
                  const travel = regionTravelData[stop.region.id];
                  const dayStart = stops.slice(0, index).reduce((s, st) => s + st.days, 0) + 1;
                  const dayEnd = dayStart + stop.days - 1;

                  return (
                    <motion.div
                      key={stop.region.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-3 sm:gap-4"
                    >
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-primary-foreground"
                          style={{ backgroundColor: color }}
                        >
                          {index + 1}
                        </div>
                        {index < stops.length - 1 && (
                          <div className="w-px flex-1 bg-border my-1 min-h-[20px]" />
                        )}
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-card border border-border rounded-2xl p-4 sm:p-5 mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-base">{stop.region.name}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px]" style={{ borderColor: color, color }}>
                                {level}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{stop.region.category}</span>
                              {travel && (
                                <span className="text-xs text-muted-foreground">· {travel.difficulty}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => index > 0 && reorderStops(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => index < stops.length - 1 && reorderStops(index, index + 1)}
                              disabled={index === stops.length - 1}
                              className="p-1 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeStop(stop.region.id)}
                              className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Days & cost */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                          <div className="bg-secondary/60 rounded-xl p-2.5">
                            <p className="text-[10px] text-muted-foreground mb-1">Days</p>
                            <Input
                              type="number"
                              min={1}
                              max={30}
                              value={stop.days}
                              onChange={(e) => updateStop(stop.region.id, { days: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="h-7 w-14 text-xs text-center bg-background rounded-lg"
                            />
                          </div>
                          <div className="bg-secondary/60 rounded-xl p-2.5">
                            <p className="text-[10px] text-muted-foreground mb-1">Day Range</p>
                            <p className="text-sm font-semibold">{dayStart}–{dayEnd}</p>
                          </div>
                          <div className="bg-secondary/60 rounded-xl p-2.5">
                            <p className="text-[10px] text-muted-foreground mb-1">Est. Cost</p>
                            <p className="text-sm font-semibold">${stop.region.avgCost * stop.days}</p>
                          </div>
                        </div>

                        {/* Highlights */}
                        {travel && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Highlights</p>
                            <div className="flex flex-wrap gap-1.5">
                              {travel.itinerary.slice(0, 3).map((item, i) => (
                                <span key={i} className="text-[10px] bg-primary/10 text-foreground px-2 py-1 rounded-full">
                                  {item.title}
                                </span>
                              ))}
                              {travel.permits.length > 0 && travel.permits[0] !== "No special permits required" && (
                                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                                  Permit needed
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="mt-3">
                          <Input
                            placeholder="Add personal notes..."
                            value={stop.notes}
                            onChange={(e) => updateStop(stop.region.id, { notes: e.target.value })}
                            className="h-8 text-xs bg-secondary/40 border-0 rounded-lg placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Add more */}
              <div className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Button asChild variant="outline" className="rounded-xl flex-1 h-auto py-4 border-dashed">
                  <Link to="/dashboard">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    Add Another Destination
                  </Link>
                </Button>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:sticky lg:top-20 h-fit space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <h3 className="font-display font-bold text-sm mb-4">Trip Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Destinations
                    </span>
                    <span className="font-display font-bold">{stops.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Total Days
                    </span>
                    <span className="font-display font-bold">{totalDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Est. Total Cost
                    </span>
                    <span className="font-display font-bold text-lg">${totalCost}</span>
                  </div>
                </div>
              </motion.div>

              {/* Route preview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <h3 className="font-display font-bold text-sm mb-3">Route</h3>
                <div className="flex flex-col gap-2">
                  {stops.map((stop, i) => (
                    <div key={stop.region.id} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs truncate">{stop.region.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{stop.days}d</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Permits needed */}
              {stops.some((s) => {
                const t = regionTravelData[s.region.id];
                return t && t.permits.some((p) => p !== "No special permits required");
              }) && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5"
                >
                  <h3 className="font-display font-bold text-sm mb-3 text-destructive">Permits Needed</h3>
                  <div className="space-y-2">
                    {stops.map((stop) => {
                      const t = regionTravelData[stop.region.id];
                      if (!t) return null;
                      const permits = t.permits.filter((p) => p !== "No special permits required");
                      if (permits.length === 0) return null;
                      return (
                        <div key={stop.region.id}>
                          <p className="text-[10px] font-medium text-muted-foreground">{stop.region.name}</p>
                          {permits.map((p) => (
                            <p key={p} className="text-xs text-destructive">{p}</p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TripPlanner;
