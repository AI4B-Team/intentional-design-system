// ─── Signing Workflow Types ─────────────────────────────────

export type SignerStatus = "pending" | "sent" | "viewed" | "signed" | "declined";
export type SigningOrder = "parallel" | "sequential";
export type ReminderFrequency = "none" | "daily" | "every_2_days" | "weekly";

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: "signer" | "cc" | "approver";
  order: number; // used when signing order is sequential
  status: SignerStatus;
  sentAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
  viewCount: number;
  ipAddress?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actor: string; // signer name, system, or user
  actorEmail?: string;
  details?: string;
  ipAddress?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  maxReminders: number;
  remindersSent: number;
  lastReminderAt?: Date;
  nextReminderAt?: Date;
}

export interface SigningWorkflow {
  signingOrder: SigningOrder;
  signers: Signer[];
  reminders: ReminderSettings;
  expiresAt?: Date;
  expirationDays: number;
  auditTrail: AuditEvent[];
}

// ─── Defaults ───────────────────────────────────────────────

export const defaultReminderSettings: ReminderSettings = {
  enabled: true,
  frequency: "every_2_days",
  maxReminders: 5,
  remindersSent: 0,
};

export function createDefaultWorkflow(): SigningWorkflow {
  return {
    signingOrder: "parallel",
    signers: [],
    reminders: { ...defaultReminderSettings },
    expirationDays: 30,
    auditTrail: [],
  };
}

export function createSigner(name: string, email: string, order: number): Signer {
  return {
    id: `signer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    email,
    role: "signer",
    order,
    status: "pending",
    viewCount: 0,
  };
}

// ─── Status helpers ─────────────────────────────────────────

export const signerStatusConfig: Record<SignerStatus, { label: string; color: string }> = {
  pending: { label: "Waiting", color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700 border-blue-200" },
  viewed: { label: "Viewed", color: "bg-amber-100 text-amber-700 border-amber-200" },
  signed: { label: "Signed", color: "bg-success/10 text-success border-success/20" },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive border-destructive/20" },
};
