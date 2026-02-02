import * as React from "react";
import { PropertyCard, PropertyCardData } from "./PropertyCard";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";

interface StageConfig {
  id: string;
  label: string;
  color: string;
  description: string;
  targetDays: number;
  category: string;
}

interface PipelineDealCardProps {
  deal: PipelineDeal;
  stageConfig: StageConfig;
  nextStage?: StageConfig;
  prevStage?: StageConfig;
  onView: () => void;
  onMove: (newStage: string) => void;
}

// Map source to lead type display
function getLeadType(source: string): string {
  const sourceMap: Record<string, string> = {
    "tax_lien": "Tax Lien",
    "pre_foreclosure": "Pre-Foreclosure",
    "probate": "Probate",
    "driving_for_dollars": "D4D",
    "mls": "On-Market",
    "fsbo": "FSBO",
    "absentee_owner": "Absentee",
    "expired_listing": "Expired",
    "cold_calling": "Cold Call",
    "direct_mail": "Direct Mail",
  };
  return sourceMap[source] || source?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";
}

// Map property_type to home type display
function getHomeType(propertyType: string): string {
  const typeMap: Record<string, string> = {
    "single_family": "Single Family",
    "multi_family": "Multi-Family",
    "condo": "Condo",
    "townhouse": "Townhouse",
    "mobile": "Mobile",
    "land": "Land",
    "commercial": "Commercial",
  };
  return typeMap[propertyType] || propertyType?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";
}

export function PipelineDealCard({
  deal,
  stageConfig,
  nextStage,
  prevStage,
  onView,
  onMove,
}: PipelineDealCardProps) {
  // Map PipelineDeal to PropertyCardData
  const propertyData: PropertyCardData = {
    id: deal.id,
    address: deal.address,
    city: deal.city,
    state: deal.state,
    zip: deal.zip,
    beds: deal.beds,
    baths: deal.baths,
    sqft: deal.sqft,
    price: deal.asking_price,
    homeType: getHomeType(deal.property_type),
    leadType: getLeadType(deal.source),
    daysInStage: deal.days_in_stage,
    sellerPhone: deal.contact_phone || undefined,
    sellerEmail: deal.contact_email || undefined,
    images: [], // TODO: Add images when available
  };

  return (
    <PropertyCard
      property={propertyData}
      onOpenDetails={() => onView()}
    />
  );
}
