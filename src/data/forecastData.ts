import { nepalRegions, type Region } from "./regions";

// ── Climate baselines per month (index 0 = Jan) ──
const MONTHLY_CLIMATE = [
  { avgTemp: 10, rainfallMm: 15, clearDaysPct: 0.8, label: "Dry & cold" },
  { avgTemp: 13, rainfallMm: 20, clearDaysPct: 0.75, label: "Dry & cool" },
  { avgTemp: 18, rainfallMm: 35, clearDaysPct: 0.7, label: "Warming, pre-monsoon showers" },
  { avgTemp: 22, rainfallMm: 55, clearDaysPct: 0.55, label: "Warm, occasional rain" },
  { avgTemp: 24, rainfallMm: 120, clearDaysPct: 0.35, label: "Hot, pre-monsoon" },
  { avgTemp: 25, rainfallMm: 250, clearDaysPct: 0.2, label: "Monsoon onset" },
  { avgTemp: 25, rainfallMm: 370, clearDaysPct: 0.15, label: "Peak monsoon" },
  { avgTemp: 25, rainfallMm: 320, clearDaysPct: 0.18, label: "Heavy monsoon" },
  { avgTemp: 23, rainfallMm: 180, clearDaysPct: 0.35, label: "Monsoon retreating" },
  { avgTemp: 20, rainfallMm: 45, clearDaysPct: 0.8, label: "Peak season — clear skies" },
  { avgTemp: 15, rainfallMm: 10, clearDaysPct: 0.85, label: "Peak season — dry & crisp" },
  { avgTemp: 11, rainfallMm: 12, clearDaysPct: 0.82, label: "Cold & clear" },
];

// ── Weather condition for a given day ──
type DayWeather = "clear" | "cloudy" | "rain" | "storm";

function getDayWeather(clearPct: number, seed: number): DayWeather {
  const r = ((Math.sin(seed * 9301 + 49297) % 233280) / 233280 + 1) % 1;
  if (r < clearPct) return "clear";
  if (r < clearPct + (1 - clearPct) * 0.4) return "cloudy";
  if (r < clearPct + (1 - clearPct) * 0.85) return "rain";
  return "storm";
}

// ── Weather impact multiplier on tourist flow ──
function weatherMultiplier(w: DayWeather): number {
  switch (w) {
    case "clear": return 1.15;
    case "cloudy": return 1.0;
    case "rain": return 0.7;
    case "storm": return 0.4;
  }
}

// ── Day-of-week pattern (0=Sun) ──
const DOW_FACTOR = [0.85, 0.75, 0.78, 0.82, 0.95, 1.2, 1.15]; // weekend peak

// ── Seasonal base flow curve (normalized) driven by tourism data ──
function getSeasonalBase(monthIdx: number): number {
  const curve = [0.55, 0.65, 0.85, 1.0, 0.72, 0.48, 0.38, 0.35, 0.68, 1.15, 0.95, 0.7];
  return curve[monthIdx];
}

export interface DayForecast {
  day: number;
  date: string;
  dayOfWeek: string;
  predictedTourists: number;
  weatherCondition: DayWeather;
  temperature: number;
  rainfallMm: number;
  weatherImpact: number; // multiplier
  flowFactor: number; // seasonal × dow
  confidence: number; // 0-1
  riskLevel: "low" | "moderate" | "high";
  insight: string;
}

