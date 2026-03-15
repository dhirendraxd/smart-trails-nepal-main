export type AccommodationOptionId = "budget" | "mid" | "premium" | "luxury";

export interface HotelSuggestion {
  name: string;
  area: string;
  reviewScore: number;
  note: string;
  nightlyFrom: number;
}

type SuggestionMap = Record<string, Partial<Record<AccommodationOptionId, HotelSuggestion[]>>>;

const fallbackSuggestions: Record<AccommodationOptionId, HotelSuggestion[]> = {
  budget: [
    {
      name: "Zostel Nepal",
      area: "Backpacker district",
      reviewScore: 4.4,
      note: "Great for solo travelers and social stays.",
      nightlyFrom: 10,
    },
    {
      name: "Namaste Budget Stay",
      area: "City center",
      reviewScore: 4.3,
      note: "Popular for clean rooms and friendly staff.",
      nightlyFrom: 12,
    },
  ],
  mid: [
    {
      name: "Hotel Middle Path",
      area: "Central area",
      reviewScore: 4.6,
      note: "Consistently praised for comfort and service.",
      nightlyFrom: 38,
    },
    {
      name: "Aloft Boutique Stay",
      area: "Tourist-friendly neighborhood",
      reviewScore: 4.5,
      note: "Well-rated for location and breakfast.",
      nightlyFrom: 42,
    },
  ],
  premium: [
    {
      name: "Temple Tree Resort",
      area: "Scenic district",
      reviewScore: 4.7,
      note: "High guest satisfaction with strong amenities.",
      nightlyFrom: 95,
    },
    {
      name: "The Pavilions",
      area: "Quiet premium area",
      reviewScore: 4.8,
      note: "Known for peaceful stays and excellent reviews.",
      nightlyFrom: 110,
    },
  ],
  luxury: [
    {
      name: "Dwarika's Heritage Stay",
      area: "Luxury district",
      reviewScore: 4.9,
      note: "Exceptional hospitality and premium experience.",
      nightlyFrom: 190,
    },
    {
      name: "Tiger Mountain Lodge",
      area: "High-end scenic retreat",
      reviewScore: 4.8,
      note: "Top-rated for exclusivity and views.",
      nightlyFrom: 220,
    },
  ],
};

