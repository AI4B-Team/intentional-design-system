import React, { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  DollarSign,
  Mail,
  MessageSquare,
  FileCheck,
  Layers,
  Settings,
  Home,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import {
  OfferTypeGrid,
  OfferTermsSection,
  POFManager,
  EmailTemplateEditor,
  TextTemplateEditor,
  LOIEditor,
  OfferPreview,
  BuilderSection,
  SectionList,
  OFFER_TYPE_CONFIGS,
  DEFAULT_OFFER_TERMS,
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_TEXT_TEMPLATE,
  DEFAULT_LOI_TEMPLATE,
  type OfferType,
  type MarketType,
  type DocumentType,
  type OfferTerms,
  type EmailTemplate,
  type TextTemplate,
  type LOITemplate,
  type POFDocument,
  type SectionStatus,
} from "@/components/offer-blaster";

type BuilderStep = "select" | "build";

// Mock POF data
const MOCK_POF_DOCUMENTS: POFDocument[] = [
  {
    id: "1",
    userId: "user1",
    fileName: "POF_ABC_Capital_2024.pdf",
    fileUrl: "/sample-pof.pdf",
    expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 500000,
    lenderName: "ABC Capital Partners",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user1",
    fileName: "POF_XYZ_Funding_Jan.pdf",
    fileUrl: "/sample-pof-2.pdf",
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Expiring soon
    amount: 250000,
    lenderName: "XYZ Funding Group",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type SectionId = "offer_type" | "offer_terms" | "loi" | "pof" | "email" | "text";

export default function OfferBlaster() {
  const [step, setStep] = useState<BuilderStep>("select");
  const [selectedOfferType, setSelectedOfferType] = useState<OfferType | null>(null);
  const [marketType, setMarketType] = useState<MarketType>("off_market");
  const [documentType, setDocumentType] = useState<DocumentType>("loi");
  
  // Form state
  const [terms, setTerms] = useState<OfferTerms>(DEFAULT_OFFER_TERMS);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATE);
  const [textTemplate, setTextTemplate] = useState<TextTemplate>(DEFAULT_TEXT_TEMPLATE);
  const [loiTemplate, setLoiTemplate] = useState<LOITemplate>(DEFAULT_LOI_TEMPLATE);
  const [includePOF, setIncludePOF] = useState(true);
  const [selectedPOFId, setSelectedPOFId] = useState<string | null>(null);
  const [pofDocuments, setPofDocuments] = useState<POFDocument[]>(MOCK_POF_DOCUMENTS);
  
  // Section state
  const [openSection, setOpenSection] = useState<SectionId>("offer_type");
  
  // Template name
  const [templateName, setTemplateName] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const selectedOfferConfig = OFFER_TYPE_CONFIGS.find(
    (c) => c.id === selectedOfferType
  );

  // POF is required only for on-market (MLS) properties with cash offers
  const isPOFRequired = marketType === "on_market" && (selectedOfferType === "cash" || selectedOfferType === "hybrid");

  const handleOfferTypeSelect = (type: string) => {
    setSelectedOfferType(type as OfferType);
    setStep("build");
    setOpenSection("offer_type");
    
    // Update email subject based on offer type
    const config = OFFER_TYPE_CONFIGS.find((c) => c.id === type);
    if (config) {
      setEmailTemplate((prev) => ({
        ...prev,
        subject: `${config.label} for {{property_address}}`,
      }));
    }
  };

  const handleBack = () => {
    if (step === "build") {
      setStep("select");
    }
  };

  const handleUploadPOF = async (file: File, metadata: Partial<POFDocument>) => {
    // Mock upload
    const newDoc: POFDocument = {
      id: `pof-${Date.now()}`,
      userId: "user1",
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      expirationDate: metadata.expirationDate || new Date().toISOString(),
      amount: metadata.amount || 0,
      lenderName: metadata.lenderName || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPofDocuments((prev) => [...prev, newDoc]);
    setSelectedPOFId(newDoc.id);
    toast.success("Proof of Funds uploaded successfully");
  };

  const handleDeletePOF = async (id: string) => {
    setPofDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedPOFId === id) {
      setSelectedPOFId(null);
    }
    toast.success("POF deleted");
  };

  const getSectionStatus = (sectionId: SectionId): SectionStatus => {
    switch (sectionId) {
      case "offer_type":
        return selectedOfferType ? "complete" : "incomplete";
      case "offer_terms":
        return terms.depositAmount > 0 && terms.closingTimeline > 0
          ? "complete"
          : "incomplete";
      case "loi":
        return loiTemplate.content.length > 100 ? "complete" : "incomplete";
      case "pof":
        if (!isPOFRequired && !includePOF) return "optional";
        if (isPOFRequired && !selectedPOFId) return "error";
        return selectedPOFId ? "complete" : "optional";
      case "email":
        return emailTemplate.subject && emailTemplate.body
          ? "complete"
          : "incomplete";
      case "text":
        return textTemplate.body ? "complete" : "optional";
      default:
        return "incomplete";
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    toast.success(`Template "${templateName}" saved successfully`);
  };

  const canProceed = selectedOfferType && getSectionStatus("offer_terms") === "complete";

  return (
    <AppLayout>
      <div className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {step === "build" && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">OfferBlaster</h1>
              <p className="text-muted-foreground">
                {step === "select"
                  ? "Select an offer type to get started"
                  : `Configure your ${selectedOfferConfig?.label || "offer"}`}
              </p>
            </div>
          </div>

          {step === "build" && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button
                variant="primary"
                disabled={!canProceed}
              >
                <Send className="h-4 w-4 mr-2" />
                Continue to Properties
              </Button>
            </div>
          )}
        </div>

        {/* Step 1: Select Offer Type */}
        {step === "select" && (
          <div className="max-w-5xl">
            <OfferTypeGrid
              selectedType={selectedOfferType}
              onSelectType={handleOfferTypeSelect}
              configs={OFFER_TYPE_CONFIGS}
            />
          </div>
        )}

        {/* Step 2: Build Offer Package */}
        {step === "build" && selectedOfferType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
            {/* Left Panel - Builder */}
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {/* Template Name */}
                <Card variant="default" padding="md">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label>Template Name</Label>
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Standard Cash Offer - Dallas"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        id="save-default"
                        checked={saveAsDefault}
                        onCheckedChange={setSaveAsDefault}
                      />
                      <Label htmlFor="save-default" className="cursor-pointer">
                        Set as default
                      </Label>
                    </div>
                  </div>
                </Card>

                {/* Market Type */}
                <Card variant="default" padding="md">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label>Market Type</Label>
                      <p className="text-tiny text-muted-foreground mb-2">
                        POF is required for on-market (MLS) offers
                      </p>
                    </div>
                    <Select
                      value={marketType}
                      onValueChange={(v) => setMarketType(v as MarketType)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off_market">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Off-Market
                          </div>
                        </SelectItem>
                        <SelectItem value="on_market">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            On-Market (MLS)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                {/* Sections */}
                <SectionList>
                  {/* Offer Type Section */}
                  <BuilderSection
                    id="offer_type"
                    title="Offer Type"
                    icon={<Layers className="h-5 w-5 text-accent" />}
                    status={getSectionStatus("offer_type")}
                    isOpen={openSection === "offer_type"}
                    onToggle={() =>
                      setOpenSection(openSection === "offer_type" ? "" as SectionId : "offer_type")
                    }
                    badge={selectedOfferConfig?.label}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {OFFER_TYPE_CONFIGS.slice(0, 5).map((config) => (
                        <button
                          key={config.id}
                          type="button"
                          onClick={() => setSelectedOfferType(config.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            selectedOfferType === config.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <p className="font-medium text-small">{config.label}</p>
                          <p className="text-tiny text-muted-foreground line-clamp-1">
                            {config.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </BuilderSection>

                  {/* Offer Terms Section */}
                  <BuilderSection
                    id="offer_terms"
                    title="Offer Terms"
                    icon={<Settings className="h-5 w-5 text-info" />}
                    status={getSectionStatus("offer_terms")}
                    isOpen={openSection === "offer_terms"}
                    onToggle={() =>
                      setOpenSection(
                        openSection === "offer_terms" ? "" as SectionId : "offer_terms"
                      )
                    }
                  >
                    <OfferTermsSection
                      terms={terms}
                      offerType={selectedOfferType}
                      onChange={setTerms}
                    />
                  </BuilderSection>

                  {/* LOI Section */}
                  <BuilderSection
                    id="loi"
                    title="Letter of Intent"
                    icon={<FileText className="h-5 w-5 text-accent" />}
                    status={getSectionStatus("loi")}
                    isOpen={openSection === "loi"}
                    onToggle={() =>
                      setOpenSection(openSection === "loi" ? "" as SectionId : "loi")
                    }
                  >
                    <LOIEditor
                      template={loiTemplate}
                      documentType={documentType}
                      onChange={setLoiTemplate}
                      onDocumentTypeChange={setDocumentType}
                    />
                  </BuilderSection>

                  {/* POF Section */}
                  <BuilderSection
                    id="pof"
                    title="Proof of Funds"
                    icon={<FileCheck className="h-5 w-5 text-success" />}
                    status={getSectionStatus("pof")}
                    isOpen={openSection === "pof"}
                    onToggle={() =>
                      setOpenSection(openSection === "pof" ? "" as SectionId : "pof")
                    }
                    isRequired={isPOFRequired}
                    badge={isPOFRequired ? "Required" : undefined}
                  >
                    <POFManager
                      documents={pofDocuments}
                      selectedPOFId={selectedPOFId}
                      includePOF={includePOF}
                      isRequired={isPOFRequired || false}
                      onTogglePOF={setIncludePOF}
                      onSelectPOF={setSelectedPOFId}
                      onUploadPOF={handleUploadPOF}
                      onDeletePOF={handleDeletePOF}
                    />
                  </BuilderSection>

                  {/* Email Section */}
                  <BuilderSection
                    id="email"
                    title="Email Template"
                    icon={<Mail className="h-5 w-5 text-info" />}
                    status={getSectionStatus("email")}
                    isOpen={openSection === "email"}
                    onToggle={() =>
                      setOpenSection(openSection === "email" ? "" as SectionId : "email")
                    }
                  >
                    <EmailTemplateEditor
                      template={emailTemplate}
                      onChange={setEmailTemplate}
                    />
                  </BuilderSection>

                  {/* Text Section */}
                  <BuilderSection
                    id="text"
                    title="SMS Template"
                    icon={<MessageSquare className="h-5 w-5 text-success" />}
                    status={getSectionStatus("text")}
                    isOpen={openSection === "text"}
                    onToggle={() =>
                      setOpenSection(openSection === "text" ? "" as SectionId : "text")
                    }
                    isRequired={false}
                  >
                    <TextTemplateEditor
                      template={textTemplate}
                      onChange={setTextTemplate}
                    />
                  </BuilderSection>
                </SectionList>
              </div>
            </ScrollArea>

            {/* Right Panel - Preview */}
            <Card variant="default" padding="lg" className="h-full overflow-hidden">
              <OfferPreview
                offerType={selectedOfferType}
                terms={terms}
                includePOF={includePOF}
                emailTemplate={emailTemplate}
                textTemplate={textTemplate}
                loiTemplate={loiTemplate}
                documentType={documentType}
              />
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
