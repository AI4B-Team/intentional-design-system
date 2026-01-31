import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Zap,
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
import { useNavigate } from "react-router-dom";

const OFFER_TYPE_OPTIONS = [
  { value: "cash", label: "Cash Offer", icon: DollarSign, color: "text-success" },
  { value: "subject_to", label: "Subject-To", icon: Key, color: "text-purple-500" },
  { value: "seller_financing", label: "Seller Financing", icon: Wallet, color: "text-info" },
  { value: "hybrid", label: "Hybrid Offer", icon: Layers, color: "text-warning" },
  { value: "novation", label: "Novation Agreement", icon: Handshake, color: "text-accent" },
  { value: "listing", label: "Listing Agreement", icon: Building, color: "text-emerald-500" },
  { value: "referral", label: "Agent Referral", icon: UserPlus, color: "text-rose-500" },
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

const DEFAULT_FORM_DATA: TemplateFormData = {
  name: "",
  description: "",
  offer_type: "cash",
  market_type: "off_market",
  document_type: "loi",
  email_subject: "Cash Offer for {{property_address}}",
  email_body: `Dear {{seller_name}},

I hope this message finds you well. My name is {{buyer_name}}, and I am a local real estate investor interested in purchasing your property at {{property_address}}.

I am prepared to make you a cash offer with the following terms:

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

export default function OfferTemplates() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useOfferTemplates();
  const createTemplate = useCreateOfferTemplate();
  const updateTemplate = useUpdateOfferTemplate();
  const deleteTemplate = useDeleteOfferTemplate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OfferTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
  const [activeTab, setActiveTab] = useState("general");

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.offer_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenDialog = (template?: OfferTemplate) => {
    if (template) {
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
    } else {
      setEditingTemplate(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setActiveTab("general");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

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
      }
      handleCloseDialog();
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
    setActiveTab("general");
    setIsDialogOpen(true);
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
    return OFFER_TYPE_OPTIONS.find((opt) => opt.value === type);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Offer Templates</h1>
              <p className="text-muted-foreground">
                Create and manage reusable offer templates for OfferBlaster
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/tools/offer-blaster")}>
              <Zap className="h-4 w-4 mr-2" />
              Open OfferBlaster
            </Button>
            <Button variant="primary" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
        {/* Filters */}
        <Card variant="default" padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {OFFER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first offer template to get started"}
            </p>
            {!searchQuery && filterType === "all" && (
              <Button variant="primary" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates?.map((template) => {
              const typeConfig = getOfferTypeConfig(template.offer_type);
              const Icon = typeConfig?.icon || FileText;

              return (
                <Card
                  key={template.id}
                  variant="default"
                  padding="md"
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          typeConfig?.color?.replace("text-", "bg-") + "/10"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", typeConfig?.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.is_default && (
                            <Star className="h-4 w-4 text-warning fill-warning" />
                          )}
                        </div>
                        <p className="text-small text-muted-foreground">
                          {typeConfig?.label}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
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
                      {template.document_type === "loi"
                        ? "LOI"
                        : template.document_type === "purchase_agreement"
                        ? "PA"
                        : "LOI + PA"}
                    </Badge>
                    {template.include_pof && (
                      <Badge variant="secondary" className="text-tiny">
                        POF
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-tiny text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {template.email_subject ? "Email" : "No email"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {template.sms_body ? "SMS" : "No SMS"}
                    </span>
                    <span className="ml-auto">Used {template.use_count}x</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create Template"}
              </DialogTitle>
              <DialogDescription>
                Configure your offer template settings, email, SMS, and LOI content.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="loi">LOI / Document</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 h-[400px]">
                <TabsContent value="general" className="m-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Template Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g., Standard Cash Offer - Dallas"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Brief description of when to use this template"
                        className="mt-1.5"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Offer Type</Label>
                      <Select
                        value={formData.offer_type}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, offer_type: v }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OFFER_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Market Type</Label>
                      <Select
                        value={formData.market_type}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, market_type: v }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MARKET_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Document Type</Label>
                      <Select
                        value={formData.document_type}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, document_type: v }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        id="include_pof"
                        checked={formData.include_pof}
                        onCheckedChange={(v) =>
                          setFormData((prev) => ({ ...prev, include_pof: v }))
                        }
                      />
                      <Label htmlFor="include_pof" className="cursor-pointer">
                        Include Proof of Funds
                      </Label>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Switch
                        id="is_default"
                        checked={formData.is_default}
                        onCheckedChange={(v) =>
                          setFormData((prev) => ({ ...prev, is_default: v }))
                        }
                      />
                      <Label htmlFor="is_default" className="cursor-pointer">
                        Set as default template for this offer type
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="m-0 space-y-4">
                  <div>
                    <Label>Email Subject</Label>
                    <Input
                      value={formData.email_subject}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email_subject: e.target.value }))
                      }
                      placeholder="Cash Offer for {{property_address}}"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email Body</Label>
                    <Textarea
                      value={formData.email_body}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email_body: e.target.value }))
                      }
                      placeholder="Enter your email template..."
                      className="mt-1.5 font-mono text-sm"
                      rows={12}
                    />
                    <p className="text-tiny text-muted-foreground mt-1">
                      Use {"{{variable}}"} for dynamic content like {"{{seller_name}}"},{" "}
                      {"{{property_address}}"}, {"{{offer_amount}}"}
                    </p>
                  </div>
                  <div>
                    <Label>Email Signature (Optional)</Label>
                    <Textarea
                      value={formData.email_signature}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email_signature: e.target.value }))
                      }
                      placeholder="Your signature..."
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sms" className="m-0 space-y-4">
                  <div>
                    <Label>SMS Message</Label>
                    <Textarea
                      value={formData.sms_body}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sms_body: e.target.value }))
                      }
                      placeholder="Enter your SMS template..."
                      className="mt-1.5"
                      rows={4}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-tiny text-muted-foreground">
                        Use {"{{variable}}"} for dynamic content
                      </p>
                      <span
                        className={cn(
                          "text-tiny",
                          formData.sms_body.length > 160
                            ? "text-warning"
                            : "text-muted-foreground"
                        )}
                      >
                        {formData.sms_body.length}/160 characters
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="loi" className="m-0 space-y-4">
                  <div>
                    <Label>Letter of Intent / Document Content</Label>
                    <Textarea
                      value={formData.loi_content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, loi_content: e.target.value }))
                      }
                      placeholder="Enter your LOI template..."
                      className="mt-1.5 font-mono text-sm"
                      rows={16}
                    />
                    <p className="text-tiny text-muted-foreground mt-1">
                      Available variables: {"{{date}}"}, {"{{seller_name}}"},{" "}
                      {"{{buyer_name}}"}, {"{{property_address}}"}, {"{{offer_amount}}"},
                      {"{{deposit_amount}}"}, {"{{closing_days}}"}, {"{{inspection_period}}"}
                    </p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={
                  !formData.name.trim() ||
                  createTemplate.isPending ||
                  updateTemplate.isPending
                }
              >
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteConfirmId}
          onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        >
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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
