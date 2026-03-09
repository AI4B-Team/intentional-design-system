import {
  Users,
  Phone,
  CalendarClock,
  FileText,
  Clock,
  MessageCircle,
  Handshake,
  Megaphone,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";

export interface PipelineStageConfig {
  id: string;
  label: string;
  color: string;
  icon: LucideIcon;
  description: string;
  targetDays: number;
  category: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  // Discovery (Red)
  { id: "new", label: "New Leads", color: "bg-red-500", icon: Users, description: "Fresh leads requiring qualification", targetDays: 2, category: "discovery" },
  { id: "contacted", label: "Contacted", color: "bg-red-500", icon: Phone, description: "Initial contact made", targetDays: 5, category: "discovery" },
  { id: "appointment", label: "Appointments", color: "bg-red-500", icon: CalendarClock, description: "Meeting scheduled with seller", targetDays: 3, category: "discovery" },
  // Intent (Amber)
  { id: "offer_made", label: "Offer Made", color: "bg-amber-500", icon: FileText, description: "Offer submitted, awaiting response", targetDays: 7, category: "intent" },
  { id: "follow_up", label: "Follow Up", color: "bg-amber-400", icon: Clock, description: "Awaiting response or next contact", targetDays: 7, category: "intent" },
  { id: "negotiating", label: "Negotiating", color: "bg-amber-500", icon: MessageCircle, description: "Active negotiation in progress", targetDays: 14, category: "intent" },
  // Commitment (Blue)
  { id: "under_contract", label: "Under Contract", color: "bg-blue-500", icon: Handshake, description: "Contract signed, heading to close", targetDays: 30, category: "commitment" },
  { id: "marketing", label: "Marketing", color: "bg-blue-500", icon: Megaphone, description: "Property being marketed to buyers", targetDays: 14, category: "commitment" },
  // Outcome (Green)
  { id: "closed", label: "Purchased", color: "bg-emerald-500", icon: BadgeDollarSign, description: "Deal completed", targetDays: 0, category: "outcome" },
  { id: "sold", label: "Sold", color: "bg-emerald-500", icon: BadgeDollarSign, description: "Property sold and funds received", targetDays: 0, category: "outcome" },
];

export function getLeadScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function getLeadScoreBg(score: number) {
  if (score >= 80) return "bg-success/10";
  if (score >= 60) return "bg-warning/10";
  return "bg-destructive/10";
}
