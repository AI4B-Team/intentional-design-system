/**
 * AI Priority Index Scoring Engine (0–100)
 * 
 * Formula:
 *   (Deal Value × 0.25) + (Time Sensitivity × 0.30) + (Engagement Intent × 0.20)
 *   + (Deal Stage Weight × 0.15) + (Silence Risk × 0.10)
 * 
 * Output: 80–100 HOT, 60–79 Warm, 40–59 Background, <40 Hidden
 */

export type PriorityTier = "hot" | "warm" | "background" | "hidden";

export interface PriorityInput {
  // Deal financials
  askingPrice?: number | null;
  arv?: number | null;
  equityAmount?: number | null;
  assignmentFee?: number | null;
  offerAmount?: number | null;
  repairEstimate?: number | null;
  
  // Time
  deadlineDate?: Date | null;
  isOverdue?: boolean;
  followUpDate?: Date | null;
  
  // Engagement
  lastContactDays?: number | null;
  motivationScore?: number | null; // 0–1000 from DB
  hasReplied?: boolean;
  
  // Stage
  status?: string | null;
  
  // Event type
  eventType?: string;
}

export interface PriorityResult {
  score: number;         // 0–100
  tier: PriorityTier;
  label: string;         // "🔥 HOT", "Warm", etc.
  components: {
    dealValue: number;
    timeSensitivity: number;
    engagementIntent: number;
    stageWeight: number;
    silenceRisk: number;
  };
}

// ─── Deal Value (0–100) ────────────────────────────────────
function scoreDealValue(input: PriorityInput): number {
  const spread = (input.arv || 0) - (input.askingPrice || 0) - (input.repairEstimate || 0);
  const fee = input.assignmentFee || 0;
  const equity = input.equityAmount || 0;
  
  // Use the best available value signal
  const dealSignal = Math.max(spread, fee, equity, input.offerAmount || 0);
  
  if (dealSignal <= 0) return 10; // Unknown = baseline
  if (dealSignal >= 100000) return 100;
  if (dealSignal >= 50000) return 85;
  if (dealSignal >= 25000) return 70;
  if (dealSignal >= 10000) return 50;
  if (dealSignal >= 5000) return 30;
  return 20;
}

// ─── Time Sensitivity (0–100) ──────────────────────────────
function scoreTimeSensitivity(input: PriorityInput): number {
  // Overdue = auto minimum 70
  if (input.isOverdue) return Math.max(70, 100);

  const now = Date.now();
  const deadline = input.deadlineDate?.getTime();
  const followUp = input.followUpDate?.getTime();
  
  const targetTime = deadline || followUp;
  if (!targetTime) return 20;
  
  const hoursUntil = (targetTime - now) / (1000 * 60 * 60);
  
  if (hoursUntil < 0) return 100;     // Past due
  if (hoursUntil <= 24) return 95;    // Within 24h
  if (hoursUntil <= 48) return 85;    // Within 48h
  if (hoursUntil <= 72) return 75;    // Within 72h
  if (hoursUntil <= 168) return 50;   // Within 1 week
  return 25;
}

// ─── Engagement Intent (0–100) ─────────────────────────────
function scoreEngagementIntent(input: PriorityInput): number {
  let score = 20; // baseline
  
  // Motivation score from DB (0–1000 → 0–50)
  if (input.motivationScore) {
    score += Math.min(50, Math.round(input.motivationScore / 20));
  }
  
  // Recent reply = high intent
  if (input.hasReplied) score += 30;
  
  // Silence + past engagement = high risk (not low intent)
  if (input.lastContactDays && input.lastContactDays > 3 && input.motivationScore && input.motivationScore > 500) {
    score += 20; // Re-engagement opportunity
  }
  
  return Math.min(100, score);
}

// ─── Deal Stage Weight (multiplier) ───────────────────────
function getStageMultiplier(status?: string | null): number {
  switch (status) {
    case "closing":
    case "sold":
      return 1.2;
    case "under_contract":
    case "accepted":
      return 1.0;
    case "offer_sent":
    case "negotiating":
      return 0.9;
    case "contacted":
    case "warm":
      return 0.8;
    case "appointment_set":
      return 0.85;
    case "new":
    default:
      return 0.6;
  }
}

function scoreStageWeight(input: PriorityInput): number {
  const multiplier = getStageMultiplier(input.status);
  // Convert multiplier to 0-100 scale (0.6 → 50, 1.2 → 100)
  return Math.round(((multiplier - 0.5) / 0.7) * 100);
}

// ─── Silence Risk (0–100) ──────────────────────────────────
function scoreSilenceRisk(input: PriorityInput): number {
  const days = input.lastContactDays;
  if (!days || days <= 1) return 0;
  if (days <= 2) return 20;
  if (days <= 3) return 40;
  if (days <= 5) return 60;
  if (days <= 7) return 80;
  return 100; // 7+ days = maximum risk
}

// ─── Main Calculator ───────────────────────────────────────
export function calculatePriorityIndex(input: PriorityInput): PriorityResult {
  const dealValue = scoreDealValue(input);
  const timeSensitivity = scoreTimeSensitivity(input);
  const engagementIntent = scoreEngagementIntent(input);
  const stageWeight = scoreStageWeight(input);
  const silenceRisk = scoreSilenceRisk(input);
  
  const raw = (
    dealValue * 0.25 +
    timeSensitivity * 0.30 +
    engagementIntent * 0.20 +
    stageWeight * 0.15 +
    silenceRisk * 0.10
  );
  
  // Apply stage multiplier as final adjustment
  const multiplier = getStageMultiplier(input.status);
  const score = Math.min(100, Math.round(raw * multiplier));
  
  let tier: PriorityTier;
  let label: string;
  
  if (score >= 80) { tier = "hot"; label = "🔥 HOT"; }
  else if (score >= 60) { tier = "warm"; label = "Warm"; }
  else if (score >= 40) { tier = "background"; label = "Background"; }
  else { tier = "hidden"; label = "Low"; }
  
  return {
    score,
    tier,
    label,
    components: { dealValue, timeSensitivity, engagementIntent, stageWeight, silenceRisk },
  };
}

/** Get tier color classes */
export function getTierStyles(tier: PriorityTier) {
  switch (tier) {
    case "hot": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", dot: "bg-red-500" };
    case "warm": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", dot: "bg-amber-500" };
    case "background": return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border", dot: "bg-muted-foreground" };
    case "hidden": return { bg: "bg-muted/30", text: "text-muted-foreground/50", border: "border-border", dot: "bg-muted-foreground/30" };
  }
}
