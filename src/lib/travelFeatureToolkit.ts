import {
  destinations,
  distanceKm,
  type CrowdLevel,
  type Destination,
  type DifficultyLevel,
} from "@/data/destinations";

export type ForecastTrend = "Busier" | "Steady" | "Quieter";

export type DestinationForecast = {
  trend: ForecastTrend;
  confidence: "High" | "Medium";
  crowdIndex: [number, number, number];
  headline: string;
  reason: string;
  action: string;
};

export type HiddenGemSuggestion = {
  destination: Destination;
  crowdReductionPercent: number;
  reason: string;
};

export type PermitProfile = {
  permits: string[];
  gear: string[];
  notes: string[];
};

export type SafetyProfile = {
  risk: "Low" | "Moderate" | "High";
  emergencyHub: string;
  warning: string;
  helicopterSupport: string;
  checklist: string[];
};

const crowdScoreByLevel: Record<CrowdLevel, number> = {
  Quiet: 34,
  Moderate: 58,
  Busy: 82,
};

const difficultyMomentum: Record<DifficultyLevel, number> = {
  Easy: 5,
  Moderate: 1,
  Challenging: -4,
};

const categoryMomentum = (category: string) => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("heritage")) return 6;
  if (normalizedCategory.includes("lake")) return 5;
  if (normalizedCategory.includes("wildlife")) return 2;
  if (normalizedCategory.includes("spiritual")) return 1;
  if (normalizedCategory.includes("popular")) return 4;
  if (normalizedCategory.includes("trek")) return 3;
  return 0;
};

const monthIndexByLabel: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getStableHash = (value: string) =>
  [...value].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);

const parseSeasonWindow = (bestSeason: string) => {
  const [startLabel, endLabel] = bestSeason.split(/[–-]/).map((part) => part.trim().slice(0, 3).toLowerCase());
  const start = monthIndexByLabel[startLabel];
  const end = monthIndexByLabel[endLabel];

  if (typeof start !== "number" || typeof end !== "number") {
    return null;
  }

  return { start, end };
};

const getSeasonModifier = (bestSeason: string, referenceDate = new Date()) => {
  const seasonWindow = parseSeasonWindow(bestSeason);

  if (!seasonWindow) {
    return 0;
  }

  const month = referenceDate.getMonth();
  const { start, end } = seasonWindow;
  const inWindow = start <= end ? month >= start && month <= end : month >= start || month <= end;

  if (inWindow) {
    return 10;
  }

  const shoulderMonths = [
    (start + 11) % 12,
    (start + 1) % 12,
    (end + 11) % 12,
    (end + 1) % 12,
  ];

  return shoulderMonths.includes(month) ? 4 : -6;
};

const getForecastReason = (destination: Destination, trend: ForecastTrend, inSeasonLift: number) => {
  if (trend === "Busier") {
    if (inSeasonLift > 0) {
      return `Peak travel months are boosting demand for ${destination.name}.`;
    }

    return `${destination.name} is gaining momentum because it is easy to access and popular with first-time travelers.`;
  }

  if (trend === "Quieter") {
    if (destination.difficulty === "Challenging") {
      return `Higher altitude and trek logistics are keeping traffic softer over the next few weeks.`;
    }

    return `This destination is staying calmer than Nepal's classic hotspots right now.`;
  }

  return `Travel demand looks balanced, so conditions should stay fairly consistent week to week.`;
};

const getForecastAction = (destination: Destination, trend: ForecastTrend) => {
  if (trend === "Busier") {
    return `Book transport and sunrise slots early if ${destination.name} is your priority.`;
  }

  if (trend === "Quieter") {
    return `This is a good moment to travel here if you want lighter crowds and more flexible stays.`;
  }

  return `Keep the plan flexible and use the map to compare nearby alternatives before you commit.`;
};

export const crowdLevelToScore = (crowd: CrowdLevel) => crowdScoreByLevel[crowd];

