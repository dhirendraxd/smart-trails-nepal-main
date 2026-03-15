import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { nepalRegions, getDensityLevel, getDensityColor, type Region } from "@/data/regions";
import { Map, Satellite, CloudSun, Search, X } from "lucide-react";
import { useWeatherData } from "@/hooks/useWeatherData";

interface Props {
  onSelectRegion: (region: Region) => void;
  selectedRegionId?: string;
}

const TouristHeatmap = ({ onSelectRegion, selectedRegionId }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const weatherMarkersRef = useRef<L.Marker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { weather, loading: weatherLoading } = useWeatherData();

  const filteredRegions = searchQuery.trim()
    ? nepalRegions.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSelect = useCallback((region: Region) => {
    onSelectRegion(region);
    setSearchQuery("");
    setSearchOpen(false);
  }, [onSelectRegion]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([28.3, 84.5], 7);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    });

    const standardLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    });

    const labelsLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 18,
    });

    satelliteLayer.addTo(map);
    labelsLayer.addTo(map);
    tileLayerRef.current = satelliteLayer;
    labelsLayerRef.current = labelsLayer;

    (map as any)._satelliteLayer = satelliteLayer;
    (map as any)._standardLayer = standardLayer;
    (map as any)._labelsLayer = labelsLayer;

    nepalRegions.forEach((region) => {
      const level = getDensityLevel(region);
      const color = getDensityColor(level);
      const ratio = region.touristCount / region.capacity;
      const radius = 12 + ratio * 20;

      L.circleMarker([region.lat, region.lng], {
        radius: radius + 8,
        color: "transparent",
        fillColor: color,
        fillOpacity: 0.15,
      }).addTo(map);

      const marker = L.circleMarker([region.lat, region.lng], {
        radius,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.35,
      }).addTo(map);

      marker.bindTooltip(region.name, {
        permanent: false,
        direction: "top",
        className: "font-body text-xs",
      });

      marker.on("click", () => onSelectRegion(region));
      markersRef.current.push(marker);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersRef.current = [];
      weatherMarkersRef.current = [];
    };
  }, [onSelectRegion]);

  // Fly to selected region, or reset to overview
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (selectedRegionId) {
      const region = nepalRegions.find((r) => r.id === selectedRegionId);
      if (region) {
        map.flyTo([region.lat, region.lng], 10, { duration: 1.2, easeLinearity: 0.25 });
      }
    } else {
      map.flyTo([28.3, 84.5], 7, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [selectedRegionId]);

  // Weather overlay effect
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove existing weather markers
    weatherMarkersRef.current.forEach((m) => map.removeLayer(m));
    weatherMarkersRef.current = [];

    if (showWeather && weather.length > 0) {
      nepalRegions.forEach((region) => {
        const w = weather.find((wi) => wi.regionId === region.id);
        if (!w) return;

        const icon = L.divIcon({
          className: "weather-overlay-icon",
          html: `<div style="
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            pointer-events: none;
          ">
            <span style="font-size:14px;line-height:1">${w.icon}</span>
            <span style="font-size:11px;font-weight:600;color:#fff">${w.temperature}°</span>
          </div>`,
          iconSize: [0, 0],
          iconAnchor: [-18, 12],
        });

        const marker = L.marker([region.lat, region.lng], { icon, interactive: false }).addTo(map);

        marker.bindTooltip(
          `<div style="text-align:center">
            <strong>${region.name}</strong><br/>
            ${w.icon} ${w.label} · ${w.temperature}°C<br/>
            💨 ${w.windSpeed} km/h · 💧 ${w.humidity}%
          </div>`,
          { direction: "top", className: "font-body text-xs" }
        );

        // Make tooltip work despite pointer-events:none on icon
        (marker as any).options.interactive = true;

        weatherMarkersRef.current.push(marker);
      });
    }
  }, [showWeather, weather]);

  const toggleMapStyle = () => {
    const map = mapInstance.current;
    if (!map) return;
    const sat = (map as any)._satelliteLayer;
    const std = (map as any)._standardLayer;
    const labels = (map as any)._labelsLayer;

    if (isSatellite) {
      map.removeLayer(sat);
      map.removeLayer(labels);
      std.addTo(map);
      markersRef.current.forEach((m) => m.bringToFront());
    } else {
      map.removeLayer(std);
      sat.addTo(map);
      labels.addTo(map);
      markersRef.current.forEach((m) => m.bringToFront());
    }
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={toggleMapStyle}
          className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-2.5 hover:bg-accent transition-colors"
          title={isSatellite ? "Switch to standard map" : "Switch to satellite view"}
        >
          {isSatellite ? <Map className="w-4 h-4 text-foreground" /> : <Satellite className="w-4 h-4 text-foreground" />}
        </button>
        <button
          onClick={() => setShowWeather(!showWeather)}
          className={`backdrop-blur-sm border border-border rounded-xl p-2.5 transition-colors ${
            showWeather ? "bg-primary/20 border-primary/40" : "bg-card/90 hover:bg-accent"
          }`}
          title={showWeather ? "Hide weather overlay" : "Show weather overlay"}
          disabled={weatherLoading}
        >
          <CloudSun className={`w-4 h-4 ${showWeather ? "text-primary" : "text-foreground"}`} />
        </button>
        <button
          onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }}
          className={`backdrop-blur-sm border border-border rounded-xl p-2.5 transition-colors ${
            searchOpen ? "bg-primary/20 border-primary/40" : "bg-card/90 hover:bg-accent"
          }`}
          title="Search regions"
        >
          <Search className={`w-4 h-4 ${searchOpen ? "text-primary" : "text-foreground"}`} />
        </button>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="absolute top-4 left-16 z-[1000] w-64 sm:w-72">
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search regions…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-secondary rounded">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {filteredRegions.length > 0 && (
              <div className="border-t border-border max-h-48 overflow-y-auto">
                {filteredRegions.map((region) => {
                  const level = getDensityLevel(region);
                  const color = getDensityColor(level);
                  return (
                    <button
                      key={region.id}
                      onClick={() => handleSearchSelect(region)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary/60 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{region.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color + "20", color }}>
                        {level}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {searchQuery && filteredRegions.length === 0 && (
              <div className="border-t border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">No regions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-xl p-3 z-[1000]">
        <p className="text-xs font-semibold mb-2">Tourist Density</p>
        <div className="flex flex-col gap-1.5">
          {([
            ["#22c55e", "Low"],
            ["#eab308", "Moderate"],
            ["#f97316", "High"],
            ["#ef4444", "Overcrowded"],
          ] as const).map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TouristHeatmap;
