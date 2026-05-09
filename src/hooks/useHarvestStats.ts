import * as React from "react";
import type {
  HarvestLead,
  HarvestOverviewStats,
  SignalBreakdown,
  TrendPoint,
  HarvestIntegration,
  HarvestSignal,
  SignalType,
  FeedHealthRow,
  RunLogEntry,
} from "@/types/harvest";

// ----- Mock data generation (Phase 1) -----

const STREETS = [
  "Maple St", "Oak Ave", "Elm Dr", "Cedar Ln", "Pine Ct", "Birch Way",
  "Walnut Blvd", "Sycamore Rd", "Magnolia Pl", "Hickory Cir",
];
const CITIES: Array<[string, string, string]> = [
  ["Dallas", "TX", "75201"], ["Houston", "TX", "77002"], ["Atlanta", "GA", "30303"],
  ["Phoenix", "AZ", "85003"], ["Tampa", "FL", "33602"], ["Charlotte", "NC", "28202"],
  ["Memphis", "TN", "38103"], ["Birmingham", "AL", "35203"],
];
const COUNTIES = ["Dallas", "Harris", "Fulton", "Maricopa", "Hillsborough", "Mecklenburg", "Shelby", "Jefferson"];
const FIRST = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth"];
const LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

const SIGNAL_TYPES: SignalType[] = [
  "notice_of_default", "estate_filing", "dissolution_record", "debt_recording",
  "tax_default", "property_citation", "vacancy_signal", "stale_listing",
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function generateLead(i: number): HarvestLead {
  const r = seeded(i * 7919 + 31);
  const [city, state, zip] = pick(CITIES, r);
  const street = `${100 + Math.floor(r() * 9000)} ${pick(STREETS, r)}`;
  const ownerName = r() > 0.08 ? `${pick(FIRST, r)} ${pick(LAST, r)}` : null;
  const entity = r() > 0.7 ? "llc" : r() > 0.5 ? "trust" : "individual";
  const opp = Math.floor(r() * 60) + 35; // 35–95
  const distress = Math.min(100, opp + Math.floor(r() * 20));
  const conf = Math.floor(r() * 40) + 55;
  const signalCount = 1 + Math.floor(r() * 3);
  const usedTypes = new Set<SignalType>();
  const signals: HarvestSignal[] = [];
  for (let s = 0; s < signalCount; s++) {
    let t = pick(SIGNAL_TYPES, r);
    while (usedTypes.has(t)) t = pick(SIGNAL_TYPES, r);
    usedTypes.add(t);
    signals.push({
      type: t,
      source: "County Records",
      capturedAt: new Date(Date.now() - Math.floor(r() * 30) * 86400000).toISOString(),
      freshnessDays: Math.floor(r() * 30),
    });
  }
  const positive: string[] = [];
  const weak: string[] = [];
  const red: string[] = [];
  if (signals.length >= 2) positive.push("Multi-Signal Detected");
  if (entity === "individual") positive.push("Individual Owner");
  if (signals.some((s) => s.type === "tax_default")) red.push("Tax Default — Urgency High");
  if (signals.some((s) => s.type === "notice_of_default")) red.push("Foreclosure Initiated");
  if (!ownerName) weak.push("Owner Name Missing");
  if (conf < 65) weak.push("Low Confidence Data");

  return {
    id: `harvest_${i}`,
    address: street,
    city,
    state,
    zip,
    county: pick(COUNTIES, r),
    ownerName,
    ownerEntityType: entity,
    isAbsentee: r() > 0.55,
    mailingAddress: r() > 0.5 ? `PO Box ${Math.floor(r() * 9000)}, ${city}, ${state}` : undefined,
    phonePrimary: r() > 0.4 ? `(${200 + Math.floor(r() * 700)}) ${100 + Math.floor(r() * 900)}-${1000 + Math.floor(r() * 9000)}` : undefined,
    ownerConfidence: conf,
    confidenceLevel: conf >= 75 ? "high" : conf >= 55 ? "medium" : "low",
    assetClass: pick(["single_family", "single_family", "single_family", "multi_family", "commercial"] as const, r),
    beds: r() > 0.2 ? 2 + Math.floor(r() * 4) : null,
    baths: r() > 0.2 ? 1 + Math.floor(r() * 3) : null,
    sqft: r() > 0.2 ? 800 + Math.floor(r() * 2500) : null,
    yearBuilt: r() > 0.2 ? 1950 + Math.floor(r() * 70) : null,
    assessedValue: r() > 0.2 ? 80000 + Math.floor(r() * 400000) : null,
    arvEstimate: r() > 0.15 ? 120000 + Math.floor(r() * 500000) : null,
    opportunityScore: opp,
    distressScore: distress,
    confidenceScore: conf,
    signals,
    redFlags: red,
    positiveFlags: positive,
    weakFlags: weak,
    recommendedAction: opp >= 80 ? "Call now — high urgency" : opp >= 60 ? "Send mail this week" : "Add to nurture",
    daysUntilAuction: signals.some((s) => s.type === "notice_of_default") && r() > 0.5 ? Math.floor(r() * 30) : null,
    capturedAt: new Date(Date.now() - Math.floor(r() * 14) * 86400000).toISOString(),
  };
}

const ALL_LEADS: HarvestLead[] = Array.from({ length: 142 }, (_, i) => generateLead(i + 1));

// ----- Hooks -----

export function useHarvestStats() {
  const [stats] = React.useState<HarvestOverviewStats>({
    newSinceLastSession: 23,
    totalInSystem: 47832,
    hot: 312,
    warm: 1184,
    watch: 4209,
    skipTraced: 8421,
    mailedThisWeek: 1240,
    focusListCount: 47,
    readyToCall: 89,
    estateActive: 124,
    newToday: 312,
  });

  const signals: SignalBreakdown[] = [
    { type: "tax_default", count: 46210 },
    { type: "property_citation", count: 35087 },
    { type: "debt_recording", count: 4380 },
    { type: "notice_of_default", count: 2720 },
    { type: "estate_filing", count: 2650 },
    { type: "dissolution_record", count: 1970 },
    { type: "vacancy_signal", count: 839 },
    { type: "stale_listing", count: 612 },
  ];

  const trend: TrendPoint[] = React.useMemo(() => {
    const r = seeded(42);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const day = d.toISOString().slice(0, 10);
      const tax = 100 + Math.floor(r() * 80);
      const nod = 20 + Math.floor(r() * 30);
      const est = 15 + Math.floor(r() * 20);
      const cit = 60 + Math.floor(r() * 50);
      return {
        date: day,
        total: tax + nod + est + cit,
        tax_default: tax,
        notice_of_default: nod,
        estate_filing: est,
        property_citation: cit,
      };
    });
  }, []);

  const integrations: HarvestIntegration[] = [
    { name: "Enrich", description: "Skip trace + owner data", status: "connected", lastRun: "12 min ago" },
    { name: "Mail", description: "Direct mail dispatch", status: "active", lastRun: "2 hr ago" },
    { name: "Sync", description: "CRM push", status: "test", lastRun: "1 day ago" },
  ];

  const feed: string[] = [
    "Estate filing captured — Dallas, TX",
    "Tax Default flagged urgent — Harris County",
    "Mail candidate passed quality gate",
    "Notice of Default detected — Phoenix, AZ",
    "Vacancy signal updated — Tampa, FL",
  ];

  return { stats, signals, trend, integrations, feed };
}

