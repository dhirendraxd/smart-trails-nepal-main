import { useEffect, useMemo, useRef, useState } from "react";
import L, { type DivIcon } from "leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { destinations, distanceKm, type CrowdLevel } from "@/data/destinations";
import { nepalBorderGeoJson } from "@/data/nepalBorder";

const crowdColors: Record<CrowdLevel, { bg: string; text: string }> = {
  Quiet:    { bg: "#dcfce7", text: "#166534" },
  Moderate: { bg: "#fef9c3", text: "#854d0e" },
  Busy:     { bg: "#fee2e2", text: "#991b1b" },
};

const markerIcon = (active: boolean): DivIcon =>
  L.divIcon({
    className: "",
    html: `<div style="width:${active ? 20 : 14}px;height:${active ? 20 : 14}px;border-radius:9999px;background:hsl(var(--background));border:3px solid hsl(var(--highlight));box-shadow:0 0 0 ${active ? 5 : 0}px hsla(152,55%,52%,0.25);"></div>`,
    iconSize: [active ? 20 : 14, active ? 20 : 14],
    iconAnchor: [active ? 10 : 7, active ? 10 : 7],
  });

const NEPAL_MAP_BOUNDS: [[number, number], [number, number]] = [
  [26.35, 80.0],
  [30.45, 88.3],
];

const MAP_FIT_PADDING = L.point(20, 20);

const getValidDestinationId = (value: string | null) =>
  destinations.some((destination) => destination.id === value) ? value : null;