export interface ForecastSummary {
  peakDay: DayForecast;
  lowDay: DayForecast;
  avgDaily: number;
  totalPredicted: number;
  rainyDays: number;
  clearDays: number;
  avgConfidence: number;
  weatherTrend: string;
  flowTrend: "increasing" | "stable" | "decreasing";
  recommendations: string[];
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function generate30DayForecast(startDate?: Date): { days: DayForecast[]; summary: ForecastSummary } {
  const now = startDate || new Date();
  const currentMonth = now.getMonth();
  const climate = MONTHLY_CLIMATE[currentMonth];
  const nextClimate = MONTHLY_CLIMATE[(currentMonth + 1) % 12];
  const seasonalBase = getSeasonalBase(currentMonth);

  // Average daily baseline from all regions
  const totalDailyBase = nepalRegions.reduce((s, r) => s + r.touristCount, 0) / 30;

  const days: DayForecast[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const dayInMonth = d.getDate();
    const monthProgress = i / 30;

    // Interpolate climate between current and next month
    const temp = Math.round(climate.avgTemp + (nextClimate.avgTemp - climate.avgTemp) * monthProgress);
    const clearPct = climate.clearDaysPct + (nextClimate.clearDaysPct - climate.clearDaysPct) * monthProgress;
    const rainfall = Math.round(climate.rainfallMm / 30 * (1 + (Math.sin(i * 0.8) * 0.5)));

    const weather = getDayWeather(clearPct, i + currentMonth * 30);
    const wMult = weatherMultiplier(weather);
    const dowFactor = DOW_FACTOR[dow];
    const flowFactor = seasonalBase * dowFactor;

    // Add slight trend variation (events, holidays)
    const eventBoost = (i === 14 || i === 15) ? 1.25 : 1.0; // mid-month festival effect
    const predicted = Math.round(totalDailyBase * flowFactor * wMult * eventBoost);

    // Confidence decreases further out
    const confidence = Math.max(0.55, 0.95 - i * 0.012);

    const riskLevel = predicted > totalDailyBase * 1.3 ? "high"
      : predicted > totalDailyBase * 0.9 ? "moderate" : "low";

    let insight = "";
    if (weather === "storm") insight = "Storm expected — significant tourist reduction likely";
    else if (weather === "rain") insight = "Rainy conditions may reduce outdoor activities";
    else if (riskLevel === "high") insight = "High flow expected — consider crowd management";
    else if (dow === 0 || dow === 6) insight = "Weekend — higher domestic tourism expected";
    else if (eventBoost > 1) insight = "Local festival period — booking surge anticipated";
    else insight = "Normal flow expected";

    days.push({
      day: i + 1,
      date: `${MONTH_LABELS[d.getMonth()]} ${dayInMonth}`,
      dayOfWeek: DOW_LABELS[dow],
      predictedTourists: predicted,
      weatherCondition: weather,
      temperature: temp,
      rainfallMm: weather === "rain" ? rainfall * 3 : weather === "storm" ? rainfall * 6 : rainfall,
      weatherImpact: wMult,
      flowFactor: Math.round(flowFactor * 100) / 100,
      confidence,
      riskLevel,
      insight,
    });
  }

  // Summary
  const sorted = [...days].sort((a, b) => b.predictedTourists - a.predictedTourists);
  const peakDay = sorted[0];
  const lowDay = sorted[sorted.length - 1];
  const totalPredicted = days.reduce((s, d) => s + d.predictedTourists, 0);
  const avgDaily = Math.round(totalPredicted / 30);
  const rainyDays = days.filter(d => d.weatherCondition === "rain" || d.weatherCondition === "storm").length;
  const clearDays = days.filter(d => d.weatherCondition === "clear").length;
  const avgConfidence = Math.round(days.reduce((s, d) => s + d.confidence, 0) / 30 * 100) / 100;

  // Flow trend: compare first 10 days avg vs last 10 days avg
  const first10 = days.slice(0, 10).reduce((s, d) => s + d.predictedTourists, 0) / 10;
  const last10 = days.slice(20).reduce((s, d) => s + d.predictedTourists, 0) / 10;
  const flowTrend = last10 > first10 * 1.1 ? "increasing" : last10 < first10 * 0.9 ? "decreasing" : "stable";

  const recommendations: string[] = [];
  if (rainyDays > 10) recommendations.push("Heavy rainfall expected — promote indoor cultural experiences and museum visits");
  if (flowTrend === "increasing") recommendations.push("Tourist flow trending up — ensure accommodation availability and guide staffing");
  if (flowTrend === "decreasing") recommendations.push("Flow declining — consider promotional offers for off-peak travel");
  if (peakDay.predictedTourists > totalDailyBase * 1.5) recommendations.push(`Peak day (${peakDay.date}) may exceed comfortable capacity — activate crowd control protocols`);
  if (clearDays > 20) recommendations.push("Predominantly clear weather — ideal for promoting trekking and outdoor adventure packages");
  if (climate.avgTemp < 10) recommendations.push("Cold temperatures ahead — advise tourists on proper gear and altitude preparation");
  if (recommendations.length === 0) recommendations.push("Conditions are favorable — maintain standard operations");

  return {
    days,
    summary: {
      peakDay,
      lowDay,
      avgDaily,
      totalPredicted,
      rainyDays,
      clearDays,
      avgConfidence,
      weatherTrend: climate.label,
      flowTrend,
      recommendations,
    },
  };
}
