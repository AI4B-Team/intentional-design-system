import * as React from "react";

import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  PenTool,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Mail,
  Download,
  Trash2,
  FileText,
  Users,
  AlertCircle,
  RefreshCw,
  Link2,
  UserPlus,
  Ban,
  ArrowRight,
  Phone,
  TrendingUp,
  BookOpen,
  Layers,
  ArrowLeft,
  Sparkles,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { TemplateLibrary } from "@/components/signatures/TemplateLibrary";
import { ClauseLibrary } from "@/components/signatures/ClauseLibrary";
import { VariableFillForm } from "@/components/signatures/VariableFillForm";
import { SignatureTemplate } from "@/types/signature-templates";
import { DocumentFieldBuilder } from "@/components/signatures/DocumentFieldBuilder";
import { DocumentField } from "@/types/document-fields";
import { SignerManager } from "@/components/signatures/SignerManager";
import { AuditTrail } from "@/components/signatures/AuditTrail";
import { SigningWorkflow, createDefaultWorkflow, createSigner, AuditEvent } from "@/types/signing-workflow";
import { DealPicker, DealData, dealToVariables } from "@/components/signatures/DealPicker";
import { SigningView } from "@/components/signatures/SigningView";
import { CompletionCertificate } from "@/components/signatures/CompletionCertificate";
import { SignatureCaptureResult } from "@/components/signatures/SignaturePad";
import { BulkSendDialog } from "@/components/signatures/BulkSendDialog";
import { ReminderManager } from "@/components/signatures/ReminderManager";
import { WorkflowVisualizer } from "@/components/signatures/WorkflowVisualizer";
import { AIDocumentAnalysis } from "@/components/signatures/AIDocumentAnalysis";
import { SignerAuthConfigPanel, SignerAuthChallenge, defaultAuthConfig } from "@/components/signatures/SignerAuthentication";
import type { SignerAuthConfig, SignerAuthResult } from "@/components/signatures/SignerAuthentication";
import { SignaturesDashboard } from "@/components/signatures/SignaturesDashboard";
import { AuditTrailViewer, generateMockAuditTrail } from "@/components/signatures/AuditTrailViewer";
import { DocumentVersioning } from "@/components/signatures/DocumentVersioning";
import { MobileSigningManager } from "@/components/signatures/MobileSigningView";
import { WebhookIntegration } from "@/components/signatures/WebhookIntegration";

// ─── Types ──────────────────────────────────────────────────
type SignatureStatus = "draft" | "pending" | "signed" | "declined" | "expired";
type AIActionMode = "manual" | "ai_assist" | "ai_auto";

const AI_MODE_CONFIG: Record<AIActionMode, { label: string; icon: string; description: string; color: string }> = {
  manual: { label: "Manual", icon: "🧍", description: "AI suggests — you decide", color: "text-muted-foreground" },
  ai_assist: { label: "AI Assist", icon: "🤖", description: "AI drafts — you approve with one click", color: "text-brand" },
  ai_auto: { label: "AI Auto", icon: "⚡", description: "AI sends reminders automatically on your rules", color: "text-warning" },
};

interface SignatureRequest {
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

// ─── Mock data ──────────────────────────────────────────────
const mockRequests: SignatureRequest[] = [
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
    lastActivity: "Viewed 3h ago",
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
    lastActivity: "Viewed 12h ago · No action",
    templateId: "tpl-5",
    dealId: "deal-5",
    dealStatus: "negotiating",
    aiMode: "ai_auto",
    aiStatus: "Reminder Scheduled",
  },
];

const statusConfig: Record<SignatureStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "In Progress", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Out For Signature", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  signed: { label: "Completed", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  declined: { label: "Action Required", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

