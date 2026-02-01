/**
 * Centralized pipeline stage color configuration.
 * Use these constants across dashboard, pipeline overview, charts, and deal cards
 * to maintain visual consistency throughout the application.
 * 
 * Color scheme matches the 4 main dashboard tiles:
 * - Leads: Red (new opportunities)
 * - Offers: Amber (active proposals)
 * - Contracts: Blue (locked deals)
 * - Sold/Closed: Emerald (completed)
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

export const PIPELINE_COLORS: Record<PipelineStageId, PipelineStageColors> = {
  // === LEADS GROUP (Red) ===
  new: {
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    text: "text-red-500",
    badge: "bg-red-100 text-red-600",
  },
  contacted: {
    bg: "bg-red-400",
    bgLight: "bg-red-50",
    text: "text-red-400",
    badge: "bg-red-50 text-red-500",
  },
  appointment: {
    bg: "bg-red-300",
    bgLight: "bg-red-50",
    text: "text-red-400",
    badge: "bg-red-50 text-red-400",
  },
  
  // === OFFERS GROUP (Amber) ===
  offer_made: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-100",
    text: "text-amber-500",
    badge: "bg-amber-100 text-amber-600",
  },
  negotiating: {
    bg: "bg-amber-400",
    bgLight: "bg-amber-50",
    text: "text-amber-400",
    badge: "bg-amber-50 text-amber-500",
  },
  
  // === CONTRACTS GROUP (Blue) ===
  under_contract: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-100",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-600",
  },
  
  // === MARKETING GROUP (Purple) ===
  marketing: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-100",
    text: "text-purple-500",
    badge: "bg-purple-100 text-purple-600",
  },
  
  // === PURCHASED/SOLD GROUP (Emerald) ===
  closed: {
    bg: "bg-emerald-400",
    bgLight: "bg-emerald-50",
    text: "text-emerald-400",
    badge: "bg-emerald-50 text-emerald-500",
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
