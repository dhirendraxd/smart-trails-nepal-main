import { ChevronDown, SlidersHorizontal } from "lucide-react";
import TouristHeatmap from "@/components/TouristHeatmap";

const FILTERS = ["Distance away", "Activity", "Difficulty", "Length"];

const UserDashboard = () => {

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      <div className="absolute inset-0">
        <TouristHeatmap minimal />
      </div>

      <div className="absolute top-3 left-3 right-24 z-[1100] pointer-events-none">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <button className="pointer-events-auto shrink-0 h-14 px-5 rounded-2xl bg-card/95 backdrop-blur-sm border border-border shadow-sm flex items-center gap-3 hover:bg-card transition-colors">
            <span className="text-xl font-display font-semibold text-foreground">Explore trails</span>
            <span className="w-7 h-7 rounded-full bg-secondary inline-flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </span>
          </button>

          {FILTERS.map((filter) => (
            <button
              key={filter}
              className="pointer-events-auto shrink-0 h-10 px-4 rounded-xl bg-card/95 backdrop-blur-sm border border-border text-sm text-foreground hover:bg-card transition-colors flex items-center gap-2"
            >
              <span>{filter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ))}

          <button className="pointer-events-auto shrink-0 h-10 px-4 rounded-xl bg-card/95 backdrop-blur-sm border border-border text-sm text-foreground hover:bg-card transition-colors flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <span>All filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
