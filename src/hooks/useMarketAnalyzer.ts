import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useDealAnalyses, type DealAnalysis } from "./useDealAnalyses";
import { toast } from "sonner";

interface PropertyInput {
  id: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  property_type?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  year_built?: number | null;
  asking_price?: number | null;
  arv?: number | null;
  repair_estimate?: number | null;
}

export function useMarketAnalyzer() {
  const navigate = useNavigate();
  const { createAnalysis, fetchAnalyses, analyses, loading } = useDealAnalyses();

  const analyzeProperty = async (
    property: PropertyInput,
    analysisType: DealAnalysis["analysis_type"] = "flip"
  ) => {
    try {
      const analysis = await createAnalysis({
        property_id: property.id,
        name: `${property.address} Analysis`,
        analysis_type: analysisType,
        address: property.address,
        city: property.city ?? undefined,
        state: property.state ?? undefined,
        zip: property.zip ?? undefined,
        property_type: property.property_type ?? undefined,
        beds: property.beds ?? undefined,
        baths: property.baths ?? undefined,
        sqft: property.sqft ?? undefined,
        year_built: property.year_built ?? undefined,
        asking_price: property.asking_price ?? undefined,
        purchase_price: property.asking_price ?? undefined,
        arv: property.arv ?? undefined,
        repair_estimate: property.repair_estimate ?? undefined,
        status: "draft",
      });

      navigate(`/calculators?tab=deal&id=${analysis.id}`);
      return analysis;
    } catch (error) {
      console.error("Failed to create analysis:", error);
      throw error;
    }
  };

  const findCompsForProperty = (property: PropertyInput) => {
    navigate(
      `/calculators?tab=comps&address=${encodeURIComponent(property.address)}&city=${encodeURIComponent(property.city || "")}&state=${encodeURIComponent(property.state || "")}`
    );
  };

  const openRentalCalculator = (property: PropertyInput) => {
    navigate(`/calculators?tab=rental&property_id=${property.id}`);
  };

  const openRepairEstimator = (property: PropertyInput) => {
    navigate(`/calculators?tab=repairs&property_id=${property.id}`);
  };

  // Fetch recent analyses
  const getRecentAnalyses = React.useCallback(async () => {
    await fetchAnalyses();
    return analyses.slice(0, 5);
  }, [fetchAnalyses, analyses]);

  return {
    analyzeProperty,
    findCompsForProperty,
    openRentalCalculator,
    openRepairEstimator,
    getRecentAnalyses,
    recentAnalyses: analyses.slice(0, 5),
    loading,
  };
}
