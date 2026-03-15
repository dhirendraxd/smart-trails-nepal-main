import destKathmandu from "@/assets/dest-kathmandu.jpg";
import destPokhara from "@/assets/dest-pokhara.jpg";
import destEverest from "@/assets/dest-everest.jpg";
import destChitwan from "@/assets/dest-chitwan.jpg";
import destAnnapurna from "@/assets/dest-annapurna.jpg";
import destLumbini from "@/assets/dest-lumbini.jpg";

export type CrowdLevel = "Quiet" | "Moderate" | "Busy";
export type DifficultyLevel = "Easy" | "Moderate" | "Challenging";

export type DestinationPhoto = {
  id: string;
  src: string;
  locationName: string;
  bestViewTime: string;
  crowd: CrowdLevel;
};

export type Destination = {
  id: string;
  name: string;
  img: string;
  category: string;
  coords: [number, number];
  area: string;
  crowd: CrowdLevel;
  bestSeason: string;
  budgetPerDayUsd: string;
  budgetPerDayNpr: string;
  altitudeM: number;
  difficulty: DifficultyLevel;
  gallery: DestinationPhoto[];
};

export type DestinationWithDistance = Destination & {
  distance: number;
};

export const KATHMANDU_COORDS: [number, number] = [27.7172, 85.324];
const EARTH_RADIUS_KM = 6371;

