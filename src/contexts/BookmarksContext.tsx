import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useActivity } from "./ActivityContext";
import { nepalRegions } from "@/data/regions";

interface BookmarksContextType {
  bookmarks: string[];
  toggleBookmark: (regionId: string) => void;
  isBookmarked: (regionId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType>({
  bookmarks: [],
  toggleBookmark: () => {},
  isBookmarked: () => false,
});

const STORAGE_KEY = "smartyatra_bookmarks";

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, userName } = useAuth();
  const { addActivity } = useActivity();
  const userKey = `${STORAGE_KEY}_${userName ?? "guest"}`;

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(userKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(userKey);
      setBookmarks(stored ? JSON.parse(stored) : []);
    } catch {
      setBookmarks([]);
    }
  }, [userKey]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(userKey, JSON.stringify(bookmarks));
    }
  }, [bookmarks, userKey, isLoggedIn]);

  const toggleBookmark = useCallback((regionId: string) => {
    setBookmarks((prev) => {
      const removing = prev.includes(regionId);
      const regionName = nepalRegions.find((r) => r.id === regionId)?.name;
      addActivity(removing ? "bookmark_remove" : "bookmark_add", regionName);
      return removing ? prev.filter((id) => id !== regionId) : [...prev, regionId];
    });
  }, [addActivity]);

  const isBookmarked = useCallback((regionId: string) => bookmarks.includes(regionId), [bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarksContext);