export function useHarvestLeads() {
  return { leads: ALL_LEADS };
}

export function useFocusList() {
  const focus = React.useMemo(
    () => ALL_LEADS.filter((l) => l.opportunityScore >= 80).slice(0, 50),
    []
  );
  return { leads: focus };
}

export function useEngineHealth() {
  const feedHealth: FeedHealthRow[] = [
    { county: "Dallas", state: "TX", source: "Probate Court", lastRun: "12 min ago", status: "ok", recordsCaptured: 142, loginOk: true },
    { county: "Harris", state: "TX", source: "Tax Assessor", lastRun: "18 min ago", status: "ok", recordsCaptured: 89, loginOk: true },
    { county: "Fulton", state: "GA", source: "Code Enforcement", lastRun: "32 min ago", status: "warning", recordsCaptured: 14, loginOk: true },
    { county: "Maricopa", state: "AZ", source: "Foreclosure Filings", lastRun: "1 hr ago", status: "ok", recordsCaptured: 67, loginOk: true },
    { county: "Hillsborough", state: "FL", source: "Probate Court", lastRun: "2 hr ago", status: "error", recordsCaptured: 0, loginOk: false },
    { county: "Mecklenburg", state: "NC", source: "Tax Assessor", lastRun: "45 min ago", status: "ok", recordsCaptured: 53, loginOk: true },
  ];

  const runLog: RunLogEntry[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const r = seeded(100 + i);
    return {
      date: d.toISOString().slice(0, 10),
      runs: 12,
      okCount: 11 - Math.floor(r() * 2),
      errorCount: Math.floor(r() * 2),
      recordsProcessed: 800 + Math.floor(r() * 600),
      avgDurationSec: 45 + Math.floor(r() * 60),
    };
  });

  return { feedHealth, runLog };
}
