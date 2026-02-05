import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Star,
  Copy,
  DollarSign,
  Key,
  Wallet,
  Layers,
  Handshake,
  Building,
  UserPlus,
  Mail,
  MessageSquare,
  ArrowLeft,
  Zap,
  Home,
  Settings,
  FileCheck,
  Check,
  AlertTriangle,
  ChevronRight,
  Save,
} from "lucide-react";
import {
  useOfferTemplates,
  useCreateOfferTemplate,
  useUpdateOfferTemplate,
  useDeleteOfferTemplate,
  OfferTemplate,
} from "@/hooks/useOfferBlaster";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  TemplateDocumentSelector,
  TemplateTermsForm,
  TemplateEmailForm,
  TemplateSmsForm,
  TemplateLivePreview,
  TemplateBuilderStepper,
} from "./template-builder";

// Offer type configurations
const OFFER_TYPE_CONFIGS = [
  {
    id: "cash",
    label: "Cash Offer",
    description: "Simple, fast closing with no financing contingencies. Most attractive to motivated sellers.",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
    features: ["Fast closing (7-14 days)", "No financing contingency", "Simple terms", "High acceptance rate"],
    requiresPOF: false,
    isLicenseRequired: false,
  },
  {
    id: "subject_to",
    label: "Subject-To",
    description: "Take over existing mortgage payments. Great for properties with favorable loan terms.",
    icon: Key,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: ["No new financing needed", "Lower cash requirement", "Keep existing rate", "Flexible terms"],
    requiresPOF: false,
    isLicenseRequired: false,
  },
  {
    id: "seller_financing",
    label: "Seller Financing",
    description: "Seller acts as the bank. Good for sellers wanting monthly income stream.",
    icon: Wallet,
    color: "text-info",
    bgColor: "bg-info/10",
    features: ["No bank qualification", "Flexible terms", "Win-win structure", "Monthly income for seller"],
    requiresPOF: false,
    isLicenseRequired: false,
  },
  {
    id: "hybrid",
    label: "Hybrid Offer",
    description: "Cash down payment with seller financing for the balance. Best of both worlds.",
    icon: Layers,
    color: "text-warning",
    bgColor: "bg-warning/10",
    features: ["Cash + financing combo", "Lower cash required", "Competitive offer", "Flexible structure"],
    requiresPOF: false,
    isLicenseRequired: false,
  },
  {
    id: "novation",
    label: "Novation Agreement",
    description: "Control property, market it, and split profits. No purchase until buyer found.",
    icon: Handshake,
    color: "text-accent",
    bgColor: "bg-accent/10",
    features: ["No upfront capital", "Profit sharing", "Marketing control", "Low risk strategy"],
    requiresPOF: false,
    isLicenseRequired: false,
  },
  {
    id: "listing",
    label: "Listing Agreement",
    description: "Offer to list the seller's property on MLS. Requires real estate license.",
    icon: Building,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: ["MLS exposure", "Professional marketing", "Full service", "Commission based"],
    requiresPOF: false,
    isLicenseRequired: true,
    disclosures: [
      "Agent/Broker must hold valid real estate license in property state",
      "Agency disclosure required before any property discussions",
    ],
  },
  {
    id: "referral",
    label: "Agent Referral",
    description: "Refer the lead to another licensed agent for a referral fee. Requires license.",
    icon: UserPlus,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    features: ["Passive income", "No transaction work", "Referral fee (25-35%)", "License required"],
    requiresPOF: false,
    isLicenseRequired: true,
    disclosures: [
      "Referral fee must be disclosed and agreed upon in writing",
      "Referring agent must hold valid license",
    ],
  },
];

const MARKET_TYPE_OPTIONS = [
  { value: "on_market", label: "On-Market (MLS)" },
  { value: "off_market", label: "Off-Market" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: "loi", label: "Letter of Intent" },
  { value: "purchase_agreement", label: "Purchase Agreement" },
  { value: "both", label: "Both" },
];

interface TemplateFormData {
  name: string;
  description: string;
  offer_type: string;
  market_type: string;
  document_type: string;
  email_subject: string;
  email_body: string;
  email_signature: string;
  sms_body: string;
  loi_content: string;
  include_pof: boolean;
  is_default: boolean;
  terms: Record<string, any>;
}

