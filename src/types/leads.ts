// Lead status model — single record, multiple states (Graduation Flow v1.1)

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_followup"
  | "pipeline_active"
  | "offer_submitted"
  | "under_contract"
  | "closed_won"
  | "closed_lost"
  | "skipped"
  | "suppressed";

export const PIPELINE_STATUSES: LeadStatus[] = [
  "pipeline_active",
  "offer_submitted",
  "under_contract",
];

export const CLOSED_STATUSES: LeadStatus[] = ["closed_won", "closed_lost"];

export type DealStage =
  | "initial_contact"
  | "negotiating"
  | "offer_submitted"
  | "under_contract"
  | "closed";

export const DEAL_STAGE_META: Record<
  DealStage,
  { label: string; order: number; alertAfterDays: number }
> = {
  initial_contact: { label: "Initial Contact", order: 1, alertAfterDays: 7 },
  negotiating: { label: "Negotiating", order: 2, alertAfterDays: 14 },
  offer_submitted: { label: "Offer Out", order: 3, alertAfterDays: 7 },
  under_contract: { label: "Under Contract", order: 4, alertAfterDays: 30 },
  closed: { label: "Closed", order: 5, alertAfterDays: 0 },
};

export interface GraduationPayload {
  property_id: string;
  note?: string;
}

export interface CloseDealPayload {
  property_id: string;
  pipeline_deal_id: string;
  outcome: "won_acquired" | "won_assigned" | "lost";
  purchase_price?: number;
  assignment_fee?: number;
  lost_reason?: string;
}