export const getDestinationForecast = (
  destination: Destination,
  referenceDate = new Date(),
): DestinationForecast => {
  const crowdBase = crowdScoreByLevel[destination.crowd];
  const seasonLift = getSeasonModifier(destination.bestSeason, referenceDate);
  const altitudeLift = destination.altitudeM > 4500 ? -7 : destination.altitudeM > 2800 ? -2 : 4;
  const difficultyLift = difficultyMomentum[destination.difficulty];
  const categoryLift = categoryMomentum(destination.category);
  const hash = getStableHash(destination.id);
  const demandWave = ((hash + referenceDate.getMonth() * 9) % 11) - 5;
  const trendSeed = Math.round((seasonLift + difficultyLift + demandWave) / 3);
  const weekOne = clamp(crowdBase + seasonLift + altitudeLift + categoryLift, 18, 96);
  const weekTwo = clamp(weekOne + Math.round(trendSeed / 2), 18, 97);
  const weekThree = clamp(weekTwo + Math.round((trendSeed + difficultyLift) / 2), 18, 98);
  const delta = weekThree - weekOne;
  const trend: ForecastTrend = delta >= 6 ? "Busier" : delta <= -6 ? "Quieter" : "Steady";

  return {
    trend,
    confidence: Math.abs(delta) >= 9 || Math.abs(seasonLift) >= 8 ? "High" : "Medium",
    crowdIndex: [weekOne, weekTwo, weekThree],
    headline:
      trend === "Busier"
        ? `${destination.name} looks busier over the next 3 weeks.`
        : trend === "Quieter"
          ? `${destination.name} should ease off compared with this week.`
          : `${destination.name} looks stable over the next 3 weeks.`,
    reason: getForecastReason(destination, trend, seasonLift),
    action: getForecastAction(destination, trend),
  };
};

const permitProfilesByDestination: Record<string, PermitProfile> = {
  kathmandu: {
    permits: ["Heritage site entry tickets at major squares and stupas"],
    gear: ["Comfortable walking shoes", "Sun protection", "Light rain layer"],
    notes: ["No trekking permit is needed for city exploration inside the valley."],
  },
  pokhara: {
    permits: ["No trekking permit for city sights", "Local tickets may apply for viewpoint activities"],
    gear: ["Light layer", "Walking shoes", "Reusable water bottle"],
    notes: ["Trekking permits start to matter once you move into protected mountain routes."],
  },
  everest: {
    permits: ["Sagarmatha National Park entry", "Khumbu local municipality permit"],
    gear: ["Down or insulated jacket", "Trekking poles", "Water purification", "Warm gloves"],
    notes: ["High-altitude plans should be confirmed locally before departure."],
  },
  chitwan: {
    permits: ["National park entry pass for safari zones"],
    gear: ["Neutral-colour clothing", "Insect repellent", "Binoculars"],
    notes: ["Safari activity permits are often arranged through lodges or guides."],
  },
  annapurna: {
    permits: ["Annapurna Conservation Area Permit (ACAP)"],
    gear: ["Layered trekking system", "Headlamp", "Trekking poles", "Warm base layers"],
    notes: ["Check the latest local rules for guide and permit updates before trekking."],
  },
  lumbini: {
    permits: ["No trekking permit required", "Some heritage compounds may have entry fees"],
    gear: ["Sun hat", "Refillable water bottle", "Modest clothing layer"],
    notes: ["Dress respectfully when visiting temples and monastic areas."],
  },
  "everest-base-camp": {
    permits: ["Sagarmatha National Park entry", "Khumbu local municipality permit"],
    gear: ["High-altitude layers", "Sleeping gear backup", "Trekking poles", "Water purification"],
    notes: ["Altitude acclimatization days are essential on this route."],
  },
  "rara-lake": {
    permits: ["Rara National Park entry pass"],
    gear: ["Warm mid-layers", "Trail shoes", "Offline maps", "Power bank"],
    notes: ["Transport connections can shift quickly in remote western Nepal."],
  },
};

export const getPermitProfile = (destination: Destination): PermitProfile =>
  permitProfilesByDestination[destination.id] ?? {
    permits: ["Check local entry rules before arrival"],
    gear: ["Daypack", "Water bottle", "Weather layer"],
    notes: ["Local operators or tourism offices can confirm any changing rules."],
  };

