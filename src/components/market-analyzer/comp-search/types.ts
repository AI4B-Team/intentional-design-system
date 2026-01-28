export interface CompResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  salePrice: number;
  listPrice?: number;
  saleDate: string;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft?: number;
  yearBuilt: number;
  distance: number;
  pricePerSqft: number;
  condition: string;
  saleType: "standard" | "reo" | "short_sale" | "auction";
  daysOnMarket?: number;
  photos?: string[];
  garage?: number;
  pool?: boolean;
  stories?: number;
}

export interface SubjectProperty {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  condition: string;
}

export interface CompAdjustment {
  compId: string;
  sqftAdj: number;
  bedsAdj: number;
  bathsAdj: number;
  conditionAdj: number;
  poolAdj: number;
  garageAdj: number;
  customAdj: number;
  totalAdj: number;
  adjustedPrice: number;
  weight: number;
}

export interface CompFilters {
  address: string;
  city: string;
  state: string;
  zip: string;
  radius: number;
  bedsMin: number | null;
  bedsMax: number | null;
  bathsMin: number | null;
  bathsMax: number | null;
  sqftMin: number | null;
  sqftMax: number | null;
  yearBuiltMin: number | null;
  yearBuiltMax: number | null;
  soldWithinMonths: number;
  propertyTypes: string[];
  saleTypes: string[];
}

export const defaultFilters: CompFilters = {
  address: "",
  city: "",
  state: "",
  zip: "",
  radius: 1,
  bedsMin: null,
  bedsMax: null,
  bathsMin: null,
  bathsMax: null,
  sqftMin: null,
  sqftMax: null,
  yearBuiltMin: null,
  yearBuiltMax: null,
  soldWithinMonths: 6,
  propertyTypes: ["sfh"],
  saleTypes: ["standard"],
};

export const defaultAdjustmentRates = {
  sqftPerUnit: 50,
  bedsPerUnit: 5000,
  bathsPerUnit: 3000,
  conditionGoodToFair: -10000,
  conditionExcellentToGood: 10000,
  poolValue: 15000,
  garagePerSpace: 5000,
};
