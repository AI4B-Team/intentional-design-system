import * as React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertCircle,
  RefreshCw,
  Phone,
  Send,
} from "lucide-react";
import { differenceInHours, differenceInDays } from "date-fns";
import { SigningWorkflow } from "@/types/signing-workflow";

// ─── Types ──────────────────────────────────────────────────
export type SignatureStatus = "draft" | "pending" | "signed" | "declined" | "expired";
export type AIActionMode = "manual" | "ai_assist" | "ai_auto";
export type SendStep = "deal" | "template" | "variables" | "fields" | "signers" | "followup_mode" | "recipient";

export interface SignatureRequest {
  id: string;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  status: SignatureStatus;
  createdAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
  propertyAddress?: string;
  viewedAt?: Date;
  viewCount?: number;
  lastActivity?: string;
  templateId?: string;
  workflow?: SigningWorkflow;
  dealId?: string;
  dealStatus?: string;
  aiMode?: AIActionMode;
  aiStatus?: string; // e.g. "Follow-Up Ready", "Reminder Scheduled", "Waiting on Approval"
}

export const AI_MODE_CONFIG: Record<AIActionMode, { label: string; icon: string; description: string; color: string }> = {
  manual: { label: "Manual", icon: "🧍", description: "AI suggests — you decide", color: "text-muted-foreground" },
  ai_assist: { label: "AI Assist", icon: "🤖", description: "AI drafts — you approve with one click", color: "text-brand" },
  ai_auto: { label: "AI Auto", icon: "⚡", description: "AI sends reminders automatically on your rules", color: "text-warning" },
};

export const statusConfig: Record<SignatureStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "In Progress", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Out For Signature", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  signed: { label: "Completed", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  declined: { label: "Action Required", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

// ─── Helpers ────────────────────────────────────────────────
export function formatTimeAgo(date: Date): string {
  const hours = differenceInHours(new Date(), date);
  if (hours < 1) return "Just Now";
  if (hours < 24) return `${hours}h Ago`;
  const days = differenceInDays(new Date(), date);
  if (days < 7) return `${days}d Ago`;
  if (days < 30) return `${Math.floor(days / 7)}w Ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo Ago`;
  return `${Math.floor(days / 365)}y Ago`;
}

export function getNextAction(request: SignatureRequest): { label: string; icon: React.ElementType; color: string } | null {
  if (request.status === "signed") return { label: "Archive", icon: CheckCircle, color: "text-success" };
  if (request.status === "pending" && request.expiresAt && differenceInHours(request.expiresAt, new Date()) <= 24) {
    return { label: "Resend — Expires in 24h", icon: RefreshCw, color: "text-destructive" };
  }
  if (request.status === "pending" && request.viewedAt && !request.signedAt) {
    const hoursSinceView = differenceInHours(new Date(), request.viewedAt);
    if (hoursSinceView > 6) return { label: `Follow Up (SMS) — Viewed ${hoursSinceView}h Ago`, icon: Phone, color: "text-warning" };
    return { label: "Waiting — Viewed Recently", icon: Eye, color: "text-muted-foreground" };
  }
  if (request.status === "pending" && !request.viewedAt) return { label: "Waiting — Not Yet Opened", icon: Clock, color: "text-muted-foreground" };
  if (request.status === "declined") return { label: "Call Signer — Declined", icon: Phone, color: "text-destructive" };
  if (request.status === "draft") return { label: "Send", icon: Send, color: "text-brand" };
  return null;
}

// ─── Sample data ────────────────────────────────────────────
export const mockRequests: SignatureRequest[] = [
  {
    id: "1",
    documentName: "Purchase Agreement - 123 Main St",
    recipientName: "John Smith",
    recipientEmail: "john.smith@email.com",
    status: "pending",
    createdAt: new Date("2024-01-20"),
    sentAt: new Date("2024-01-20"),
    expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
    propertyAddress: "123 Main St, Austin, TX",
    viewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    viewCount: 3,
    lastActivity: "Viewed 3h Ago",
    templateId: "tpl-1",
    dealId: "deal-1",
    dealStatus: "offer_made",
    aiMode: "ai_assist",
    aiStatus: "Follow-Up Ready",
    workflow: {
      signingOrder: "sequential",
      signers: [
        { id: "s1", name: "John Smith", email: "john.smith@email.com", role: "signer", order: 1, status: "viewed", viewCount: 3, viewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), sentAt: new Date("2024-01-20") },
        { id: "s2", name: "Jane Smith", email: "jane.smith@email.com", role: "signer", order: 2, status: "pending", viewCount: 0 },
      ],
      reminders: { enabled: true, frequency: "every_2_days", maxReminders: 5, remindersSent: 1, lastReminderAt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      expirationDays: 30,
      auditTrail: [
        { id: "a1", timestamp: new Date("2024-01-20T09:00:00"), action: "created", actor: "You", details: "Document created from Purchase Agreement template" },
        { id: "a2", timestamp: new Date("2024-01-20T09:05:00"), action: "sent", actor: "System", actorEmail: "john.smith@email.com", details: "Sent to John Smith" },
        { id: "a3", timestamp: new Date("2024-01-20T14:30:00"), action: "viewed", actor: "John Smith", actorEmail: "john.smith@email.com", ipAddress: "192.168.1.42" },
        { id: "a4", timestamp: new Date("2024-01-22T09:00:00"), action: "reminder_sent", actor: "System", details: "Auto-reminder sent to John Smith" },
      ],
    },
  },
  {
    id: "2",
    documentName: "Assignment Contract - 456 Oak Ave",
    recipientName: "Sarah Johnson",
    recipientEmail: "sarah.j@email.com",
    status: "signed",
    createdAt: new Date("2024-01-18"),
    sentAt: new Date("2024-01-18"),
    signedAt: new Date("2024-01-19"),
    propertyAddress: "456 Oak Ave, Dallas, TX",
    viewCount: 2,
    lastActivity: "Signed",
    templateId: "tpl-2",
    dealId: "deal-2",
    dealStatus: "under_contract",
    aiMode: "ai_auto",
    aiStatus: "Complete — Archived",
  },
  {
    id: "3",
    documentName: "Lead Paint Disclosure",
    recipientName: "Mike Williams",
    recipientEmail: "mike.w@email.com",
    status: "declined",
    createdAt: new Date("2024-01-15"),
    sentAt: new Date("2024-01-15"),
    propertyAddress: "789 Pine Rd, Houston, TX",
    viewCount: 1,
    lastActivity: "Declined",
    templateId: "tpl-3",
    aiMode: "manual",
  },
  {
    id: "4",
    documentName: "Seller Financing Agreement",
    recipientName: "Emily Brown",
    recipientEmail: "emily.brown@email.com",
    status: "draft",
    createdAt: new Date("2024-01-22"),
    viewCount: 0,
    lastActivity: "Draft",
  },
  {
    id: "5",
    documentName: "Addendum - 321 Elm St",
    recipientName: "David Lee",
    recipientEmail: "david.lee@email.com",
    status: "pending",
    createdAt: new Date("2024-01-21"),
    sentAt: new Date("2024-01-21"),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    propertyAddress: "321 Elm St, San Antonio, TX",
    viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    viewCount: 5,
    lastActivity: "Viewed 12h Ago · No Action",
    templateId: "tpl-5",
    dealId: "deal-5",
    dealStatus: "negotiating",
    aiMode: "ai_auto",
    aiStatus: "Reminder Scheduled",
  },
];
