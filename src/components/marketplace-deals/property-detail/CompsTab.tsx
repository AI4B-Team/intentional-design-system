import React from "react";
import { ComparableSalesSection } from "@/components/marketplace-deals/ComparableSalesSection";
import { RentalCompsSection } from "./RentalCompsSection";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";

interface CompsTabProps {
  deal: MarketplaceDeal;
  viewMode: "flip" | "hold";
}

export function CompsTab({ deal, viewMode }: CompsTabProps) {
  // Mock investor comps data (distressed/as-is sales)
  const investorComps = [
    {
      id: "1",
      address: "14234 Maple Lane",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      salePrice: Math.round(deal.arv * 0.68),
      saleDate: "2025-12-15",
      distanceMiles: 0.3,
      pricePerSqft: Math.round((deal.arv * 0.68) / (deal.sqft + 120)),
      similarity: 95,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "REO",
    },
    {
      id: "2",
      address: "7892 Oak Street",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      salePrice: Math.round(deal.arv * 0.62),
      saleDate: "2025-11-28",
      distanceMiles: 0.5,
      pricePerSqft: Math.round((deal.arv * 0.62) / (deal.sqft - 80)),
      similarity: 92,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Short Sale",
    },
    {
      id: "3",
      address: "2456 Pine Drive",
      city: deal.city,
      state: deal.state,
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      salePrice: Math.round(deal.arv * 0.72),
      saleDate: "2025-10-10",
      distanceMiles: 0.8,
      pricePerSqft: Math.round((deal.arv * 0.72) / (deal.sqft + 350)),
      similarity: 78,
      isSelected: true,
      quality: "good" as const,
      saleType: "As-Is",
    },
    {
      id: "4",
      address: "9821 Cedar Way",
      city: deal.city,
      state: deal.state,
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      salePrice: Math.round(deal.arv * 0.58),
      saleDate: "2025-09-22",
      distanceMiles: 1.1,
      pricePerSqft: Math.round((deal.arv * 0.58) / (deal.sqft - 300)),
      similarity: 72,
      isSelected: true,
      quality: "good" as const,
      saleType: "Auction",
    },
  ];

  // Mock rental comps data for Hold mode
  const rentalComps = [
    {
      id: "rent1",
      address: "14234 Maple Lane",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      monthlyRent: 1695,
      leaseDate: "2025-12-01",
      distanceMiles: 0.3,
      rentPerSqft: 1.12,
      similarity: 95,
      quality: "excellent" as const,
      leaseType: "Annual",
    },
    {
      id: "rent2",
      address: "7892 Oak Street",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      monthlyRent: 1550,
      leaseDate: "2025-11-15",
      distanceMiles: 0.5,
      rentPerSqft: 1.08,
      similarity: 92,
      quality: "excellent" as const,
      leaseType: "Annual",
    },
    {
      id: "rent3",
      address: "2456 Pine Drive",
      city: deal.city,
      state: deal.state,
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      monthlyRent: 1850,
      leaseDate: "2025-10-20",
      distanceMiles: 0.8,
      rentPerSqft: 0.98,
      similarity: 78,
      quality: "good" as const,
      leaseType: "Annual",
    },
    {
      id: "rent4",
      address: "9821 Cedar Way",
      city: deal.city,
      state: deal.state,
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      monthlyRent: 1350,
      leaseDate: "2025-09-01",
      distanceMiles: 1.1,
      rentPerSqft: 1.18,
      similarity: 72,
      quality: "good" as const,
      leaseType: "Annual",
    },
  ];

  // Mock retail comps data (standard MLS sales)
  const retailComps = [
    {
      id: "r1",
      address: "14234 Maple Lane",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      salePrice: deal.arv + 5000,
      saleDate: "2025-12-15",
      distanceMiles: 0.3,
      pricePerSqft: Math.round((deal.arv + 5000) / (deal.sqft + 120)),
      similarity: 95,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r2",
      address: "7892 Oak Street",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      salePrice: deal.arv - 8000,
      saleDate: "2025-11-28",
      distanceMiles: 0.5,
      pricePerSqft: Math.round((deal.arv - 8000) / (deal.sqft - 80)),
      similarity: 92,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r3",
      address: "2456 Pine Drive",
      city: deal.city,
      state: deal.state,
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      salePrice: deal.arv + 35000,
      saleDate: "2025-10-10",
      distanceMiles: 0.8,
      pricePerSqft: Math.round((deal.arv + 35000) / (deal.sqft + 350)),
      similarity: 78,
      isSelected: true,
      quality: "good" as const,
      saleType: "Standard",
    },
    {
      id: "r4",
      address: "9821 Cedar Way",
      city: deal.city,
      state: deal.state,
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      salePrice: deal.arv - 25000,
      saleDate: "2025-09-22",
      distanceMiles: 1.1,
      pricePerSqft: Math.round((deal.arv - 25000) / (deal.sqft - 300)),
      similarity: 72,
      isSelected: true,
      quality: "good" as const,
      saleType: "Standard",
    },
  ];

  if (viewMode === "hold") {
    return (
      <div className="space-y-6">
        <RentalCompsSection
          rentalComps={rentalComps}
          subjectProperty={{
            address: deal.address,
            beds: deal.beds,
            baths: deal.baths,
            sqft: deal.sqft,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComparableSalesSection
        investorComps={investorComps}
        retailComps={retailComps}
        subjectProperty={{
          address: deal.address,
          city: deal.city,
          state: deal.state,
          zip: deal.zip,
          beds: deal.beds,
          baths: deal.baths,
          sqft: deal.sqft,
          price: deal.price,
          arv: deal.arv,
        }}
      />
    </div>
  );
}
