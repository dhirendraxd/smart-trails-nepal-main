import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import L, { type DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import destKathmandu from "@/assets/dest-kathmandu.jpg";
import destPokhara from "@/assets/dest-pokhara.jpg";
import destEverest from "@/assets/dest-everest.jpg";
import destChitwan from "@/assets/dest-chitwan.jpg";
import destAnnapurna from "@/assets/dest-annapurna.jpg";
import destLumbini from "@/assets/dest-lumbini.jpg";

type CrowdLevel = "Quiet" | "Moderate" | "Busy";

const crowdColors: Record<CrowdLevel, { bg: string; text: string }> = {
  Quiet:    { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Busy:     { bg: "#fee2e2", text: "#991b1b" },
};

const destinations = [
  {
    id: "kathmandu",
    name: "Kathmandu Valley",
    img: destKathmandu,
    category: "Heritage & Culture",
    coords: [27.7172, 85.324],
    area: "Bagmati Region",
    crowd: "Busy" as CrowdLevel,
  },
  {
    id: "pokhara",
    name: "Pokhara",
    img: destPokhara,
    category: "Lake & Mountains",
    coords: [28.2096, 83.9856],
    area: "Gandaki Region",
    crowd: "Moderate" as CrowdLevel,
  },
  {
    id: "everest",
    name: "Everest Region",
    img: destEverest,
    category: "Trekking & Adventure",
    coords: [27.932, 86.761],
    area: "Khumbu Region",
    crowd: "Busy" as CrowdLevel,
  },
  {
    id: "chitwan",
    name: "Chitwan",
    img: destChitwan,
    category: "Wildlife Safari",
    coords: [27.5291, 84.3542],
    area: "Terai Region",
    crowd: "Quiet" as CrowdLevel,
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    img: destAnnapurna,
    category: "Trekking",
    coords: [28.5961, 83.8203],
    area: "Annapurna Region",
    crowd: "Moderate" as CrowdLevel,
  },
  {
    id: "lumbini",
    name: "Lumbini",
    img: destLumbini,
    category: "Spiritual Pilgrimage",
    coords: [27.4833, 83.276],
    area: "Lumbini Region",
    crowd: "Quiet" as CrowdLevel,
  },
];

const markerIcon = (active: boolean): DivIcon =>
  L.divIcon({
    className: "",
    html: `<div style="width:${active ? 20 : 14}px;height:${active ? 20 : 14}px;border-radius:9999px;background:hsl(var(--background));border:3px solid hsl(var(--highlight));box-shadow:0 0 0 ${active ? 5 : 0}px hsla(152,55%,52%,0.25);"></div>`,
    iconSize: [active ? 20 : 14, active ? 20 : 14],
    iconAnchor: [active ? 10 : 7, active ? 10 : 7],
  });

const EARTH_RADIUS_KM = 6371;

const distanceKm = (from: [number, number], to: [number, number]) => {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const latDelta = ((lat2 - lat1) * Math.PI) / 180;
  const lonDelta = ((lon2 - lon1) * Math.PI) / 180;

  const haversineA =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(lonDelta / 2) ** 2;

  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));
  return EARTH_RADIUS_KM * haversineC;
};

