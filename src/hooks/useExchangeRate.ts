import { useState, useEffect } from "react";

interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source: string;
}

const FALLBACK_RATE = 133.5;
const CACHE_KEY = "exchange_rate_usd_npr";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function getCached(): ExchangeRateData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.data;
  } catch {}
  return null;
}

function setCache(data: ExchangeRateData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRateData>({
    rate: FALLBACK_RATE,
    lastUpdated: "",
    source: "fallback",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((json) => {
        if (json.result === "success" && json.rates?.NPR) {
          const rateData: ExchangeRateData = {
            rate: json.rates.NPR,
            lastUpdated: json.time_last_update_utc || new Date().toISOString(),
            source: "open.er-api.com",
          };
          setData(rateData);
          setCache(rateData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
