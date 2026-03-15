import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Calculator, Route, Heart, MapPin, TrendingUp, Compass, ArrowLeft, Shield, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarksContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useActivity } from "@/contexts/ActivityContext";
import { nepalRegions, getDensityLevel, getDensityColor } from "@/data/regions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TravelTips from "@/components/dashboard/TravelTips";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import BudgetContent from "@/components/dashboard/BudgetContent";
import TripContent from "@/components/dashboard/TripContent";
import MapContent from "@/components/dashboard/MapContent";
import SOSSafetySystem from "@/components/dashboard/SOSSafetySystem";
import OfflinePackageDownload from "@/components/dashboard/OfflinePackageDownload";

type DashboardView = "overview" | "map" | "budget" | "trip" | "sos" | "offline";

const quickActions = [
  { id: "map" as const, label: "Explore Map", icon: Map, desc: "Interactive heatmap of Nepal" },
  { id: "budget" as const, label: "Budget Tool", icon: Calculator, desc: "Estimate your trip costs" },
  { id: "trip" as const, label: "Trip Planner", icon: Route, desc: "Build your itinerary" },
  { id: "sos" as const, label: "SOS Safety", icon: Shield, desc: "Emergency contacts & timer" },
  { id: "offline" as const, label: "Offline Packs", icon: Download, desc: "Download for offline use" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const UserDashboard = () => {
  const { isLoggedIn, userName } = useAuth();
  const { bookmarks } = useBookmarks();
  const { stops } = useTripPlanner();
  const { markAsRead } = useActivity();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const savedRegions = nepalRegions.filter((r) => bookmarks.includes(r.id));

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (activeView === "overview") markAsRead();
  }, [activeView, markAsRead]);

  if (!isLoggedIn) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="solid" />

      {activeView !== "overview" && (
        <div className="container pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-xs gap-1.5"
            onClick={() => setActiveView("overview")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeView === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="container py-8 sm:py-12 space-y-10"
          >
            {/* Welcome */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {greeting()}, {userName} 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Here's your travel overview for Nepal.
              </p>
            </div>

            {/* Stat cards */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Saved Regions", value: savedRegions.length, icon: Heart, color: "text-destructive" },
                { label: "Trip Stops", value: stops.length, icon: MapPin, color: "text-primary" },
                { label: "Regions", value: nepalRegions.length, icon: Compass, color: "text-accent-foreground" },
                { label: "Avg Cost", value: `$${Math.round(nepalRegions.reduce((a, r) => a + r.avgCost, 0) / nepalRegions.length)}/day`, icon: TrendingUp, color: "text-primary" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={item} className="bg-card border border-border rounded-2xl p-4 sm:p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="font-display font-bold text-xl sm:text-2xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={container} initial="hidden" animate="show">
              <h2 className="font-display font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {quickActions.map((action) => (
                  <motion.div key={action.id} variants={item}>
                    <button
                      onClick={() => setActiveView(action.id)}
                      className="w-full group flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-2xl p-4 sm:p-5 transition-all duration-200 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Saved regions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" /> Saved Regions
                </h2>
                <Button variant="ghost" size="sm" className="text-xs rounded-full" onClick={() => setActiveView("map")}>
                  View Map
                </Button>
              </div>

              {savedRegions.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedRegions.map((region) => {
                    const level = getDensityLevel(region);
                    const color = getDensityColor(level);
                    return (
                      <button
                        key={region.id}
                        onClick={() => setActiveView("map")}
                        className="bg-card border border-border hover:border-primary/30 rounded-2xl p-4 transition-all duration-200 text-left"
                      >
                        <p className="font-medium text-sm">{region.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: color, color }}>{level}</Badge>
                          <span className="text-[11px] text-muted-foreground">{region.temperature}°C</span>
                          <span className="text-[11px] text-muted-foreground">${region.avgCost}/day</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No saved regions yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <button onClick={() => setActiveView("map")} className="text-primary underline underline-offset-2">Explore the map</button> and tap the heart icon to save regions.
                  </p>
                </div>
              )}
            </motion.div>

            <ActivityFeed />
            <TravelTips />
          </motion.div>
        ) : (
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="container py-6"
          >
            {activeView === "map" && <MapContent />}
            {activeView === "budget" && <BudgetContent />}
            {activeView === "trip" && <TripContent onSwitchToMap={() => setActiveView("map")} />}
            {activeView === "sos" && <SOSSafetySystem />}
            {activeView === "offline" && <OfflinePackageDownload />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