export const getPackingList = (destination: Destination) => {
  const gear = new Set<string>(["Reusable water bottle", "Power bank", "Sun protection"]);

  if (destination.altitudeM > 3000) {
    gear.add("Insulated outer layer");
    gear.add("Warm hat and gloves");
  }

  if (destination.difficulty !== "Easy") {
    gear.add("Trail shoes or boots");
    gear.add("Trekking pole support");
  }

  if (destination.category.toLowerCase().includes("wildlife")) {
    gear.add("Insect repellent");
    gear.add("Neutral-colour clothing");
  }

  if (destination.category.toLowerCase().includes("heritage") || destination.category.toLowerCase().includes("spiritual")) {
    gear.add("Modest shoulder cover");
  }

  if (destination.category.toLowerCase().includes("lake")) {
    gear.add("Light wind layer");
  }

  return [...gear].slice(0, 7);
};

const emergencyHubByDestination: Record<string, string> = {
  kathmandu: "Kathmandu emergency hub",
  pokhara: "Pokhara emergency hub",
  everest: "Lukla and Kathmandu evacuation coordination",
  chitwan: "Bharatpur emergency hub",
  annapurna: "Pokhara emergency hub",
  lumbini: "Bhairahawa emergency hub",
  "everest-base-camp": "Lukla and Kathmandu evacuation coordination",
  "rara-lake": "Nepalgunj remote support hub",
};

export const getSafetyProfile = (destination: Destination): SafetyProfile => {
  if (destination.altitudeM >= 4500) {
    return {
      risk: "High",
      emergencyHub: emergencyHubByDestination[destination.id] ?? "Nearest regional emergency hub",
      warning: "High-altitude risk is significant here. Plan acclimatization, slow ascent, and same-day descent options.",
      helicopterSupport: "Weather-dependent helicopter evacuation is the main backup once you are deep on the route.",
      checklist: [
        "Share a check-in plan before trekking",
        "Carry cash, power, and water purification",
        "Monitor headache, nausea, and shortness of breath early",
      ],
    };
  }

  if (destination.altitudeM >= 2500) {
    return {
      risk: "Moderate",
      emergencyHub: emergencyHubByDestination[destination.id] ?? "Nearest regional emergency hub",
      warning: "Altitude can affect new arrivals here, especially if you increase elevation too quickly.",
      helicopterSupport: "Road or flight support depends on the region, so keep a buffer day in your plan.",
      checklist: [
        "Hydrate consistently",
        "Keep a warm layer accessible",
        "Confirm transport fallback before leaving the last major town",
      ],
    };
  }

  return {
    risk: "Low",
    emergencyHub: emergencyHubByDestination[destination.id] ?? "Nearest regional emergency hub",
    warning: "General travel caution is enough for most visitors, but weather and transport can still shift fast.",
    helicopterSupport: "Ground transport is usually the most practical emergency fallback here.",
    checklist: [
      "Save local accommodation contacts",
      "Keep a charged phone and cash reserve",
      "Share your route if you head into quieter areas",
    ],
  };
};

const foodTipByDestination: Record<string, string> = {
  kathmandu: "Try a Newari snack stop or momo break between heritage sites.",
  pokhara: "A lakeside thakali set or fresh local trout works well after sunset walks.",
  everest: "Garlic soup and simple hot meals are a classic acclimatization choice in the Khumbu.",
  chitwan: "A Tharu-style meal pairs well with an evening cultural stop in Sauraha.",
  annapurna: "A warm thakali set is the easiest high-energy meal on trekking days.",
  lumbini: "Keep meals light and hydrating for long, warm monastery walks.",
  "everest-base-camp": "Plan simple hot meals and plenty of fluids on this route.",
  "rara-lake": "Remote lodges are simple, so keep snack backups in your daypack.",
};

export const getSmartInsight = (
  destination: Destination,
  forecast: DestinationForecast,
  hiddenGems: HiddenGemSuggestion[],
  liveNearbyCount: number,
) => {
  const hiddenGem = hiddenGems[0];

  if (forecast.trend === "Busier" && hiddenGem) {
    return `${destination.name} is trending busier, so consider an early start or pivot to ${hiddenGem.destination.name} for a calmer version of the same travel mood.`;
  }

  if (forecast.trend === "Quieter") {
    return `${destination.name} is in a softer demand window, which means more room to travel slowly and compare nearby stops before booking.`;
  }

  return liveNearbyCount > 0
    ? `${destination.name} is relatively stable right now, and your live nearby view gives you backup options if the main stop feels too busy when you arrive.`
    : `${destination.name} is relatively stable, so this is a good destination to pair with a nearby second stop in the same trip.`;
};

