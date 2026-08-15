import * as React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PenTool,
  Send,
  CheckCircle,
  Eye,
  Download,
  Trash2,
  Users,
  RefreshCw,
  Link2,
  Ban,
  ArrowRight,
  Phone,
  Sparkles,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInHours } from "date-fns";
import { AuditTrail } from "@/components/signatures/AuditTrail";
import { WorkflowVisualizer } from "@/components/signatures/WorkflowVisualizer";
import {
  AI_MODE_CONFIG,
  AIActionMode,
  SignatureRequest,
  formatTimeAgo,
  statusConfig,
} from "./signature-request-types";

type DetailTab = "details" | "signers" | "audit";

interface RequestDetailDialogProps {
  request: SignatureRequest | null;
  onClose: () => void;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  onCycleAiMode: (request: SignatureRequest, next: AIActionMode) => void;
  onOpenSigning: (request: SignatureRequest) => void;
  onCopyLink: (id: string) => void;
  onResend: (id: string) => void;
  onVoid: (id: string) => void;
  onDelete: (id: string) => void;
  onViewCertificate: (request: SignatureRequest) => void;
  onOpenAuditTrail: (request: SignatureRequest) => void;
  onOpenVersioning: (request: SignatureRequest) => void;
  onOpenMobileSigning: (request: SignatureRequest) => void;
  onOpenAiAnalysis: (request: SignatureRequest) => void;
}

export function RequestDetailDialog({
  request,
  onClose,
  detailTab,
  setDetailTab,
  onCycleAiMode,
  onOpenSigning,
  onCopyLink,
  onResend,
  onVoid,
  onDelete,
  onViewCertificate,
  onOpenAuditTrail,
  onOpenVersioning,
  onOpenMobileSigning,
  onOpenAiAnalysis,
}: RequestDetailDialogProps) {
  const info = request ? statusConfig[request.status] : null;
  const Icon = info?.icon;
  const wf = request?.workflow;

  return (
    <Dialog open={!!request} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[650px]">
        {request && info && Icon && (
          <>
            <DialogHeader>
              <DialogTitle>{request.documentName}</DialogTitle>
              <DialogDescription>Signature request details</DialogDescription>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border-subtle px-6 flex-shrink-0">
              {(["details", "signers", "audit"] as const).map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "px-3 py-2 text-sm font-medium border-b-2 transition-colors capitalize",
                    detailTab === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab === "signers" ? `Signers${wf ? ` (${wf.signers.length})` : ""}` : tab === "audit" ? "Audit Trail" : "Details"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6">
              {/* Details Tab */}
              {detailTab === "details" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", info.color)}>
                      <Icon className="h-3 w-3 mr-1" />
                      {info.label}
                    </Badge>
                    {request.viewCount !== undefined && request.viewCount > 0 && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        Viewed {request.viewCount}×
                      </Badge>
                    )}
                    {wf && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {wf.signingOrder}
                      </Badge>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="flex items-center gap-2 text-sm border border-border-subtle rounded-lg p-3 bg-surface-secondary">
                    <div className="flex items-center gap-2 flex-wrap">
                      {request.sentAt && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Send className="h-3 w-3" /> Sent {formatTimeAgo(request.sentAt)}
                        </span>
                      )}
                      {request.viewedAt && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3 w-3" /> Opened {formatTimeAgo(request.viewedAt)}
                          </span>
                        </>
                      )}
                      {request.signedAt && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle className="h-3 w-3" /> Signed {formatTimeAgo(request.signedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Recipient</p>
                      <p className="font-medium">{request.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{request.recipientEmail}</p>
                    </div>
                    {request.propertyAddress && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">Property Address</p>
                        <p className="font-medium">{request.propertyAddress}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground mb-1">Created</p>
                      <p className="font-medium">{format(request.createdAt, "MMM d, yyyy")}</p>
                    </div>
                    {request.sentAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Sent</p>
                        <p className="font-medium">{format(request.sentAt, "MMM d, yyyy")}</p>
                      </div>
                    )}
                    {request.signedAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Signed</p>
                        <p className="font-medium">{format(request.signedAt, "MMM d, yyyy")}</p>
                      </div>
                    )}
                    {request.expiresAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Expires</p>
                        <p className={cn(
                          "font-medium",
                          differenceInHours(request.expiresAt, new Date()) <= 48 ? "text-destructive" : ""
                        )}>
                          {format(request.expiresAt, "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                    {wf?.reminders.enabled && (
                      <div>
                        <p className="text-muted-foreground mb-1">Reminders</p>
                        <p className="font-medium">{wf.reminders.remindersSent}/{wf.reminders.maxReminders} sent</p>
                      </div>
                    )}
                    {request.dealId && (
                      <div className="col-span-2 mt-2 flex items-center gap-2 text-xs bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
                        <Building2 className="h-3.5 w-3.5 text-brand" />
                        <span className="font-medium text-brand">Linked to Deal</span>
                        {request.dealStatus && (
                          <Badge variant="outline" className="text-[10px] h-5 capitalize">
                            {request.dealStatus.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                    )}
                    {/* AI Mode indicator in detail view */}
                    {request.aiMode && (
                      <div className="col-span-2 mt-2 flex items-center justify-between text-xs bg-muted/30 border border-border-subtle rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span>{AI_MODE_CONFIG[request.aiMode].icon}</span>
                          <span className="font-medium text-foreground">{AI_MODE_CONFIG[request.aiMode].label}</span>
                          {request.aiStatus && (
                            <span className="text-muted-foreground">· {request.aiStatus}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onClick={() => {
                            const modes: AIActionMode[] = ["manual", "ai_assist", "ai_auto"];
                            const current = modes.indexOf(request.aiMode!);
                            onCycleAiMode(request, modes[(current + 1) % modes.length]);
                          }}
                        >
                          Switch Mode
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signers Tab - Enhanced with Workflow Visualizer */}
              {detailTab === "signers" && wf && (
                <WorkflowVisualizer workflow={wf} />
              )}
              {detailTab === "signers" && !wf && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No workflow configured for this request
                </div>
              )}

              {/* Audit Trail Tab */}
              {detailTab === "audit" && (
                <AuditTrail events={wf?.auditTrail || []} />
              )}
            </div>

            <DialogFooter className="flex-wrap gap-1.5">
              {request.status === "pending" && (
                <>
                  <Button size="sm" className="gap-2" onClick={() => onOpenSigning(request)}>
                    <PenTool className="h-4 w-4" />
                    Sign Now
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onCopyLink(request.id)}>
                    <Link2 className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onResend(request.id)}>
                    <RefreshCw className="h-4 w-4" />
                    Send Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => onVoid(request.id)}>
                    <Ban className="h-4 w-4" />
                    Void
                  </Button>
                </>
              )}
              {request.status === "signed" && (
                <>
                  <Button size="sm" className="gap-2" onClick={() => onViewCertificate(request)}>
                    <Shield className="h-4 w-4" />
                    View Certificate
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Signed
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenAuditTrail(request)}>
                <Shield className="h-4 w-4" />
                Audit Trail
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenVersioning(request)}>
                <RefreshCw className="h-4 w-4" />
                Versions
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenMobileSigning(request)}>
                <Phone className="h-4 w-4" />
                Mobile
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenAiAnalysis(request)}>
                <Sparkles className="h-4 w-4" />
                AI Analysis
              </Button>
              <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(request.id)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
