import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Download,
  Eye,
  Send,
  PenTool,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Fingerprint,
  FileText,
  Copy,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: "created" | "sent" | "viewed" | "signed" | "declined" | "expired" | "reminder_sent" | "voided" | "downloaded" | "auth_verified" | "field_completed";
  actor: string;
  actorEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: string;
  details?: string;
  hash?: string;
}

export interface CertificateData {
  documentId: string;
  documentName: string;
  certificateId: string;
  createdAt: Date;
  completedAt: Date;
  signers: {
    name: string;
    email: string;
    signedAt: Date;
    ipAddress?: string;
    authMethod?: string;
  }[];
  auditTrail: AuditEntry[];
  documentHash: string;
  tamperProof: boolean;
}

// ─── Mock helpers ───────────────────────────────────────────

function generateHash(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function generateMockAuditTrail(docName: string, signerName: string, signerEmail: string): AuditEntry[] {
  const now = new Date();
  const base = now.getTime();
  return [
    { id: "a1", timestamp: new Date(base - 86400000 * 3), action: "created", actor: "You", details: `Document "${docName}" created`, hash: generateHash() },
    { id: "a2", timestamp: new Date(base - 86400000 * 3 + 60000), action: "sent", actor: "System", actorEmail: signerEmail, ipAddress: "192.168.1.1", details: `Sent to ${signerName} (${signerEmail})`, hash: generateHash() },
    { id: "a3", timestamp: new Date(base - 86400000 * 2), action: "viewed", actor: signerName, actorEmail: signerEmail, ipAddress: "73.162.45.89", userAgent: "Chrome 120 / macOS", geoLocation: "Dallas, TX", details: "Document opened and viewed", hash: generateHash() },
    { id: "a4", timestamp: new Date(base - 86400000 * 2 + 300000), action: "viewed", actor: signerName, actorEmail: signerEmail, ipAddress: "73.162.45.89", details: "Document viewed again (page 2)", hash: generateHash() },
    { id: "a5", timestamp: new Date(base - 86400000), action: "auth_verified", actor: signerName, actorEmail: signerEmail, ipAddress: "73.162.45.89", details: "Email OTP verification passed", hash: generateHash() },
    { id: "a6", timestamp: new Date(base - 86400000 + 120000), action: "field_completed", actor: signerName, ipAddress: "73.162.45.89", details: "Signature field completed", hash: generateHash() },
    { id: "a7", timestamp: new Date(base - 86400000 + 180000), action: "signed", actor: signerName, actorEmail: signerEmail, ipAddress: "73.162.45.89", geoLocation: "Dallas, TX", details: "Document signed successfully", hash: generateHash() },
  ];
}

// ─── Audit Trail Viewer ─────────────────────────────────────

interface AuditTrailViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  entries: AuditEntry[];
  onDownloadCertificate?: () => void;
}

const actionIcons: Record<string, React.ElementType> = {
  created: FileText,
  sent: Send,
  viewed: Eye,
  signed: PenTool,
  declined: XCircle,
  expired: Clock,
  reminder_sent: Send,
  voided: XCircle,
  downloaded: Download,
  auth_verified: Fingerprint,
  field_completed: CheckCircle,
};

const actionColors: Record<string, string> = {
  created: "text-brand",
  sent: "text-brand",
  viewed: "text-muted-foreground",
  signed: "text-success",
  declined: "text-destructive",
  expired: "text-warning",
  reminder_sent: "text-warning",
  voided: "text-destructive",
  downloaded: "text-muted-foreground",
  auth_verified: "text-success",
  field_completed: "text-brand",
};

export function AuditTrailViewer({ isOpen, onClose, documentName, entries, onDownloadCertificate }: AuditTrailViewerProps) {
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle>Audit Trail</DialogTitle>
              <DialogDescription>{documentName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tamper-proof indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
          <Lock className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Tamper-Proof Chain</span>
          <span className="text-xs text-muted-foreground ml-auto">{entries.length} events · SHA-256 hashed</span>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 space-y-0">
          {entries.map((entry, i) => {
            const Icon = actionIcons[entry.action] || FileText;
            const color = actionColors[entry.action] || "text-muted-foreground";
            const isLast = i === entries.length - 1;
            return (
              <div key={entry.id} className="relative pb-6">
                {/* Line */}
                {!isLast && (
                  <div className="absolute left-[-20px] top-6 bottom-0 w-px bg-border-subtle" />
                )}
                {/* Dot */}
                <div className={cn("absolute left-[-28px] top-0.5 h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center", color === "text-success" ? "border-success" : color === "text-destructive" ? "border-destructive" : "border-border-subtle")}>
                  <Icon className={cn("h-3 w-3", color)} />
                </div>
                {/* Content */}
                <div className="rounded-lg bg-surface-secondary p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{entry.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(entry.timestamp, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="font-medium">{entry.actor}</span>
                    {entry.ipAddress && (
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{entry.ipAddress}</span>
                    )}
                    {entry.geoLocation && <span>{entry.geoLocation}</span>}
                    {entry.userAgent && <span>{entry.userAgent}</span>}
                  </div>
                  {entry.hash && (
                    <button
                      onClick={() => copyHash(entry.hash!)}
                      className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60 hover:text-muted-foreground font-mono truncate max-w-full"
                    >
                      <Copy className="h-2.5 w-2.5 flex-shrink-0" />
                      {entry.hash.slice(0, 32)}...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          {onDownloadCertificate && (
            <Button variant="outline" className="gap-2" onClick={onDownloadCertificate}>
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
