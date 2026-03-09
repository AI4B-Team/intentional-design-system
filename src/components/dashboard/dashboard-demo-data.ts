import type { HotOpportunityEnhanced } from "@/hooks/useDashboardInsights";

export const demoPipelineValueData = {
  leads: { count: 42, totalValue: 7350000, profitPotential: 367500 },
  offers: { count: 12, totalValue: 2100000, profitPotential: 105000 },
  contracted: { count: 8, totalValue: 1400000, profitPotential: 84000 },
  sold: { count: 1, totalValue: 175000, profitPotential: 10500 },
};

function demoOpp(
  id: string,
  address: string,
  city: string,
  state: string,
  score: number,
  status: string,
  daysAgo: number,
  profit: number,
  equity: number,
  arv: number,
  urgency: string | null = null,
  rank: string = "",
): HotOpportunityEnhanced {
  return {
    id: `demo-${id}`,
    address,
    city,
    state,
    motivation_score: score,
    status,
    updated_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    owner_phone: `(555) ${String(100 + parseInt(id)).padStart(3, '0')}-${String(4567 + parseInt(id))}`,
    owner_email: `owner${id}@example.com`,
    profit_potential: profit,
    equity_percent: equity,
    days_since_added: daysAgo,
    urgency_reason: urgency,
    deal_score_rank: rank,
    arv,
  };
}

export const demoHotOpportunities: HotOpportunityEnhanced[] = [
  demoOpp("1", "1842 Sunset Boulevard", "Los Angeles", "CA", 920, "new", 0, 78000, 45, 385000, "🔥 Motivated seller", "🏆 Top Deal"),
  demoOpp("2", "3921 Maple Street", "Phoenix", "AZ", 850, "contacted", 1, 62000, 38, 295000, "Pre-foreclosure"),
  demoOpp("3", "7845 Oak Avenue", "Dallas", "TX", 780, "new", 2, 55000, 52, 265000),
  demoOpp("4", "2156 Cherry Lane", "Atlanta", "GA", 720, "appointment", 3, 48000, 35, 225000, "🔥 Divorce situation"),
  demoOpp("5", "9023 Birch Court", "Denver", "CO", 680, "new", 4, 42000, 28, 198000),
  demoOpp("6", "4512 Willow Creek Drive", "Austin", "TX", 620, "contacted", 5, 38000, 42, 275000),
  demoOpp("7", "8734 Pinewood Lane", "Seattle", "WA", 590, "new", 6, 51000, 33, 320000),
  demoOpp("8", "1298 Riverside Boulevard", "Miami", "FL", 540, "appointment", 7, 45000, 31, 245000),
  demoOpp("9", "5567 Mountain View Road", "Portland", "OR", 510, "new", 8, 39000, 29, 215000),
  demoOpp("10", "3344 Harbor View Drive", "San Diego", "CA", 480, "contacted", 9, 52000, 36, 298000),
  demoOpp("11", "7789 Lakeshore Terrace", "Chicago", "IL", 450, "new", 10, 41000, 27, 188000),
  demoOpp("12", "2211 Forest Hills Lane", "Nashville", "TN", 420, "contacted", 11, 36000, 24, 172000),
  demoOpp("13", "445 Lakeview Drive", "Tampa", "FL", 410, "new", 12, 33000, 22, 165000),
];

export const demoRecentActivity = [
  {
    id: "demo-activity-1",
    type: "property_added" as const,
    description: "New Property Added: 1842 Sunset Boulevard",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    relativeTime: "30 minutes ago",
    propertyId: "demo-1",
  },
  {
    id: "demo-activity-2",
    type: "offer_sent" as const,
    description: "Offer Sent: $285,000 on 3921 Maple Street",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    relativeTime: "2 hours ago",
    propertyId: "demo-2",
  },
  {
    id: "demo-activity-3",
    type: "appointment_scheduled" as const,
    description: "Property Walkthrough Scheduled: 7845 Oak Avenue",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    relativeTime: "5 hours ago",
    propertyId: "demo-3",
  },
  {
    id: "demo-activity-4",
    type: "response_received" as const,
    description: "Counter-Offer Received: $310,000 on 2156 Cherry Lane",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    relativeTime: "1 day ago",
    propertyId: "demo-4",
  },
  {
    id: "demo-activity-5",
    type: "status_changed" as const,
    description: "Status Updated to Under Contract: 9023 Birch Court",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    relativeTime: "2 days ago",
    propertyId: "demo-5",
  },
  {
    id: "demo-activity-6",
    type: "property_added" as const,
    description: "New Property Added: 4512 Willow Creek Drive",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    relativeTime: "3 days ago",
    propertyId: "demo-6",
  },
];
