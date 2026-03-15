import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Region } from "@/data/regions";
import { useActivity } from "./ActivityContext";

export interface TripStop {
  region: Region;
  days: number;
  notes: string;
}

interface TripPlannerContextType {
  stops: TripStop[];
  addStop: (region: Region) => void;
  removeStop: (regionId: string) => void;
  reorderStops: (fromIndex: number, toIndex: number) => void;
  updateStop: (regionId: string, updates: Partial<Pick<TripStop, "days" | "notes">>) => void;
  clearTrip: () => void;
  isInTrip: (regionId: string) => boolean;
  totalDays: number;
  totalCost: number;
}

const TripPlannerContext = createContext<TripPlannerContextType>({
  stops: [],
  addStop: () => {},
  removeStop: () => {},
  reorderStops: () => {},
  updateStop: () => {},
  clearTrip: () => {},
  isInTrip: () => false,
  totalDays: 0,
  totalCost: 0,
});

export function TripPlannerProvider({ children }: { children: ReactNode }) {
  const [stops, setStops] = useState<TripStop[]>([]);
  const { addActivity } = useActivity();

  const addStop = useCallback((region: Region) => {
    setStops((prev) => {
      if (prev.some((s) => s.region.id === region.id)) return prev;
      addActivity("trip_add", region.name);
      return [...prev, { region, days: 2, notes: "" }];
    });
  }, [addActivity]);

  const removeStop = useCallback((regionId: string) => {
    setStops((prev) => {
      const stop = prev.find((s) => s.region.id === regionId);
      if (stop) addActivity("trip_remove", stop.region.name);
      return prev.filter((s) => s.region.id !== regionId);
    });
  }, [addActivity]);

  const reorderStops = useCallback((fromIndex: number, toIndex: number) => {
    setStops((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      addActivity("trip_reorder");
      return updated;
    });
  }, [addActivity]);

  const updateStop = useCallback((regionId: string, updates: Partial<Pick<TripStop, "days" | "notes">>) => {
    setStops((prev) =>
      prev.map((s) => (s.region.id === regionId ? { ...s, ...updates } : s))
    );
  }, []);

  const clearTrip = useCallback(() => {
    addActivity("trip_clear");
    setStops([]);
  }, [addActivity]);

  const isInTrip = useCallback((regionId: string) => stops.some((s) => s.region.id === regionId), [stops]);

  const totalDays = stops.reduce((sum, s) => sum + s.days, 0);
  const totalCost = stops.reduce((sum, s) => sum + s.region.avgCost * s.days, 0);

  return (
    <TripPlannerContext.Provider
      value={{ stops, addStop, removeStop, reorderStops, updateStop, clearTrip, isInTrip, totalDays, totalCost }}
    >
      {children}
    </TripPlannerContext.Provider>
  );
}

export const useTripPlanner = () => useContext(TripPlannerContext);
