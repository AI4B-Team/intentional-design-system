/**
 * Transaction Coordinator Pipeline Stages
 * 
 * These stages are specifically for deals that are UNDER CONTRACT.
 * The pipeline flows: Contract Signed → Due Diligence → Title/Escrow → Marketing → Closing → Sold
 * 
 * All communications route through the Inbox.
 */

import { LucideIcon } from "lucide-react";
import {
  FileSignature,
  Search,
  Scale,
  Megaphone,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export type TransactionStageId =
  | "contract_signed"
  | "due_diligence"
  | "title_escrow"
  | "marketing"
  | "closing"
  | "sold"
  | "cancelled";

export interface TransactionStage {
  id: TransactionStageId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  order: number;
}

export const TRANSACTION_STAGES: Record<TransactionStageId, TransactionStage> = {
  contract_signed: {
    id: "contract_signed",
    label: "Contract Signed",
    shortLabel: "Signed",
    description: "Purchase agreement executed, earnest money deposited",
    icon: FileSignature,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200",
    order: 1,
  },
  due_diligence: {
    id: "due_diligence",
    label: "Due Diligence",
    shortLabel: "DD",
    description: "Inspections, title search, and contingency period",
    icon: Search,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-200",
    order: 2,
  },
  title_escrow: {
    id: "title_escrow",
    label: "Title & Escrow",
    shortLabel: "Title",
    description: "Title clearance and escrow coordination",
    icon: Scale,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-200",
    order: 3,
  },
  marketing: {
    id: "marketing",
    label: "Buyer Marketing",
    shortLabel: "Marketing",
    description: "Finding and matching end buyers for assignment",
    icon: Megaphone,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-200",
    order: 4,
  },
  closing: {
    id: "closing",
    label: "Closing",
    shortLabel: "Closing",
    description: "Final documents, funding, and transfer",
    icon: Key,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-200",
    order: 5,
  },
  sold: {
    id: "sold",
    label: "Sold",
    shortLabel: "Sold",
    description: "Transaction completed and closed",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    order: 6,
  },
  cancelled: {
    id: "cancelled",
    label: "Cancelled",
    shortLabel: "Cancelled",
    description: "Transaction fell through or was cancelled",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    order: 7,
  },
};

export const ACTIVE_STAGES: TransactionStageId[] = [
  "contract_signed",
  "due_diligence",
  "title_escrow",
  "marketing",
  "closing",
];

export const getStageConfig = (stageId: TransactionStageId | string): TransactionStage => {
  return TRANSACTION_STAGES[stageId as TransactionStageId] || TRANSACTION_STAGES.contract_signed;
};

export const getNextStage = (currentStage: TransactionStageId): TransactionStageId | null => {
  const currentOrder = TRANSACTION_STAGES[currentStage].order;
  const nextStage = Object.values(TRANSACTION_STAGES).find(s => s.order === currentOrder + 1);
  return nextStage?.id || null;
};

export const getPreviousStage = (currentStage: TransactionStageId): TransactionStageId | null => {
  const currentOrder = TRANSACTION_STAGES[currentStage].order;
  const prevStage = Object.values(TRANSACTION_STAGES).find(s => s.order === currentOrder - 1);
  return prevStage?.id || null;
};

/**
 * Critical Dates for Transaction Coordination
 */
export interface CriticalDate {
  id: string;
  label: string;
  date: Date | null;
  isCompleted: boolean;
  stageId: TransactionStageId;
  daysFromContract?: number; // Default days from contract signing
  isRequired: boolean;
  alertDaysBefore: number;
}

export const DEFAULT_CRITICAL_DATES: Omit<CriticalDate, "id" | "date" | "isCompleted">[] = [
  // Contract Signed
  { label: "Contract Execution", stageId: "contract_signed", daysFromContract: 0, isRequired: true, alertDaysBefore: 0 },
  { label: "Earnest Money Due", stageId: "contract_signed", daysFromContract: 3, isRequired: true, alertDaysBefore: 1 },
  
  // Due Diligence
  { label: "Inspection Deadline", stageId: "due_diligence", daysFromContract: 10, isRequired: true, alertDaysBefore: 2 },
  { label: "Appraisal Ordered", stageId: "due_diligence", daysFromContract: 7, isRequired: false, alertDaysBefore: 1 },
  { label: "Title Commitment Due", stageId: "due_diligence", daysFromContract: 14, isRequired: true, alertDaysBefore: 2 },
  
  // Title & Escrow
  { label: "Title Clear", stageId: "title_escrow", daysFromContract: 21, isRequired: true, alertDaysBefore: 3 },
  { label: "Survey Complete", stageId: "title_escrow", daysFromContract: 18, isRequired: false, alertDaysBefore: 2 },
  
  // Marketing (for wholesalers)
  { label: "Buyer Found", stageId: "marketing", daysFromContract: 14, isRequired: false, alertDaysBefore: 3 },
  { label: "Assignment Contract Signed", stageId: "marketing", daysFromContract: 21, isRequired: false, alertDaysBefore: 2 },
  
  // Closing
  { label: "Final Walkthrough", stageId: "closing", daysFromContract: 28, isRequired: true, alertDaysBefore: 1 },
  { label: "Closing Date", stageId: "closing", daysFromContract: 30, isRequired: true, alertDaysBefore: 3 },
  { label: "Funding Complete", stageId: "closing", daysFromContract: 30, isRequired: true, alertDaysBefore: 1 },
];

/**
 * Document Checklist for Transaction Coordination
 */
export interface DocumentItem {
  id: string;
  label: string;
  stageId: TransactionStageId;
  isRequired: boolean;
  isUploaded: boolean;
  uploadedAt?: Date;
  fileUrl?: string;
}

export const DEFAULT_DOCUMENTS: Omit<DocumentItem, "id" | "isUploaded" | "uploadedAt" | "fileUrl">[] = [
  // Contract Signed
  { label: "Purchase Agreement", stageId: "contract_signed", isRequired: true },
  { label: "Earnest Money Receipt", stageId: "contract_signed", isRequired: true },
  { label: "Proof of Funds", stageId: "contract_signed", isRequired: false },
  
  // Due Diligence
  { label: "Inspection Report", stageId: "due_diligence", isRequired: true },
  { label: "Appraisal Report", stageId: "due_diligence", isRequired: false },
  { label: "Repair Addendum", stageId: "due_diligence", isRequired: false },
  
  // Title & Escrow
  { label: "Title Commitment", stageId: "title_escrow", isRequired: true },
  { label: "Survey", stageId: "title_escrow", isRequired: false },
  { label: "HOA Documents", stageId: "title_escrow", isRequired: false },
  
  // Marketing
  { label: "Assignment Contract", stageId: "marketing", isRequired: false },
  { label: "Buyer Proof of Funds", stageId: "marketing", isRequired: false },
  
  // Closing
  { label: "Closing Disclosure", stageId: "closing", isRequired: true },
  { label: "Settlement Statement", stageId: "closing", isRequired: true },
  { label: "Deed", stageId: "closing", isRequired: true },
];

/**
 * Stakeholder types for transaction coordination
 */
export type StakeholderType = 
  | "seller"
  | "seller_agent"
  | "buyer"
  | "buyer_agent"
  | "title_company"
  | "lender"
  | "inspector"
  | "appraiser"
  | "insurance"
  | "attorney";

export interface Stakeholder {
  id: string;
  type: StakeholderType;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  role: string;
  isConfirmed: boolean;
  notes?: string;
}

export const STAKEHOLDER_LABELS: Record<StakeholderType, string> = {
  seller: "Seller",
  seller_agent: "Seller's Agent",
  buyer: "End Buyer",
  buyer_agent: "Buyer's Agent",
  title_company: "Title Company",
  lender: "Lender",
  inspector: "Inspector",
  appraiser: "Appraiser",
  insurance: "Insurance",
  attorney: "Attorney",
};
