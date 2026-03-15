export interface Region {
  id: string;
  name: string;
  lat: number;
  lng: number;
  touristCount: number;
  capacity: number;
  category: string;
  avgCost: number;
  weatherCondition: "clear" | "rain" | "storm" | "cloudy";
  temperature: number;
  riskAlert?: string;
}

export const nepalRegions: Region[] = [
  {
    id: "kathmandu",
    name: "Kathmandu Valley",
    lat: 27.7172,
    lng: 85.324,
    touristCount: 8500,
    capacity: 10000,
    category: "culture",
    avgCost: 45,
    weatherCondition: "clear",
    temperature: 22,
  },
  {
    id: "pokhara",
    name: "Pokhara",
    lat: 28.2096,
    lng: 83.9856,
    touristCount: 6200,
    capacity: 7000,
    category: "nature",
    avgCost: 38,
    weatherCondition: "cloudy",
    temperature: 19,
  },
  {
    id: "chitwan",
    name: "Chitwan National Park",
    lat: 27.5291,
    lng: 84.3542,
    touristCount: 3100,
    capacity: 5000,
    category: "nature",
    avgCost: 55,
    weatherCondition: "clear",
    temperature: 28,
  },
  {
    id: "lumbini",
    name: "Lumbini",
    lat: 27.4833,
    lng: 83.2767,
    touristCount: 1800,
    capacity: 4000,
    category: "culture",
    avgCost: 30,
    weatherCondition: "clear",
    temperature: 26,
  },
  {
    id: "everest",
    name: "Everest Region",
    lat: 27.9881,
    lng: 86.925,
    touristCount: 4800,
    capacity: 3500,
    category: "adventure",
    avgCost: 120,
    weatherCondition: "storm",
    temperature: -5,
    riskAlert: "Severe weather warning – high altitude storms expected",
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    lat: 28.5965,
    lng: 83.8203,
    touristCount: 3900,
    capacity: 4500,
    category: "adventure",
    avgCost: 85,
    weatherCondition: "cloudy",
    temperature: 8,
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    lat: 28.2139,
    lng: 85.5619,
    touristCount: 900,
    capacity: 2000,
    category: "nature",
    avgCost: 60,
    weatherCondition: "clear",
    temperature: 12,
  },
  {
    id: "bhaktapur",
    name: "Bhaktapur",
    lat: 27.6722,
    lng: 85.4298,
    touristCount: 2800,
    capacity: 3500,
    category: "culture",
    avgCost: 25,
    weatherCondition: "clear",
    temperature: 21,
  },
  {
    id: "nagarkot",
    name: "Nagarkot",
    lat: 27.7152,
    lng: 85.5195,
    touristCount: 1200,
    capacity: 2500,
    category: "nature",
    avgCost: 35,
    weatherCondition: "cloudy",
    temperature: 16,
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    lat: 29.1899,
    lng: 83.9642,
    touristCount: 600,
    capacity: 1500,
    category: "adventure",
    avgCost: 150,
    weatherCondition: "clear",
    temperature: 5,
  },
];

export function getDensityLevel(region: Region): "low" | "moderate" | "high" | "overcrowded" {
  const ratio = region.touristCount / region.capacity;
  if (ratio < 0.4) return "low";
  if (ratio < 0.7) return "moderate";
  if (ratio < 1) return "high";
  return "overcrowded";
}

export function getDensityColor(level: "low" | "moderate" | "high" | "overcrowded"): string {
  switch (level) {
    case "low": return "#22c55e";
    case "moderate": return "#eab308";
    case "high": return "#f97316";
    case "overcrowded": return "#ef4444";
  }
}
