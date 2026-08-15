import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, FileText, ArrowRight, ArrowLeft, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateLibrary } from "@/components/signatures/TemplateLibrary";
import { VariableFillForm } from "@/components/signatures/VariableFillForm";
import { SignatureTemplate } from "@/types/signature-templates";
import { DocumentFieldBuilder } from "@/components/signatures/DocumentFieldBuilder";
import { DocumentField } from "@/types/document-fields";
import { SignerManager } from "@/components/signatures/SignerManager";
import { SigningWorkflow } from "@/types/signing-workflow";
import { DealPicker, DealData } from "@/components/signatures/DealPicker";
import { SignerAuthConfigPanel } from "@/components/signatures/SignerAuthentication";
import type { SignerAuthConfig } from "@/components/signatures/SignerAuthentication";
import { AI_MODE_CONFIG, AIActionMode, SendStep } from "./signature-request-types";

interface RecipientInfo {
  recipientName: string;
  recipientEmail: string;
  propertyAddress: string;
}

interface SendFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sendStep: SendStep;
  setSendStep: (step: SendStep) => void;
  selectedDeal: DealData | null;
  onSelectDeal: (deal: DealData) => void;
  selectedTemplate: SignatureTemplate | null;
  setSelectedTemplate: (template: SignatureTemplate | null) => void;
  onSelectTemplate: (template: SignatureTemplate) => void;
  variableValues: Record<string, string>;
  setVariableValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onVariablesNext: () => void;
  documentFields: DocumentField[];
  setDocumentFields: (fields: DocumentField[]) => void;
  onFieldsNext: () => void;
  sendWorkflow: SigningWorkflow;
  setSendWorkflow: (workflow: SigningWorkflow) => void;
  onSignersNext: () => void;
  authConfig: SignerAuthConfig;
  setAuthConfig: (config: SignerAuthConfig) => void;
  sendAiMode: AIActionMode;
  setSendAiMode: (mode: AIActionMode) => void;
  recipientInfo: RecipientInfo;
  setRecipientInfo: (info: RecipientInfo) => void;
  onSend: () => void;
}

export function SendFlowDialog({
  isOpen,
  onClose,
  sendStep,
  setSendStep,
  selectedDeal,
  onSelectDeal,
  selectedTemplate,
  setSelectedTemplate,
  onSelectTemplate,
  variableValues,
  setVariableValues,
  onVariablesNext,
  documentFields,
  setDocumentFields,
  onFieldsNext,
  sendWorkflow,
  setSendWorkflow,
  onSignersNext,
  authConfig,
  setAuthConfig,
  sendAiMode,
  setSendAiMode,
  recipientInfo,
  setRecipientInfo,
  onSend,
}: SendFlowDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={cn(
        sendStep === "template" || sendStep === "fields" || sendStep === "deal" ? "sm:max-w-[900px]" : "sm:max-w-[600px]"
      )}>
        {/* Step: Select Deal */}
        {sendStep === "deal" && (
          <>
            <DialogHeader>
              <DialogTitle>Build from Deal</DialogTitle>
              <DialogDescription>Select a property from your pipeline to auto-fill document fields, or skip to start fresh.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6">
              <DealPicker onSelect={onSelectDeal} selectedDealId={selectedDeal?.id} />
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSendStep("template")}>
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
            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6">
              <TemplateLibrary onSelectTemplate={onSelectTemplate} compact />
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
            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6">
              <VariableFillForm
                template={selectedTemplate}
                values={variableValues}
                onChange={setVariableValues}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendStep("template")}>Back</Button>
              <Button onClick={onVariablesNext} className="gap-2">
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
            <div className="flex-1 overflow-y-auto py-4 px-6 min-h-[420px]">
              <DocumentFieldBuilder
                fields={documentFields}
                onFieldsChange={setDocumentFields}
                documentName={selectedTemplate?.name}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => selectedTemplate ? setSendStep("variables") : setSendStep("template")}>Back</Button>
              <Button onClick={onFieldsNext} className="gap-2">
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
            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6 space-y-6">
              <SignerManager workflow={sendWorkflow} onWorkflowChange={setSendWorkflow} />

              {/* Signer Authentication Config */}
              <div className="border-t border-border-subtle pt-4">
                <SignerAuthConfigPanel config={authConfig} onChange={setAuthConfig} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendStep("fields")}>Back</Button>
              <Button onClick={onSignersNext} className="gap-2">
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
            <div className="flex-1 overflow-y-auto min-h-0 py-4 px-6 space-y-3">
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
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4 px-6">
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
              <Button onClick={onSend} className="gap-2">
                <Send className="h-4 w-4" />
                Send For Signature
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
