import {
  Gavel,
  ScrollText,
  Receipt,
  Link2,
  FileWarning,
  Scale,
  FileText,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export interface RecordCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface MotivatedFlag {
  id: string;
  label: string;
}

export const RECORD_CATEGORIES: RecordCategory[] = [
  { id: "Foreclosure / Trustee", label: "Foreclosure / Trustee", icon: Gavel, color: "text-red-400", bgColor: "bg-red-400/10" },
  { id: "Probate / Heirship", label: "Probate / Heirship", icon: ScrollText, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  { id: "Tax Delinquent", label: "Tax Delinquent", icon: Receipt, color: "text-amber-400", bgColor: "bg-amber-400/10" },
  { id: "Liens", label: "Liens", icon: Link2, color: "text-orange-400", bgColor: "bg-orange-400/10" },
  { id: "Lis Pendens", label: "Lis Pendens", icon: FileWarning, color: "text-rose-400", bgColor: "bg-rose-400/10" },
  { id: "Bankruptcy / Divorce", label: "Bankruptcy / Divorce", icon: Scale, color: "text-indigo-400", bgColor: "bg-indigo-400/10" },
  { id: "Deeds", label: "Deeds", icon: FileText, color: "text-sky-400", bgColor: "bg-sky-400/10" },
  { id: "Eviction", label: "Eviction", icon: ShieldAlert, color: "text-pink-400", bgColor: "bg-pink-400/10" },
];

export const MOTIVATED_FLAGS: MotivatedFlag[] = [
  { id: "delinquent_taxes", label: "Delinquent Taxes" },
  { id: "probate_estate", label: "Probate / Estate" },
  { id: "pre_foreclosure", label: "Pre-Foreclosure / FC" },
  { id: "lis_pendens", label: "Lis Pendens Filed" },
  { id: "senior_65", label: "Owner 65+" },
  { id: "disabled_owner", label: "Disabled Owner" },
  { id: "veteran_owner", label: "Veteran Owner" },
  { id: "bankruptcy", label: "Bankruptcy" },
  { id: "divorce", label: "Divorce Filing" },
  { id: "multiple_liens", label: "Multiple Liens" },
  { id: "judgment_lien", label: "Judgment Lien" },
  { id: "homestead", label: "Homestead" },
  { id: "llc_corp", label: "LLC / Corp Owner" },
  { id: "absentee", label: "Absentee Owner" },
  { id: "vacant", label: "Vacant" },
  { id: "code_violation", label: "Code Violation" },
  { id: "high_equity", label: "High Equity (60%+)" },
  { id: "new_this_week", label: "New This Week" },
];

export const TABS = [
  { id: "live", label: "Live Feed" },
  { id: "foreclosures", label: "Foreclosures" },
  { id: "tax", label: "Tax Delinquent" },
  { id: "probate", label: "Probate" },
  { id: "public", label: "Public Records" },
  { id: "stack", label: "Stack" },
  { id: "analyzer", label: "Deal Analyzer" },
  { id: "export", label: "Export + Mail" },
] as const;

export type TabId = typeof TABS[number]["id"];
