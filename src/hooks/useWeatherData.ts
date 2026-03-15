import { useEffect, useState } from "react";
import { nepalRegions } from "@/data/regions";

export interface WeatherInfo {
  regionId: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  label: string;
  icon: string;
}

function getWeatherLabel(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear", icon: "☀️" };
  if (code <= 3) return { label: "Cloudy", icon: "⛅" };
  if (code <= 48) return { label: "Foggy", icon: "🌫️" };
  if (code <= 57) return { label: "Drizzle", icon: "🌦️" };
  if (code <= 67) return { label: "Rain", icon: "🌧️" };
  if (code <= 77) return { label: "Snow", icon: "❄️" };
  if (code <= 82) return { label: "Showers", icon: "🌧️" };
  if (code <= 86) return { label: "Snow", icon: "🌨️" };
  if (code <= 99) return { label: "Storm", icon: "⛈️" };
  return { label: "Unknown", icon: "❓" };
}

function parseWeatherItem(item: any, regionId: string): WeatherInfo | null {
  if (!item?.current) return null;
  const { label, icon } = getWeatherLabel(item.current.weather_code);
  return {
    regionId,
    temperature: Math.round(item.current.temperature_2m),
    weatherCode: item.current.weather_code,
    windSpeed: item.current.wind_speed_10m,
    humidity: item.current.relative_humidity_2m,
    label,
    icon,
  };
}

export function useWeatherData() {
  const [weather, setWeather] = useState<WeatherInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lats = nepalRegions.map((r) => r.lat).join(",");
    const lngs = nepalRegions.map((r) => r.lng).join(",");

    const bulkUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;

    fetch(bulkUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const results: WeatherInfo[] = [];
        const items = Array.isArray(data) ? data : [data];
        items.forEach((item: any, i: number) => {
          const parsed = parseWeatherItem(item, nepalRegions[i]?.id);
          if (parsed) results.push(parsed);
        });
        if (results.length > 0) {
          setWeather(results);
          setLoading(false);
          return;
        }
        throw new Error("No results from bulk request");
      })
      .catch(() => {
        // Fallback: fetch individually in parallel
        const promises = nepalRegions.map((r) =>
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
          )
            .then((res) => res.json())
            .then((data) => parseWeatherItem(data, r.id))
            .catch(() => null)
        );
        Promise.all(promises).then((results) => {
          setWeather(results.filter(Boolean) as WeatherInfo[]);
          setLoading(false);
        });
      });
  }, []);

  return { weather, loading };
}
