export interface RepairItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  unitCost: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface RepairTemplate {
  id: string;
  name: string;
  description: string;
  scope: RepairScope;
  items: Omit<RepairItem, "id">[];
}

export type RepairScope = "cosmetic" | "light" | "medium" | "heavy" | "gut";

export interface ScopeDefinition {
  value: RepairScope;
  label: string;
  description: string;
  lowPerSqft: number;
  highPerSqft: number;
}

export const REPAIR_SCOPES: ScopeDefinition[] = [
  {
    value: "cosmetic",
    label: "Cosmetic",
    description: "Paint, flooring, fixtures",
    lowPerSqft: 8,
    highPerSqft: 12,
  },
  {
    value: "light",
    label: "Light",
    description: "+ kitchen/bath updates",
    lowPerSqft: 15,
    highPerSqft: 25,
  },
  {
    value: "medium",
    label: "Medium",
    description: "+ mechanicals",
    lowPerSqft: 30,
    highPerSqft: 45,
  },
  {
    value: "heavy",
    label: "Heavy",
    description: "Major renovation",
    lowPerSqft: 50,
    highPerSqft: 75,
  },
  {
    value: "gut",
    label: "Gut Rehab",
    description: "Full rebuild",
    lowPerSqft: 80,
    highPerSqft: 120,
  },
];

export const CATEGORIES = [
  "Exterior",
  "Interior",
  "Flooring",
  "Kitchen",
  "Bathroom",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Foundation",
  "Windows/Doors",
  "Landscaping",
  "Miscellaneous",
] as const;

export type RepairCategory = (typeof CATEGORIES)[number];

export interface CategoryTotal {
  category: RepairCategory;
  total: number;
  itemCount: number;
}

export interface EstimateSummary {
  subtotal: number;
  contingencyPct: number;
  contingencyAmount: number;
  total: number;
  perSqft: number | null;
  categoryTotals: CategoryTotal[];
}
