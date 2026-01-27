// MotivationIQ Scoring System
// Total max: 1000 points

export interface SignalDefinition {
  id: string;
  label: string;
  points: number;
  category: SignalCategory;
}

export type SignalCategory = 
  | "financial_distress"
  | "life_transitions"
  | "opportunity_indicators"
  | "property_condition";

export interface BonusDefinition {
  id: string;
  reason: string;
  requiredSignals: string[];
  points: number;
}

export interface ScoreBreakdown {
  signal: string;
  label: string;
  points: number;
}

export interface BonusBreakdown {
  reason: string;
  points: number;
}

export interface MotivationScoreResult {
  score: number;
  breakdown: ScoreBreakdown[];
  bonuses: BonusBreakdown[];
  categoryScores: Record<SignalCategory, number>;
}

// Category max scores
export const CATEGORY_MAX_SCORES: Record<SignalCategory, number> = {
  financial_distress: 300,
  life_transitions: 250,
  opportunity_indicators: 250,
  property_condition: 200,
};

export const CATEGORY_LABELS: Record<SignalCategory, string> = {
  financial_distress: "Financial Distress",
  life_transitions: "Life Transitions",
  opportunity_indicators: "Opportunity Indicators",
  property_condition: "Property Condition",
};

// Signal definitions by category
export const SIGNALS: SignalDefinition[] = [
  // FINANCIAL DISTRESS (max 300)
  { id: "federal_tax_lien", label: "Federal Tax Lien", points: 40, category: "financial_distress" },
  { id: "state_tax_lien", label: "State Tax Lien", points: 35, category: "financial_distress" },
  { id: "property_tax_delinquent_3yr", label: "Property Tax Delinquent (3+ Years)", points: 35, category: "financial_distress" },
  { id: "mechanic_lien", label: "Mechanic's Lien", points: 25, category: "financial_distress" },
  { id: "multiple_liens_stacked", label: "Multiple Liens Stacked (+15 per additional)", points: 15, category: "financial_distress" },
  { id: "nod_filed", label: "Notice of Default Filed", points: 40, category: "financial_distress" },
  { id: "auction_scheduled_60_days", label: "Auction Scheduled (60 days)", points: 50, category: "financial_distress" },
  { id: "auction_scheduled_30_days", label: "Auction Scheduled (30 days)", points: 65, category: "financial_distress" },
  { id: "bankruptcy_ch7", label: "Bankruptcy (Chapter 7)", points: 35, category: "financial_distress" },
  { id: "bankruptcy_ch13", label: "Bankruptcy (Chapter 13)", points: 25, category: "financial_distress" },
  { id: "mortgage_late_90_days", label: "Mortgage Late (90+ days)", points: 30, category: "financial_distress" },
  { id: "utility_shutoff", label: "Utility Shutoff", points: 25, category: "financial_distress" },

  // LIFE TRANSITIONS (max 250)
  { id: "probate_filed", label: "Probate Filed", points: 50, category: "life_transitions" },
  { id: "death_certificate_match", label: "Death Certificate Match", points: 45, category: "life_transitions" },
  { id: "divorce_filing", label: "Divorce Filing", points: 40, category: "life_transitions" },
  { id: "job_loss_detected", label: "Job Loss Detected", points: 30, category: "life_transitions" },
  { id: "medical_collections", label: "Medical Collections", points: 25, category: "life_transitions" },
  { id: "mail_returned_6mo", label: "Mail Returned (6+ months)", points: 40, category: "life_transitions" },
  { id: "vacant_registration", label: "Vacant Property Registration", points: 35, category: "life_transitions" },
  { id: "insurance_cancelled", label: "Insurance Cancelled", points: 40, category: "life_transitions" },
  { id: "code_violations", label: "Code Violations", points: 30, category: "life_transitions" },
  { id: "grass_violations", label: "Grass/Lawn Violations", points: 20, category: "life_transitions" },

  // OPPORTUNITY INDICATORS (max 250)
  { id: "free_and_clear", label: "Free & Clear (No Mortgage)", points: 40, category: "opportunity_indicators" },
  { id: "equity_70_plus", label: "70%+ Equity", points: 35, category: "opportunity_indicators" },
  { id: "equity_50_to_70", label: "50-70% Equity", points: 25, category: "opportunity_indicators" },
  { id: "absentee_owner", label: "Absentee Owner", points: 25, category: "opportunity_indicators" },
  { id: "out_of_state_owner", label: "Out of State Owner", points: 30, category: "opportunity_indicators" },
  { id: "owned_10_plus_years", label: "Owned 10+ Years", points: 20, category: "opportunity_indicators" },
  { id: "mls_expired", label: "MLS Listing Expired", points: 40, category: "opportunity_indicators" },
  { id: "mls_withdrawn", label: "MLS Listing Withdrawn", points: 35, category: "opportunity_indicators" },
  { id: "fsbo_expired", label: "FSBO Expired", points: 35, category: "opportunity_indicators" },
  { id: "dom_180_plus", label: "Days on Market 180+", points: 35, category: "opportunity_indicators" },
  { id: "dom_90_to_180", label: "Days on Market 90-180", points: 25, category: "opportunity_indicators" },
  { id: "price_reduced_multiple", label: "Multiple Price Reductions", points: 30, category: "opportunity_indicators" },
  { id: "price_reduced_once", label: "Price Reduced Once", points: 20, category: "opportunity_indicators" },

  // PROPERTY CONDITION (max 200)
  { id: "condemned", label: "Condemned Property", points: 50, category: "property_condition" },
  { id: "structural_violations", label: "Structural Violations", points: 45, category: "property_condition" },
  { id: "health_safety_violations", label: "Health & Safety Violations", points: 40, category: "property_condition" },
  { id: "fire_damage", label: "Fire Damage", points: 45, category: "property_condition" },
  { id: "flood_damage", label: "Flood Damage", points: 40, category: "property_condition" },
  { id: "roof_damage", label: "Roof Damage", points: 30, category: "property_condition" },
  { id: "foundation_issues", label: "Foundation Issues", points: 35, category: "property_condition" },
  { id: "major_deferred_maintenance", label: "Major Deferred Maintenance", points: 25, category: "property_condition" },
];

