import {
  destinations,
  distanceKm,
  type Destination,
  type DestinationWithDistance,
} from "@/data/destinations";
import { getLocalExploreForDestination, type LocalExploreItem } from "@/data/localExplore";
import {
  getDestinationForecast,
  getHiddenGemSuggestions,
  getPackingList,
  getPermitProfile,
  getSafetyProfile,
} from "@/lib/travelFeatureToolkit";

export const CHAT_REQUEST_LIMIT_PER_MINUTE = 10;

export type ChatRole = "user" | "assistant";

export type ChatRequestMessage = {
  role: ChatRole;
  content: string;
};

type DestinationSummary = {
  id: string;
  name: string;
  area: string;
  category: string;
  crowd: Destination["crowd"];
  bestSeason: string;
  difficulty: Destination["difficulty"];
  altitudeM: number;
  budgetPerDayUsd: string;
  budgetPerDayNpr: string;
  detailPath: string;
};

type NearbyDestinationSummary = DestinationSummary & {
  approxDistanceKm: number;
};

type LocalExploreSummary = {
  name: string;
  duration: string;
  note: string;
  difficulty?: string;
};

type DestinationExploreSummary = {
  id: string;
  name: string;
  places: LocalExploreSummary[];
  hikes: LocalExploreSummary[];
  trails: LocalExploreSummary[];
};

type RouteSummary = {
  from: string;
  to: string;
  approxDistanceKm: number;
};

type LivePopularPlaceSummary = {
  destinationId: string;
  destinationName: string;
  name: string;
  bestVisitWindow: string;
  note: string;
  approxDistanceKm: number;
};

type ForecastSummary = {
  destinationId: string;
  destinationName: string;
  trend: string;
  headline: string;
  crowdIndex: [number, number, number];
  reason: string;
};

type HiddenGemSummary = {
  destinationId: string;
  destinationName: string;
  crowdReductionPercent: number;
  reason: string;
};

type SelectedToolkitSummary = {
  packingList: string[];
  permits: string[];
  gear: string[];
  safetyRisk: string;
  safetyWarning: string;
  emergencyHub: string;
};

export type TravelChatContext = {
  destinationCatalog: DestinationSummary[];
  destinationExploreCatalog: DestinationExploreSummary[];
  selectedDestination: DestinationSummary | null;
  fromDestination: DestinationSummary | null;
  routeSummary: RouteSummary | null;
  nearbyDestinations: NearbyDestinationSummary[];
  liveNearbyDestinations: NearbyDestinationSummary[];
  livePopularPlaces: LivePopularPlaceSummary[];
  forecastHighlights: ForecastSummary[];
  hiddenGemSuggestions: HiddenGemSummary[];
  selectedToolkit: SelectedToolkitSummary | null;
  appNavigation: {
    searchFields: ["From", "Where To"];
    actions: string[];
    notes: string[];
  };
};

type LivePopularPlaceInput = {
  destinationId: string;
  approxDistanceKm: number;
  place: {
    name: string;
    duration: string;
    note: string;
  };
};

type BuildTravelChatContextInput = {
  selectedDestination: Destination | null;
  fromDestination: Destination | null;
  nearbyDestinations: DestinationWithDistance[];
  liveNearbyDestinations: DestinationWithDistance[];
  livePopularPlaces: LivePopularPlaceInput[];
};

const roundDistanceKm = (distance: number) => Math.max(1, Math.round(distance));

const toDestinationSummary = (destination: Destination): DestinationSummary => ({
  id: destination.id,
  name: destination.name,
  area: destination.area,
  category: destination.category,
  crowd: destination.crowd,
  bestSeason: destination.bestSeason,
  difficulty: destination.difficulty,
  altitudeM: destination.altitudeM,
  budgetPerDayUsd: destination.budgetPerDayUsd,
  budgetPerDayNpr: destination.budgetPerDayNpr,
  detailPath: `/destinations/${destination.id}`,
});

const toNearbyDestinationSummary = (
  destination: DestinationWithDistance,
): NearbyDestinationSummary => ({
  ...toDestinationSummary(destination),
  approxDistanceKm: roundDistanceKm(destination.distance),
});

const toLocalExploreSummary = (item: LocalExploreItem): LocalExploreSummary => ({
  name: item.name,
  duration: item.duration,
  note: item.note,
  difficulty: item.difficulty,
});

const toDestinationExploreSummary = (destination: Destination): DestinationExploreSummary => {
  const explore = getLocalExploreForDestination(destination.id);

  return {
    id: destination.id,
    name: destination.name,
    places: explore.places.slice(0, 3).map(toLocalExploreSummary),
    hikes: explore.hikes.slice(0, 3).map(toLocalExploreSummary),
    trails: explore.trails.slice(0, 3).map(toLocalExploreSummary),
  };
};

