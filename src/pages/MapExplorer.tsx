import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Heart, Maximize2, Minimize2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import TouristHeatmap from "@/components/TouristHeatmap";
import RegionInfoPanel from "@/components/RegionInfoPanel";
import { type Region, nepalRegions, getDensityLevel, getDensityColor } from "@/data/regions";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const UserDashboard = () => {
  const [searchParams] = useSearchParams();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { isLoggedIn } = useAuth();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const savedRegions = nepalRegions.filter((r) => bookmarks.includes(r.id));
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const regionId = searchParams.get("region");
    if (regionId) {
      const found = nepalRegions.find((r) => r.id === regionId);
      if (found) setSelectedRegion(found);
    }
  }, [searchParams]);

  const handleClose = useCallback(() => {
    setSelectedRegion(null);
    setExpanded(false);
  }, []);

  const handleSelectRegion = useCallback((region: Region) => {
    setSelectedRegion(region);
  }, []);

  const panelWidth = expanded
    ? "w-full"
    : "w-full sm:w-[420px] lg:w-[460px]";

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar variant="solid" />

      <div className="flex-1 relative overflow-hidden">
        {/* Full-bleed map */}
        <div className="absolute inset-0">
          <TouristHeatmap
            onSelectRegion={handleSelectRegion}
            selectedRegionId={selectedRegion?.id}
          />
        </div>

        {/* Side panel overlay */}
        <AnimatePresence mode="wait">
          {selectedRegion ? (
            <motion.div
              key={`region-panel-${expanded ? "full" : "side"}`}
              ref={panelRef}
              initial={{ y: "100%", x: 0, opacity: 0 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              exit={{ y: "100%", x: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 300) {
                  handleClose();
                }
              }}
              className={`absolute inset-x-0 bottom-0 top-[30%] sm:top-0 sm:inset-x-auto sm:right-0 sm:bottom-0 ${panelWidth} z-[1000] flex flex-col bg-card/95 backdrop-blur-xl border-t sm:border-t-0 sm:border-l border-border shadow-2xl rounded-t-2xl sm:rounded-none touch-none sm:touch-auto`}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Expand/collapse toggle — hidden on mobile */}
              <div className="hidden sm:flex absolute top-3 left-3 z-10">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border transition-colors"
                  title={expanded ? "Collapse to sidebar" : "Expand to full page"}
                >
                  {expanded ? (
                    <Minimize2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto ${expanded ? "max-w-4xl mx-auto w-full" : ""}`}>
                <RegionInfoPanel
                  region={selectedRegion}
                  onClose={handleClose}
                  onSelectRegion={handleSelectRegion}
                  expanded={expanded}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-panel"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:top-3 sm:right-3 z-[1000] sm:w-80"
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5">
                {isLoggedIn && savedRegions.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-destructive" />
                      <h3 className="font-display font-semibold text-sm">Saved</h3>
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5">
                        {savedRegions.length}
                      </span>
                    </div>
                    <div className="flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-x-visible sm:max-h-[50vh] sm:overflow-y-auto">
                      {savedRegions.map((region) => {
                        const level = getDensityLevel(region);
                        const color = getDensityColor(level);
                        return (
                          <button
                            key={region.id}
                            onClick={() => handleSelectRegion(region)}
                            className="min-w-[140px] sm:min-w-0 w-full text-left bg-secondary/50 hover:bg-secondary rounded-xl p-2.5 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{region.name}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(region.id); }}
                                className="text-destructive hover:text-destructive/80 p-0.5"
                              >
                                <Heart className="w-3 h-3 fill-current" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: color, color }}>
                                {level}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">{region.temperature}°C</span>
                              <span className="text-[11px] text-muted-foreground">${region.avgCost}/day</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="font-display font-semibold text-sm mb-1">Select a destination</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Tap any region on the map to see weather, crowds, and packing tips.
                    </p>
                    {isLoggedIn && (
                      <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" /> Save with the heart icon
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
