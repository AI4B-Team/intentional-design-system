import * as React from "react";

import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Link2,
  TrendingUp,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInHours } from "date-fns";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { TemplateLibrary } from "@/components/signatures/TemplateLibrary";
import { ClauseLibrary } from "@/components/signatures/ClauseLibrary";
import { SignatureTemplate } from "@/types/signature-templates";
import { DocumentField } from "@/types/document-fields";
import { SigningWorkflow, createDefaultWorkflow } from "@/types/signing-workflow";
import { DealData, dealToVariables } from "@/components/signatures/DealPicker";
import { SigningView } from "@/components/signatures/SigningView";
import { CompletionCertificate } from "@/components/signatures/CompletionCertificate";
import { SignatureCaptureResult } from "@/components/signatures/SignaturePad";
import { BulkSendDialog } from "@/components/signatures/BulkSendDialog";
import { ReminderManager } from "@/components/signatures/ReminderManager";
import { AIDocumentAnalysis } from "@/components/signatures/AIDocumentAnalysis";
import { SignerAuthChallenge, defaultAuthConfig } from "@/components/signatures/SignerAuthentication";
import type { SignerAuthConfig } from "@/components/signatures/SignerAuthentication";
import { SignaturesDashboard } from "@/components/signatures/SignaturesDashboard";
import { AuditTrailViewer, generateMockAuditTrail } from "@/components/signatures/AuditTrailViewer";
import { DocumentVersioning } from "@/components/signatures/DocumentVersioning";
import { MobileSigningManager } from "@/components/signatures/MobileSigningView";
import { WebhookIntegration } from "@/components/signatures/WebhookIntegration";
import {
  AIActionMode,
  SendStep,
  SignatureRequest,
  SignatureStatus,
  mockRequests,
} from "@/components/signatures/signature-request-types";
import { SignatureRequestCard } from "@/components/signatures/SignatureRequestCard";
import { SendFlowDialog } from "@/components/signatures/SendFlowDialog";
import { RequestDetailDialog } from "@/components/signatures/RequestDetailDialog";

const aiStatusForMode = (mode: AIActionMode) =>
  mode === "ai_auto" ? "Monitoring" : mode === "ai_assist" ? "Awaiting Approval" : undefined;

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
  const [sendAiMode, setSendAiMode] = React.useState<AIActionMode>("ai_assist");

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
      setVariableValues(dealToVariables(selectedDeal));
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

  const handleFieldsNext = () => setSendStep("signers");

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
      aiStatus: aiStatusForMode(sendAiMode),
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

  const handleChangeAiMode = (id: string, mode: AIActionMode) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, aiMode: mode, aiStatus: aiStatusForMode(mode) } : r));
    toast.success(mode === "manual" ? "Switched to Manual mode" : "Switched to AI Assist mode");
  };

  const handleCycleAiMode = (request: SignatureRequest, next: AIActionMode) => {
    const updated = { ...request, aiMode: next, aiStatus: aiStatusForMode(next) };
    setRequests((prev) => prev.map((r) => r.id === request.id ? updated : r));
    setSelectedRequest(updated);
    toast.success(`Switched to ${next === "manual" ? "Manual" : next === "ai_assist" ? "AI Assist" : "AI Auto"}`);
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

  const openAiAnalysis = (documentName: string) => {
    setAiAnalysisDoc(documentName);
    setAiAnalysisOpen(true);
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
                    onClick={() => openAiAnalysis("All Active Requests")}
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
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]">
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
              {filteredRequests.map((request) => (
                <SignatureRequestCard
                  key={request.id}
                  request={request}
                  onSelect={setSelectedRequest}
                  onResend={handleResend}
                  onCopyLink={handleCopyLink}
                  onVoid={handleVoid}
                  onDelete={handleDelete}
                  onRunAiReview={(r) => openAiAnalysis(r.documentName)}
                  onChangeAiMode={handleChangeAiMode}
                />
              ))}

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
            onSendReminder={() => toast.success("Reminder sent")}
            onExtendExpiration={(id, days) => toast.success(`Expiration extended by ${days} days`)}
          />
        )}

        {/* ─── Webhooks View ─────────────────────────────────── */}
        {pageView === "webhooks" && <WebhookIntegration />}

        {/* ─── Dashboard View ────────────────────────────────── */}
        {pageView === "dashboard" && <SignaturesDashboard />}
      </PageLayout>

      {/* ─── Multi-Step Send Flow Dialog ─────────────────────── */}
      <SendFlowDialog
        isOpen={isNewRequestOpen}
        onClose={resetSendFlow}
        sendStep={sendStep}
        setSendStep={setSendStep}
        selectedDeal={selectedDeal}
        onSelectDeal={handleSelectDeal}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onSelectTemplate={handleSelectTemplate}
        variableValues={variableValues}
        setVariableValues={setVariableValues}
        onVariablesNext={handleVariablesNext}
        documentFields={documentFields}
        setDocumentFields={setDocumentFields}
        onFieldsNext={handleFieldsNext}
        sendWorkflow={sendWorkflow}
        setSendWorkflow={setSendWorkflow}
        onSignersNext={handleSignersNext}
        authConfig={authConfig}
        setAuthConfig={setAuthConfig}
        sendAiMode={sendAiMode}
        setSendAiMode={setSendAiMode}
        recipientInfo={recipientInfo}
        setRecipientInfo={setRecipientInfo}
        onSend={handleSendRequest}
      />

      {/* ─── Document Detail Dialog ──────────────────────────── */}
      <RequestDetailDialog
        request={selectedRequest}
        onClose={() => { setSelectedRequest(null); setDetailTab("details"); }}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        onCycleAiMode={handleCycleAiMode}
        onOpenSigning={handleOpenSigning}
        onCopyLink={(id) => handleCopyLink(id)}
        onResend={(id) => { handleResend(id); setSelectedRequest(null); }}
        onVoid={(id) => handleVoid(id)}
        onDelete={(id) => handleDelete(id)}
        onViewCertificate={handleViewCertificate}
        onOpenAuditTrail={(r) => { setAuditTrailDoc(r.documentName); setAuditTrailOpen(true); }}
        onOpenVersioning={(r) => { setVersioningDoc(r.documentName); setVersioningOpen(true); }}
        onOpenMobileSigning={(r) => { setMobileSignRequest(r); setMobileSignOpen(true); }}
        onOpenAiAnalysis={(r) => openAiAnalysis(r.documentName)}
      />

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
        onVerified={() => {
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
          onSendSms={(phone) => {
            toast.success(`SMS signing link sent to ${phone}`);
          }}
        />
      )}
    </>
  );
}