const DestinationsSection = () => {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const linesLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedQueryId = searchParams.get("selected");

  const [selectedId, setSelectedId] = useState<string | null>(() => getValidDestinationId(selectedQueryId));
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

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === selectedId) ?? null,
    [selectedId],
  );

  const nearbyDestinations = useMemo(() => {
    if (!selectedDestination) return [];

    return destinations
      .filter((destination) => destination.id !== selectedDestination.id)
      .map((destination) => ({
        ...destination,
        distance: distanceKm(selectedDestination.coords, destination.coords),
      }))
      .filter((destination) => destination.distance <= 220)
      .sort((first, second) => first.distance - second.distance);
  }, [selectedDestination]);

  const viewportDestinations = useMemo(
    () => destinations.filter((d) => viewportIds.has(d.id)),
    [viewportIds],
  );

  const visibleDestinations = selectedDestination ? nearbyDestinations : viewportDestinations;

  const hasDistance = (
    destination: (typeof visibleDestinations)[number],
  ): destination is (typeof nearbyDestinations)[number] =>
    "distance" in destination && typeof destination.distance === "number";

  useEffect(() => {
    const nextSelectedId = getValidDestinationId(selectedQueryId);

    setSelectedId((currentSelectedId) =>
      currentSelectedId === nextSelectedId ? currentSelectedId : nextSelectedId,
    );

    if (nextSelectedId) {
      const destination = destinations.find((item) => item.id === nextSelectedId);

      if (destination) {
        mapRef.current?.flyTo(destination.coords, 8, { duration: 0.6 });
      }

      if (window.location.hash === "#destinations") {
        document.getElementById("destinations")?.scrollIntoView({ block: "start" });
      }
    }
  }, [selectedQueryId]);

  const syncSelectedQuery = (destinationId: string | null) => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        if (destinationId) {
          nextParams.set("selected", destinationId);
        } else {
          nextParams.delete("selected");
        }

        return nextParams;
      },
      { replace: true },
    );
  };

  const handleSelectDestination = (destinationId: string) => {
    setSelectedId(destinationId);
    setHoveredId(null);
    syncSelectedQuery(destinationId);
  };

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

    const nepalBounds = L.latLngBounds(NEPAL_MAP_BOUNDS);
    const dragBounds = nepalBounds.pad(0.22);

    const map = L.map(mapNodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: false,
      inertia: true,
      inertiaDeceleration: 2200,
      easeLinearity: 0.2,
      attributionControl: false,
      maxBounds: dragBounds,
      maxBoundsViscosity: 0.35,
      zoomSnap: 0.25,
    });

    map.fitBounds(nepalBounds, { animate: false, padding: MAP_FIT_PADDING });

    const minZoom = map.getBoundsZoom(nepalBounds, false, MAP_FIT_PADDING);
    map.setMinZoom(minZoom);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      noWrap: true,
    }).addTo(map);

    L.geoJSON(nepalBorderGeoJson, {
      interactive: false,
      style: {
        color: "rgba(16, 185, 129, 0.30)",
        weight: 9,
        opacity: 0.95,
        fillColor: "#10b981",
        fillOpacity: 0.025,
        lineCap: "round",
        lineJoin: "round",
      },
    }).addTo(map);

    L.geoJSON(nepalBorderGeoJson, {
      interactive: false,
      style: {
        color: "#10b981",
        weight: 3.2,
        opacity: 1,
        fillOpacity: 0,
        lineCap: "round",
        lineJoin: "round",
      },
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    linesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const initialSelectedId = getValidDestinationId(new URLSearchParams(window.location.search).get("selected"));

    if (initialSelectedId) {
      const initialDestination = destinations.find((destination) => destination.id === initialSelectedId);

      if (initialDestination) {
        map.whenReady(() => {
          map.flyTo(initialDestination.coords, 8, { duration: 0.6 });

          if (window.location.hash === "#destinations") {
            document.getElementById("destinations")?.scrollIntoView({ block: "start" });
          }
        });
      }
    }

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
        handleSelectDestination(destination.id);
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

    if (selectedDestination) {
      nearbyDestinations.forEach((destination) => {
        L.polyline([selectedDestination.coords, destination.coords], {
          color: "hsl(var(--highlight))",
          weight: 2,
          dashArray: "6 6",
          opacity: 0.95,
        }).addTo(linesLayer);
      });
    }
  }, [selectedDestination, activeId, nearbyDestinations]);

  const handleBackToAll = () => {
    setSelectedId(null);
    setHoveredId(null);
    syncSelectedQuery(null);
    mapRef.current?.flyToBounds(NEPAL_MAP_BOUNDS, { duration: 0.6, padding: MAP_FIT_PADDING });
  };

  return (
    <section id="destinations" className="h-full bg-secondary/30">
      <div className="h-full w-full py-2 md:py-3 pl-2 md:pl-3 pr-0">
        <div className="rounded-2xl overflow-hidden border border-border bg-card h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="h-full p-4 md:p-5 flex flex-col border-b border-border lg:border-b-0 lg:border-r">
              <div className="flex-1 overflow-hidden min-h-0">
            {selectedId && (
              <button
                type="button"
                onClick={handleBackToAll}
                className="w-full mb-4 text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors"
              >
                Back to all
              </button>
            )}

            <div className="mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Explore</p>
              <h3 className="text-xl font-display font-semibold mt-1">
                {selectedDestination
                  ? `${nearbyDestinations.length} places near ${selectedDestination.name}`
                  : `${viewportDestinations.length} destination${viewportDestinations.length !== 1 ? "s" : ""} in view`}
              </h3>
              <p className="text-xs text-muted-foreground/75 mt-1.5 leading-relaxed">
                {selectedDestination
                  ? `Showing destinations within roughly 220 km of ${selectedDestination.name}.`
                  : "Drag the map to explore Nepal, then click a pin to reveal nearby places."}
              </p>
            </div>

            <div className="space-y-2">
              {visibleDestinations.map((destination) => {
                const distanceLabel = hasDistance(destination) ? `${destination.distance.toFixed(0)} km away` : null;
                const isSelected = destination.id === selectedId;
                const isHovered = destination.id === hoveredId;

                return (
                  <button
                    key={destination.id}
                    type="button"
                    onMouseEnter={() => setHoveredId(destination.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      handleSelectDestination(destination.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border bg-background transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-400/60 bg-accent/45 shadow-sm"
                        : isHovered
                          ? "border-border/80 bg-accent/25"
                          : "border-border hover:border-border/80 hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={destination.img}
                        alt={destination.name}
                        className="h-14 w-14 rounded-lg object-cover shrink-0 transition-transform duration-200"
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

              {selectedDestination && nearbyDestinations.length === 0 && (
                <p className="text-sm text-muted-foreground py-3">
                  No nearby destinations found within this selected region.
                </p>
              )}

              {!selectedDestination && viewportDestinations.length === 0 && (
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

                {selectedDestination && (
                  <button
                    type="button"
                    onClick={() => navigate(`/destinations/${selectedDestination.id}`)}
                    className="mt-3 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>

            <div className="relative h-full min-h-[340px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]">
              <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-full border border-white/55 bg-white/94 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-foreground/75 shadow-sm backdrop-blur-sm uppercase">
                Drag Map • Click Pins
              </div>
              <div ref={mapNodeRef} className="explore-map-shell absolute inset-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
