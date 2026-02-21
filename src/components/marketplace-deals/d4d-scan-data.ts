// AI Driving for Dollars — mock distressed property generator

export interface D4DProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  // Physical distress
  overgrown: boolean;
  boardedWindows: boolean;
  roofDamage: boolean;
  codeViolations: number;
  vacant: boolean;
  // Financial distress
  preForeclosure: boolean;
  taxLien: boolean;
  probate: boolean;
  highEquity: boolean;
  ownershipYears: number;
  estimatedEquityPct: number;
  // Scores
  distressScore: number; // 0-100 combined
  physicalScore: number;
  financialScore: number;
  // Property info
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  estimatedValue: number;
  lastSalePrice: number;
  lastSaleDate: string;
  propertyType: string;
  thumbnailUrl: string;
  // NEW: Street view & enhanced data
  streetViewUrl: string;
  ownerName: string;
  ownerType: "individual" | "corporate" | "trust" | "estate";
  mailingAddress: string;
  mailStatus: "deliverable" | "vacant" | "returned" | "unknown";
  phoneAvailable: boolean;
  emailAvailable: boolean;
  estimatedRehab: number;
  neighborhoodRating: number; // 1-10
  neighborhoodName: string;
  daysVacant: number | null;
  lastInspection: string | null;
  waterShutoff: boolean;
  permitActivity: boolean;
  lotSqft: number;
  zoning: string;
  floodZone: boolean;
  hoaFee: number | null;
  arvEstimate: number;
  wholesaleSpread: number;
}

// Seeded random for consistency
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STREET_NAMES = [
  "Oak", "Pine", "Maple", "Cedar", "Elm", "Birch", "Walnut", "Cherry", "Magnolia", "Cypress",
  "Pecan", "Willow", "Hickory", "Palm", "Laurel", "Poplar", "Dogwood", "Holly", "Ash", "Spruce",
  "Bay", "Sycamore", "Olive", "Redwood", "Juniper", "Chestnut", "Beech", "Hazel", "Acacia", "Mulberry"
];
const STREET_TYPES = ["St", "Ave", "Dr", "Ln", "Ct", "Blvd", "Way", "Pl", "Rd", "Cir"];
const CITIES_FL = [
  { city: "Tampa", zip: "33602", lat: 27.9506, lng: -82.4572 },
  { city: "Orlando", zip: "32801", lat: 28.5383, lng: -81.3792 },
  { city: "Jacksonville", zip: "32202", lat: 30.3322, lng: -81.6557 },
  { city: "Miami", zip: "33101", lat: 25.7617, lng: -80.1918 },
  { city: "Fort Myers", zip: "33901", lat: 26.6406, lng: -81.8723 },
  { city: "St. Petersburg", zip: "33701", lat: 27.7676, lng: -82.6403 },
  { city: "Lakeland", zip: "33801", lat: 28.0395, lng: -81.9498 },
  { city: "Daytona Beach", zip: "32114", lat: 29.2108, lng: -81.0228 },
  { city: "Sarasota", zip: "34236", lat: 27.3364, lng: -82.5307 },
  { city: "Pensacola", zip: "32502", lat: 30.4213, lng: -87.2169 },
  { city: "Cape Coral", zip: "33904", lat: 26.5629, lng: -81.9495 },
  { city: "Port St. Lucie", zip: "34952", lat: 27.2730, lng: -80.3582 },
  { city: "Ocala", zip: "34471", lat: 29.1872, lng: -82.1401 },
  { city: "Gainesville", zip: "32601", lat: 29.6516, lng: -82.3248 },
  { city: "Tallahassee", zip: "32301", lat: 30.4383, lng: -84.2807 },
];

const PROPERTY_TYPES = ["Single Family", "Duplex", "Triplex", "Mobile Home"];
const THUMBNAIL_URLS = [
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=300&h=200&fit=crop",
];

// Distressed house images for street view simulation
const STREET_VIEW_URLS = [
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=640&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&h=400&fit=crop",
];

