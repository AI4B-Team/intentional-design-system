export interface MarketMetric {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
}

export interface PriceHistoryPoint {
  month: string;
  price: number;
}

export interface InventoryPoint {
  month: string;
  activeListings: number;
  monthsOfSupply: number;
}

export interface DOMDistribution {
  range: string;
  percentage: number;
}

export interface RentalData {
  beds: string;
  rent: number;
  pricePerSqft: number;
  yoyChange: number;
}

export interface InvestmentMetric {
  label: string;
  value: string;
  rating: "good" | "average" | "poor";
  description?: string;
}

export interface RecentSale {
  id: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  pricePerSqft: number;
  dom: number;
  saleDate: string;
}

export interface MarketAlerts {
  priceChange: boolean;
  inventoryChange: boolean;
  weeklySummary: boolean;
}

// Mock data generators
export function generateMockMetrics(): MarketMetric[] {
  return [
    {
      label: "Median Price",
      value: "$385,000",
      sparklineData: [350, 358, 365, 372, 378, 382, 385],
      change: 5.2,
      changeLabel: "YoY",
    },
    {
      label: "YoY Change",
      value: "+5.2%",
      subValue: "vs last year",
      sparklineData: [2.1, 3.2, 4.1, 4.8, 5.0, 5.1, 5.2],
    },
    {
      label: "Median DOM",
      value: "18 days",
      sparklineData: [24, 22, 20, 19, 18, 17, 18],
      change: -25,
      changeLabel: "faster",
    },
    {
      label: "Inventory",
      value: "2.1 months",
      subValue: "Seller's Market",
      sparklineData: [2.8, 2.5, 2.3, 2.2, 2.1, 2.0, 2.1],
    },
    {
      label: "List/Sale Ratio",
      value: "98.5%",
      sparklineData: [97.2, 97.8, 98.1, 98.3, 98.4, 98.5, 98.5],
    },
    {
      label: "Median Rent",
      value: "$1,850",
      sparklineData: [1720, 1760, 1790, 1810, 1830, 1845, 1850],
      change: 5.0,
      changeLabel: "YoY",
    },
    {
      label: "Gross Yield",
      value: "5.8%",
      sparklineData: [6.1, 6.0, 5.9, 5.8, 5.8, 5.8, 5.8],
    },
    {
      label: "Active Listings",
      value: "234",
      sparklineData: [280, 265, 252, 245, 240, 236, 234],
      change: -16.4,
      changeLabel: "vs 6mo",
    },
  ];
}

export function generatePriceHistory(): PriceHistoryPoint[] {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const prices = [366000, 368000, 370000, 372000, 374000, 376000, 378000, 380000, 382000, 383000, 384000, 385000];
  return months.map((month, i) => ({ month, price: prices[i] }));
}

export function generateInventoryData(): InventoryPoint[] {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const listings = [280, 275, 268, 260, 255, 250, 245, 242, 238, 236, 235, 234];
  const supply = [2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.2, 2.1, 2.1, 2.1, 2.1];
  return months.map((month, i) => ({ month, activeListings: listings[i], monthsOfSupply: supply[i] }));
}

export function generateDOMDistribution(): DOMDistribution[] {
  return [
    { range: "0-7 days", percentage: 35 },
    { range: "8-14 days", percentage: 28 },
    { range: "15-30 days", percentage: 22 },
    { range: "31-60 days", percentage: 10 },
    { range: "60+ days", percentage: 5 },
  ];
}

export function generateRentalData(): RentalData[] {
  return [
    { beds: "1 BR", rent: 1250, pricePerSqft: 1.45, yoyChange: 3.2 },
    { beds: "2 BR", rent: 1550, pricePerSqft: 1.35, yoyChange: 4.1 },
    { beds: "3 BR", rent: 1850, pricePerSqft: 1.25, yoyChange: 5.0 },
    { beds: "4 BR", rent: 2300, pricePerSqft: 1.15, yoyChange: 4.5 },
  ];
}

export function generateInvestmentMetrics(): InvestmentMetric[] {
  return [
    { label: "Price/Rent Ratio", value: "17.3", rating: "average", description: "Months of rent to buy" },
    { label: "Gross Yield", value: "5.8%", rating: "average" },
    { label: "Cap Rate", value: "4.5%", rating: "poor" },
    { label: "Appreciation", value: "8.2%/yr", rating: "good", description: "3-year average" },
  ];
}

export function generateRecentSales(): RecentSale[] {
  return [
    { id: "1", address: "123 Main St", price: 375000, beds: 3, baths: 2, sqft: 1750, pricePerSqft: 214, dom: 12, saleDate: "2024-01-15" },
    { id: "2", address: "456 Oak Ave", price: 395000, beds: 4, baths: 2.5, sqft: 2100, pricePerSqft: 188, dom: 8, saleDate: "2024-01-12" },
    { id: "3", address: "789 Pine Rd", price: 348000, beds: 3, baths: 2, sqft: 1620, pricePerSqft: 215, dom: 21, saleDate: "2024-01-10" },
    { id: "4", address: "234 Elm Dr", price: 425000, beds: 4, baths: 3, sqft: 2350, pricePerSqft: 181, dom: 5, saleDate: "2024-01-08" },
    { id: "5", address: "567 Maple Ln", price: 362000, beds: 3, baths: 2, sqft: 1680, pricePerSqft: 216, dom: 15, saleDate: "2024-01-05" },
  ];
}
