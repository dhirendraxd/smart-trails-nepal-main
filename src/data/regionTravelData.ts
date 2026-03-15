import { type Region } from "./regions";

export interface RegionTravelData {
  permits: string[];
  essentialGear: string[];
  bestSeason: string;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Extreme";
  itinerary: { day: string; title: string; description: string }[];
  tips: string[];
  nearbyAttractions: string[];
}

export const regionTravelData: Record<string, RegionTravelData> = {
  kathmandu: {
    permits: ["No special permits required"],
    essentialGear: ["Comfortable walking shoes", "Sun protection", "Light layers"],
    bestSeason: "October – December",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Heritage Walk", description: "Explore Durbar Square, Swayambhunath (Monkey Temple), and Thamel streets." },
      { day: "Day 2", title: "Temples & Culture", description: "Visit Pashupatinath, Boudhanath Stupa, and the Garden of Dreams." },
      { day: "Day 3", title: "Day Trip", description: "Head to Patan Durbar Square and explore local artisan workshops." },
    ],
    tips: [
      "Bargain at local markets — prices are often inflated for tourists",
      "Carry a reusable water bottle with purifier",
      "Respect temple dress codes — cover shoulders and knees",
    ],
    nearbyAttractions: ["Bhaktapur", "Nagarkot", "Chandragiri Hills"],
  },
  pokhara: {
    permits: ["ACAP permit (if trekking)", "TIMS card (if trekking)"],
    essentialGear: ["Trekking boots", "Rain jacket", "Daypack", "Sunscreen"],
    bestSeason: "October – November, March – April",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Lakeside Exploration", description: "Stroll Phewa Lake, rent a boat, visit Tal Barahi Temple." },
      { day: "Day 2", title: "Sarangkot Sunrise", description: "Early morning hike to Sarangkot for Annapurna panorama views." },
      { day: "Day 3", title: "Adventure Day", description: "Paragliding over the lake, visit World Peace Pagoda." },
      { day: "Day 4", title: "Caves & Falls", description: "Explore Devi's Fall, Gupteshwor Cave, and International Mountain Museum." },
    ],
    tips: [
      "Book paragliding a day in advance during peak season",
      "Lakeside has the best restaurant variety — try local Dal Bhat",
      "Carry cash — many places outside lakeside don't accept cards",
    ],
    nearbyAttractions: ["Annapurna Circuit", "Begnas Lake", "Bandipur"],
  },
  chitwan: {
    permits: ["National Park entry permit (NPR 2,000 for foreigners)"],
    essentialGear: ["Binoculars", "Insect repellent", "Long sleeves", "Neutral-colored clothing"],
    bestSeason: "October – March",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Arrival & Tharu Culture", description: "Check into jungle lodge, evening Tharu cultural dance show." },
      { day: "Day 2", title: "Jungle Safari", description: "Jeep safari through the park — spot rhinos, deer, and crocodiles." },
      { day: "Day 3", title: "Canoe & Bird Watching", description: "Canoe ride on Rapti River, guided bird-watching walk." },
    ],
    tips: [
      "Avoid wearing bright colors during safari — animals are sensitive to them",
      "Book through your lodge for authorized guides only",
      "Best wildlife sightings are early morning and late afternoon",
    ],
    nearbyAttractions: ["Lumbini", "Bandipur", "Palpa"],
  },
  lumbini: {
    permits: ["No special permits required"],
    essentialGear: ["Comfortable shoes", "Hat and sunscreen", "Water bottle"],
    bestSeason: "October – March",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Sacred Garden", description: "Visit Maya Devi Temple, Ashoka Pillar, and the Sacred Garden complex." },
      { day: "Day 2", title: "Monastery Circuit", description: "Explore monasteries from various countries — Myanmar, Thailand, China, Korea." },
      { day: "Day 3", title: "Peace & Meditation", description: "World Peace Pagoda, Lumbini Museum, meditation at the Eternal Peace Flame." },
    ],
    tips: [
      "Rent a bicycle to cover the vast monastery area efficiently",
      "Visit early morning for peaceful, crowd-free experience",
      "Dress modestly when visiting religious sites",
    ],
    nearbyAttractions: ["Tilaurakot", "Kapilvastu", "Devdaha"],
  },
  everest: {
    permits: ["Sagarmatha National Park permit", "TIMS card", "Climbing permit (for summit)"],
    essentialGear: ["Down jacket", "Trekking boots (broken in)", "Altitude sickness medication", "Sleeping bag (-20°C)", "UV sunglasses", "Trekking poles"],
    bestSeason: "March – May, September – November",
    difficulty: "Extreme",
    itinerary: [
      { day: "Day 1-2", title: "Lukla to Namche", description: "Fly to Lukla, trek to Phakding, then to Namche Bazaar." },
      { day: "Day 3", title: "Acclimatization", description: "Rest day in Namche — visit Sherpa museum and hike to viewpoint." },
      { day: "Day 4-5", title: "Tengboche & Dingboche", description: "Trek through rhododendron forests to Tengboche monastery, continue to Dingboche." },
      { day: "Day 6-7", title: "Lobuche & Gorak Shep", description: "Push to higher altitude camps, acclimatization walks." },
      { day: "Day 8", title: "Everest Base Camp", description: "Early start to EBC (5,364m). Witness the Khumbu Icefall." },
      { day: "Day 9-12", title: "Return Trek", description: "Descend via Kala Patthar (sunrise view), return to Lukla." },
    ],
    tips: [
      "Acclimatize properly — climb high, sleep low",
      "Carry Diamox for altitude sickness prevention",
      "Hire a licensed guide — it's mandatory for solo trekkers since 2023",
      "Expect flights to Lukla to be delayed by weather — build in buffer days",
    ],
    nearbyAttractions: ["Gokyo Lakes", "Island Peak", "Cho La Pass"],
  },
  annapurna: {
    permits: ["ACAP permit", "TIMS card"],
    essentialGear: ["Trekking boots", "Down jacket", "Sleeping bag", "Water purification", "Trekking poles", "Headlamp"],
    bestSeason: "March – May, October – November",
    difficulty: "Challenging",
    itinerary: [
      { day: "Day 1-3", title: "Besisahar to Chame", description: "Start the circuit through terraced rice fields, arrive at Chame." },
      { day: "Day 4-6", title: "Chame to Manang", description: "Pass through pine forests, views of Annapurna II, rest in Manang." },
      { day: "Day 7", title: "Acclimatization", description: "Day hike to Ice Lake (4,600m) for stunning panoramic views." },
      { day: "Day 8-9", title: "Thorong La Pass", description: "Cross the highest point at 5,416m — the most challenging day." },
      { day: "Day 10-12", title: "Muktinath to Jomsom", description: "Descend to Muktinath temple, continue to Jomsom." },
    ],
    tips: [
      "Start early on Thorong La day — weather worsens after noon",
      "Teahouses fill up in peak season — arrive by early afternoon",
      "Carry energy snacks — meals at altitude are basic and slow",
    ],
    nearbyAttractions: ["Upper Mustang", "Poon Hill", "Tilicho Lake"],
  },
  langtang: {
    permits: ["Langtang National Park permit", "TIMS card"],
    essentialGear: ["Trekking boots", "Warm layers", "Sleeping bag", "Rain gear", "First aid kit"],
    bestSeason: "March – May, October – November",
    difficulty: "Moderate",
    itinerary: [
      { day: "Day 1-2", title: "Syabrubesi to Lama Hotel", description: "Bus from Kathmandu, begin trek through lush forest trails." },
      { day: "Day 3-4", title: "Langtang Village", description: "Trek to Langtang village, explore yak pastures and local cheese factory." },
      { day: "Day 5", title: "Kyanjin Gompa", description: "Reach Kyanjin Gompa, visit the monastery and enjoy mountain views." },
      { day: "Day 6", title: "Tserko Ri Hike", description: "Optional summit of Tserko Ri (4,984m) for 360° Himalayan panorama." },
      { day: "Day 7-8", title: "Return Trek", description: "Descend back to Syabrubesi." },
    ],
    tips: [
      "Less crowded than Everest/Annapurna — great for solitude seekers",
      "Try the local yak cheese at Kyanjin Gompa",
      "Trail can be slippery during monsoon — trekking poles recommended",
    ],
    nearbyAttractions: ["Gosaikunda Lake", "Helambu Trek", "Tamang Heritage Trail"],
  },
  bhaktapur: {
    permits: ["Bhaktapur entry ticket (NPR 1,800 for foreigners)"],
    essentialGear: ["Comfortable walking shoes", "Camera", "Sun protection"],
    bestSeason: "October – April",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Durbar Square & Pottery", description: "Explore the 55 Window Palace, Nyatapola Temple, and Pottery Square." },
      { day: "Day 2", title: "Local Life & Food", description: "Visit Dattatreya Square, try Juju Dhau (king curd), explore side alleys." },
    ],
    tips: [
      "Entry ticket is valid for a week if you register at the counter",
      "Visit early morning to see locals performing rituals",
      "Juju Dhau from Bhaktapur is a must-try — the original king curd",
    ],
    nearbyAttractions: ["Nagarkot", "Changu Narayan", "Kathmandu"],
  },
  nagarkot: {
    permits: ["No special permits required"],
    essentialGear: ["Warm jacket (mornings are cold)", "Camera", "Comfortable shoes"],
    bestSeason: "October – March",
    difficulty: "Easy",
    itinerary: [
      { day: "Day 1", title: "Sunrise & Views", description: "Wake early for sunrise over the Himalayas, including Everest on clear days." },
      { day: "Day 2", title: "Nature Hike", description: "Hike from Nagarkot to Changu Narayan (ancient Vishnu temple, UNESCO site)." },
    ],
    tips: [
      "Book a room with an east-facing window for sunrise views",
      "October/November offers the clearest mountain views",
      "The Nagarkot tower gives 360° panoramic views",
    ],
    nearbyAttractions: ["Bhaktapur", "Changu Narayan", "Dhulikhel"],
  },
  mustang: {
    permits: ["Restricted Area Permit (USD 500 for 10 days)", "ACAP permit", "TIMS card"],
    essentialGear: ["Down jacket", "Windproof layers", "Sunglasses (UV)", "Trekking boots", "Sleeping bag", "Dust mask"],
    bestSeason: "June – September (rain shadow area)",
    difficulty: "Challenging",
    itinerary: [
      { day: "Day 1-3", title: "Jomsom to Kagbeni", description: "Fly to Jomsom, trek to Kagbeni — the gateway to Upper Mustang." },
      { day: "Day 4-6", title: "Samar to Ghami", description: "Trek through surreal eroded cliffs, red and ochre landscapes." },
      { day: "Day 7-8", title: "Lo Manthang", description: "Arrive at the walled city, explore ancient monasteries and the royal palace." },
      { day: "Day 9-10", title: "Return Trek", description: "Return via alternative route through Ghar Gompa." },
    ],
    tips: [
      "Must trek with a licensed agency — solo trekking not allowed",
      "Carry enough cash — no ATMs in Upper Mustang",
      "Best visited during monsoon when rest of Nepal is rainy",
      "Respect the Tibetan Buddhist culture — ask before photographing people",
    ],
    nearbyAttractions: ["Annapurna Circuit", "Muktinath", "Marpha"],
  },
};