const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Thomas", "Dorothy", "Charles", "Margaret", "Carlos", "Maria"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "White", "Harris"];
const NEIGHBORHOODS = ["Seminole Heights", "West Tampa", "College Park", "Riverside", "Avondale", "Old Northeast", "Shore Acres", "Historic Kenwood", "Palma Ceia", "Davis Islands", "Ybor City", "Oakwood", "Pine Hills", "Parramore", "Callahan"];
const OWNER_TYPES: ("individual" | "corporate" | "trust" | "estate")[] = ["individual", "individual", "individual", "corporate", "trust", "estate"];
const MAIL_STATUSES: ("deliverable" | "vacant" | "returned" | "unknown")[] = ["deliverable", "deliverable", "vacant", "returned", "unknown"];
const ZONINGS = ["R-1", "R-2", "R-3", "RM-1", "PD", "C-1"];

export function generateD4DProperties(
  centerLat: number,
  centerLng: number,
  count: number = 500,
  seed: number = 42
): D4DProperty[] {
  const rand = seededRandom(seed + Math.round(centerLat * 100) + Math.round(centerLng * 100));
  const properties: D4DProperty[] = [];

  for (let i = 0; i < count; i++) {
    const latOffset = (rand() - 0.5) * 0.8;
    const lngOffset = (rand() - 0.5) * 0.8;
    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;

    const cityInfo = CITIES_FL[Math.floor(rand() * CITIES_FL.length)];
    const streetNum = 100 + Math.floor(rand() * 9900);
    const streetName = STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)];
    const streetType = STREET_TYPES[Math.floor(rand() * STREET_TYPES.length)];

    // Physical distress signals
    const overgrown = rand() < 0.45;
    const boardedWindows = rand() < 0.2;
    const roofDamage = rand() < 0.3;
    const codeViolations = rand() < 0.35 ? Math.floor(rand() * 5) + 1 : 0;
    const vacant = rand() < 0.4;

    // Financial distress signals
    const preForeclosure = rand() < 0.15;
    const taxLien = rand() < 0.2;
    const probate = rand() < 0.1;
    const ownershipYears = Math.floor(rand() * 30) + 2;
    const highEquity = ownershipYears > 10 && rand() < 0.6;
    const estimatedEquityPct = highEquity
      ? 60 + Math.floor(rand() * 35)
      : 10 + Math.floor(rand() * 40);

    // Calculate scores
    let physicalScore = 0;
    if (overgrown) physicalScore += 20;
    if (boardedWindows) physicalScore += 25;
    if (roofDamage) physicalScore += 20;
    if (codeViolations > 0) physicalScore += Math.min(codeViolations * 8, 20);
    if (vacant) physicalScore += 15;

    let financialScore = 0;
    if (preForeclosure) financialScore += 30;
    if (taxLien) financialScore += 25;
    if (probate) financialScore += 20;
    if (highEquity) financialScore += 15;
    if (ownershipYears > 15) financialScore += 10;

    const distressScore = Math.min(100, Math.round(physicalScore * 0.5 + financialScore * 0.5));

    const yearBuilt = 1940 + Math.floor(rand() * 70);
    const sqft = 800 + Math.floor(rand() * 2500);
    const beds = Math.floor(rand() * 4) + 1;
    const baths = Math.floor(rand() * 3) + 1;
    const estimatedValue = 80000 + Math.floor(rand() * 350000);
    const lastSalePrice = Math.floor(estimatedValue * (0.4 + rand() * 0.4));
    const lastSaleYear = 2005 + Math.floor(rand() * 15);
    const lotSqft = sqft + Math.floor(rand() * 8000) + 2000;

    // Enhanced data
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const ownerType = OWNER_TYPES[Math.floor(rand() * OWNER_TYPES.length)];
    const ownerName = ownerType === "corporate"
      ? `${lastName} Properties LLC`
      : ownerType === "trust"
        ? `${lastName} Family Trust`
        : ownerType === "estate"
          ? `Estate of ${firstName} ${lastName}`
          : `${firstName} ${lastName}`;

    const estimatedRehab = 5000 + Math.floor(rand() * 80000);
    const arvEstimate = estimatedValue + estimatedRehab + Math.floor(rand() * 40000);
    const wholesaleSpread = Math.max(5000, arvEstimate * 0.7 - estimatedValue);

    properties.push({
      id: `d4d-${seed}-${i}`,
      address: `${streetNum} ${streetName} ${streetType}`,
      city: cityInfo.city,
      state: "FL",
      zip: cityInfo.zip,
      lat,
      lng,
      overgrown,
      boardedWindows,
      roofDamage,
      codeViolations,
      vacant,
      preForeclosure,
      taxLien,
      probate,
      highEquity,
      ownershipYears,
      estimatedEquityPct,
      distressScore,
      physicalScore: Math.min(100, physicalScore),
      financialScore: Math.min(100, financialScore),
      beds,
      baths,
      sqft,
      yearBuilt,
      estimatedValue,
      lastSalePrice,
      lastSaleDate: `${lastSaleYear}-${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}-15`,
      propertyType: PROPERTY_TYPES[Math.floor(rand() * PROPERTY_TYPES.length)],
      thumbnailUrl: THUMBNAIL_URLS[Math.floor(rand() * THUMBNAIL_URLS.length)],
      // New fields
      streetViewUrl: STREET_VIEW_URLS[Math.floor(rand() * STREET_VIEW_URLS.length)],
      ownerName,
      ownerType,
      mailingAddress: `${100 + Math.floor(rand() * 9000)} ${STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)]} ${STREET_TYPES[Math.floor(rand() * STREET_TYPES.length)]}, ${cityInfo.city}, FL`,
      mailStatus: MAIL_STATUSES[Math.floor(rand() * MAIL_STATUSES.length)],
      phoneAvailable: rand() < 0.65,
      emailAvailable: rand() < 0.4,
      estimatedRehab,
      neighborhoodRating: Math.floor(rand() * 7) + 2,
      neighborhoodName: NEIGHBORHOODS[Math.floor(rand() * NEIGHBORHOODS.length)],
      daysVacant: vacant ? Math.floor(rand() * 365) + 30 : null,
      lastInspection: rand() < 0.3 ? `${2023 + Math.floor(rand() * 3)}-${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}` : null,
      waterShutoff: vacant && rand() < 0.4,
      permitActivity: rand() < 0.15,
      lotSqft,
      zoning: ZONINGS[Math.floor(rand() * ZONINGS.length)],
      floodZone: rand() < 0.12,
      hoaFee: rand() < 0.25 ? Math.floor(rand() * 300) + 50 : null,
      arvEstimate,
      wholesaleSpread,
    });
  }

  // Sort by distress score descending
  properties.sort((a, b) => b.distressScore - a.distressScore);
  return properties;
}

export function getDistressColor(score: number): string {
  if (score >= 70) return "#ef4444"; // red - high distress
  if (score >= 45) return "#f97316"; // orange - moderate
  if (score >= 25) return "#eab308"; // yellow - mild
  return "#6b7280"; // gray - low
}

export function getDistressLabel(score: number): string {
  if (score >= 70) return "High Distress";
  if (score >= 45) return "Moderate";
  if (score >= 25) return "Mild";
  return "Low";
}

export interface ScanPhase {
  label: string;
  icon: string;
  duration: number; // ms
}

export const SCAN_PHASES: ScanPhase[] = [
  { label: "Analyzing satellite imagery...", icon: "🛰️", duration: 1200 },
  { label: "Scanning property records...", icon: "📋", duration: 1000 },
  { label: "Cross-referencing financial data...", icon: "💰", duration: 800 },
  { label: "AI scoring distress signals...", icon: "🤖", duration: 1000 },
  { label: "Generating street view analysis...", icon: "📸", duration: 800 },
  { label: "Compiling results...", icon: "✅", duration: 600 },
];
