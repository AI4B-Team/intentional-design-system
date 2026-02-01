/**
 * Centralized pipeline stage color configuration.
 * Use these constants across dashboard, pipeline overview, charts, and deal cards
 * to maintain visual consistency throughout the application.
 * 
 * UNIFIED PIPELINE CATEGORY SYSTEM:
 * 🔴 RED (Discovery) - Leads, Contacted, Appointments
 * 🟡 YELLOW (Intent) - Offers, Negotiating
 * 🔵 BLUE (Commitment) - Under Contract
 * 🟢 GREEN (Outcome) - Purchased, Sold
 */

export type PipelineStageId = 
  | "new" 
  | "contacted" 
  | "appointment" 
  | "offer_made" 
  | "negotiating"
  | "under_contract" 
  | "marketing"
  | "closed"
  | "sold";

export type PipelineCategoryId = "discovery" | "intent" | "commitment" | "outcome";

export interface PipelineStageColors {
  /** Background color for badges and dots (e.g., "bg-red-500") */
  bg: string;
  /** Light background for badges (e.g., "bg-red-100") */
  bgLight: string;
  /** Text color (e.g., "text-red-500") */
  text: string;
  /** Combined badge styling (light bg + text) */
  badge: string;
}

export interface PipelineCategory {
  id: PipelineCategoryId;
  label: string;
  statuses: PipelineStageId[];
  colors: {
    bg: string;
    bgLight: string;
    text: string;
    icon: string;
    progress: string;
  };
}

/**
 * The four parent pipeline categories - AUTHORITATIVE SYSTEM
 */
export const PIPELINE_CATEGORIES: Record<PipelineCategoryId, PipelineCategory> = {
  discovery: {
    id: "discovery",
    label: "Discovery",
    statuses: ["new", "contacted", "appointment"],
    colors: {
      bg: "bg-red-500",
      bgLight: "bg-red-100",
      text: "text-red-500",
      icon: "text-red-500",
      progress: "bg-red-500",
    },
  },
  intent: {
    id: "intent",
    label: "Intent",
    statuses: ["offer_made", "negotiating"],
    colors: {
      bg: "bg-amber-500",
      bgLight: "bg-amber-100",
      text: "text-amber-500",
      icon: "text-amber-500",
      progress: "bg-amber-500",
    },
  },
  commitment: {
    id: "commitment",
    label: "Commitment",
    statuses: ["under_contract"],
    colors: {
      bg: "bg-blue-500",
      bgLight: "bg-blue-100",
      text: "text-blue-600",
      icon: "text-blue-600",
      progress: "bg-blue-500",
    },
  },
  outcome: {
    id: "outcome",
    label: "Outcome",
    statuses: ["closed", "sold", "marketing"],
    colors: {
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-100",
      text: "text-emerald-500",
      icon: "text-emerald-500",
      progress: "bg-emerald-500",
    },
  },
};

/**
 * Get the category for a given status
 */
export function getStatusCategory(status: string | null): PipelineCategory {
  const normalizedStatus = (status || "new").toLowerCase().replace(" ", "_") as PipelineStageId;
  
  for (const category of Object.values(PIPELINE_CATEGORIES)) {
    if (category.statuses.includes(normalizedStatus)) {
      return category;
    }
  }
  
  // Default to discovery for unknown statuses
  return PIPELINE_CATEGORIES.discovery;
}

export const PIPELINE_COLORS: Record<PipelineStageId, PipelineStageColors> = {
  // === DISCOVERY GROUP (Red) - Leads, Contacted, Appointments ===
  new: {
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    text: "text-red-500",
    badge: "bg-red-100 text-red-600",
  },
  contacted: {
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    text: "text-red-500",
    badge: "bg-red-100 text-red-500",
  },
  appointment: {
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    text: "text-red-500",
    badge: "bg-red-100 text-red-500",
  },
  
  // === INTENT GROUP (Yellow/Amber) - Offers, Negotiating ===
  offer_made: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-100",
    text: "text-amber-500",
    badge: "bg-amber-100 text-amber-600",
  },
  negotiating: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-100",
    text: "text-amber-500",
    badge: "bg-amber-100 text-amber-500",
  },
  
  // === COMMITMENT GROUP (Blue) - Under Contract ===
  under_contract: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-100",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-600",
  },
  
  // === OUTCOME GROUP (Green) - Purchased, Sold, Marketing ===
  marketing: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-100",
    text: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-600",
  },
  closed: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-100",
    text: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-500",
  },
  sold: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-100",
    text: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-600",
  },
};

/**
 * Get pipeline stage colors with fallback for unknown statuses
 */
export function getPipelineColors(status: string | null): PipelineStageColors {
  const normalizedStatus = (status || "new").toLowerCase().replace(" ", "_") as PipelineStageId;
  return PIPELINE_COLORS[normalizedStatus] || PIPELINE_COLORS.new;
}

/**
 * Pipeline stage labels (for display)
 */
export const PIPELINE_LABELS: Record<PipelineStageId, string> = {
  new: "New Leads",
  contacted: "Contacted",
  appointment: "Appointments",
  offer_made: "Offers Made",
  negotiating: "Negotiating",
  under_contract: "Under Contract",
  marketing: "Marketing",
  closed: "Purchased",
  sold: "Sold",
};

/**
 * Get display label for a status
 */
export function getPipelineLabel(status: string | null): string {
  const normalizedStatus = (status || "new").toLowerCase().replace(" ", "_") as PipelineStageId;
  return PIPELINE_LABELS[normalizedStatus] || status || "New";
}

/**
 * Category totals for dashboard cards
 */
export interface CategoryTotals {
  discovery: number;  // Red - Leads + Contacted + Appointments
  intent: number;     // Yellow - Offers + Negotiating
  commitment: number; // Blue - Under Contract
  outcome: number;    // Green - Purchased + Sold
}

/**
 * Calculate category totals from pipeline stats
 */
export function calculateCategoryTotals(
  pipelineStats: Array<{ status: string; count: number }>
): CategoryTotals {
  const totals: CategoryTotals = {
    discovery: 0,
    intent: 0,
    commitment: 0,
    outcome: 0,
  };

  for (const stat of pipelineStats) {
    const category = getStatusCategory(stat.status);
    totals[category.id] += stat.count;
  }

  return totals;
}
