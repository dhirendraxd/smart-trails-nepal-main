import { useState } from "react";
import { type DayForecast } from "@/hooks/useWeeklyForecast";
import { Backpack, Loader2, Download, Share2, Mail, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  forecast: DayForecast[];
  loading: boolean;
  regionName?: string;
}

interface PackingItem {
  item: string;
  reason: string;
  priority: "essential" | "recommended" | "optional";
}

function getPackingSuggestions(forecast: DayForecast[]): PackingItem[] {
  if (!forecast.length) return [];

  const items: PackingItem[] = [];
  const minTemp = Math.min(...forecast.map((d) => d.tempMin));
  const maxTemp = Math.max(...forecast.map((d) => d.tempMax));
  const totalPrecip = forecast.reduce((s, d) => s + d.precipitation, 0);
  const rainyDays = forecast.filter((d) => d.precipitation > 1).length;
  const maxWind = Math.max(...forecast.map((d) => d.windSpeedMax));
  const hasSnow = forecast.some((d) => d.weatherCode >= 71 && d.weatherCode <= 86);
  const hasStorm = forecast.some((d) => d.weatherCode >= 95);

  // Temperature-based
  if (minTemp < 5) {
    items.push({ item: "Down jacket", reason: `Lows dropping to ${minTemp}°C`, priority: "essential" });
    items.push({ item: "Thermal base layers", reason: "Cold nights expected", priority: "essential" });
  } else if (minTemp < 15) {
    items.push({ item: "Warm fleece / jacket", reason: `Evenings around ${minTemp}°C`, priority: "recommended" });
  }

  if (maxTemp > 30) {
    items.push({ item: "Lightweight breathable clothing", reason: `Highs reaching ${maxTemp}°C`, priority: "essential" });
    items.push({ item: "Sun hat & sunscreen", reason: "Strong sun expected", priority: "essential" });
  } else if (maxTemp > 22) {
    items.push({ item: "Sun protection", reason: `Warm days up to ${maxTemp}°C`, priority: "recommended" });
  }

  if (maxTemp - minTemp > 15) {
    items.push({ item: "Layered clothing", reason: `${minTemp}–${maxTemp}°C temperature swings`, priority: "essential" });
  }

  // Rain
  if (rainyDays >= 3) {
    items.push({ item: "Waterproof rain jacket", reason: `${rainyDays} rainy days forecasted`, priority: "essential" });
    items.push({ item: "Waterproof bag cover", reason: "Prolonged rain expected", priority: "recommended" });
  } else if (totalPrecip > 2) {
    items.push({ item: "Compact umbrella / poncho", reason: `${totalPrecip.toFixed(0)}mm rain expected`, priority: "recommended" });
  }

  // Snow
  if (hasSnow) {
    items.push({ item: "Waterproof trekking boots", reason: "Snowfall in forecast", priority: "essential" });
    items.push({ item: "Gaiters", reason: "Snow on trails", priority: "recommended" });
  }

  // Wind
  if (maxWind > 40) {
    items.push({ item: "Windproof shell", reason: `Gusts up to ${maxWind} km/h`, priority: "essential" });
  } else if (maxWind > 25) {
    items.push({ item: "Wind-resistant layer", reason: `Winds up to ${maxWind} km/h`, priority: "recommended" });
  }

  // Storm
  if (hasStorm) {
    items.push({ item: "Emergency poncho", reason: "Thunderstorms forecasted", priority: "essential" });
  }

  // Always useful
  items.push({ item: "Reusable water bottle", reason: "Stay hydrated", priority: "optional" });
  if (totalPrecip < 2 && maxTemp > 20) {
    items.push({ item: "Sunglasses (UV)", reason: "Bright clear days ahead", priority: "recommended" });
  }

  return items;
}

function generateChecklistText(items: PackingItem[], regionName: string, forecast: DayForecast[]): string {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const minTemp = Math.min(...forecast.map((d) => d.tempMin));
  const maxTemp = Math.max(...forecast.map((d) => d.tempMax));
  const dateRange = forecast.length
    ? `${forecast[0].date} → ${forecast[forecast.length - 1].date}`
    : "";

  let text = `═══════════════════════════════════════\n`;
  text += `  PACKING CHECKLIST — ${regionName.toUpperCase()}\n`;
  text += `═══════════════════════════════════════\n`;
  text += `Generated: ${now}\n`;
  text += `Forecast:  ${dateRange}  |  ${minTemp}°C – ${maxTemp}°C\n`;
  text += `───────────────────────────────────────\n\n`;

  const groups: { key: PackingItem["priority"]; label: string }[] = [
    { key: "essential", label: "ESSENTIAL" },
    { key: "recommended", label: "RECOMMENDED" },
    { key: "optional", label: "OPTIONAL" },
  ];

  for (const { key, label } of groups) {
    const group = items.filter((i) => i.priority === key);
    if (!group.length) continue;
    text += `▸ ${label}\n`;
    for (const item of group) {
      text += `  [ ] ${item.item}  — ${item.reason}\n`;
    }
    text += `\n`;
  }

  text += `───────────────────────────────────────\n`;
  text += `  SmartYatra • Weather-based packing\n`;
  return text;
}

function downloadChecklist(items: PackingItem[], regionName: string, forecast: DayForecast[]) {
  const text = generateChecklistText(items, regionName, forecast);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `packing-checklist-${regionName.toLowerCase().replace(/\s+/g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  essential: { bg: "bg-destructive/10", text: "text-destructive", label: "Essential" },
  recommended: { bg: "bg-primary/10", text: "text-primary", label: "Recommended" },
  optional: { bg: "bg-muted", text: "text-muted-foreground", label: "Optional" },
};

const PackingSuggestions = ({ forecast, loading, regionName = "Destination" }: Props) => {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Analyzing weather for packing tips…</span>
      </div>
    );
  }

  const items = getPackingSuggestions(forecast);
  if (!items.length) return null;

  const grouped = {
    essential: items.filter((i) => i.priority === "essential"),
    recommended: items.filter((i) => i.priority === "recommended"),
    optional: items.filter((i) => i.priority === "optional"),
  };

  const checklistText = generateChecklistText(items, regionName, forecast);
  const shareSubject = `Packing Checklist for ${regionName} — SmartYatra`;
  const shareBody = checklistText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checklistText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`,
      "_blank"
    );
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareSubject}\n\n${shareBody}`)}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareSubject, text: shareBody });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-secondary/60 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Backpack className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold">Smart Packing List</p>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary hover:bg-secondary/80 rounded-lg px-2 py-1"
                title="Share packing checklist"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleEmail} className="text-xs gap-2">
                <Mail className="w-3.5 h-3.5" />
                Send via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWhatsApp} className="text-xs gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy} className="text-xs gap-2">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </DropdownMenuItem>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <DropdownMenuItem onClick={handleNativeShare} className="text-xs gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  More Options…
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => downloadChecklist(items, regionName, forecast)}
            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 rounded-lg px-2 py-1"
            title="Download packing checklist"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {(["essential", "recommended", "optional"] as const).map((priority) => {
          const group = grouped[priority];
          if (!group.length) return null;
          const style = priorityStyles[priority];

          return (
            <div key={priority}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
                {style.label}
              </span>
              <div className="mt-1 space-y-1">
                {group.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 ${style.bg}`}
                  >
                    <span className={`text-xs font-medium shrink-0 ${style.text}`}>•</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium">{item.item}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">{item.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackingSuggestions;