const getDefaultFormData = (offerType: string = "cash"): TemplateFormData => {
  const config = OFFER_TYPE_CONFIGS.find((c) => c.id === offerType);
  return {
    name: "",
    description: "",
    offer_type: offerType,
    market_type: "off_market",
    document_type: "loi",
    email_subject: `${config?.label || "Cash Offer"} for {{property_address}}`,
    email_body: `Dear {{seller_name}},

I hope this message finds you well. My name is {{buyer_name}}, and I am a local real estate investor interested in purchasing your property at {{property_address}}.

I am prepared to make you a ${config?.label?.toLowerCase() || "cash offer"} with the following terms:

• Earnest Money Deposit: {{deposit_amount}}
• Closing Timeline: {{closing_days}} days
• No financing contingency
• Quick, hassle-free closing

Would you be available for a brief call to discuss this further?

Best regards,
{{buyer_name}}
{{buyer_phone}}
{{buyer_email}}`,
    email_signature: "",
    sms_body: "Hi {{seller_name}}! This is {{buyer_name}}. I'm interested in making a cash offer on your property at {{property_address}}. Would you be open to a quick call? Reply YES and I'll give you a ring.",
    loi_content: `LETTER OF INTENT TO PURCHASE REAL ESTATE

Date: {{date}}

Dear {{seller_name}},

This Letter of Intent outlines the basic terms under which {{buyer_name}} proposes to purchase the property at:

{{property_address}}
{{property_city}}, {{property_state}} {{property_zip}}

1. PURCHASE PRICE: {{offer_amount}}
2. EARNEST MONEY DEPOSIT: {{deposit_amount}}
3. INSPECTION PERIOD: {{inspection_period}} days
4. CLOSING DATE: {{closing_days}} days from acceptance

This LOI is non-binding and subject to the execution of a mutually acceptable Purchase Agreement.

Sincerely,
{{buyer_name}}`,
    include_pof: false,
    is_default: false,
    terms: {
      depositAmount: 1000,
      depositType: "flat",
      inspectionPeriod: 10,
      closingTimeline: 14,
    },
  };
};

type ViewMode = "grid" | "builder";

