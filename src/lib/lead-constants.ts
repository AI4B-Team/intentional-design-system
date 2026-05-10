/**
 * Shared constants for the Leads engine.
 * Single source of truth — do NOT redefine these in components.
 *
 * Schema reference (live tables): leads_properties, leads_signals,
 * leads_scores, leads_enrichment, leads_outreach_log, leads_scraper_health,
 * leads_scan_jobs, leads_pins, automation_settings.
 */

// ---------- Lead statuses (UI labels for leads_properties.status) ----------
export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-success" },
  { value: "contacted", label: "Contacted", color: "bg-info" },
  { value: "qualified", label: "Qualified", color: "bg-warning" },
  { value: "appointment", label: "Appointment", color: "bg-purple-500" },
  { value: "offer_made", label: "Offer Made", color: "bg-orange-500" },
  { value: "closed", label: "Closed", color: "bg-success" },
  { value: "lost", label: "Lost", color: "bg-destructive" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

// Legacy alias — keeps existing imports working during migration.
export const STATUS_OPTIONS = LEAD_STATUSES;

// ---------- Tier system (matches agent-grade output) ----------
export const LEAD_TIERS = {
  hot: { label: "Hot", min: 81, color: "#DC2626", bg: "#FEE2E2", dbValue: "hot" as const },
  warm: { label: "Warm", min: 61, color: "#EA580C", bg: "#FFEDD5", dbValue: "warm" as const },
  cold: { label: "Cold", min: 0, color: "#6B7280", bg: "#F3F4F6", dbValue: "cold" as const },
} as const;

export type LeadTier = keyof typeof LEAD_TIERS;

export function getTier(score: number): LeadTier {
  if (score > 80) return "hot";
  if (score > 60) return "warm";
  return "cold";
}

/** Tailwind classes for tier chips — uses semantic tokens where possible. */
export const TIER_CHIP_CLASSES: Record<LeadTier, string> = {
  hot: "bg-destructive/10 text-destructive border-destructive/20",
  warm: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  cold: "bg-muted text-muted-foreground border-border",
};

// ---------- Score breakdown components (agent-grade formula, max=100) ----------
export const SCORE_COMPONENTS = [
  { key: "signal_severity", label: "Signal Severity", max: 40 },
  { key: "equity_strength", label: "Equity Strength", max: 25 },
  { key: "freshness_decay", label: "Signal Freshness", max: 20 },
  { key: "enrichment_completeness", label: "Data Completeness", max: 15 },
] as const;

export type ScoreBreakdownKey = (typeof SCORE_COMPONENTS)[number]["key"];

// ---------- Lead sources (leads_properties.source) ----------
export const LEAD_SOURCES = [
  { value: "auto_detect", label: "Auto-Detect" },
  { value: "manual", label: "Manual" },
  { value: "d4d_pin", label: "Driving for Dollars" },
  { value: "manual_scan", label: "Manual Scan" },
  { value: "website_form", label: "Website Form" },
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number]["value"];

// ---------- Signal types (leads_signals.signal_type) ----------
export const SIGNAL_TYPES = [
  { value: "probate", label: "Probate" },
  { value: "tax_delinquency", label: "Tax Delinquency" },
  { value: "code_violation", label: "Code Violation" },
  { value: "foreclosure", label: "Foreclosure" },
  { value: "vacancy", label: "Vacancy" },
  { value: "absentee_owner", label: "Absentee Owner" },
  { value: "high_equity", label: "High Equity" },
  { value: "expired_listing", label: "Expired Listing" },
] as const;

// ---------- Signal severity ----------
export const SIGNAL_SEVERITIES = [
  { value: "low", label: "Low", weight: 0.25 },
  { value: "medium", label: "Medium", weight: 0.5 },
  { value: "high", label: "High", weight: 0.75 },
  { value: "critical", label: "Critical", weight: 1 },
] as const;

// ---------- Outreach campaign types (leads_outreach_log.campaign_type) ----------
export const CAMPAIGN_TYPES = [
  { value: "sms", label: "SMS" },
  { value: "mail", label: "Direct Mail" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number]["value"];

// ---------- Outreach status ----------
export const OUTREACH_STATUSES = [
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

// ---------- Scraper health sources (agent-oversight) ----------
export const SCRAPER_SOURCES = [
  { value: "probate_court", label: "Probate Court" },
  { value: "tax_assessor", label: "Tax Assessor" },
  { value: "code_enforcement", label: "Code Enforcement" },
  { value: "foreclosure_filings", label: "Foreclosure Filings" },
  { value: "mls_listings", label: "MLS Listings" },
  { value: "skip_trace_provider", label: "Skip Trace" },
  { value: "attom_api", label: "ATTOM Data API" },
] as const;

// ---------- Sell timeline (manual lead form) ----------
export const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "30_days", label: "30 Days" },
  { value: "60_days", label: "60 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "6_months", label: "6 Months" },
  { value: "flexible", label: "Flexible" },
] as const;

export const TIMELINE_LABELS: Record<string, string> = Object.fromEntries(
  TIMELINE_OPTIONS.map((o) => [o.value, o.label])
);

// ---------- Property condition (manual lead form) ----------
export const CONDITION_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_work", label: "Needs Work" },
  { value: "poor", label: "Poor" },
] as const;
