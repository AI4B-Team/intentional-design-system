export interface VelocityFactor {
  name: string;
  points: number;
  description: string;
  category: "competition" | "market" | "seller_urgency";
}

export interface VelocityResult {
  score: number;
  factors: VelocityFactor[];
  urgency_level: "CRITICAL" | "HIGH" | "STANDARD" | "LOW";
  recommended_action: string;
  deadline: Date | null;
  deadline_type?: string;
  days_until_deadline?: number;
}

export interface PropertyVelocityData {
  // Competition factors
  other_investors_contacted?: boolean;
  on_wholesaler_lists?: boolean;
  multiple_recent_inquiries?: boolean;
  competitor_activity_flagged?: boolean;
  competition_detected?: boolean;
  competition_notes?: string;

  // Market factors
  days_on_market?: number;
  area_avg_days_on_market?: number;
  high_buyer_demand_area?: boolean;
  fast_market_comps?: boolean;

  // Seller urgency factors
  auction_date?: Date | string;
  seller_mentioned_urgent?: boolean;
  foreclosure_advancing?: boolean;
  life_event_deadline?: Date | string;
  life_event_type?: string;
  motivation_score?: number;

  // Existing property data
  distress_signals?: string[];
}

function daysUntilDate(date: Date | string | undefined): number | null {
  if (!date) return null;
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getUrgencyLevel(score: number): "CRITICAL" | "HIGH" | "STANDARD" | "LOW" {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "STANDARD";
  return "LOW";
}

function getRecommendedAction(urgencyLevel: string, deadline: Date | null, daysUntil: number | null): string {
  if (urgencyLevel === "CRITICAL") {
    if (daysUntil !== null && daysUntil <= 3) {
      return `URGENT: Act immediately - deadline in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
    }
    return "Act within 24 hours - high competition or deadline approaching";
  }
  if (urgencyLevel === "HIGH") {
    if (daysUntil !== null && daysUntil <= 7) {
      return `Contact today - ${daysUntil} days until deadline`;
    }
    return "Contact today - strong urgency indicators present";
  }
  if (urgencyLevel === "STANDARD") {
    return "Contact within 48 hours - moderate urgency";
  }
  return "Add to nurture sequence - low urgency, requires relationship building";
}

export function calculateVelocityScore(data: PropertyVelocityData): VelocityResult {
  const factors: VelocityFactor[] = [];
  let competitionPoints = 0;
  let marketPoints = 0;
  let sellerUrgencyPoints = 0;

  // ========== COMPETITION FACTORS (max 40) ==========
  if (data.other_investors_contacted) {
    factors.push({
      name: "Other Investors Contacted",
      points: 20,
      description: "Seller has been contacted by other investors",
      category: "competition",
    });
    competitionPoints += 20;
  }

  if (data.on_wholesaler_lists) {
    factors.push({
      name: "On Wholesaler Lists",
      points: 15,
      description: "Property appears on other wholesaler marketing",
      category: "competition",
    });
    competitionPoints += 15;
  }

  if (data.multiple_recent_inquiries) {
    factors.push({
      name: "Multiple Recent Inquiries",
      points: 10,
      description: "Property receiving significant interest",
      category: "competition",
    });
    competitionPoints += 10;
  }

  if (data.competitor_activity_flagged || data.competition_detected) {
    factors.push({
      name: "Competitor Activity",
      points: 10,
      description: "Signs of competitor activity detected",
      category: "competition",
    });
    competitionPoints += 10;
  }

  competitionPoints = Math.min(competitionPoints, 40);

  // ========== MARKET FACTORS (max 25) ==========
  if (data.days_on_market !== undefined && data.area_avg_days_on_market) {
    const ratio = data.days_on_market / data.area_avg_days_on_market;
    if (ratio <= 0.5) {
      factors.push({
        name: "Fast Moving Property",
        points: 15,
        description: "50%+ faster than average days on market",
        category: "market",
      });
      marketPoints += 15;
    } else if (ratio <= 1.0) {
      factors.push({
        name: "Average Market Time",
        points: 10,
        description: "At or near average days on market",
        category: "market",
      });
      marketPoints += 10;
    } else {
      factors.push({
        name: "Extended Market Time",
        points: 5,
        description: "Slower than average - may indicate issues or opportunity",
        category: "market",
      });
      marketPoints += 5;
    }
  }

  if (data.high_buyer_demand_area) {
    factors.push({
      name: "High Demand Area",
      points: 10,
      description: "Property in area with strong buyer demand",
      category: "market",
    });
    marketPoints += 10;
  }

  if (data.fast_market_comps) {
    factors.push({
      name: "Fast Comp Sales",
      points: 10,
      description: "Recent comparables sold quickly",
      category: "market",
    });
    marketPoints += 10;
  }

  marketPoints = Math.min(marketPoints, 25);

  // ========== SELLER URGENCY FACTORS (max 35) ==========
  let deadline: Date | null = null;
  let deadlineType: string | undefined;
  let daysUntilDeadline: number | null = null;

  // Auction date
  const daysToAuction = daysUntilDate(data.auction_date);
  if (daysToAuction !== null && daysToAuction > 0) {
    deadline = typeof data.auction_date === "string" ? new Date(data.auction_date) : data.auction_date!;
    deadlineType = "Auction";
    daysUntilDeadline = daysToAuction;

    if (daysToAuction <= 30) {
      factors.push({
        name: "Auction Imminent",
        points: 20,
        description: `Auction in ${daysToAuction} days`,
        category: "seller_urgency",
      });
      sellerUrgencyPoints += 20;
    } else if (daysToAuction <= 60) {
      factors.push({
        name: "Auction Approaching",
        points: 15,
        description: `Auction in ${daysToAuction} days`,
        category: "seller_urgency",
      });
      sellerUrgencyPoints += 15;
    }
  }

  // Life event deadline
  const daysToLifeEvent = daysUntilDate(data.life_event_deadline);
  if (daysToLifeEvent !== null && daysToLifeEvent > 0) {
    if (!deadline || daysToLifeEvent < daysUntilDeadline!) {
      deadline = typeof data.life_event_deadline === "string" 
        ? new Date(data.life_event_deadline) 
        : data.life_event_deadline!;
      deadlineType = data.life_event_type || "Life Event";
      daysUntilDeadline = daysToLifeEvent;
    }

    factors.push({
      name: "Life Event Deadline",
      points: 10,
      description: data.life_event_type 
        ? `${data.life_event_type} deadline in ${daysToLifeEvent} days`
        : `Life event deadline in ${daysToLifeEvent} days`,
      category: "seller_urgency",
    });
    sellerUrgencyPoints += 10;
  }

  if (data.seller_mentioned_urgent) {
    factors.push({
      name: "Seller Expressed Urgency",
      points: 15,
      description: "Seller mentioned needing to sell quickly",
      category: "seller_urgency",
    });
    sellerUrgencyPoints += 15;
  }

  if (data.foreclosure_advancing) {
    factors.push({
      name: "Foreclosure Advancing",
      points: 15,
      description: "Foreclosure process is progressing",
      category: "seller_urgency",
    });
    sellerUrgencyPoints += 15;
  }

  if (data.motivation_score && data.motivation_score > 800) {
    factors.push({
      name: "High Motivation Score",
      points: 10,
      description: `Motivation score of ${data.motivation_score} indicates strong seller motivation`,
      category: "seller_urgency",
    });
    sellerUrgencyPoints += 10;
  }

  // Check distress signals for additional urgency
  if (data.distress_signals?.length) {
    const urgentSignals = ["foreclosure", "pre-foreclosure", "bankruptcy", "divorce", "probate", "death", "estate"];
    const hasUrgentSignal = data.distress_signals.some((signal) =>
      urgentSignals.some((urgent) => signal.toLowerCase().includes(urgent))
    );
    if (hasUrgentSignal && sellerUrgencyPoints < 35) {
      factors.push({
        name: "Distress Signals",
        points: 5,
        description: "Property shows distress indicators",
        category: "seller_urgency",
      });
      sellerUrgencyPoints += 5;
    }
  }

  sellerUrgencyPoints = Math.min(sellerUrgencyPoints, 35);

  // ========== CALCULATE FINAL SCORE ==========
  const score = competitionPoints + marketPoints + sellerUrgencyPoints;
  const urgency_level = getUrgencyLevel(score);
  const recommended_action = getRecommendedAction(urgency_level, deadline, daysUntilDeadline);

  return {
    score,
    factors: factors.sort((a, b) => b.points - a.points),
    urgency_level,
    recommended_action,
    deadline,
    deadline_type: deadlineType,
    days_until_deadline: daysUntilDeadline ?? undefined,
  };
}

export function getUrgencyColor(level: string): { bg: string; text: string; border: string } {
  switch (level) {
    case "CRITICAL":
      return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive" };
    case "HIGH":
      return { bg: "bg-warning/10", text: "text-warning", border: "border-warning" };
    case "STANDARD":
      return { bg: "bg-info/10", text: "text-info", border: "border-info" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" };
  }
}

export function getVelocityScoreColor(score: number): string {
  if (score >= 90) return "text-destructive";
  if (score >= 70) return "text-warning";
  if (score >= 40) return "text-info";
  return "text-muted-foreground";
}

// Simulate velocity data for properties (in real app, this would come from DB)
export function getDefaultVelocityData(property: {
  motivation_score?: number | null;
  distress_signals?: any;
  status?: string | null;
}): PropertyVelocityData {
  const distressSignals = property.distress_signals && Array.isArray(property.distress_signals)
    ? (property.distress_signals as string[])
    : [];

  // Simulate some market data
  const hasForeclosureSignal = distressSignals.some((s) => 
    s.toLowerCase().includes("foreclosure") || s.toLowerCase().includes("pre-foreclosure")
  );

  return {
    motivation_score: property.motivation_score || 0,
    distress_signals: distressSignals,
    foreclosure_advancing: hasForeclosureSignal,
    days_on_market: Math.floor(Math.random() * 90) + 10,
    area_avg_days_on_market: 45,
    high_buyer_demand_area: Math.random() > 0.5,
  };
}