export function TemplatesTab() {
  const { data: templates, isLoading } = useOfferTemplates();
  const createTemplate = useCreateOfferTemplate();
  const updateTemplate = useUpdateOfferTemplate();
  const deleteTemplate = useDeleteOfferTemplate();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [editingTemplate, setEditingTemplate] = useState<OfferTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(getDefaultFormData());
  const [activeBuilderTab, setActiveBuilderTab] = useState("general");

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.offer_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSelectOfferType = (type: string) => {
    setFormData(getDefaultFormData(type));
    setEditingTemplate(null);
    setActiveBuilderTab("general");
    setViewMode("builder");
  };

  const handleEditTemplate = (template: OfferTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      offer_type: template.offer_type,
      market_type: template.market_type,
      document_type: template.document_type,
      email_subject: template.email_subject || "",
      email_body: template.email_body || "",
      email_signature: template.email_signature || "",
      sms_body: template.sms_body || "",
      loi_content: template.loi_content || "",
      include_pof: template.include_pof,
      is_default: template.is_default,
      terms: template.terms || {},
    });
    setActiveBuilderTab("general");
    setViewMode("builder");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setEditingTemplate(null);
    setFormData(getDefaultFormData());
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          updates: {
            name: formData.name,
            description: formData.description,
            offer_type: formData.offer_type,
            market_type: formData.market_type,
            document_type: formData.document_type,
            email_subject: formData.email_subject,
            email_body: formData.email_body,
            email_signature: formData.email_signature,
            sms_body: formData.sms_body,
            loi_content: formData.loi_content,
            include_pof: formData.include_pof,
            is_default: formData.is_default,
            terms: formData.terms,
          },
        });
        toast.success("Template updated successfully");
      } else {
        await createTemplate.mutateAsync({
          name: formData.name,
          description: formData.description,
          offer_type: formData.offer_type,
          market_type: formData.market_type,
          document_type: formData.document_type,
          email_subject: formData.email_subject,
          email_body: formData.email_body,
          email_signature: formData.email_signature,
          sms_body: formData.sms_body,
          loi_content: formData.loi_content,
          include_pof: formData.include_pof,
          is_default: formData.is_default,
          is_active: true,
          terms: formData.terms,
        });
        toast.success("Template created successfully");
      }
      handleBackToGrid();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDuplicate = (template: OfferTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      offer_type: template.offer_type,
      market_type: template.market_type,
      document_type: template.document_type,
      email_subject: template.email_subject || "",
      email_body: template.email_body || "",
      email_signature: template.email_signature || "",
      sms_body: template.sms_body || "",
      loi_content: template.loi_content || "",
      include_pof: template.include_pof,
      is_default: false,
      terms: template.terms || {},
    });
    setActiveBuilderTab("general");
    setViewMode("builder");
  };

  const handleSetDefault = async (template: OfferTemplate) => {
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: {
          is_default: !template.is_default,
          offer_type: template.offer_type,
        },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getOfferTypeConfig = (type: string) => {
    return OFFER_TYPE_CONFIGS.find((opt) => opt.id === type);
  };

  const currentOfferConfig = getOfferTypeConfig(formData.offer_type);
  const isPOFRequired = formData.market_type === "on_market" && (formData.offer_type === "cash" || formData.offer_type === "hybrid");

  // Split offer types into investor and licensed
  const investorOffers = OFFER_TYPE_CONFIGS.filter((c) => !c.isLicenseRequired);
  const licensedOffers = OFFER_TYPE_CONFIGS.filter((c) => c.isLicenseRequired);

  const [useSampleData, setUseSampleData] = useState(true);
  const [includeSms, setIncludeSms] = useState(true);

  // Builder View - Vertical Stepper Layout
  if (viewMode === "builder") {
    return (
      <TemplateBuilderStepper
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onBack={handleBackToGrid}
        isSaving={createTemplate.isPending || updateTemplate.isPending}
        isEditing={!!editingTemplate}
      />
    );
  }

  // Grid View (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Offer Templates</h2>
            <p className="text-muted-foreground text-sm">
              Select an offer type to create a new template
            </p>
          </div>
        </div>
      </div>

      {/* Offer Type Selection Grid */}
      <div className="space-y-8">
        {/* Investor Offers */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Investor Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investorOffers.map((config) => (
              <Card
                key={config.id}
                variant="default"
                padding="lg"
                className="cursor-pointer transition-all hover:shadow-lg hover:border-accent/50 group"
                onClick={() => handleSelectOfferType(config.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-lg shrink-0", config.bgColor)}>
                    <config.icon className={cn("h-6 w-6", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-foreground">{config.label}</h4>
                    </div>
                    <p className="text-small text-muted-foreground mb-3">{config.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {config.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-tiny px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Licensed Offers */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-foreground">Agent Options</h3>
            <Badge variant="warning" size="sm">License Required</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licensedOffers.map((config) => (
              <Card
                key={config.id}
                variant="default"
                padding="lg"
                className="cursor-pointer transition-all hover:shadow-lg hover:border-accent/50 group"
                onClick={() => handleSelectOfferType(config.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-lg shrink-0", config.bgColor)}>
                    <config.icon className={cn("h-6 w-6", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-foreground">{config.label}</h4>
                      <Badge variant="warning" size="sm">License Required</Badge>
                    </div>
                    <p className="text-small text-muted-foreground mb-3">{config.description}</p>
                    {config.disclosures && (
                      <div className="p-2 bg-warning/10 border border-warning/20 rounded-md mb-3">
                        <div className="flex items-center gap-1.5 text-warning text-tiny">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Disclosures required</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {config.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-tiny px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Existing Templates */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Saved Templates</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {OFFER_TYPE_CONFIGS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filter"
                : "Select an offer type above to create your first template"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates?.map((template) => {
              const typeConfig = getOfferTypeConfig(template.offer_type);
              const Icon = typeConfig?.icon || FileText;

              return (
                <Card key={template.id} variant="default" padding="md" className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", typeConfig?.bgColor)}>
                        <Icon className={cn("h-5 w-5", typeConfig?.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          {template.is_default && (
                            <Star className="h-4 w-4 text-warning fill-warning" />
                          )}
                        </div>
                        <p className="text-small text-muted-foreground">{typeConfig?.label}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                          <Star className="h-4 w-4 mr-2" />
                          {template.is_default ? "Remove Default" : "Set as Default"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteConfirmId(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {template.description && (
                    <p className="text-small text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-tiny">
                      {template.market_type === "on_market" ? "MLS" : "Off-Market"}
                    </Badge>
                    <Badge variant="secondary" className="text-tiny">
                      {template.document_type === "loi" ? "LOI" : template.document_type === "purchase_agreement" ? "PA" : "LOI + PA"}
                    </Badge>
                    {template.include_pof && (
                      <Badge variant="secondary" className="text-tiny">POF</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-tiny text-muted-foreground">
                    {template.email_body && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                    )}
                    {template.sms_body && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        SMS
                      </div>
                    )}
                    {template.loi_content && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        LOI
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