// Cross-correlation bonuses
export const BONUSES: BonusDefinition[] = [
  {
    id: "divorce_high_equity",
    reason: "Divorce + High Equity (70%+)",
    requiredSignals: ["divorce_filing", "equity_70_plus"],
    points: 50,
  },
  {
    id: "probate_out_of_state",
    reason: "Probate + Out of State Owner",
    requiredSignals: ["probate_filed", "out_of_state_owner"],
    points: 40,
  },
  {
    id: "tax_mechanic_lien",
    reason: "Tax Lien + Mechanic's Lien",
    requiredSignals: ["federal_tax_lien", "mechanic_lien"],
    points: 50,
  },
  {
    id: "tax_mechanic_lien_state",
    reason: "Tax Lien + Mechanic's Lien",
    requiredSignals: ["state_tax_lien", "mechanic_lien"],
    points: 50,
  },
  {
    id: "vacant_code",
    reason: "Vacant + Code Violations",
    requiredSignals: ["vacant_registration", "code_violations"],
    points: 35,
  },
  {
    id: "auction_high_equity",
    reason: "Auction Scheduled + High Equity",
    requiredSignals: ["auction_scheduled_30_days", "equity_70_plus"],
    points: 40,
  },
  {
    id: "auction_high_equity_60",
    reason: "Auction Scheduled + High Equity",
    requiredSignals: ["auction_scheduled_60_days", "equity_70_plus"],
    points: 40,
  },
];

// Get signals by category
export function getSignalsByCategory(category: SignalCategory): SignalDefinition[] {
  return SIGNALS.filter((s) => s.category === category);
}

// Get all categories
export function getCategories(): SignalCategory[] {
  return ["financial_distress", "life_transitions", "opportunity_indicators", "property_condition"];
}

// Calculate motivation score
export function calculateMotivationScore(signals: string[]): MotivationScoreResult {
  const signalSet = new Set(signals);
  const breakdown: ScoreBreakdown[] = [];
  const bonuses: BonusBreakdown[] = [];
  const categoryScores: Record<SignalCategory, number> = {
    financial_distress: 0,
    life_transitions: 0,
    opportunity_indicators: 0,
    property_condition: 0,
  };

  // Calculate base scores from signals
  for (const signal of signals) {
    const signalDef = SIGNALS.find((s) => s.id === signal);
    if (signalDef) {
      breakdown.push({
        signal: signalDef.id,
        label: signalDef.label,
        points: signalDef.points,
      });
      categoryScores[signalDef.category] += signalDef.points;
    }
  }

  // Apply category caps
  for (const category of getCategories()) {
    const max = CATEGORY_MAX_SCORES[category];
    if (categoryScores[category] > max) {
      categoryScores[category] = max;
    }
  }

  // Calculate bonuses
  const appliedBonusIds = new Set<string>();
  for (const bonus of BONUSES) {
    // Check if all required signals are present
    const hasAllSignals = bonus.requiredSignals.every((s) => signalSet.has(s));
    if (hasAllSignals && !appliedBonusIds.has(bonus.id)) {
      bonuses.push({
        reason: bonus.reason,
        points: bonus.points,
      });
      appliedBonusIds.add(bonus.id);
    }
  }

  // Calculate total score
  const baseScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0);
  const bonusScore = bonuses.reduce((sum, b) => sum + b.points, 0);
  const totalScore = Math.min(baseScore + bonusScore, 1000);

  return {
    score: totalScore,
    breakdown,
    bonuses,
    categoryScores,
  };
}

// Get score tier info
export interface ScoreTier {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 800) {
    return {
      label: "HOT",
      color: "text-score-hot",
      bgColor: "bg-score-hot/15",
      borderColor: "border-score-hot/30",
    };
  }
  if (score >= 600) {
    return {
      label: "WARM",
      color: "text-score-warm",
      bgColor: "bg-score-warm/15",
      borderColor: "border-score-warm/30",
    };
  }
  if (score >= 400) {
    return {
      label: "MODERATE",
      color: "text-score-moderate",
      bgColor: "bg-score-moderate/15",
      borderColor: "border-score-moderate/30",
    };
  }
  if (score >= 200) {
    return {
      label: "COOL",
      color: "text-score-cool",
      bgColor: "bg-score-cool/15",
      borderColor: "border-score-cool/30",
    };
  }
  return {
    label: "COLD",
    color: "text-score-cold",
    bgColor: "bg-score-cold/15",
    borderColor: "border-score-cold/30",
  };
}