export const buildTravelChatContext = ({
  selectedDestination,
  fromDestination,
  nearbyDestinations,
  liveNearbyDestinations,
  livePopularPlaces,
}: BuildTravelChatContextInput): TravelChatContext => {
  const activeDestination = selectedDestination ?? nearbyDestinations[0] ?? destinations[0] ?? null;
  const activeDestinationForecast = activeDestination ? getDestinationForecast(activeDestination) : null;
  const activeDestinationSafety = activeDestination ? getSafetyProfile(activeDestination) : null;
  const activeDestinationPermits = activeDestination ? getPermitProfile(activeDestination) : null;

  return {
    destinationCatalog: destinations.map(toDestinationSummary),
    destinationExploreCatalog: destinations.map(toDestinationExploreSummary),
    selectedDestination: selectedDestination ? toDestinationSummary(selectedDestination) : null,
    fromDestination: fromDestination ? toDestinationSummary(fromDestination) : null,
    routeSummary:
      selectedDestination &&
      fromDestination &&
      fromDestination.id !== selectedDestination.id
        ? {
            from: fromDestination.name,
            to: selectedDestination.name,
            approxDistanceKm: roundDistanceKm(distanceKm(fromDestination.coords, selectedDestination.coords)),
          }
        : null,
    nearbyDestinations: nearbyDestinations.slice(0, 4).map(toNearbyDestinationSummary),
    liveNearbyDestinations: liveNearbyDestinations.slice(0, 3).map(toNearbyDestinationSummary),
    livePopularPlaces: livePopularPlaces.slice(0, 5).map((item) => ({
      destinationId: item.destinationId,
      destinationName:
        destinations.find((destination) => destination.id === item.destinationId)?.name ?? item.destinationId,
      name: item.place.name,
      bestVisitWindow: item.place.duration,
      note: item.place.note,
      approxDistanceKm: roundDistanceKm(item.approxDistanceKm),
    })),
    forecastHighlights: destinations.slice(0, 6).map((destination) => {
      const forecast = getDestinationForecast(destination);

      return {
        destinationId: destination.id,
        destinationName: destination.name,
        trend: forecast.trend,
        headline: forecast.headline,
        crowdIndex: forecast.crowdIndex,
        reason: forecast.reason,
      };
    }),
    hiddenGemSuggestions: getHiddenGemSuggestions(activeDestination).map((item) => ({
      destinationId: item.destination.id,
      destinationName: item.destination.name,
      crowdReductionPercent: item.crowdReductionPercent,
      reason: item.reason,
    })),
    selectedToolkit:
      activeDestination && activeDestinationForecast && activeDestinationSafety && activeDestinationPermits
        ? {
            packingList: getPackingList(activeDestination),
            permits: activeDestinationPermits.permits,
            gear: activeDestinationPermits.gear,
            safetyRisk: activeDestinationSafety.risk,
            safetyWarning: activeDestinationSafety.warning,
            emergencyHub: activeDestinationSafety.emergencyHub,
          }
        : null,
    appNavigation: {
      searchFields: ["From", "Where To"],
      actions: [
        "Click a destination card or map pin to focus a place.",
        "Use the From and Where To fields to compare places.",
        "Use All Places to reset the map and list.",
        "Open the feature panel for heatmap, forecast, budget, safety, offline pack, and trip planner tools.",
        "Open a destination detail page for photo galleries and nearby spots.",
      ],
      notes: [
        "Approximate distances in the app are straight-line estimates, not live road travel times.",
        "The assistant only receives map context and approximate nearby places, not raw GPS coordinates.",
        "Forecasts, hidden gems, and safety recommendations are product-demo guidance and should be locally verified.",
        "For remote trekking routes, remind users to confirm transport, permits, and weather locally.",
      ],
    },
  };
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const destinationAliasRecords = destinations
  .flatMap((destination) => {
    const aliases = new Set<string>([
      destination.name.toLowerCase(),
      destination.id.replace(/-/g, " ").toLowerCase(),
    ]);

    const shortenedName = destination.name
      .replace(/\b(valley|region|circuit|lake)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (shortenedName.length >= 3) {
      aliases.add(shortenedName);
    }

    if (destination.id === "everest-base-camp") {
      aliases.add("ebc");
    }

    return [...aliases]
      .filter((alias) => alias.length >= 3)
      .map((alias) => ({ id: destination.id, alias }));
  })
  .sort((first, second) => second.alias.length - first.alias.length);

const rangesOverlap = (firstStart: number, firstEnd: number, secondStart: number, secondEnd: number) =>
  firstStart < secondEnd && secondStart < firstEnd;

export const findDestinationMentions = (text: string) => {
  const normalizedText = text.toLowerCase();
  const matches: Array<{ id: string; start: number; end: number; aliasLength: number }> = [];

  destinationAliasRecords.forEach(({ id, alias }) => {
    const matcher = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i");
    const match = matcher.exec(normalizedText);

    if (!match || typeof match.index !== "number") {
      return;
    }

    const start = match.index;
    const end = start + alias.length;
    const overlapsExistingMatch = matches.some((existingMatch) =>
      rangesOverlap(existingMatch.start, existingMatch.end, start, end),
    );

    if (overlapsExistingMatch) {
      return;
    }

    matches.push({ id, start, end, aliasLength: alias.length });
  });

  return matches
    .sort((first, second) => first.start - second.start || second.aliasLength - first.aliasLength)
    .map((match) => match.id)
    .filter((id, index, array) => array.indexOf(id) === index);
};

export const getPrimaryMentionedDestinationId = (text: string) => {
  const mentions = findDestinationMentions(text);
  return mentions.length === 1 ? mentions[0] : null;
};

export const getExploreChatSuggestions = (selectedDestination: Destination | null) => {
  if (selectedDestination) {
    return [
      `Plan me 4 days around ${selectedDestination.name} with a moderate budget and fewer crowds.`,
      `Which hikes or trails near ${selectedDestination.name} fit beginners?`,
      `What safety, permit, and gear notes should I know for ${selectedDestination.name}?`,
    ];
  }

  return [
    "7 days, $600, avoid crowds — build me a Nepal trip.",
    "What can I explore near Pokhara?",
    "How do I use this page to compare places in Nepal?",
  ];
};
