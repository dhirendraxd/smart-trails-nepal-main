import { Link } from "react-router-dom";
import { Trash2, ChevronUp, ChevronDown, MapPin, Calendar, DollarSign, Route, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { regionTravelData } from "@/data/regionTravelData";
import { getDensityLevel, getDensityColor } from "@/data/regions";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface TripContentProps {
  onSwitchToMap?: () => void;
}

const TripContent = ({ onSwitchToMap }: TripContentProps) => {
  const { stops, removeStop, reorderStops, updateStop, clearTrip, totalDays, totalCost } = useTripPlanner();

  if (stops.length === 0) {
    return (
      <div className="bg-secondary/30 border border-border rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-display font-semibold mb-2">No stops yet</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Go to the map and click "Add to Trip" on any destination to start building your itinerary.
        </p>
        {onSwitchToMap ? (
          <Button variant="outline" className="rounded-xl" onClick={onSwitchToMap}>
            <MapPin className="w-4 h-4 mr-1.5" /> Explore Destinations
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/map"><MapPin className="w-4 h-4 mr-1.5" /> Explore Destinations</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Route className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold">Trip Planner</h2>
            <p className="text-xs text-muted-foreground">Your multi-stop itinerary</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:text-destructive" onClick={clearTrip}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear All
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Stops */}
        <div className="space-y-0">
          <AnimatePresence>
            {stops.map((stop, index) => {
              const level = getDensityLevel(stop.region);
              const color = getDensityColor(level);
              const travel = regionTravelData[stop.region.id];
              const dayStart = stops.slice(0, index).reduce((s, st) => s + st.days, 0) + 1;
              const dayEnd = dayStart + stop.days - 1;

              return (
                <motion.div key={stop.region.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-primary-foreground" style={{ backgroundColor: color }}>
                      {index + 1}
                    </div>
                    {index < stops.length - 1 && <div className="w-px flex-1 bg-border my-1 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 bg-secondary/30 border border-border rounded-2xl p-4 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-base">{stop.region.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: color, color }}>{level}</Badge>
                          <span className="text-xs text-muted-foreground">{stop.region.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => index > 0 && reorderStops(index, index - 1)} disabled={index === 0} className="p-1 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                        <button onClick={() => index < stops.length - 1 && reorderStops(index, index + 1)} disabled={index === stops.length - 1} className="p-1 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                        <button onClick={() => removeStop(stop.region.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-background/50 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">Days</p>
                        <Input type="number" min={1} max={30} value={stop.days} onChange={(e) => updateStop(stop.region.id, { days: Math.max(1, parseInt(e.target.value) || 1) })} className="h-7 w-14 text-xs text-center bg-background rounded-lg" />
                      </div>
                      <div className="bg-background/50 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">Day Range</p>
                        <p className="text-sm font-semibold">{dayStart}–{dayEnd}</p>
                      </div>
                      <div className="bg-background/50 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">Est. Cost</p>
                        <p className="text-sm font-semibold">${stop.region.avgCost * stop.days}</p>
                      </div>
                    </div>
                    {travel && (
                      <div className="flex flex-wrap gap-1.5">
                        {travel.itinerary.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-foreground px-2 py-1 rounded-full">{item.title}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3">
                      <Input placeholder="Add personal notes..." value={stop.notes} onChange={(e) => updateStop(stop.region.id, { notes: e.target.value })} className="h-8 text-xs bg-background/40 border-0 rounded-lg placeholder:text-muted-foreground/50" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            {onSwitchToMap ? (
              <Button variant="outline" className="rounded-xl flex-1 h-auto py-4 border-dashed" onClick={onSwitchToMap}>
                <MapPin className="w-4 h-4 mr-1.5" /> Add Another Destination
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-xl flex-1 h-auto py-4 border-dashed">
                <Link to="/map"><MapPin className="w-4 h-4 mr-1.5" /> Add Another Destination</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4 lg:sticky lg:top-4 h-fit">
          <div className="bg-secondary/30 border border-border rounded-2xl p-4">
            <h3 className="font-display font-bold text-sm mb-3">Trip Summary</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Destinations</span>
                <span className="font-display font-bold">{stops.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Total Days</span>
                <span className="font-display font-bold">{totalDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Est. Cost</span>
                <span className="font-display font-bold text-lg">${totalCost}</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-4">
            <h3 className="font-display font-bold text-sm mb-3">Route</h3>
            <div className="flex flex-col gap-2">
              {stops.map((stop, i) => (
                <div key={stop.region.id} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-xs truncate">{stop.region.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{stop.days}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripContent;