export const getDailyBriefing = (
  destination: Destination,
  forecast: DestinationForecast,
  weatherSummary?: string | null,
) => ({
  headline: `Today's ${destination.name} briefing`,
  bullets: [
    weatherSummary ?? `Travel window: ${forecast.trend === "Busier" ? "go early in the day" : "keep the plan flexible and slow-paced"}.`,
    `Crowd outlook: ${forecast.reason}`,
    `Action: ${forecast.action}`,
  ],
  foodTip: foodTipByDestination[destination.id] ?? "Keep meals simple, hydrating, and easy to find near your stop.",
});

export const getHiddenGemSuggestions = (selectedDestination: Destination | null, limit = 3): HiddenGemSuggestion[] => {
  if (!selectedDestination) {
    return destinations
      .filter((destination) => destination.crowd === "Quiet")
      .slice(0, limit)
      .map((destination) => ({
        destination,
        crowdReductionPercent: 55,
        reason: `${destination.name} stays calmer than Nepal's headline stops and works well for low-crowd exploration.`,
      }));
  }

  const selectedCrowdScore = crowdScoreByLevel[selectedDestination.crowd];
  const selectedCategoryTokens = selectedDestination.category.toLowerCase().split(/[^a-z]+/).filter(Boolean);

  return destinations
    .filter((candidate) => candidate.id !== selectedDestination.id)
    .map((candidate) => {
      const candidateCrowdScore = crowdScoreByLevel[candidate.crowd];
      const sharedCategoryWords = candidate.category
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => selectedCategoryTokens.includes(word)).length;
      const similarityScore =
        (candidate.difficulty === selectedDestination.difficulty ? 18 : 0) +
        sharedCategoryWords * 10 +
        (Math.abs(candidate.altitudeM - selectedDestination.altitudeM) <= 1600 ? 7 : 0) +
        (distanceKm(candidate.coords, selectedDestination.coords) <= 320 ? 10 : 0) +
        (candidate.crowd === "Quiet" ? 12 : 0) +
        (candidate.id === "rara-lake" ? 6 : 0);
      const crowdReductionPercent = clamp(
        Math.round(((selectedCrowdScore - candidateCrowdScore) / Math.max(selectedCrowdScore, 1)) * 100),
        12,
        95,
      );

      return {
        destination: candidate,
        score: similarityScore - candidateCrowdScore / 4,
        crowdReductionPercent,
      };
    })
    .filter((candidate) => candidate.crowdReductionPercent >= 15)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((candidate) => ({
      destination: candidate.destination,
      crowdReductionPercent: candidate.crowdReductionPercent,
      reason: `${candidate.destination.name} gives you a similar Nepal vibe with fewer crowd pinch points than ${selectedDestination.name}.`,
    }));
};

export const parseBudgetRange = (value: string) => {
  const numbers = value
    .replace(/[^\d–-]/g, "")
    .split(/[–-]/)
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));

  if (numbers.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: numbers[0],
    max: numbers[numbers.length - 1] ?? numbers[0],
  };
};

export const getBudgetEstimate = ({
  destination,
  days,
  travelers,
  comfortMultiplier,
  usdToNprRate,
}: {
  destination: Destination;
  days: number;
  travelers: number;
  comfortMultiplier: number;
  usdToNprRate: number;
}) => {
  const tripDays = clamp(days, 1, 30);
  const tripTravelers = clamp(travelers, 1, 8);
  const { min, max } = parseBudgetRange(destination.budgetPerDayUsd);
  const totalUsdMin = Math.round(min * tripDays * tripTravelers * comfortMultiplier);
  const totalUsdMax = Math.round(max * tripDays * tripTravelers * comfortMultiplier);

  return {
    totalUsdMin,
    totalUsdMax,
    totalNprMin: Math.round(totalUsdMin * usdToNprRate),
    totalNprMax: Math.round(totalUsdMax * usdToNprRate),
    perDayUsdMid: Math.round(((min + max) / 2) * comfortMultiplier),
  };
};

export const getWeatherCodeLabel = (weatherCode: number) => {
  if (weatherCode === 0) return "Clear";
  if ([1, 2].includes(weatherCode)) return "Mostly clear";
  if (weatherCode === 3) return "Overcast";
  if ([45, 48].includes(weatherCode)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "Snow";
  if ([95, 96, 99].includes(weatherCode)) return "Storm risk";
  return "Mixed conditions";
};