export const distanceKm = (from: [number, number], to: [number, number]) => {
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

export const destinations: Destination[] = [
  {
    id: "kathmandu",
    name: "Kathmandu Valley",
    img: destKathmandu,
    category: "Heritage & Culture",
    coords: [27.7172, 85.324],
    area: "Bagmati Region",
    crowd: "Busy",
    bestSeason: "Oct–Dec",
    budgetPerDayUsd: "$45–$80",
    budgetPerDayNpr: "NPR 6,000–10,500",
    altitudeM: 1400,
    difficulty: "Easy",
    gallery: [
      {
        id: "kathmandu-durbar",
        src: destKathmandu,
        locationName: "Kathmandu Durbar Square",
        bestViewTime: "Early morning (7:00–9:00)",
        crowd: "Busy",
      },
      {
        id: "swayambhu-view",
        src: destPokhara,
        locationName: "Swayambhunath Hill Viewpoint",
        bestViewTime: "Golden hour before sunset",
        crowd: "Moderate",
      },
      {
        id: "pashupatinath-steps",
        src: destLumbini,
        locationName: "Pashupatinath River Steps",
        bestViewTime: "Late afternoon (4:00–5:30)",
        crowd: "Busy",
      },
      {
        id: "bhaktapur-lane",
        src: destChitwan,
        locationName: "Bhaktapur Heritage Lane",
        bestViewTime: "Weekday morning",
        crowd: "Moderate",
      },
    ],
  },
  {
    id: "pokhara",
    name: "Pokhara",
    img: destPokhara,
    category: "Lake & Mountains",
    coords: [28.2096, 83.9856],
    area: "Gandaki Region",
    crowd: "Moderate",
    bestSeason: "Sep–Nov",
    budgetPerDayUsd: "$40–$70",
    budgetPerDayNpr: "NPR 5,300–9,300",
    altitudeM: 822,
    difficulty: "Easy",
    gallery: [
      {
        id: "phewa-lakeside",
        src: destPokhara,
        locationName: "Phewa Lake Lakeside",
        bestViewTime: "Sunrise (6:00–7:00)",
        crowd: "Moderate",
      },
      {
        id: "sarangkot-ridge",
        src: destAnnapurna,
        locationName: "Sarangkot Ridge",
        bestViewTime: "Sunrise before 6:30",
        crowd: "Busy",
      },
      {
        id: "peace-pagoda",
        src: destEverest,
        locationName: "World Peace Pagoda Viewpoint",
        bestViewTime: "Late afternoon",
        crowd: "Moderate",
      },
      {
        id: "begnas-shore",
        src: destKathmandu,
        locationName: "Begnas Lake Shore",
        bestViewTime: "Early morning",
        crowd: "Quiet",
      },
    ],
  },
  {
    id: "everest",
    name: "Everest Region",
    img: destEverest,
    category: "Trekking & Adventure",
    coords: [27.932, 86.761],
    area: "Khumbu Region",
    crowd: "Busy",
    bestSeason: "Apr–May",
    budgetPerDayUsd: "$70–$120",
    budgetPerDayNpr: "NPR 9,300–16,000",
    altitudeM: 5364,
    difficulty: "Challenging",
    gallery: [
      {
        id: "namche-overlook",
        src: destEverest,
        locationName: "Namche Bazaar Overlook",
        bestViewTime: "Clear morning",
        crowd: "Moderate",
      },
      {
        id: "tengboche-view",
        src: destAnnapurna,
        locationName: "Tengboche Monastery View",
        bestViewTime: "Mid-morning",
        crowd: "Moderate",
      },
      {
        id: "kalapatthar-point",
        src: destPokhara,
        locationName: "Kala Patthar Summit View",
        bestViewTime: "Sunrise on a clear day",
        crowd: "Busy",
      },
      {
        id: "phakding-trail",
        src: destKathmandu,
        locationName: "Phakding Riverside Trail",
        bestViewTime: "Late morning",
        crowd: "Quiet",
      },
    ],
  },
  {
    id: "chitwan",
    name: "Chitwan",
    img: destChitwan,
    category: "Wildlife Safari",
    coords: [27.5291, 84.3542],
    area: "Terai Region",
    crowd: "Quiet",
    bestSeason: "Oct–Mar",
    budgetPerDayUsd: "$35–$60",
    budgetPerDayNpr: "NPR 4,700–8,000",
    altitudeM: 415,
    difficulty: "Easy",
    gallery: [
      {
        id: "rapti-river",
        src: destChitwan,
        locationName: "Rapti River Bank",
        bestViewTime: "Sunset canoe hour",
        crowd: "Moderate",
      },
      {
        id: "sauraha-watchtower",
        src: destLumbini,
        locationName: "Sauraha Watchtower",
        bestViewTime: "Early morning safari",
        crowd: "Quiet",
      },
      {
        id: "elephant-grassland",
        src: destKathmandu,
        locationName: "Elephant Grassland Track",
        bestViewTime: "Late afternoon",
        crowd: "Quiet",
      },
      {
        id: "tharu-village",
        src: destPokhara,
        locationName: "Tharu Cultural Village",
        bestViewTime: "Evening performance time",
        crowd: "Moderate",
      },
    ],
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    img: destAnnapurna,
    category: "Trekking",
    coords: [28.5961, 83.8203],
    area: "Annapurna Region",
    crowd: "Moderate",
    bestSeason: "Mar–May",
    budgetPerDayUsd: "$55–$95",
    budgetPerDayNpr: "NPR 7,300–12,700",
    altitudeM: 5416,
    difficulty: "Challenging",
    gallery: [
      {
        id: "thorong-la",
        src: destAnnapurna,
        locationName: "Thorong La Pass Approach",
        bestViewTime: "Early morning crossing window",
        crowd: "Busy",
      },
      {
        id: "manang-valley",
        src: destEverest,
        locationName: "Manang Valley Ridge",
        bestViewTime: "Midday clear skies",
        crowd: "Moderate",
      },
      {
        id: "poonhill-summit",
        src: destPokhara,
        locationName: "Poon Hill Summit",
        bestViewTime: "Before sunrise",
        crowd: "Busy",
      },
      {
        id: "ghandruk-view",
        src: destKathmandu,
        locationName: "Ghandruk Village Viewpoint",
        bestViewTime: "Late afternoon",
        crowd: "Moderate",
      },
    ],
  },
  {
    id: "lumbini",
    name: "Lumbini",
    img: destLumbini,
    category: "Spiritual Pilgrimage",
    coords: [27.4833, 83.276],
    area: "Lumbini Region",
    crowd: "Quiet",
    bestSeason: "Nov–Feb",
    budgetPerDayUsd: "$30–$55",
    budgetPerDayNpr: "NPR 4,000–7,300",
    altitudeM: 150,
    difficulty: "Easy",
    gallery: [
      {
        id: "maya-devi",
        src: destLumbini,
        locationName: "Maya Devi Temple Courtyard",
        bestViewTime: "Morning calm hours",
        crowd: "Quiet",
      },
      {
        id: "monastic-zone",
        src: destChitwan,
        locationName: "Monastic Zone Walkway",
        bestViewTime: "Late afternoon",
        crowd: "Quiet",
      },
      {
        id: "peace-flame",
        src: destKathmandu,
        locationName: "Lumbini Peace Flame",
        bestViewTime: "Sunset",
        crowd: "Moderate",
      },
      {
        id: "sacred-garden",
        src: destPokhara,
        locationName: "Sacred Garden North Path",
        bestViewTime: "Early morning",
        crowd: "Quiet",
      },
    ],
  },
];

export const getDestinationById = (id: string) => destinations.find((destination) => destination.id === id) ?? null;

export const getNearbyDestinations = (id: string, limit = 4): DestinationWithDistance[] => {
  const destination = getDestinationById(id);

  if (!destination) return [];

  return destinations
    .filter((candidate) => candidate.id !== destination.id)
    .map((candidate) => ({
      ...candidate,
      distance: distanceKm(destination.coords, candidate.coords),
    }))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, limit);
};
