import { type DayForecast } from "@/hooks/useWeeklyForecast";
import { Loader2, Droplets } from "lucide-react";

interface Props {
  forecast: DayForecast[];
  loading: boolean;
}

const WeeklyForecastChart = ({ forecast, loading }: Props) => {
  if (loading) {
    return (
      <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading 7-day forecast…</span>
      </div>
    );
  }

  if (!forecast.length) return null;

  const allTemps = forecast.flatMap((d) => [d.tempMax, d.tempMin]);
  const maxTemp = Math.max(...allTemps);
  const minTemp = Math.min(...allTemps);
  const range = maxTemp - minTemp || 1;

  return (
    <div className="bg-secondary/60 rounded-xl p-3">
      <p className="text-xs font-semibold mb-3">7-Day Forecast</p>

      <div className="flex gap-1">
        {forecast.map((day) => {
          const highPct = ((day.tempMax - minTemp) / range) * 100;
          const lowPct = ((day.tempMin - minTemp) / range) * 100;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              {/* Day label */}
              <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                {day.dayLabel}
              </span>

              {/* Weather icon */}
              <span className="text-sm leading-none">{day.icon}</span>

              {/* Temp bar */}
              <div className="relative w-full h-16 flex items-end justify-center">
                <div
                  className="w-2 rounded-full bg-gradient-to-t from-blue-400 to-orange-400 transition-all"
                  style={{
                    height: `${Math.max(highPct - lowPct + 15, 20)}%`,
                    marginBottom: `${lowPct * 0.6}%`,
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Max temp */}
              <span className="text-[10px] font-bold font-display">{day.tempMax}°</span>
              {/* Min temp */}
              <span className="text-[10px] text-muted-foreground">{day.tempMin}°</span>

              {/* Precipitation */}
              {day.precipitation > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-blue-500">
                  <Droplets className="w-2.5 h-2.5" />
                  {day.precipitation.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecastChart;