const DestinationsSection = () => {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const linesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewportIds, setViewportIds] = useState<Set<string>>(
    () => new Set(destinations.map((d) => d.id)),
  );
  const [aiInsight, setAiInsight] = useState<{
    loading: boolean;
    text: string | null;
    error: string | null;
    destId: string | null;
  }>({ loading: false, text: null, error: null, destId: null });

  const activeId = hoveredId ?? selectedId;

  const activeDestination = useMemo(
    () => destinations.find((destination) => destination.id === activeId) ?? null,
    [activeId],
  );

  const nearbyDestinations = useMemo(() => {
    if (!activeDestination) return [];

    return destinations
      .filter((destination) => destination.id !== activeDestination.id)
      .map((destination) => ({
        ...destination,
        distance: distanceKm(activeDestination.coords, destination.coords),
      }))
      .filter((destination) => destination.distance <= 220)
      .sort((first, second) => first.distance - second.distance);
  }, [activeDestination]);

  const viewportDestinations = useMemo(
    () => destinations.filter((d) => viewportIds.has(d.id)),
    [viewportIds],
  );

  const visibleDestinations = activeDestination ? nearbyDestinations : viewportDestinations;

  useEffect(() => {
    if (!selectedId) {
      setAiInsight({ loading: false, text: null, error: null, destId: null });
      return;
    }

    const dest = destinations.find((d) => d.id === selectedId);
    if (!dest) return;

    const nearby = destinations
      .filter((d) => d.id !== dest.id)
      .map((d) => ({ ...d, distance: distanceKm(dest.coords, d.coords) }))
      .filter((d) => d.distance <= 220)
      .sort((a, b) => a.distance - b.distance);

    const nearbyList =
      nearby.length > 0
        ? nearby.map((d) => `${d.name} (crowd: ${d.crowd})`).join(", ")
        : "none within 220 km";

    const prompt =
      `You are a Nepal travel expert. A traveler is viewing ${dest.name} (${dest.category}, ${dest.area}). ` +
      `Current crowd level: ${dest.crowd}. ` +
      `Nearby destinations within 220 km: ${nearbyList}.\n\n` +
      `In 2–3 concise sentences: (1) explain why ${dest.name} currently has a "${dest.crowd}" crowd level, ` +
      `(2) what this means practically for a traveler visiting, and ` +
      `(3) give one specific actionable recommendation. Be direct and practical.`;

    const controller = new AbortController();
    setAiInsight({ loading: true, text: null, error: null, destId: selectedId });

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": (import.meta.env.VITE_ANTHROPIC_API_KEY as string) ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const text: string = data?.content?.[0]?.text ?? "No insight available.";
        setAiInsight({ loading: false, text, error: null, destId: selectedId });
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setAiInsight({
          loading: false,
          text: null,
          error: "Could not load AI insight. Check your VITE_ANTHROPIC_API_KEY.",
          destId: selectedId,
        });
      });

    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const map = L.map(mapNodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    }).setView([28.2, 84.1], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    linesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const updateViewport = () => {
      const bounds = map.getBounds();
      setViewportIds(
        new Set(
          destinations
            .filter((d) => bounds.contains(d.coords as L.LatLngExpression))
            .map((d) => d.id),
        ),
      );
    };

    map.on("moveend", updateViewport);
    map.whenReady(updateViewport);

    return () => {
      map.off("moveend", updateViewport);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      linesLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    const linesLayer = linesLayerRef.current;

    if (!map || !markersLayer || !linesLayer) return;

    markersLayer.clearLayers();
    linesLayer.clearLayers();

    destinations.forEach((destination) => {
      const isActive = destination.id === activeId;

      const marker = L.marker(destination.coords, {
        icon: markerIcon(isActive),
      });

      marker.on("mouseover", () => {
        setHoveredId(destination.id);
      });

      marker.on("mouseout", () => {
        setHoveredId((currentHovered) => (currentHovered === destination.id ? null : currentHovered));
      });

      marker.on("click", () => {
        setSelectedId(destination.id);
        setHoveredId(null);
        map.flyTo(destination.coords, 8, { duration: 0.6 });
      });

      const { bg, text } = crowdColors[destination.crowd];
      marker.bindTooltip(
        `<div style="font-family:inherit;min-width:140px;">
          <p style="font-weight:600;font-size:13px;margin:0 0 6px;">${destination.name}</p>
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${bg};color:${text};margin-bottom:5px;">${destination.crowd}</span>
          <p style="font-size:11px;color:#6b7280;margin:0;">${destination.category}</p>
        </div>`,
        {
          direction: "top",
          offset: [0, -16],
          opacity: 1,
          className: "smart-trails-tooltip",
        },
      );

      marker.addTo(markersLayer);
    });

    if (activeDestination) {
      nearbyDestinations.forEach((destination) => {
        L.polyline([activeDestination.coords, destination.coords], {
          color: "hsl(var(--highlight))",
          weight: 2,
          dashArray: "6 6",
          opacity: 0.95,
        }).addTo(linesLayer);
      });
    }
  }, [activeDestination, activeId, nearbyDestinations]);

  const handleBackToAll = () => {
    setSelectedId(null);
    setHoveredId(null);
    mapRef.current?.flyTo([28.2, 84.1], 7, { duration: 0.6 });
  };

  return (
    <section id="destinations" className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 md:mb-16 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
              Explore Nepal
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Where to Visit?
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href="#services"
              className="inline-block text-sm font-medium border border-border px-6 py-3 rounded-full hover:bg-accent transition-colors"
            >
              View Featured Tools →
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-5">
          <div className="bg-card border border-border rounded-2xl p-5 h-[580px] flex flex-col">
            <div className="flex-1 overflow-y-auto min-h-0">
            {selectedId && (
              <button
                type="button"
                onClick={handleBackToAll}
                className="w-full mb-4 text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors"
              >
                Back to all
              </button>
            )}

            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Explore</p>
              <h3 className="text-xl font-display font-semibold mt-1">
                {activeDestination
                  ? `${nearbyDestinations.length} places near ${activeDestination.name}`
                  : `${viewportDestinations.length} destination${viewportDestinations.length !== 1 ? "s" : ""} in view`}
              </h3>
            </div>

            <div className="space-y-3">
              {visibleDestinations.map((destination) => {
                const distanceLabel = "distance" in destination ? `${destination.distance.toFixed(0)} km away` : null;

                return (
                  <button
                    key={destination.id}
                    type="button"
                    onMouseEnter={() => setHoveredId(destination.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      setSelectedId(destination.id);
                      mapRef.current?.flyTo(destination.coords, 8, { duration: 0.6 });
                    }}
                    className="w-full text-left p-3 rounded-xl border border-border bg-background hover:bg-accent/60 transition-colors"
                  >
                    <div className="flex gap-3">
                      <img
                        src={destination.img}
                        alt={destination.name}
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{destination.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{destination.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">{destination.area}</p>
                        {distanceLabel && <p className="text-xs font-medium text-foreground/80 mt-1">{distanceLabel}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}

              {activeDestination && nearbyDestinations.length === 0 && (
                <p className="text-sm text-muted-foreground py-3">
                  No nearby destinations found within this selected region.
                </p>
              )}

              {!activeDestination && viewportDestinations.length === 0 && (
                <p className="text-sm text-muted-foreground py-3">
                  No destinations in the current map view. Pan or zoom out to see more.
                </p>
              )}
            </div>
            </div>

            <div className="border-t border-border pt-3 mt-2 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                  style={{ boxShadow: "0 0 0 3px rgba(16,185,129,0.18)" }}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  AI Insight
                </span>
              </div>
              {!selectedId ? (
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  Select a destination pin to get an AI-powered travel insight.
                </p>
              ) : aiInsight.loading ? (
                <div className="space-y-1.5 py-0.5">
                  <div className="h-2.5 bg-muted animate-pulse rounded-full w-full" />
                  <div className="h-2.5 bg-muted animate-pulse rounded-full w-5/6" />
                  <div className="h-2.5 bg-muted animate-pulse rounded-full w-4/6" />
                </div>
              ) : aiInsight.error ? (
                <p className="text-xs text-destructive/80 leading-relaxed">{aiInsight.error}</p>
              ) : (
                <p className="text-xs text-foreground/75 leading-relaxed">{aiInsight.text}</p>
              )}
            </div>
          </div>

          <div className="relative h-[580px] rounded-2xl overflow-hidden border border-border bg-card">
            <div ref={mapNodeRef} className="absolute inset-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
