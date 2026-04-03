import { type RecordCategory, type MotivatedFlag } from "./public-records-config";

// Seeded random for consistent data per county
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export interface PublicRecord {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  owner: string;
  category: string;
  docType: string;
  filedDate: string;
  amountDue: number | null;
  sellerScore: number;
  flags: string[];
  estimatedValue: number;
  equityPercent: number;
  daysOnFile: number;
  phone?: string;
  email?: string;
}

const STREETS = [
  "Oak", "Maple", "Cedar", "Pine", "Elm", "Walnut", "Birch", "Ash", "Cypress", "Willow",
  "Main", "Park", "Lake", "Hill", "Spring", "River", "Valley", "Forest", "Meadow", "Ridge",
];
const SUFFIXES = ["St", "Ave", "Dr", "Ln", "Ct", "Blvd", "Way", "Pl", "Rd", "Cir"];
const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];

const CATEGORIES = [
  "Foreclosure / Trustee", "Probate / Heirship", "Tax Delinquent", "Liens",
  "Lis Pendens", "Bankruptcy / Divorce", "Deeds", "Eviction",
];

const DOC_TYPES: Record<string, string[]> = {
  "Foreclosure / Trustee": ["Notice of Default", "Notice of Trustee Sale", "Lis Pendens"],
  "Probate / Heirship": ["Probate/Estate", "Heirship Affidavit", "Letters Testamentary"],
  "Tax Delinquent": ["Tax Lien Certificate", "Delinquent Notice", "Tax Sale Notice"],
  "Liens": ["Mechanic's Lien", "Federal Tax Lien", "HOA Lien", "Judgment Lien"],
  "Lis Pendens": ["Lis Pendens", "Civil Action", "Quiet Title"],
  "Bankruptcy / Divorce": ["Chapter 7", "Chapter 13", "Divorce Decree", "Dissolution"],
  "Deeds": ["Quit Claim Deed", "Warranty Deed", "Grant Deed"],
  "Eviction": ["Eviction Filing", "Unlawful Detainer", "Writ of Possession"],
};

const FLAGS = [
  "Vacant", "Pre-FC", "Tax Lien", "Code Viol", "Absentee", "Senior 65+",
  "High Equity", "Multiple Liens", "Distressed", "Probate", "Inherited",
  "Disabled Owner", "Veteran",
];

export function generatePublicRecords(county: string, state: string, count: number = 50): PublicRecord[] {
  const rand = seededRandom(county + state);
  const r = (min: number, max: number) => Math.round(min + rand() * (max - min));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const records: PublicRecord[] = [];

  for (let i = 0; i < count; i++) {
    const num = r(100, 12000);
    const street = pick(STREETS);
    const suffix = pick(SUFFIXES);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const category = pick(CATEGORIES);
    const docTypes = DOC_TYPES[category] || ["General"];
    const amountDue = category === "Tax Delinquent" ? r(2000, 50000) :
                      category === "Liens" ? r(5000, 200000) :
                      category === "Foreclosure / Trustee" ? r(80000, 500000) :
                      rand() > 0.5 ? r(10000, 300000) : null;
    const score = r(30, 95);
    const numFlags = r(1, 4);
    const recordFlags: string[] = [];
    for (let f = 0; f < numFlags; f++) {
      const flag = pick(FLAGS);
      if (!recordFlags.includes(flag)) recordFlags.push(flag);
    }

    const daysAgo = r(0, 180);
    const filed = new Date();
    filed.setDate(filed.getDate() - daysAgo);

    records.push({
      id: `pr-${i}-${county}`,
      address: `${num} ${street} ${suffix}`,
      city: county.split(" ")[0],
      state,
      zip: `${r(10000, 99999)}`,
      owner: `${lastName} ${firstName} ${rand() > 0.6 ? "EST OF" : rand() > 0.4 ? "& " + pick(FIRST_NAMES) : ""}`.trim(),
      category,
      docType: pick(docTypes),
      filedDate: filed.toISOString().split("T")[0],
      amountDue,
      sellerScore: score,
      flags: recordFlags,
      estimatedValue: r(80000, 600000),
      equityPercent: r(10, 90),
      daysOnFile: daysAgo,
    });
  }

  return records.sort((a, b) => b.sellerScore - a.sellerScore);
}
