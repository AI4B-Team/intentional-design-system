import { useMemo } from "react";

export interface MarketplaceDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  price: number;
  arv: number;
  arvPercent: number;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  tags: string[];
  isNew: boolean;
  isFavorite: boolean;
  imageUrl: string;
  images?: string[]; // Additional property photos
  lat: number;
  lng: number;
  createdAt: string;
  status?: "new" | "for_sale" | "sold"; // Optional status override
}

interface UseMockDealsOptions {
  filters: {
    address: string;
    leadType: string;
    homeTypes: string[];
    priceMin: string;
    priceMax: string;
    bedsMin: string;
    bathsMin: string;
  };
  sortBy: string;
  page: number;
  perPage: number;
}

// Get today's date and various past dates for realistic listing ages
const today = new Date();
const getDateString = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const mockDeals: MarketplaceDeal[] = [
  {
    id: "1",
    address: "14060 Sydney Rd",
    city: "Tampa",
    state: "FL",
    zip: "33527",
    county: "Hillsborough County",
    price: 165000,
    arv: 235000,
    arvPercent: 70,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1850,
    tags: ["Single Family", "High Equity", "Cash Buyer", "Motivated Seller"],
    isNew: true,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    ],
    lat: 27.9506,
    lng: -82.4572,
    createdAt: getDateString(0), // Today - shows "New"
  },
  {
    id: "2",
    address: "7890 Coral Way",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33301",
    county: "Broward County",
    price: 245000,
    arv: 365000,
    arvPercent: 67,
    propertyType: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2200,
    tags: ["Single Family", "Divorce", "Motivated Seller", "High Equity", "Quick Close"],
    isNew: true,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
    ],
    lat: 26.1224,
    lng: -80.1373,
    createdAt: getDateString(2), // 2 days ago - shows "New 2 Days Ago"
  },
  {
    id: "3",
    address: "456 Palm Beach Blvd",
    city: "West Palm Beach",
    state: "FL",
    zip: "33401",
    county: "Palm Beach County",
    price: 175000,
    arv: 250000,
    arvPercent: 70,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1650,
    tags: ["Single Family", "Pre-Foreclosure", "Vacant"],
    isNew: false,
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    lat: 26.7153,
    lng: -80.0534,
    createdAt: getDateString(3), // 3 days ago
  },
  {
    id: "4",
    address: "123 Ocean Drive",
    city: "Miami Beach",
    state: "FL",
    zip: "33139",
    county: "Miami-Dade County",
    price: 560000,
    arv: 750000,
    arvPercent: 75,
    propertyType: "Condo",
    beds: 2,
    baths: 2,
    sqft: 1200,
    tags: ["Condo", "Probate", "High Equity"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    lat: 25.7907,
    lng: -80.1300,
    createdAt: getDateString(7), // 7 days ago - shows "For Sale"
    status: "sold", // Mark as sold
  },
  {
    id: "5",
    address: "789 Lakeside Dr",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    county: "Orange County",
    price: 89000,
    arv: 145000,
    arvPercent: 61,
    propertyType: "Single Family",
    beds: 2,
    baths: 1,
    sqft: 1100,
    tags: ["Single Family", "Tax Lien", "Fixer Upper"],
    isNew: true,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
    lat: 28.5383,
    lng: -81.3792,
    createdAt: getDateString(2), // 2 days ago
  },
  {
    id: "6",
    address: "321 Sunset Blvd",
    city: "St. Petersburg",
    state: "FL",
    zip: "33701",
    county: "Pinellas County",
    price: 198000,
    arv: 280000,
    arvPercent: 71,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1750,
    tags: ["Single Family", "Estate Sale", "Cash Buyer"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    lat: 27.7676,
    lng: -82.6403,
    createdAt: getDateString(10), // 10 days ago - shows "For Sale"
  },
  {
    id: "7",
    address: "555 Bay St",
    city: "Clearwater",
    state: "FL",
    zip: "33756",
    county: "Pinellas County",
    price: 240000,
    arv: 340000,
    arvPercent: 71,
    propertyType: "Townhouse",
    beds: 3,
    baths: 2.5,
    sqft: 1900,
    tags: ["Townhouse", "Short Sale", "Motivated Seller"],
    isNew: false,
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    lat: 27.9659,
    lng: -82.8001,
    createdAt: getDateString(8), // 8 days ago - shows "For Sale"
  },
  {
    id: "8",
    address: "888 Harbor View",
    city: "Sarasota",
    state: "FL",
    zip: "34236",
    county: "Sarasota County",
    price: 58000,
    arv: 95000,
    arvPercent: 61,
    propertyType: "Mobile Home",
    beds: 2,
    baths: 1,
    sqft: 900,
    tags: ["Mobile Home", "Bank Owned", "Quick Close"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80",
    lat: 27.3364,
    lng: -82.5307,
    createdAt: getDateString(5),
    status: "for_sale",
  },
  {
    id: "9",
    address: "999 Coastal Hwy",
    city: "Jacksonville",
    state: "FL",
    zip: "32202",
    county: "Duval County",
    price: 235000,
    arv: 320000,
    arvPercent: 73,
    propertyType: "Single Family",
    beds: 4,
    baths: 2,
    sqft: 2100,
    tags: ["Single Family", "Inherited", "Vacant"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    lat: 30.3322,
    lng: -81.6557,
    createdAt: getDateString(12), // 12 days ago - shows "For Sale"
  },
  {
    id: "10",
    address: "222 Golf Course Rd",
    city: "Naples",
    state: "FL",
    zip: "34102",
    county: "Collier County",
    price: 175000,
    arv: 260000,
    arvPercent: 67,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1600,
    tags: ["Single Family", "Divorce", "High Equity"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    lat: 26.1420,
    lng: -81.7948,
    createdAt: getDateString(6), // 6 days ago - shows "For Sale"
  },
  {
    id: "11",
    address: "444 River Walk",
    city: "Gainesville",
    state: "FL",
    zip: "32601",
    county: "Alachua County",
    price: 125000,
    arv: 185000,
    arvPercent: 68,
    propertyType: "Duplex",
    beds: 4,
    baths: 2,
    sqft: 1800,
    tags: ["Duplex", "Rental Income", "Cash Flow"],
    isNew: true,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    lat: 29.6516,
    lng: -82.3248,
    createdAt: getDateString(8), // 8 days ago - shows "For Sale"
  },
  {
    id: "12",
    address: "666 Main St",
    city: "Tallahassee",
    state: "FL",
    zip: "32301",
    county: "Leon County",
    price: 145000,
    arv: 210000,
    arvPercent: 69,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1500,
    tags: ["Single Family", "Probate", "Fixer Upper"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    lat: 30.4383,
    lng: -84.2807,
    createdAt: getDateString(15), // 15 days ago - shows "For Sale"
  },
  {
    id: "13",
    address: "777 Beach Rd",
    city: "Pensacola",
    state: "FL",
    zip: "32502",
    county: "Escambia County",
    price: 168000,
    arv: 240000,
    arvPercent: 70,
    propertyType: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1650,
    tags: ["Single Family", "Tax Lien", "Motivated Seller"],
    isNew: false,
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80",
    lat: 30.4213,
    lng: -87.2169,
    createdAt: getDateString(4), // 4 days ago
  },
  {
    id: "14",
    address: "333 Downtown Ave",
    city: "Ocala",
    state: "FL",
    zip: "34471",
    county: "Marion County",
    price: 95000,
    arv: 150000,
    arvPercent: 63,
    propertyType: "Single Family",
    beds: 2,
    baths: 1,
    sqft: 1100,
    tags: ["Single Family", "Estate Sale", "Quick Close"],
    isNew: false,
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
    lat: 29.1872,
    lng: -82.1401,
    createdAt: getDateString(0),
    status: "sold",
  },
];

export function useMockDeals({ filters, sortBy, page, perPage }: UseMockDealsOptions) {
  const filteredDeals = useMemo(() => {
    let result = [...mockDeals];

    // Apply filters
    if (filters.address) {
      const search = filters.address.toLowerCase();
      result = result.filter(
        (d) =>
          d.address.toLowerCase().includes(search) ||
          d.city.toLowerCase().includes(search) ||
          d.county.toLowerCase().includes(search) ||
          d.zip.includes(search)
      );
    }

    if (filters.leadType && filters.leadType !== "all") {
      const leadTypeMap: Record<string, string[]> = {
        "high-equity": ["High Equity"],
        "cash-buyer": ["Cash Buyer"],
        "absentee-owner": ["Absentee Owner"],
        "distressed": ["Distressed", "Fixer Upper"],
        "foreclosure": ["Foreclosure", "Bank Owned"],
        "pre-foreclosure": ["Pre-Foreclosure"],
        "vacant": ["Vacant"],
        "tax-lien": ["Tax Lien"],
        "probate": ["Probate"],
        "divorce": ["Divorce"],
        "motivated-seller": ["Motivated Seller"],
      };
      const tags = leadTypeMap[filters.leadType] || [];
      if (tags.length > 0) {
        result = result.filter((d) => 
          d.tags.some(tag => tags.includes(tag))
        );
      }
    }

    // Filter by home types - map filter IDs to property type names
    if (filters.homeTypes && filters.homeTypes.length > 0 && filters.homeTypes.length < 7) {
      const homeTypeMap: Record<string, string[]> = {
        "houses": ["Single Family"],
        "townhomes": ["Townhouse"],
        "multi-family": ["Duplex", "Multi-Family"],
        "condos": ["Condo", "Co-op"],
        "lots-land": ["Land", "Lot"],
        "apartments": ["Apartment"],
        "manufactured": ["Mobile Home", "Manufactured"],
      };
      
      const allowedTypes: string[] = [];
      filters.homeTypes.forEach(ht => {
        const mapped = homeTypeMap[ht];
        if (mapped) {
          allowedTypes.push(...mapped);
        }
      });
      
      if (allowedTypes.length > 0) {
        result = result.filter((d) => 
          allowedTypes.some(type => 
            d.propertyType.toLowerCase() === type.toLowerCase()
          )
        );
      }
    }

    if (filters.priceMin) {
      result = result.filter((d) => d.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      result = result.filter((d) => d.price <= parseInt(filters.priceMax));
    }

    if (filters.bedsMin) {
      result = result.filter((d) => d.beds >= parseInt(filters.bedsMin));
    }

    if (filters.bathsMin) {
      result = result.filter((d) => d.baths >= parseInt(filters.bathsMin));
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "arv":
        result.sort((a, b) => a.arvPercent - b.arvPercent);
        break;
      case "most_viewed":
        // For mock data, just use a random but stable sort based on id
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    return result;
  }, [filters, sortBy]);

  const totalCount = filteredDeals.length;
  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (page - 1) * perPage;
  const deals = filteredDeals.slice(startIndex, startIndex + perPage);

  return {
    deals,
    totalCount,
    totalPages,
    isLoading: false,
  };
}
