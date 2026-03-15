import { useEffect, useState } from "react";
import { nepalRegions } from "@/data/regions";

export interface DayForecast {
  date: string;
  dayLabel: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  label: string;
  icon: string;
  precipitation: number;
  windSpeedMax: number;
}

export interface RegionForecast {
  regionId: string;
  days: DayForecast[];
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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function useWeeklyForecast(regionId: string) {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const region = nepalRegions.find((r) => r.id === regionId);
    if (!region) {
      setLoading(false);
      return;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.daily) {
          const days: DayForecast[] = data.daily.time.map((date: string, i: number) => {
            const d = new Date(date);
            const { label, icon } = getWeatherLabel(data.daily.weather_code[i]);
            return {
              date,
              dayLabel: i === 0 ? "Today" : DAY_NAMES[d.getDay()],
              tempMax: Math.round(data.daily.temperature_2m_max[i]),
              tempMin: Math.round(data.daily.temperature_2m_min[i]),
              weatherCode: data.daily.weather_code[i],
              label,
              icon,
              precipitation: data.daily.precipitation_sum[i],
              windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
            };
          });
          setForecast(days);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [regionId]);

  return { forecast, loading };
}
