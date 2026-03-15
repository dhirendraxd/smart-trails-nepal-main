import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Activity {
  id: string;
  type: "bookmark_add" | "bookmark_remove" | "trip_add" | "trip_remove" | "trip_clear" | "trip_reorder";
  regionName?: string;
  timestamp: number;
}

interface ActivityContextType {
  activities: Activity[];
  unreadCount: number;
  addActivity: (type: Activity["type"], regionName?: string) => void;
  clearActivities: () => void;
  markAsRead: () => void;
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  unreadCount: 0,
  addActivity: () => {},
  clearActivities: () => {},
  markAsRead: () => {},
});

const STORAGE_KEY = "smartyatra_activities";
const SEEN_KEY = "smartyatra_activity_seen";
const MAX_ACTIVITIES = 30;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [lastSeenAt, setLastSeenAt] = useState<number>(() => {
    try { return Number(localStorage.getItem(SEEN_KEY) ?? "0"); } catch { return 0; }
  });

  const persist = (items: Activity[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  };

  const addActivity = useCallback((type: Activity["type"], regionName?: string) => {
    setActivities((prev) => {
      const next = [
        { id: crypto.randomUUID(), type, regionName, timestamp: Date.now() },
        ...prev,
      ].slice(0, MAX_ACTIVITIES);
      persist(next);
      return next;
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    persist([]);
  }, []);

  const markAsRead = useCallback(() => {
    const now = Date.now();
    setLastSeenAt(now);
    try { localStorage.setItem(SEEN_KEY, String(now)); } catch {}
  }, []);

  const unreadCount = activities.filter((a) => a.timestamp > lastSeenAt).length;

  return (
    <ActivityContext.Provider value={{ activities, unreadCount, addActivity, clearActivities, markAsRead }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivity = () => useContext(ActivityContext);
