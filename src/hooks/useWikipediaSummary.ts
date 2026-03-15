import { useState, useEffect } from "react";

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
}

const CACHE_KEY_PREFIX = "wiki_summary_";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Map region IDs to Wikipedia article titles
const WIKI_TITLES: Record<string, string> = {
  kathmandu: "Kathmandu",
  pokhara: "Pokhara",
  chitwan: "Chitwan_National_Park",
  lumbini: "Lumbini",
  everest: "Mount_Everest",
  annapurna: "Annapurna_Circuit",
  langtang: "Langtang_National_Park",
  bhaktapur: "Bhaktapur",
  nagarkot: "Nagarkot",
  mustang: "Upper_Mustang",
};

function getCached(regionId: string): WikiSummary | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + regionId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.data;
  } catch {}
  return null;
}

function setCache(regionId: string, data: WikiSummary) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + regionId, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function useWikipediaSummary(regionId: string) {
  const [data, setData] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const title = WIKI_TITLES[regionId];
    if (!title) {
      setLoading(false);
      return;
    }

    const cached = getCached(regionId);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.extract) {
          const summary: WikiSummary = {
            title: json.title,
            extract: json.extract,
            thumbnail: json.thumbnail?.source,
            url: json.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${title}`,
          };
          setData(summary);
          setCache(regionId, summary);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [regionId]);

  return { data, loading };
}