// ─── Helpers ────────────────────────────────────────────────
function formatTimeAgo(date: Date): string {
  const hours = differenceInHours(new Date(), date);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = differenceInDays(new Date(), date);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function getNextAction(request: SignatureRequest): { label: string; icon: React.ElementType; color: string } | null {
  if (request.status === "signed") return { label: "Archive", icon: CheckCircle, color: "text-success" };
  if (request.status === "pending" && request.expiresAt && differenceInHours(request.expiresAt, new Date()) <= 24) {
    return { label: "Resend — Expires in 24h", icon: RefreshCw, color: "text-destructive" };
  }
  if (request.status === "pending" && request.viewedAt && !request.signedAt) {
    const hoursSinceView = differenceInHours(new Date(), request.viewedAt);
    if (hoursSinceView > 6) return { label: `Follow Up (SMS) — Viewed ${hoursSinceView}h ago`, icon: Phone, color: "text-warning" };
    return { label: "Waiting — Viewed recently", icon: Eye, color: "text-muted-foreground" };
  }
  if (request.status === "pending" && !request.viewedAt) return { label: "Waiting — Not yet opened", icon: Clock, color: "text-muted-foreground" };
  if (request.status === "declined") return { label: "Call Signer — Declined", icon: Phone, color: "text-destructive" };
  if (request.status === "draft") return { label: "Send", icon: Send, color: "text-brand" };
  return null;
}

// ─── Send Flow Steps ────────────────────────────────────────
type SendStep = "deal" | "template" | "variables" | "fields" | "signers" | "followup_mode" | "recipient";

// ─── Main Component ─────────────────────────────────────────
export default function Signatures() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [requests, setRequests] = React.useState<SignatureRequest[]>(mockRequests);
  const [activeStatusFilter, setActiveStatusFilter] = React.useState("all");
  const [selectedRequest, setSelectedRequest] = React.useState<SignatureRequest | null>(null);

  // Page-level view: requests | templates | clauses
  const [pageView, setPageView] = React.useState<"requests" | "templates" | "clauses" | "reminders" | "dashboard" | "webhooks">("requests");
  const [bulkSendOpen, setBulkSendOpen] = React.useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = React.useState(false);
  const [aiAnalysisDoc, setAiAnalysisDoc] = React.useState("");
  const [authConfig, setAuthConfig] = React.useState<SignerAuthConfig>(defaultAuthConfig);
  const [authChallengeOpen, setAuthChallengeOpen] = React.useState(false);
  const [auditTrailOpen, setAuditTrailOpen] = React.useState(false);
  const [auditTrailDoc, setAuditTrailDoc] = React.useState("");
  const [versioningOpen, setVersioningOpen] = React.useState(false);
  const [versioningDoc, setVersioningDoc] = React.useState("");
  const [mobileSignOpen, setMobileSignOpen] = React.useState(false);
  const [mobileSignRequest, setMobileSignRequest] = React.useState<SignatureRequest | null>(null);

  // Send flow state
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(!!templateId);
  const [sendStep, setSendStep] = React.useState<SendStep>("deal");
  const [selectedTemplate, setSelectedTemplate] = React.useState<SignatureTemplate | null>(null);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [recipientInfo, setRecipientInfo] = React.useState({
    recipientName: "",
    recipientEmail: "",
    propertyAddress: "",
  });
  const [documentFields, setDocumentFields] = React.useState<DocumentField[]>([]);
  const [sendWorkflow, setSendWorkflow] = React.useState<SigningWorkflow>(createDefaultWorkflow());
  const [detailTab, setDetailTab] = React.useState<"details" | "signers" | "audit">("details");
  const [selectedDeal, setSelectedDeal] = React.useState<DealData | null>(null);
  const [signingViewOpen, setSigningViewOpen] = React.useState(false);
  const [signingRequest, setSigningRequest] = React.useState<SignatureRequest | null>(null);
  const [certificateOpen, setCertificateOpen] = React.useState(false);
  const [certificateRequest, setCertificateRequest] = React.useState<SignatureRequest | null>(null);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeStatusFilter === "all") return matchesSearch;
    return matchesSearch && req.status === activeStatusFilter;
  });

  const stats = {
    outForSignature: requests.filter((r) => r.status === "pending").length,
    expiringSoon: requests.filter((r) => {
      if (r.status !== "pending" || !r.expiresAt) return false;
      return differenceInHours(r.expiresAt, new Date()) <= 48;
    }).length,
    needsFollowUp: requests.filter((r) => r.status === "pending" && r.viewedAt && !r.signedAt).length,
    completionRate: requests.length > 0
      ? Math.round((requests.filter((r) => r.status === "signed").length / Math.max(requests.filter((r) => r.status !== "draft").length, 1)) * 100)
      : 0,
  };

  // ─── Send Flow Handlers ────────────────────────────────────
  const handleSelectDeal = (deal: DealData) => {
    setSelectedDeal(deal);
    // Pre-fill variables from deal
    const dealVars = dealToVariables(deal);
    setVariableValues((prev) => {
      const merged = { ...prev };
      Object.entries(dealVars).forEach(([key, val]) => {
        if (val && !merged[key]?.trim()) merged[key] = val;
      });
      return merged;
    });
    // Pre-fill recipient from deal owner
    setRecipientInfo({
      recipientName: deal.ownerName || "",
      recipientEmail: deal.ownerEmail || "",
      propertyAddress: [deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(", "),
    });
  };

  const handleSelectTemplate = (template: SignatureTemplate) => {
    setSelectedTemplate(template);
    // Merge deal vars into template if deal already selected
    if (selectedDeal) {
      const dealVars = dealToVariables(selectedDeal);
      setVariableValues(dealVars);
    } else {
      setVariableValues({});
    }
    setSendStep("variables");
  };

  const handleVariablesNext = () => {
    if (!selectedTemplate) return;
    const missingRequired = selectedTemplate.variables
      .filter((v) => v.required && !variableValues[v.key]?.trim());
    if (missingRequired.length > 0) {
      toast.error(`Please fill required fields: ${missingRequired.map((v) => v.label).join(", ")}`);
      return;
    }
    // Pre-fill recipient from variables if available
    setRecipientInfo({
      recipientName: variableValues["seller_name"] || variableValues["buyer_name"] || "",
      recipientEmail: variableValues["seller_email"] || variableValues["buyer_email"] || "",
      propertyAddress: variableValues["property_address"] || "",
    });
    setSendStep("fields");
  };

  const handleFieldsNext = () => {
    setSendStep("signers");
  };

  const handleSignersNext = () => {
    if (sendWorkflow.signers.length === 0) {
      toast.error("Add at least one signer");
      return;
    }
    // Auto-fill recipient from first signer
    const firstSigner = sendWorkflow.signers[0];
    setRecipientInfo((prev) => ({
      recipientName: prev.recipientName || firstSigner.name,
      recipientEmail: prev.recipientEmail || firstSigner.email,
      propertyAddress: prev.propertyAddress,
    }));
    setSendStep("followup_mode");
  };

  // Follow-up mode state
  const [sendAiMode, setSendAiMode] = React.useState<AIActionMode>("ai_assist");

  const handleSendRequest = () => {
    if (!recipientInfo.recipientEmail.trim()) {
      toast.error("Recipient email is required");
      return;
    }

    const docName = selectedTemplate
      ? `${selectedTemplate.name}${recipientInfo.propertyAddress ? ` - ${recipientInfo.propertyAddress.split(",")[0]}` : ""}`
      : "Untitled Document";

    const now = new Date();
    const workflow: SigningWorkflow = {
      ...sendWorkflow,
      signers: sendWorkflow.signers.map((s) => ({ ...s, status: "sent" as const, sentAt: now })),
      expiresAt: new Date(Date.now() + sendWorkflow.expirationDays * 24 * 60 * 60 * 1000),
      auditTrail: [
        { id: `a-${Date.now()}`, timestamp: now, action: "created", actor: "You", details: `Document created${selectedTemplate ? ` from ${selectedTemplate.name}` : ""}` },
        ...sendWorkflow.signers.map((s, i) => ({
          id: `a-${Date.now()}-${i}`,
          timestamp: now,
          action: "sent" as const,
          actor: "System",
          actorEmail: s.email,
          details: `Sent to ${s.name}`,
        })),
      ],
    };

    const request: SignatureRequest = {
      id: Date.now().toString(),
      documentName: docName,
      recipientName: recipientInfo.recipientName || workflow.signers[0]?.name || "Unknown",
      recipientEmail: recipientInfo.recipientEmail || workflow.signers[0]?.email || "",
      propertyAddress: recipientInfo.propertyAddress,
      status: "pending",
      createdAt: now,
      sentAt: now,
      expiresAt: workflow.expiresAt,
      viewCount: 0,
      templateId: selectedTemplate?.id,
      workflow,
      dealId: selectedDeal?.id,
      dealStatus: selectedDeal?.status,
      aiMode: sendAiMode,
      aiStatus: sendAiMode === "ai_auto" ? "Monitoring" : sendAiMode === "ai_assist" ? "Awaiting Approval" : undefined,
    };

    setRequests([request, ...requests]);
    resetSendFlow();
    toast.success("Document sent for signature!");
  };

  const resetSendFlow = () => {
    setIsNewRequestOpen(false);
    setSendStep("deal");
    setSelectedTemplate(null);
    setVariableValues({});
    setRecipientInfo({ recipientName: "", recipientEmail: "", propertyAddress: "" });
    setDocumentFields([]);
    setSendWorkflow(createDefaultWorkflow());
    setDetailTab("details");
    setSelectedDeal(null);
  };

  const handleResend = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toast.success("Reminder sent to recipient");
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRequests(requests.filter((r) => r.id !== id));
    setSelectedRequest(null);
    toast.success("Request deleted");
  };

  const handleCopyLink = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`https://app.realelite.com/sign/${id}`);
    toast.success("Signing link copied");
  };

  const handleVoid = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRequests(requests.map((r) => r.id === id ? { ...r, status: "expired" as SignatureStatus } : r));
    setSelectedRequest(null);
    toast.success("Request voided");
  };

  const handleOpenSigning = (request: SignatureRequest) => {
    setSigningRequest(request);
    setSigningViewOpen(true);
    setSelectedRequest(null);
  };

  const handleSigningComplete = (signatures: Record<string, SignatureCaptureResult>) => {
    if (!signingRequest) return;
    const now = new Date();
    setRequests((prev) =>
      prev.map((r) =>
        r.id === signingRequest.id
          ? {
              ...r,
              status: "signed" as SignatureStatus,
              signedAt: now,
              lastActivity: "Signed",
              workflow: r.workflow
                ? {
                    ...r.workflow,
                    signers: r.workflow.signers.map((s) => ({ ...s, status: "signed" as const, signedAt: now })),
                    auditTrail: [
                      ...r.workflow.auditTrail,
                      { id: `a-${Date.now()}`, timestamp: now, action: "signed", actor: r.recipientName, actorEmail: r.recipientEmail, details: "Document signed electronically" },
                    ],
                  }
                : undefined,
            }
          : r
      )
    );
    setSigningViewOpen(false);
    setSigningRequest(null);
    toast.success("Document signed successfully!");
  };

  const handleViewCertificate = (request: SignatureRequest) => {
    setCertificateRequest(request);
    setCertificateOpen(true);
    setSelectedRequest(null);
  };

  return (
    <>
      <PageLayout>
        <PageHeader
          title="Digital Signatures"
          description="Send, track, and automate deal paperwork"
        >
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => { resetSendFlow(); setIsNewRequestOpen(true); }}>
              <Send className="h-4 w-4" />
              Send For Signature
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setBulkSendOpen(true)}>
              <Users className="h-4 w-4" />
              Bulk Send
            </Button>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setAiAnalysisDoc("All Active Requests");
                      setAiAnalysisOpen(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Review
                    {(stats.expiringSoon > 0 || stats.needsFollowUp > 0) && (
                      <Badge variant="warning" size="sm" className="ml-0.5">
                        {stats.expiringSoon + stats.needsFollowUp}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-foreground z-[200]">
                  Missing fields · Pricing check · Expiry risk · Clause flags
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </PageHeader>

        {/* Page View Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { value: "requests" as const, label: "Requests", icon: PenTool },
            { value: "dashboard" as const, label: "Dashboard", icon: TrendingUp },
            { value: "templates" as const, label: "Templates", icon: Layers },
            { value: "clauses" as const, label: "Clause Library", icon: BookOpen },
            { value: "reminders" as const, label: "Reminders", icon: Clock },
            { value: "webhooks" as const, label: "API & Webhooks", icon: Link2 },
          ].map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={pageView === tab.value ? "default" : "outline"}
              onClick={() => setPageView(tab.value)}
              className="gap-1.5"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* ─── Requests View ─────────────────────────────────── */}
        {pageView === "requests" && (
          <>
            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.outForSignature}</p>
                <p className="text-sm text-muted-foreground">Out For Signature</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className={cn("text-2xl font-bold", stats.expiringSoon > 0 ? "text-destructive" : "text-foreground")}>{stats.expiringSoon}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-xs text-muted-foreground/70">Next 48h</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className={cn("text-2xl font-bold", stats.needsFollowUp > 0 ? "text-warning" : "text-foreground")}>{stats.needsFollowUp}</p>
                <p className="text-sm text-muted-foreground">Needs Follow-Up</p>
                <p className="text-xs text-muted-foreground/70">Viewed, not signed</p>
              </Card>
              <Card padding="md" className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-success">{stats.completionRate}%</p>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </Card>
            </div>

            {/* Status Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Out For Signature" },
                  { value: "signed", label: "Completed" },
                  { value: "declined", label: "Action Required" },
                  { value: "draft", label: "In Progress" },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    size="sm"
                    variant={activeStatusFilter === tab.value ? "default" : "outline"}
                    onClick={() => setActiveStatusFilter(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const statusInfo = statusConfig[request.status];
                const StatusIcon = statusInfo.icon;
                const nextAction = getNextAction(request);

                return (
                  <Card key={request.id} padding="md" className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <PenTool className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-foreground truncate">{request.documentName}</h3>
                          <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {nextAction && (
                            <Badge variant="outline" className={cn("text-xs gap-1", nextAction.color)}>
                              <nextAction.icon className="h-3 w-3" />
                              {nextAction.label}
                            </Badge>
                          )}
                        </div>
                        {/* Deal context line */}
                        {(request.dealId || request.propertyAddress) && (
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-brand/60" />
                            {request.dealId ? (
                              <>
                                <span>Linked Deal: {request.propertyAddress || "—"}</span>
                                {request.dealStatus && (
                                  <span className="text-brand/80 font-medium">· {request.dealStatus.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                                )}
                              </>
                            ) : (
                              <span>{request.propertyAddress}</span>
                            )}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {request.recipientName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {request.recipientEmail}
                          </span>
                        </div>

                        {/* Status Timeline */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>
                            {request.sentAt ? `Sent ${formatTimeAgo(request.sentAt)}` : `Created ${formatTimeAgo(request.createdAt)}`}
                          </span>
                          {request.viewedAt && (
                            <>
                              <ArrowRight className="h-3 w-3" />
                              <span>Viewed {formatTimeAgo(request.viewedAt)}</span>
                            </>
                          )}
                          {request.signedAt && (
                            <>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-success">Signed {formatTimeAgo(request.signedAt)}</span>
                            </>
                          )}
                          {request.viewCount !== undefined && request.viewCount > 0 && (
                            <span className="ml-2 flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {request.viewCount}×
                            </span>
                          )}
                          {/* AI Mode Status — visible, not hidden */}
                          {request.aiMode && request.aiMode !== "manual" && request.aiStatus && (
                            <span className={cn(
                              "ml-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/5 border border-brand/15",
                              AI_MODE_CONFIG[request.aiMode].color
                            )}>
                              <Sparkles className="h-2.5 w-2.5" />
                              <span className="font-medium">{request.aiStatus}</span>
                            </span>
                          )}
                          {request.aiMode === "manual" && request.status !== "signed" && request.status !== "draft" && (
                            <span className="ml-2 flex items-center gap-1 text-muted-foreground/60">
                              <span className="text-[10px]">🧍</span>
                              <span>Manual</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right hidden sm:flex flex-col items-end gap-1">
                        {request.expiresAt && request.status === "pending" && (
                          <p className={cn(
                            "text-xs",
                            differenceInHours(request.expiresAt, new Date()) <= 48
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          )}>
                            Expires {format(request.expiresAt, "MMM d")}
                          </p>
                        )}
                        {request.lastActivity && (
                          <p className="text-xs text-muted-foreground">{request.lastActivity}</p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <TooltipProvider delayDuration={0}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {request.status === "pending" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleResend(request.id, e)}>
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="bg-white text-foreground z-[200]">Send Reminder</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleCopyLink(request.id, e)}>
                                <Link2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white text-foreground z-[200]">Copy Link</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}>
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === "pending" && (
                            <>
                              <DropdownMenuItem className="gap-2" onClick={(e) => handleResend(request.id, e as any)}>
                                <RefreshCw className="h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={(e) => handleCopyLink(request.id, e as any)}>
                                <Link2 className="h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Signer
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={(e) => handleVoid(request.id, e as any)}>
                                <Ban className="h-4 w-4" />
                                Void
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status === "signed" && (
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              Download Signed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" />
                            View Audit Trail
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* AI Actions Section */}
                          <div className="px-2 py-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Actions</p>
                          </div>
                          <DropdownMenuItem className="gap-2" onClick={(e) => {
                            e.stopPropagation();
                            setAiAnalysisDoc(request.documentName);
                            setAiAnalysisOpen(true);
                          }}>
                            <Sparkles className="h-4 w-4" />
                            Run AI Review
                          </DropdownMenuItem>
                          {request.aiMode !== "manual" && (
                            <DropdownMenuItem className="gap-2" onClick={(e) => {
                              e.stopPropagation();
                              setRequests(prev => prev.map(r => r.id === request.id ? { ...r, aiMode: "manual" as AIActionMode, aiStatus: undefined } : r));
                              toast.success("Switched to Manual mode");
                            }}>
                              <Ban className="h-4 w-4" />
                              Pause AI
                            </DropdownMenuItem>
                          )}
                          {request.aiMode === "manual" && request.status === "pending" && (
                            <DropdownMenuItem className="gap-2" onClick={(e) => {
                              e.stopPropagation();
                              setRequests(prev => prev.map(r => r.id === request.id ? { ...r, aiMode: "ai_assist" as AIActionMode, aiStatus: "Awaiting Approval" } : r));
                              toast.success("Switched to AI Assist mode");
                            }}>
                              <Sparkles className="h-4 w-4" />
                              Enable AI Assist
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={(e) => handleDelete(request.id, e as any)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PenTool className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-1">No Signature Requests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search terms" : "Send your first document for signature"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => { resetSendFlow(); setIsNewRequestOpen(true); }} className="gap-2">
                      <Send className="h-4 w-4" />
                      Send For Signature
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Templates View ────────────────────────────────── */}
        {pageView === "templates" && (
          <TemplateLibrary
            onSelectTemplate={(template) => {
              handleSelectTemplate(template);
              setIsNewRequestOpen(true);
            }}
          />
        )}

        {/* ─── Clauses View ──────────────────────────────────── */}
        {pageView === "clauses" && <ClauseLibrary />}

        {/* ─── Reminders View ────────────────────────────────── */}
        {pageView === "reminders" && (
          <ReminderManager
            onSendReminder={(id) => {
              toast.success("Reminder sent");
            }}
            onExtendExpiration={(id, days) => {
              toast.success(`Expiration extended by ${days} days`);
            }}
          />
        )}

        {/* ─── Webhooks View ─────────────────────────────────── */}
        {pageView === "webhooks" && <WebhookIntegration />}

        {/* ─── Dashboard View ────────────────────────────────── */}
        {pageView === "dashboard" && <SignaturesDashboard />}
      </PageLayout>

      {/* ─── Multi-Step Send Flow Dialog ─────────────────────── */}
      <Dialog open={isNewRequestOpen} onOpenChange={(open) => { if (!open) resetSendFlow(); }}>
        <DialogContent className={cn(
          "max-h-[85vh] overflow-y-auto",
          sendStep === "template" || sendStep === "fields" || sendStep === "deal" ? "sm:max-w-[900px]" : "sm:max-w-[600px]"
        )}>
          {/* Step: Select Deal */}
          {sendStep === "deal" && (
            <>
              <DialogHeader>
                <DialogTitle>Build from Deal</DialogTitle>
                <DialogDescription>Select a property from your pipeline to auto-fill document fields, or skip to start fresh.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <DealPicker onSelect={handleSelectDeal} selectedDealId={selectedDeal?.id} />
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={resetSendFlow}>Cancel</Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSendStep("template")}
                  >
                    Skip — No Deal
                  </Button>
                  {selectedDeal && (
                    <Button onClick={() => setSendStep("template")} className="gap-2">
                      Continue with {selectedDeal.address.split(",")[0]}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}

          {/* Step: Choose Template */}
          {sendStep === "template" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendStep("deal")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>
                      {selectedDeal
                        ? `Deal: ${selectedDeal.address} — Select a template to auto-fill.`
                        : "Select a document template or start from scratch."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {selectedDeal && (
                <div className="mx-6 mb-2 flex items-center gap-2 text-xs text-brand bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="font-medium">{selectedDeal.address}</span>
                  <span className="text-muted-foreground">· {selectedDeal.ownerName || "No owner"}</span>
                  <span className="text-muted-foreground">· {selectedDeal.status?.replace(/_/g, " ")}</span>
                </div>
              )}
              <div className="py-4">
                <TemplateLibrary onSelectTemplate={handleSelectTemplate} compact />
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSendStep("deal")}>Back</Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setSendStep("fields");
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Skip — Blank Document
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Fill Variables */}
          {sendStep === "variables" && selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendStep("template")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>{selectedTemplate.name}</DialogTitle>
                    <DialogDescription>Fill in the document fields. Fields with source badges can be auto-filled from deal data.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <VariableFillForm
                  template={selectedTemplate}
                  values={variableValues}
                  onChange={setVariableValues}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendStep("template")}>Back</Button>
                <Button onClick={handleVariablesNext} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Place Fields */}
          {sendStep === "fields" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectedTemplate ? setSendStep("variables") : setSendStep("template")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Place Signature Fields</DialogTitle>
                    <DialogDescription>Upload a PDF and place fields where signers need to sign, initial, or fill in information.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4 min-h-[420px]">
                <DocumentFieldBuilder
                  fields={documentFields}
                  onFieldsChange={setDocumentFields}
                  documentName={selectedTemplate?.name}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => selectedTemplate ? setSendStep("variables") : setSendStep("template")}>Back</Button>
                <Button onClick={handleFieldsNext} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Signers + Workflow */}
          {sendStep === "signers" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendStep("fields")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Add Signers</DialogTitle>
                    <DialogDescription>Add signers, set signing order, and configure reminders.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <SignerManager workflow={sendWorkflow} onWorkflowChange={setSendWorkflow} />
                
                {/* Signer Authentication Config */}
                <div className="border-t border-border-subtle pt-4">
                  <SignerAuthConfigPanel config={authConfig} onChange={setAuthConfig} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendStep("fields")}>Back</Button>
                <Button onClick={handleSignersNext} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Follow-Up Mode */}
          {sendStep === "followup_mode" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendStep("signers")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Follow-Up Mode</DialogTitle>
                    <DialogDescription>Choose how AI handles follow-ups for this document.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4 space-y-3">
                {(Object.entries(AI_MODE_CONFIG) as [AIActionMode, typeof AI_MODE_CONFIG[AIActionMode]][]).map(([mode, config]) => (
                  <button
                    key={mode}
                    className={cn(
                      "w-full text-left rounded-lg border p-4 transition-all",
                      sendAiMode === mode
                        ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                        : "border-border-subtle hover:border-brand/30 hover:bg-muted/30"
                    )}
                    onClick={() => setSendAiMode(mode)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{config.label}</span>
                          {mode === "ai_assist" && (
                            <Badge variant="default" size="sm">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                        sendAiMode === mode ? "border-brand" : "border-border"
                      )}>
                        {sendAiMode === mode && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                      </div>
                    </div>
                    {mode === "ai_auto" && sendAiMode === mode && (
                      <div className="mt-3 ml-8 text-xs text-muted-foreground space-y-1 border-t border-border-subtle pt-2">
                        <p>• If viewed but not signed in 24h → send email</p>
                        <p>• If still unsigned after 48h → send SMS</p>
                        <p>• If 72h + expires soon → notify you + suggest call</p>
                        <p>• If declined → pause automation and alert you</p>
                      </div>
                    )}
                  </button>
                ))}
                <p className="text-xs text-muted-foreground/70 text-center mt-2">
                  AI will follow up automatically if not signed within 48 hours.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendStep("signers")}>Back</Button>
                <Button onClick={() => setSendStep("recipient")} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Recipient + Send */}
          {sendStep === "recipient" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendStep("followup_mode")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Recipient Details</DialogTitle>
                    <DialogDescription>
                      {selectedTemplate
                        ? `Sending: ${selectedTemplate.name}`
                        : "Enter recipient details and Send For Signature."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!selectedTemplate && (
                  <div className="space-y-2">
                    <Label htmlFor="documentName">Document Name *</Label>
                    <Input id="documentName" placeholder="e.g., Purchase Agreement - 123 Main St" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="John Smith"
                      value={recipientInfo.recipientName}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="john@email.com"
                      value={recipientInfo.recipientEmail}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, recipientEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input
                    id="propertyAddress"
                    placeholder="123 Main St, City, State"
                    value={recipientInfo.propertyAddress}
                    onChange={(e) => setRecipientInfo({ ...recipientInfo, propertyAddress: e.target.value })}
                  />
                </div>

                {/* Summary if template selected */}
                {selectedTemplate && (
                  <div className="rounded-lg border border-border-subtle p-3 bg-surface-secondary">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-brand" />
                      <span className="text-sm font-medium text-foreground">Document Preview</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Template: <span className="font-medium text-foreground">{selectedTemplate.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fields filled: <span className="font-medium text-foreground">
                        {Object.values(variableValues).filter((v) => v?.trim()).length}/{selectedTemplate.variables.length}
                      </span>
                    </p>
                    {documentFields.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Signature fields: <span className="font-medium text-foreground">{documentFields.length}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendStep("signers")}>Back</Button>
                <Button onClick={handleSendRequest} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send For Signature
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Document Detail Dialog ──────────────────────────── */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setDetailTab("details"); } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedRequest && (() => {
            const info = statusConfig[selectedRequest.status];
            const Icon = info.icon;
            const wf = selectedRequest.workflow;
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedRequest.documentName}</DialogTitle>
                  <DialogDescription>Signature request details</DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-border-subtle -mx-6 px-6">
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

                <div className="py-4">
                  {/* Details Tab */}
                  {detailTab === "details" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", info.color)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {info.label}
                        </Badge>
                        {selectedRequest.viewCount !== undefined && selectedRequest.viewCount > 0 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Eye className="h-3 w-3" />
                            Viewed {selectedRequest.viewCount}×
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
                          {selectedRequest.sentAt && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Send className="h-3 w-3" /> Sent {formatTimeAgo(selectedRequest.sentAt)}
                            </span>
                          )}
                          {selectedRequest.viewedAt && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-3 w-3" /> Opened {formatTimeAgo(selectedRequest.viewedAt)}
                              </span>
                            </>
                          )}
                          {selectedRequest.signedAt && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="flex items-center gap-1 text-success">
                                <CheckCircle className="h-3 w-3" /> Signed {formatTimeAgo(selectedRequest.signedAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Recipient</p>
                          <p className="font-medium">{selectedRequest.recipientName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Email</p>
                          <p className="font-medium">{selectedRequest.recipientEmail}</p>
                        </div>
                        {selectedRequest.propertyAddress && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground mb-1">Property Address</p>
                            <p className="font-medium">{selectedRequest.propertyAddress}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground mb-1">Created</p>
                          <p className="font-medium">{format(selectedRequest.createdAt, "MMM d, yyyy")}</p>
                        </div>
                        {selectedRequest.sentAt && (
                          <div>
                            <p className="text-muted-foreground mb-1">Sent</p>
                            <p className="font-medium">{format(selectedRequest.sentAt, "MMM d, yyyy")}</p>
                          </div>
                        )}
                        {selectedRequest.signedAt && (
                          <div>
                            <p className="text-muted-foreground mb-1">Signed</p>
                            <p className="font-medium">{format(selectedRequest.signedAt, "MMM d, yyyy")}</p>
                          </div>
                        )}
                        {selectedRequest.expiresAt && (
                          <div>
                            <p className="text-muted-foreground mb-1">Expires</p>
                            <p className={cn(
                              "font-medium",
                              selectedRequest.expiresAt && differenceInHours(selectedRequest.expiresAt, new Date()) <= 48 ? "text-destructive" : ""
                            )}>
                              {format(selectedRequest.expiresAt, "MMM d, yyyy")}
                            </p>
                          </div>
                        )}
                        {wf?.reminders.enabled && (
                          <div>
                            <p className="text-muted-foreground mb-1">Reminders</p>
                            <p className="font-medium">{wf.reminders.remindersSent}/{wf.reminders.maxReminders} sent</p>
                          </div>
                        )}
                        {selectedRequest.dealId && (
                          <div className="col-span-2 mt-2 flex items-center gap-2 text-xs bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
                            <Building2 className="h-3.5 w-3.5 text-brand" />
                            <span className="font-medium text-brand">Linked to Deal</span>
                            {selectedRequest.dealStatus && (
                              <Badge variant="outline" className="text-[10px] h-5 capitalize">
                                {selectedRequest.dealStatus.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        )}
                        {/* AI Mode indicator in detail view */}
                        {selectedRequest.aiMode && (
                          <div className="col-span-2 mt-2 flex items-center justify-between text-xs bg-muted/30 border border-border-subtle rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span>{AI_MODE_CONFIG[selectedRequest.aiMode].icon}</span>
                              <span className="font-medium text-foreground">{AI_MODE_CONFIG[selectedRequest.aiMode].label}</span>
                              {selectedRequest.aiStatus && (
                                <span className="text-muted-foreground">· {selectedRequest.aiStatus}</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-2"
                              onClick={() => {
                                const modes: AIActionMode[] = ["manual", "ai_assist", "ai_auto"];
                                const current = modes.indexOf(selectedRequest.aiMode!);
                                const next = modes[(current + 1) % modes.length];
                                const updated = { ...selectedRequest, aiMode: next, aiStatus: next === "ai_auto" ? "Monitoring" : next === "ai_assist" ? "Awaiting Approval" : undefined };
                                setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updated : r));
                                setSelectedRequest(updated);
                                toast.success(`Switched to ${AI_MODE_CONFIG[next].label}`);
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

                <DialogFooter className="flex-wrap gap-2">
                  {selectedRequest.status === "pending" && (
                    <>
                      <Button size="sm" className="gap-2" onClick={() => handleOpenSigning(selectedRequest)}>
                        <PenTool className="h-4 w-4" />
                        Sign Now
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCopyLink(selectedRequest.id)}>
                        <Link2 className="h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => { handleResend(selectedRequest.id); setSelectedRequest(null); }}>
                        <RefreshCw className="h-4 w-4" />
                        Send Reminder
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleVoid(selectedRequest.id)}>
                        <Ban className="h-4 w-4" />
                        Void
                      </Button>
                    </>
                  )}
                  {selectedRequest.status === "signed" && (
                    <>
                      <Button size="sm" className="gap-2" onClick={() => handleViewCertificate(selectedRequest)}>
                        <Shield className="h-4 w-4" />
                        View Certificate
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Signed
                      </Button>
                    </>
                  )}
                   <Button variant="outline" size="sm" className="gap-2" onClick={() => { setAuditTrailDoc(selectedRequest.documentName); setAuditTrailOpen(true); }}>
                     <Shield className="h-4 w-4" />
                     Audit Trail
                   </Button>
                   <Button variant="outline" size="sm" className="gap-2" onClick={() => { setVersioningDoc(selectedRequest.documentName); setVersioningOpen(true); }}>
                     <RefreshCw className="h-4 w-4" />
                     Versions
                   </Button>
                   <Button variant="outline" size="sm" className="gap-2" onClick={() => { setMobileSignRequest(selectedRequest); setMobileSignOpen(true); }}>
                     <Phone className="h-4 w-4" />
                     Mobile
                   </Button>
                   <Button variant="outline" size="sm" className="gap-2" onClick={() => { setAiAnalysisDoc(selectedRequest.documentName); setAiAnalysisOpen(true); }}>
                     <Sparkles className="h-4 w-4" />
                     AI Analysis
                   </Button>
                   <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(selectedRequest.id)}>
                     <Trash2 className="h-4 w-4" />
                     Delete
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* ─── Signing View Dialog ─────────────────────────────── */}
      {signingRequest && (
        <SigningView
          isOpen={signingViewOpen}
          onClose={() => { setSigningViewOpen(false); setSigningRequest(null); }}
          documentName={signingRequest.documentName}
          signerName={signingRequest.recipientName}
          signerEmail={signingRequest.recipientEmail}
          fields={documentFields}
          onComplete={handleSigningComplete}
        />
      )}

      {/* ─── Completion Certificate Dialog ───────────────────── */}
      {certificateRequest && (
        <CompletionCertificate
          isOpen={certificateOpen}
          onClose={() => { setCertificateOpen(false); setCertificateRequest(null); }}
          documentName={certificateRequest.documentName}
          documentId={certificateRequest.id}
          createdAt={certificateRequest.createdAt}
          completedAt={certificateRequest.signedAt || new Date()}
          signers={
            certificateRequest.workflow?.signers.map((s) => ({
              name: s.name,
              email: s.email,
              signedAt: s.signedAt || new Date(),
              ipAddress: s.ipAddress,
            })) || [
              {
                name: certificateRequest.recipientName,
                email: certificateRequest.recipientEmail,
                signedAt: certificateRequest.signedAt || new Date(),
              },
            ]
          }
        />
      )}

      {/* ─── Bulk Send Dialog ────────────────────────────────── */}
      <BulkSendDialog
        isOpen={bulkSendOpen}
        onClose={() => setBulkSendOpen(false)}
        onSend={(template, recipients) => {
          const now = new Date();
          const newRequests = recipients.map((r) => ({
            id: `bulk-${Date.now()}-${r.id}`,
            documentName: `${template.name}${r.propertyAddress ? ` - ${r.propertyAddress.split(",")[0]}` : ""}`,
            recipientName: r.name,
            recipientEmail: r.email,
            propertyAddress: r.propertyAddress,
            status: "pending" as const,
            createdAt: now,
            sentAt: now,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            viewCount: 0,
            templateId: template.id,
            dealId: r.dealId,
            workflow: {
              signingOrder: "parallel" as const,
              signers: [{ id: `s-${r.id}`, name: r.name, email: r.email, role: "signer" as const, order: 1, status: "sent" as const, viewCount: 0, sentAt: now }],
              reminders: { enabled: true, frequency: "every_2_days" as const, maxReminders: 5, remindersSent: 0 },
              expirationDays: 30,
              auditTrail: [
                { id: `a-${Date.now()}-${r.id}`, timestamp: now, action: "created", actor: "You", details: `Bulk send: ${template.name}` },
                { id: `a-${Date.now()}-${r.id}-s`, timestamp: now, action: "sent", actor: "System", actorEmail: r.email, details: `Sent to ${r.name}` },
              ],
            },
          }));
          setRequests((prev) => [...newRequests, ...prev]);
          toast.success(`Sent ${recipients.length} signature requests!`);
        }}
      />

      {/* ─── AI Document Analysis Dialog ─────────────────────── */}
      <AIDocumentAnalysis
        isOpen={aiAnalysisOpen}
        onClose={() => setAiAnalysisOpen(false)}
        documentName={aiAnalysisDoc}
        template={selectedTemplate}
        onApplySuggestion={(suggestion) => {
          toast.success(`Applied: ${suggestion.title}`);
        }}
        onAddClause={(clause) => {
          toast.success(`Added clause: ${clause.name}`);
        }}
      />

      {/* ─── Signer Auth Challenge Dialog ────────────────────── */}
      <SignerAuthChallenge
        isOpen={authChallengeOpen}
        onClose={() => setAuthChallengeOpen(false)}
        onVerified={(results) => {
          setAuthChallengeOpen(false);
          toast.success("Signer identity verified");
        }}
        signerName={signingRequest?.recipientName || ""}
        signerEmail={signingRequest?.recipientEmail || ""}
        config={authConfig}
      />

      {/* ─── Audit Trail Viewer Dialog ───────────────────────── */}
      <AuditTrailViewer
        isOpen={auditTrailOpen}
        onClose={() => setAuditTrailOpen(false)}
        documentName={auditTrailDoc}
        entries={generateMockAuditTrail(auditTrailDoc, selectedRequest?.recipientName || "", selectedRequest?.recipientEmail || "")}
        onDownloadCertificate={() => {
          if (selectedRequest) {
            handleViewCertificate(selectedRequest);
          }
        }}
      />

      {/* ─── Document Versioning Dialog ──────────────────────── */}
      <DocumentVersioning
        isOpen={versioningOpen}
        onClose={() => setVersioningOpen(false)}
        documentName={versioningDoc}
        onRestore={(version) => {
          toast.success(`Restored to v${version.version}`);
          setVersioningOpen(false);
        }}
      />

      {/* ─── Mobile Signing Dialog ───────────────────────────── */}
      {mobileSignRequest && (
        <MobileSigningManager
          isOpen={mobileSignOpen}
          onClose={() => { setMobileSignOpen(false); setMobileSignRequest(null); }}
          documentName={mobileSignRequest.documentName}
          recipientName={mobileSignRequest.recipientName}
          recipientEmail={mobileSignRequest.recipientEmail}
          onSendSms={(phone, link) => {
            toast.success(`SMS signing link sent to ${phone}`);
          }}
        />
      )}
    </>
  );
}