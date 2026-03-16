import { useEffect, useMemo, useRef, useState } from "react";
import L, { type DivIcon } from "leaflet";
import { useSearchParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import {
  destinations,
  distanceKm,
  type CrowdLevel,
  type DestinationWithDistance,
} from "@/data/destinations";
import { getLocalExploreForDestination } from "@/data/localExplore";

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
const LIVE_NEARBY_RADIUS_KM = 240;
const LIVE_NEARBY_LIMIT = 3;

type LiveLocationState = {
  status: "locating" | "ready" | "error" | "unsupported";
  coords: [number, number] | null;
  accuracyM: number | null;
  error: string | null;
};

const getGeolocationErrorMessage = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Enable it to see live nearby popular places.";
    case error.POSITION_UNAVAILABLE:
      return "Live location is unavailable right now. Try moving to an open area or retry.";
    case error.TIMEOUT:
      return "Location request timed out. Please retry with a stronger signal.";
    default:
      return "Unable to read your location at the moment.";
  }
};

const isWithinNepalBounds = (coords: [number, number]) => {
  const [[minLat, minLng], [maxLat, maxLng]] = NEPAL_MAP_BOUNDS;
  const [lat, lng] = coords;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

const getDestinationMatches = (query: string, excludedId?: string | null) => {
  const normalizedQuery = query.trim().toLowerCase();
  const candidates = destinations.filter((destination) => destination.id !== excludedId);

  if (!normalizedQuery) {
    return candidates.slice(0, 5);
  }

  return candidates
    .map((destination) => {
      const name = destination.name.toLowerCase();
      const area = destination.area.toLowerCase();
      const category = destination.category.toLowerCase();

      let score = Number.POSITIVE_INFINITY;

      if (name.startsWith(normalizedQuery)) score = 0;
      else if (name.includes(normalizedQuery)) score = 1;
      else if (area.includes(normalizedQuery)) score = 2;
      else if (category.includes(normalizedQuery)) score = 3;

      return { destination, score };
    })
    .filter((result) => Number.isFinite(result.score))
    .sort((first, second) => first.score - second.score || first.destination.name.localeCompare(second.destination.name))
    .map((result) => result.destination)
    .slice(0, 5);
};

const getValidDestinationId = (value: string | null) =>
  destinations.some((destination) => destination.id === value) ? value : null;

const DestinationsSection = () => {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const hasCenteredOnLiveRef = useRef(false);
  const plannerRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedQueryId = searchParams.get("selected");

  const [selectedId, setSelectedId] = useState<string | null>(() => getValidDestinationId(selectedQueryId));
  const [fromId, setFromId] = useState<string | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState(() => {
    const initialDestinationId = getValidDestinationId(selectedQueryId);
    return initialDestinationId
      ? destinations.find((destination) => destination.id === initialDestinationId)?.name ?? ""
      : "";
  });
  const [activePlannerField, setActivePlannerField] = useState<"from" | "to" | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocationState>({
    status: "locating",
    coords: null,
    accuracyM: null,
    error: null,
  });
  const [viewportIds, setViewportIds] = useState<Set<string>>(
    () => new Set(destinations.map((d) => d.id)),
  );

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

  const selectedDestinationWithDistance = useMemo<DestinationWithDistance | null>(() => {
    if (!selectedDestination) return null;
    return { ...selectedDestination, distance: 0 };
  }, [selectedDestination]);

  const visibleDestinations = useMemo(() => {
    if (!selectedDestination) {
      return viewportDestinations;
    }

    if (!selectedDestinationWithDistance) {
      return nearbyDestinations;
    }

    return [selectedDestinationWithDistance, ...nearbyDestinations];
  }, [selectedDestination, selectedDestinationWithDistance, nearbyDestinations, viewportDestinations]);

  const liveNearbyDestinations = useMemo<DestinationWithDistance[]>(() => {
    if (!liveLocation.coords) {
      return [];
    }

    const ranked = destinations
      .map((destination) => ({
        ...destination,
        distance: distanceKm(liveLocation.coords as [number, number], destination.coords),
      }))
      .sort((first, second) => first.distance - second.distance);

    const nearby = ranked.filter((destination) => destination.distance <= LIVE_NEARBY_RADIUS_KM);
    return (nearby.length > 0 ? nearby : ranked).slice(0, LIVE_NEARBY_LIMIT);
  }, [liveLocation.coords]);

  const livePopularPlaces = useMemo(() => {
    return liveNearbyDestinations
      .flatMap((destination) => {
        const localExplore = getLocalExploreForDestination(destination.id);

        return localExplore.places.map((place, index) => ({
          id: `${destination.id}-${place.name}`,
          destinationId: destination.id,
          area: destination.area,
          approxDistanceKm: destination.distance,
          popularityOrder: index,
          place,
        }));
      })
      .sort(
        (first, second) =>
          first.approxDistanceKm - second.approxDistanceKm || first.popularityOrder - second.popularityOrder,
      )
      .slice(0, 7);
  }, [liveNearbyDestinations]);

  const livePopularPlacesByDestination = useMemo(() => {
    const grouped: Record<string, typeof livePopularPlaces> = {};

    livePopularPlaces.forEach((item) => {
      if (!grouped[item.destinationId]) {
        grouped[item.destinationId] = [];
      }
      grouped[item.destinationId].push(item);
    });

    return grouped;
  }, [livePopularPlaces]);

  const fromSuggestions = useMemo(
    () => getDestinationMatches(fromQuery, selectedId),
    [fromQuery, selectedId],
  );

  const toSuggestions = useMemo(
    () => getDestinationMatches(toQuery, fromId),
    [toQuery, fromId],
  );

  const hasDistance = (
    destination: (typeof visibleDestinations)[number],
  ): destination is (typeof nearbyDestinations)[number] =>
    "distance" in destination && typeof destination.distance === "number";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!plannerRef.current?.contains(event.target as Node)) {
        setActivePlannerField(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLiveLocation({
        status: "unsupported",
        coords: null,
        accuracyM: null,
        error: "Geolocation is not supported on this browser.",
      });
      return;
    }

    setLiveLocation((currentState) =>
      currentState.status === "ready"
        ? currentState
        : {
            status: "locating",
            coords: null,
            accuracyM: null,
            error: null,
          },
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveLocation({
          status: "ready",
          coords: [position.coords.latitude, position.coords.longitude],
          accuracyM: position.coords.accuracy,
          error: null,
        });
      },
      (error) => {
        setLiveLocation((currentState) =>
          currentState.status === "ready"
            ? currentState
            : {
                status: "error",
                coords: null,
                accuracyM: null,
                error: getGeolocationErrorMessage(error),
              },
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 45000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const nextSelectedId = getValidDestinationId(selectedQueryId);

    setSelectedId((currentSelectedId) =>
      currentSelectedId === nextSelectedId ? currentSelectedId : nextSelectedId,
    );

    if (nextSelectedId) {
      const destination = destinations.find((item) => item.id === nextSelectedId);

      if (destination) {
        setToQuery(destination.name);
        mapRef.current?.flyTo(destination.coords, 8, { duration: 0.6 });
      }

      if (window.location.hash === "#destinations") {
        document.getElementById("destinations")?.scrollIntoView({ block: "start" });
      }
    } else {
      setToQuery("");
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
    const destination = destinations.find((item) => item.id === destinationId);

    setSelectedId(destinationId);
    setHoveredId(null);
    if (destination) {
      setToQuery(destination.name);
    }
    syncSelectedQuery(destinationId);
  };

  const handleSelectFromDestination = (destinationId: string) => {
    const destination = destinations.find((item) => item.id === destinationId);

    setFromId(destinationId);
    setFromQuery(destination?.name ?? "");
    setActivePlannerField(null);
  };

  const handleSelectToDestination = (destinationId: string) => {
    handleSelectDestination(destinationId);
    setActivePlannerField(null);
  };

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

    markersLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);
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
      userLocationLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    destinations.forEach((destination) => {
      const isActive = destination.id === activeId || destination.id === fromId;

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

  }, [activeId, fromId]);

  useEffect(() => {
    const map = mapRef.current;
    const userLocationLayer = userLocationLayerRef.current;

    if (!map || !userLocationLayer) return;

    userLocationLayer.clearLayers();

    if (liveLocation.status !== "ready" || !liveLocation.coords) return;

    const accuracyRadiusM = Math.min(Math.max(liveLocation.accuracyM ?? 120, 50), 3000);

    L.circle(liveLocation.coords, {
      radius: accuracyRadiusM,
      color: "#0284c7",
      weight: 1.5,
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
      opacity: 0.8,
      interactive: false,
    }).addTo(userLocationLayer);

    const userMarker = L.circleMarker(liveLocation.coords, {
      radius: 7,
      color: "#075985",
      fillColor: "#0ea5e9",
      fillOpacity: 1,
      weight: 2,
    }).addTo(userLocationLayer);

    userMarker.bindTooltip(`You are here (${Math.round(accuracyRadiusM)}m accuracy)`, {
      direction: "top",
      offset: [0, -12],
      opacity: 1,
      className: "smart-trails-tooltip",
    });

    if (!hasCenteredOnLiveRef.current && isWithinNepalBounds(liveLocation.coords) && !selectedId) {
      map.flyTo(liveLocation.coords, 8, { duration: 0.6 });
      hasCenteredOnLiveRef.current = true;
    }
  }, [liveLocation, selectedId]);

  const handleBackToAll = () => {
    setSelectedId(null);
    setHoveredId(null);
    setToQuery("");
    syncSelectedQuery(null);
    mapRef.current?.flyToBounds(NEPAL_MAP_BOUNDS, { duration: 0.6, padding: MAP_FIT_PADDING });
  };

  return (
    <section id="destinations" className="h-full bg-secondary/30">
      <div className="h-full w-full py-2 md:py-3 pl-2 md:pl-3 pr-0">
        <div className="rounded-2xl overflow-hidden border border-border bg-card h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="h-full p-3 md:p-4 flex flex-col border-b border-border lg:border-b-0 lg:border-r">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
                <div ref={plannerRef} className="space-y-2">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                  <div className="relative">
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      From
                    </label>
                    <Input
                      value={fromQuery}
                      onFocus={() => setActivePlannerField("from")}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setFromQuery(nextValue);
                        setFromId(null);
                        setActivePlannerField("from");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && fromSuggestions[0]) {
                          event.preventDefault();
                          handleSelectFromDestination(fromSuggestions[0].id);
                        }
                      }}
                      placeholder="Start location"
                      className="h-9 rounded-xl border-border/80 bg-background/75 px-3 text-sm shadow-none focus-visible:ring-1"
                    />
                    {activePlannerField === "from" && fromSuggestions.length > 0 && (
                      <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-[700] rounded-xl border border-border bg-card p-1 shadow-xl">
                        {fromSuggestions.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelectFromDestination(destination.id);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/55"
                          >
                            <p className="text-sm font-medium leading-tight">{destination.name}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{destination.area}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Where To
                    </label>
                    <Input
                      value={toQuery}
                      onFocus={() => setActivePlannerField("to")}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setToQuery(nextValue);
                        setSelectedId(null);
                        syncSelectedQuery(null);
                        setActivePlannerField("to");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && toSuggestions[0]) {
                          event.preventDefault();
                          handleSelectToDestination(toSuggestions[0].id);
                        }
                      }}
                      placeholder="Destination"
                      className="h-9 rounded-xl border-border/80 bg-background/75 px-3 text-sm shadow-none focus-visible:ring-1"
                    />
                    {activePlannerField === "to" && toSuggestions.length > 0 && (
                      <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-[700] rounded-xl border border-border bg-card p-1 shadow-xl">
                        {toSuggestions.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleSelectToDestination(destination.id);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/55"
                          >
                            <p className="text-sm font-medium leading-tight">{destination.name}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{destination.area}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

                <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Explore</p>
                      <h3 className="text-base font-display font-semibold mt-0.5">
                        {selectedDestination
                          ? `${visibleDestinations.length} places near ${selectedDestination.name}`
                          : `${viewportDestinations.length} destination${viewportDestinations.length !== 1 ? "s" : ""} in view`}
                      </h3>
                    </div>
                    {selectedId && (
                      <button
                        type="button"
                        onClick={handleBackToAll}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-border hover:bg-accent transition-colors"
                      >
                        All Places
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/75 mt-1 leading-relaxed">
                    {selectedDestination
                      ? `Showing destinations within roughly 220 km of ${selectedDestination.name}.`
                      : "Drag map and tap pins to reveal nearby places."}
                  </p>
                </div>

                <div className="space-y-1.5">
              {visibleDestinations.map((destination) => {
                const distanceLabel = hasDistance(destination) ? `${destination.distance.toFixed(0)} km away` : null;
                const isSelected = destination.id === selectedId;
                const isHovered = destination.id === hoveredId;
                const popularPlacesForDestination = livePopularPlacesByDestination[destination.id] ?? [];

                return (
                  <div
                    key={destination.id}
                    onMouseEnter={() => setHoveredId(destination.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`rounded-lg border bg-background transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-400/60 bg-accent/45 shadow-sm"
                        : isHovered
                          ? "border-border/80 bg-accent/25"
                          : "border-border hover:border-border/80 hover:bg-accent/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDestination(destination.id)}
                      className="w-full text-left p-2"
                    >
                      <div className="flex gap-3 items-start">
                        <img
                          src={destination.img}
                          alt={destination.name}
                          className="h-12 w-12 rounded-md object-cover shrink-0 transition-transform duration-200"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-tight">{destination.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{destination.category}</p>
                          <p className="text-xs text-muted-foreground mt-1">{destination.area}</p>
                          {distanceLabel && (
                            <p className="text-xs font-medium text-foreground/80 mt-1">{distanceLabel}</p>
                          )}
                        </div>
                      </div>
                    </button>

                    {liveLocation.status === "ready" && popularPlacesForDestination.length > 0 && (
                      <div className="border-t border-border/70 px-2 pb-2 pt-1.5">
                        <div className="space-y-1">
                          {popularPlacesForDestination.map((item) => (
                            <div key={item.id} className="rounded-md border border-sky-200/70 bg-sky-50/55 px-2 py-1.5">
                              <div className="flex items-start gap-2">
                                {item.place.image && (
                                  <img
                                    src={item.place.image}
                                    alt={item.place.name}
                                    className="h-10 w-10 rounded-md object-cover shrink-0"
                                    loading="lazy"
                                  />
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-semibold text-foreground truncate">{item.place.name}</p>
                                    <span className="rounded-sm border border-sky-200 bg-sky-100/75 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-900/75">
                                      Popular
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Best visit time: {item.place.duration}
                                  </p>
                                  <p className="mt-0.5 text-[10px] italic text-sky-900/75">{item.place.note}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
            </div>

            <div className="relative h-full min-h-[340px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]">
              <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-full border border-white/55 bg-white/94 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-foreground/75 shadow-sm backdrop-blur-sm uppercase">
                Drag Map • Click Pins
              </div>
              {liveLocation.status === "ready" && (
                <div className="pointer-events-none absolute left-4 top-14 z-[500] rounded-md border border-sky-200/80 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-sky-900/80 shadow-sm backdrop-blur-sm">
                  Live location area active
                </div>
              )}
              <div ref={mapNodeRef} className="explore-map-shell absolute inset-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
