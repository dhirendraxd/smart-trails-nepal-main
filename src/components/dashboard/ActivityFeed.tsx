import { Heart, MapPin, Trash2, ArrowUpDown, Clock, History } from "lucide-react";
import { useActivity, type Activity } from "@/contexts/ActivityContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<Activity["type"], typeof Heart> = {
  bookmark_add: Heart,
  bookmark_remove: Heart,
  trip_add: MapPin,
  trip_remove: Trash2,
  trip_clear: Trash2,
  trip_reorder: ArrowUpDown,
};

const labelMap: Record<Activity["type"], (name?: string) => string> = {
  bookmark_add: (n) => `Saved ${n ?? "a region"}`,
  bookmark_remove: (n) => `Unsaved ${n ?? "a region"}`,
  trip_add: (n) => `Added ${n ?? "a stop"} to trip`,
  trip_remove: (n) => `Removed ${n ?? "a stop"} from trip`,
  trip_clear: () => "Cleared all trip stops",
  trip_reorder: () => "Reordered trip stops",
};

const colorMap: Record<Activity["type"], string> = {
  bookmark_add: "text-destructive bg-destructive/10",
  bookmark_remove: "text-muted-foreground bg-muted",
  trip_add: "text-primary bg-primary/10",
  trip_remove: "text-destructive bg-destructive/10",
  trip_clear: "text-destructive bg-destructive/10",
  trip_reorder: "text-primary bg-primary/10",
};

const ActivityFeed = () => {
  const { activities, clearActivities } = useActivity();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Recent Activity
        </h2>
        {activities.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs rounded-full text-muted-foreground" onClick={clearActivities}>
            Clear
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recent activity.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your bookmarks and trip changes will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
          <AnimatePresence initial={false}>
            {activities.slice(0, 10).map((activity) => {
              const Icon = iconMap[activity.type];
              const colors = colorMap[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {labelMap[activity.type](activity.regionName)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
