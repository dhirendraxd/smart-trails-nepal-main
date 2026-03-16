import type { DifficultyLevel } from "@/data/destinations";

export type LocalExploreItem = {
  name: string;
  duration: string;
  note: string;
  difficulty?: DifficultyLevel;
};

export type LocalExploreSet = {
  places: LocalExploreItem[];
  hikes: LocalExploreItem[];
  trails: LocalExploreItem[];
};

export const localExploreByDestination: Record<string, LocalExploreSet> = {
  kathmandu: {
    places: [
      { name: "Patan Durbar Square", duration: "1.5-2 hrs", note: "Best for architecture walks and cafe breaks." },
      { name: "Boudhanath Stupa", duration: "1-1.5 hrs", note: "Great for sunset prayer-wheel loops and rooftops." },
      { name: "Bhaktapur Durbar Square", duration: "2-3 hrs", note: "Ideal for heritage lanes, pottery, and local sweets." },
    ],
    hikes: [
      {
        name: "Shivapuri Day Hike",
        duration: "4-5 hrs",
        difficulty: "Moderate",
        note: "Cool forest air and valley views make this an easy confidence builder.",
      },
      {
        name: "Nagarjun Forest Hike",
        duration: "2.5-3.5 hrs",
        difficulty: "Easy",
        note: "Shorter climb with peaceful pine sections and city lookouts.",
      },
    ],
    trails: [
      {
        name: "Sundarijal to Chisapani",
        duration: "5-6 hrs",
        difficulty: "Moderate",
        note: "Waterfalls, stone stairs, and a classic first Himalayan ridge day.",
      },
      {
        name: "Phulchoki Ridge Trail",
        duration: "4-5 hrs",
        difficulty: "Moderate",
        note: "Birdlife-rich route with broad valley panoramas near the summit.",
      },
    ],
  },
  pokhara: {
    places: [
      { name: "Phewa Lakeside", duration: "1-2 hrs", note: "Perfect for relaxed walks, coffee stops, and boat views." },
      { name: "World Peace Pagoda", duration: "1.5-2 hrs", note: "Strong Annapurna backdrop and calm hilltop atmosphere." },
      { name: "Bindhyabasini Temple", duration: "45-60 min", note: "Quick spiritual stop with great local neighborhood access." },
    ],
    hikes: [
      {
        name: "Sarangkot Sunrise Hike",
        duration: "2.5-3.5 hrs",
        difficulty: "Easy",
        note: "High reward sunrise route with classic Machhapuchhre views.",
      },
      {
        name: "Panchase Hill Hike",
        duration: "5-6 hrs",
        difficulty: "Moderate",
        note: "Ridge forests and layered peaks without heavy altitude pressure.",
      },
    ],
    trails: [
      {
        name: "Naudanda Ridge Trail",
        duration: "3-4 hrs",
        difficulty: "Easy",
        note: "Open ridge walking with frequent mountain photo points.",
      },
      {
        name: "Begnas to Rupa Lake Trail",
        duration: "4-5 hrs",
        difficulty: "Moderate",
        note: "Quiet villages and dual-lake scenery for slow-paced trekking days.",
      },
    ],
  },
  everest: {
    places: [
      { name: "Namche Bazaar", duration: "2-3 hrs", note: "Acclimatization hub with bakeries, gear shops, and viewpoints." },
      { name: "Tengboche Monastery", duration: "1-1.5 hrs", note: "Iconic monastery setting with dramatic Ama Dablam backdrop." },
      { name: "Kala Patthar Viewpoint", duration: "2-3 hrs round", note: "Premier Everest panorama for clear-morning climbs." },
    ],
    hikes: [
      {
        name: "Everest View Hotel Hike",
        duration: "3-4 hrs",
        difficulty: "Moderate",
        note: "Short acclimatization day with huge mountain reward.",
      },
      {
        name: "Khumjung Village Hike",
        duration: "2.5-3.5 hrs",
        difficulty: "Moderate",
        note: "Culture-rich side trip through Sherpa settlements and school routes.",
      },
    ],
    trails: [
      {
        name: "Lukla to Namche Trail",
        duration: "6-7 hrs",
        difficulty: "Challenging",
        note: "Legendary suspension bridge section and first major Everest push.",
      },
      {
        name: "Dingboche to Nangkartshang Trail",
        duration: "4-5 hrs",
        difficulty: "Challenging",
        note: "Acclimatization climb with broad valley and glacier viewpoints.",
      },
    ],
  },
  chitwan: {
    places: [
      { name: "Sauraha Riverside", duration: "1-2 hrs", note: "Best for sunset river scenes and relaxed wildlife ambience." },
      { name: "Tharu Cultural Museum", duration: "45-60 min", note: "Quick insight into local heritage before safari activities." },
      { name: "Kasara Museum", duration: "45-60 min", note: "Useful primer for park history and species context." },
    ],
    hikes: [
      {
        name: "Community Forest Walk",
        duration: "2-3 hrs",
        difficulty: "Easy",
        note: "Low-intensity walk ideal for families and first-time visitors.",
      },
      {
        name: "Bishazari Lake Walk",
        duration: "3-4 hrs",
        difficulty: "Easy",
        note: "Wetland birding route with calm terrain and frequent sightings.",
      },
    ],
    trails: [
      {
        name: "Rapti River Nature Trail",
        duration: "2-3 hrs",
        difficulty: "Easy",
        note: "Gentle jungle-edge trail suited for sunset wildlife tracking.",
      },
      {
        name: "Beeshazari Wetland Trail",
        duration: "3-4 hrs",
        difficulty: "Easy",
        note: "Flat, photogenic route with strong chances of bird encounters.",
      },
    ],
  },
  annapurna: {
    places: [
      { name: "Manang Village", duration: "1-2 hrs", note: "High-altitude culture stop with bakeries and acclimatization views." },
      { name: "Muktinath Temple", duration: "1-1.5 hrs", note: "Sacred mountain-site visit with dramatic dry landscapes." },
      { name: "Ghandruk Village", duration: "1.5-2 hrs", note: "Stone lanes, Gurung culture, and classic Annapurna framing." },
    ],
    hikes: [
      {
        name: "Poon Hill Hike",
        duration: "4-5 hrs",
        difficulty: "Moderate",
        note: "One of Nepal's most reliable sunrise panoramas.",
      },
      {
        name: "Ice Lake Hike",
        duration: "6-7 hrs",
        difficulty: "Challenging",
        note: "High-altitude challenge with exceptional glacier views.",
      },
    ],
    trails: [
      {
        name: "Thorong La Trail",
        duration: "7-9 hrs",
        difficulty: "Challenging",
        note: "Bucket-list pass crossing for seasoned trekkers.",
      },
      {
        name: "Upper Pisang to Ngawal Trail",
        duration: "4-5 hrs",
        difficulty: "Moderate",
        note: "Scenic upper route with less traffic and broader vistas.",
      },
    ],
  },
  lumbini: {
    places: [
      { name: "Maya Devi Temple", duration: "1-1.5 hrs", note: "Core pilgrimage landmark with meditative garden spaces." },
      { name: "Monastic Zone", duration: "2-3 hrs", note: "Diverse global monastery architecture in one peaceful corridor." },
      { name: "World Peace Pagoda", duration: "45-60 min", note: "Quiet reflection stop with broad surrounding views." },
    ],
    hikes: [
      {
        name: "Sacred Garden Walk",
        duration: "1.5-2 hrs",
        difficulty: "Easy",
        note: "Low-intensity spiritual walk ideal for slow travel days.",
      },
      {
        name: "Lumbini Crane Sanctuary Walk",
        duration: "2-3 hrs",
        difficulty: "Easy",
        note: "Nature-focused walk with seasonal birdwatching moments.",
      },
    ],
    trails: [
      {
        name: "Lumbini Heritage Trail",
        duration: "2-3 hrs",
        difficulty: "Easy",
        note: "Historical route linking key spiritual monuments.",
      },
      {
        name: "Tilaurakot Heritage Trail",
        duration: "3-4 hrs",
        difficulty: "Easy",
        note: "Archaeological trail with calm rural surroundings.",
      },
    ],
  },
};

export const getLocalExploreForDestination = (destinationId: string): LocalExploreSet =>
  localExploreByDestination[destinationId] ?? { places: [], hikes: [], trails: [] };