const destinationSuggestions: SuggestionMap = {
  kathmandu: {
    budget: [
      {
        name: "Yala Peak Hostel",
        area: "Thamel",
        reviewScore: 4.4,
        note: "Loved for location and backpacker vibe.",
        nightlyFrom: 11,
      },
      {
        name: "Alobar1000 Hostel",
        area: "Thamel",
        reviewScore: 4.5,
        note: "Good reviews for staff and rooftop atmosphere.",
        nightlyFrom: 13,
      },
    ],
    mid: [
      {
        name: "Kumari Boutique Hotel",
        area: "Thamel",
        reviewScore: 4.7,
        note: "Reliable choice with strong guest reviews.",
        nightlyFrom: 42,
      },
      {
        name: "Hotel Shanker",
        area: "Lazimpat",
        reviewScore: 4.6,
        note: "Popular for heritage feel and service quality.",
        nightlyFrom: 55,
      },
      {
        name: "Aloft Kathmandu",
        area: "Thamel",
        reviewScore: 4.5,
        note: "Highly rated for comfort and modern rooms.",
        nightlyFrom: 60,
      },
    ],
    premium: [
      {
        name: "Hyatt Centric Soalteemode",
        area: "Tahachal",
        reviewScore: 4.7,
        note: "Great reviews for facilities and city access.",
        nightlyFrom: 120,
      },
      {
        name: "The Soaltee Kathmandu",
        area: "Tahachal",
        reviewScore: 4.6,
        note: "Well-reviewed premium stay with strong amenities.",
        nightlyFrom: 135,
      },
    ],
    luxury: [
      {
        name: "Dwarika's Hotel",
        area: "Battisputali",
        reviewScore: 4.9,
        note: "One of the most reviewed luxury stays in Kathmandu.",
        nightlyFrom: 260,
      },
      {
        name: "Kathmandu Marriott Hotel",
        area: "Naxal",
        reviewScore: 4.8,
        note: "Excellent guest ratings for service and rooms.",
        nightlyFrom: 240,
      },
    ],
  },
  pokhara: {
    budget: [
      {
        name: "Hotel Diplomat",
        area: "Lakeside",
        reviewScore: 4.4,
        note: "Budget-friendly with very solid location reviews.",
        nightlyFrom: 12,
      },
      {
        name: "Pokhara Youth Hostel",
        area: "Lakeside",
        reviewScore: 4.3,
        note: "Good ratings for backpacker comfort.",
        nightlyFrom: 10,
      },
    ],
    mid: [
      {
        name: "Hotel Middle Path & Spa",
        area: "Lakeside",
        reviewScore: 4.7,
        note: "A strong mid-range favorite with great reviews.",
        nightlyFrom: 40,
      },
      {
        name: "Mount Kailash Resort",
        area: "Lakeside",
        reviewScore: 4.6,
        note: "Known for comfort, pool, and friendly service.",
        nightlyFrom: 48,
      },
      {
        name: "Aabas Pokhara",
        area: "Lakeside",
        reviewScore: 4.6,
        note: "Guests rate it highly for design and cleanliness.",
        nightlyFrom: 44,
      },
    ],
    premium: [
      {
        name: "Temple Tree Resort & Spa",
        area: "Lakeside",
        reviewScore: 4.7,
        note: "Premium stay with consistently strong feedback.",
        nightlyFrom: 105,
      },
      {
        name: "Bar Peepal Resort",
        area: "Lakeside hill",
        reviewScore: 4.8,
        note: "Top-rated for views and upscale experience.",
        nightlyFrom: 125,
      },
    ],
    luxury: [
      {
        name: "Tiger Mountain Pokhara Lodge",
        area: "Mountain ridge",
        reviewScore: 4.9,
        note: "Exceptional reviews for privacy and views.",
        nightlyFrom: 260,
      },
      {
        name: "The Pavilions Himalayas",
        area: "Pame",
        reviewScore: 4.8,
        note: "Luxury eco-stay with outstanding guest ratings.",
        nightlyFrom: 240,
      },
    ],
  },
  chitwan: {
    budget: [
      {
        name: "Hotel Parkland",
        area: "Sauraha",
        reviewScore: 4.3,
        note: "Simple stay with good safari access.",
        nightlyFrom: 14,
      },
      {
        name: "Travellers Jungle Camp",
        area: "Sauraha",
        reviewScore: 4.2,
        note: "Popular with budget wildlife travelers.",
        nightlyFrom: 13,
      },
    ],
    mid: [
      {
        name: "Green Park Chitwan",
        area: "Sauraha",
        reviewScore: 4.7,
        note: "Very well reviewed for hospitality and food.",
        nightlyFrom: 46,
      },
      {
        name: "Hotel Seven Star",
        area: "Sauraha",
        reviewScore: 4.5,
        note: "Strong ratings for pool and overall comfort.",
        nightlyFrom: 42,
      },
    ],
    premium: [
      {
        name: "Kasara Chitwan",
        area: "Patihani",
        reviewScore: 4.7,
        note: "Premium jungle stay with excellent guest feedback.",
        nightlyFrom: 120,
      },
      {
        name: "Jagatpur Lodge",
        area: "Jagatpur",
        reviewScore: 4.8,
        note: "Highly praised for wildlife experience.",
        nightlyFrom: 135,
      },
    ],
  },
  lumbini: {
    mid: [
      {
        name: "Bodhi Redsun",
        area: "Lumbini Garden",
        reviewScore: 4.5,
        note: "Good reviews for peaceful atmosphere.",
        nightlyFrom: 34,
      },
      {
        name: "Lumbini Buddha Garden Resort",
        area: "Monastic zone",
        reviewScore: 4.4,
        note: "Convenient and comfortable for temple visits.",
        nightlyFrom: 39,
      },
    ],
  },
  everest: {
    mid: [
      {
        name: "Hotel Namche",
        area: "Namche Bazaar",
        reviewScore: 4.5,
        note: "Reliable trekkers' favorite with solid reviews.",
        nightlyFrom: 36,
      },
      {
        name: "Panorama Lodge",
        area: "Namche Bazaar",
        reviewScore: 4.4,
        note: "Good reputation for views and trekking stopovers.",
        nightlyFrom: 33,
      },
    ],
    luxury: [
      {
        name: "Everest Summit Lodge",
        area: "Lukla & Namche circuit",
        reviewScore: 4.8,
        note: "Top-end trekking lodge with excellent guest ratings.",
        nightlyFrom: 190,
      },
    ],
  },
};

export function getHotelSuggestions(destinationId: string, accommodationId: AccommodationOptionId): HotelSuggestion[] {
  return destinationSuggestions[destinationId]?.[accommodationId] ?? fallbackSuggestions[accommodationId];
}
