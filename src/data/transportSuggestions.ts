export type TransportOptionId = "local-bus" | "tourist-bus" | "luxury-bus" | "private-car" | "domestic-flight";

export interface TransportSuggestion {
  name: string;
  type: string;
  reviewScore: number;
  note: string;
  fareFrom: number;
}

type SuggestionMap = Record<string, Partial<Record<TransportOptionId, TransportSuggestion[]>>>;

const fallbackSuggestions: Record<TransportOptionId, TransportSuggestion[]> = {
  "local-bus": [
    {
      name: "Local Greenline Connector",
      type: "Shared local bus",
      reviewScore: 4.1,
      note: "Low-cost option with frequent departures.",
      fareFrom: 5,
    },
    {
      name: "CityLink Traveller Bus",
      type: "Regional bus",
      reviewScore: 4.0,
      note: "Good for flexible travel on a tight budget.",
      fareFrom: 6,
    },
  ],
  "tourist-bus": [
    {
      name: "Greenline Tours",
      type: "Tourist bus",
      reviewScore: 4.5,
      note: "Reliable and popular for intercity routes.",
      fareFrom: 15,
    },
    {
      name: "Mountain Overland",
      type: "Tourist coach",
      reviewScore: 4.4,
      note: "Well-rated for comfort and punctuality.",
      fareFrom: 17,
    },
  ],
  "luxury-bus": [
    {
      name: "Sofa Bus Nepal",
      type: "Luxury coach",
      reviewScore: 4.7,
      note: "Known for reclining seats and smoother rides.",
      fareFrom: 26,
    },
    {
      name: "Jagadamba Premium",
      type: "VIP bus",
      reviewScore: 4.6,
      note: "Good reviews for comfort and onboard service.",
      fareFrom: 28,
    },
  ],
  "private-car": [
    {
      name: "Nepal Drive Transfers",
      type: "Private car",
      reviewScore: 4.8,
      note: "Highly rated for safe drivers and door-to-door service.",
      fareFrom: 48,
    },
    {
      name: "Himalayan Rides",
      type: "Private transfer",
      reviewScore: 4.7,
      note: "Popular for flexibility and comfort.",
      fareFrom: 52,
    },
  ],
  "domestic-flight": [
    {
      name: "Buddha Air",
      type: "Domestic flight",
      reviewScore: 4.5,
      note: "Widely used with strong service reputation.",
      fareFrom: 82,
    },
    {
      name: "Yeti Airlines",
      type: "Domestic flight",
      reviewScore: 4.4,
      note: "Good option for faster regional travel.",
      fareFrom: 85,
    },
  ],
};

const destinationSuggestions: SuggestionMap = {
  kathmandu: {
    "tourist-bus": [
      {
        name: "Greenline Kathmandu",
        type: "Tourist bus",
        reviewScore: 4.6,
        note: "Frequent and comfortable for Kathmandu routes.",
        fareFrom: 16,
      },
      {
        name: "Mountain Overland",
        type: "Tourist coach",
        reviewScore: 4.4,
        note: "Well-reviewed for Kathmandu–Pokhara transfers.",
        fareFrom: 17,
      },
    ],
    "luxury-bus": [
      {
        name: "Jagadamba Premium",
        type: "Luxury coach",
        reviewScore: 4.7,
        note: "Top comfort option from Kathmandu to major cities.",
        fareFrom: 29,
      },
      {
        name: "Sofa Bus Nepal",
        type: "VIP sleeper-style bus",
        reviewScore: 4.6,
        note: "Praised for wider seats and air suspension.",
        fareFrom: 30,
      },
    ],
    "private-car": [
      {
        name: "Kathmandu Valley Car Hire",
        type: "Private car",
        reviewScore: 4.8,
        note: "Strong ratings for city tours and flexible pickups.",
        fareFrom: 50,
      },
      {
        name: "Nepal Drive Transfers",
        type: "Private SUV",
        reviewScore: 4.7,
        note: "Good choice for day trips and airport pickups.",
        fareFrom: 55,
      },
    ],
  },
  pokhara: {
    "tourist-bus": [
      {
        name: "Pokhara Tourist Coach",
        type: "Tourist bus",
        reviewScore: 4.5,
        note: "Well-liked for the Kathmandu–Pokhara route.",
        fareFrom: 16,
      },
      {
        name: "Greenline Pokhara",
        type: "Tourist coach",
        reviewScore: 4.6,
        note: "Known for comfortable seats and on-time departures.",
        fareFrom: 18,
      },
    ],
    "luxury-bus": [
      {
        name: "Sofa Bus Pokhara Express",
        type: "Luxury bus",
        reviewScore: 4.7,
        note: "High comfort option with strong user reviews.",
        fareFrom: 28,
      },
    ],
    "private-car": [
      {
        name: "Pokhara Private Rides",
        type: "Private car",
        reviewScore: 4.8,
        note: "Great for lakeside pickup and scenic day trips.",
        fareFrom: 46,
      },
      {
        name: "Himalayan Rides Pokhara",
        type: "Private jeep",
        reviewScore: 4.7,
        note: "Popular for flexibility around Pokhara valley.",
        fareFrom: 52,
      },
    ],
    "domestic-flight": [
      {
        name: "Buddha Air",
        type: "Kathmandu–Pokhara flight",
        reviewScore: 4.5,
        note: "Fastest option with frequent departures.",
        fareFrom: 84,
      },
    ],
  },
  chitwan: {
    "tourist-bus": [
      {
        name: "Sauraha Tourist Bus",
        type: "Tourist bus",
        reviewScore: 4.4,
        note: "Convenient for direct park-area access.",
        fareFrom: 15,
      },
    ],
    "private-car": [
      {
        name: "Chitwan Safari Transfers",
        type: "Private jeep",
        reviewScore: 4.7,
        note: "Good for lodge drop-offs and safari timing.",
        fareFrom: 49,
      },
    ],
  },
};

export function getTransportSuggestions(destinationId: string, transportId: TransportOptionId): TransportSuggestion[] {
  return destinationSuggestions[destinationId]?.[transportId] ?? fallbackSuggestions[transportId];
}
