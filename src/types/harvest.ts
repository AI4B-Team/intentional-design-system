// HARVEST — Autonomous Lead Engine types
// Naming: strict — no borrowed terms (see spec §02)

export type SignalType =
  | "notice_of_default"
  | "estate_filing"
  | "dissolution_record"
  | "debt_recording"
  | "tax_default"
  | "property_citation"
  | "vacancy_signal"
  | "stale_listing";

export const SIGNAL_LABELS: Record<SignalType, string> = {
  notice_of_default: "Notice of Default",
  estate_filing: "Estate Filing",
  dissolution_record: "Dissolution Record",
  debt_recording: "Debt Recording",
  tax_default: "Tax Default",
  property_citation: "Property Citation",
  vacancy_signal: "Vacancy Signal",
  stale_listing: "Stale Listing",
};

export type ScoreTier = "hot" | "warm" | "watch" | "archive";

export function tierFromScore(score: number): ScoreTier {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "watch";
  return "archive";
}

export type ConfidenceLevel = "high" | "medium" | "low";
export type AssetClass = "single_family" | "multi_family" | "commercial" | "land" | "industrial" | "unknown";
export type OwnerEntity = "individual" | "llc" | "trust" | "unknown";

export interface HarvestSignal {
  type: SignalType;
  source: string;
  capturedAt: string;
  freshnessDays: number;
}

export interface HarvestLead {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  ownerName: string | null;
  ownerEntityType: OwnerEntity;
  isAbsentee: boolean;
  mailingAddress?: string;
  phonePrimary?: string;
  ownerConfidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  assetClass: AssetClass;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  assessedValue: number | null;
  arvEstimate: number | null;
  opportunityScore: number; // 0-100
  distressScore: number; // 0-100
  confidenceScore: number; // 0-100
  signals: HarvestSignal[];
  redFlags: string[];
  positiveFlags: string[];
  weakFlags: string[];
  recommendedAction: string;
  daysUntilAuction?: number | null;
  capturedAt: string;
}

export interface HarvestOverviewStats {
  newSinceLastSession: number;
  totalInSystem: number;
  hot: number;
  warm: number;
  watch: number;
  skipTraced: number;
  mailedThisWeek: number;
  focusListCount: number;
  readyToCall: number;
  estateActive: number;
  newToday: number;
}

export interface SignalBreakdown {
  type: SignalType;
  count: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  tax_default: number;
  notice_of_default: number;
  estate_filing: number;
  property_citation: number;
}

export type IntegrationStatus = "connected" | "test" | "active" | "disconnected";

export interface HarvestIntegration {
  name: "Enrich" | "Mail" | "Sync";
  description: string;
  status: IntegrationStatus;
  lastRun?: string;
}

export interface FeedHealthRow {
  county: string;
  state: string;
  source: string;
  lastRun: string;
  status: "ok" | "warning" | "error";
  recordsCaptured: number;
  loginOk: boolean;
}

export interface RunLogEntry {
  date: string;
  runs: number;
  okCount: number;
  errorCount: number;
  recordsProcessed: number;
  avgDurationSec: number;
}
