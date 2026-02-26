import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useMailTemplates, useCreateMailCampaign } from "@/hooks/useMailCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Database, 
  Upload, 
  Edit,
  Calendar,
  Phone,
  Link as LinkIcon,
  Eye,
  Rocket,
  FileText,
  Mail,
  Zap,
  Droplet,
  Layers,
  Plus,
  Trash2,
  QrCode,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const WIZARD_STEPS = [
  { id: 1, label: "Basics", icon: FileText },
  { id: 2, label: "Recipients", icon: Database },
  { id: 3, label: "Schedule", icon: Calendar },
  { id: 4, label: "Tracking", icon: Phone },
  { id: 5, label: "Review", icon: Eye },
];

const PROPERTY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "appointment", label: "Appointment" },
  { value: "offer_made", label: "Offer Made" },
  { value: "under_contract", label: "Under Contract" },
];

const PROPERTY_SOURCES = [
  { value: "d4d", label: "D4D" },
  { value: "direct_mail", label: "Direct Mail" },
  { value: "agent", label: "Agent" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "marketing", label: "Marketing" },
];

const LAST_CONTACT_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "30", label: "More than 30 days ago" },
  { value: "60", label: "More than 60 days ago" },
  { value: "90", label: "More than 90 days ago" },
  { value: "never", label: "Never contacted" },
];

interface SequenceTouch {
  id: string;
  templateId: string | null;
  daysAfter: number;
}

interface WizardState {
  name: string;
  description: string;
  templateId: string | null;
  listType: "database" | "upload" | "manual";
  statusFilters: string[];
  motivationRange: [number, number];
  sourceFilters: string[];
  lastContactFilter: string;
  neverMailed: boolean;
  hasMailingAddress: boolean;
  // Enhanced schedule options
  scheduleType: "single" | "drip" | "multitouch";
  sendDate: string;
  mailClass: "first_class" | "standard";
  dripStartDate: string;
  dripPiecesPerDay: number;
  sequenceTouches: SequenceTouch[];
  // Enhanced tracking options
  useTrackingPhone: boolean;
  trackingPhone: string;
  useTrackingUrl: boolean;
  trackingUrlSlug: string;
  landingPageHeadline: string;
  landingPageSubheadline: string;
  landingFormFields: string[];
  // Review confirmations
  confirmLegitimate: boolean;
  confirmNoRecall: boolean;
}

const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

const initialState: WizardState = {
  name: "",
  description: "",
  templateId: null,
  listType: "database",
  statusFilters: [],
  motivationRange: [0, 1000],
  sourceFilters: [],
  lastContactFilter: "any",
  neverMailed: false,
  hasMailingAddress: true,
  scheduleType: "single",
  sendDate: tomorrow,
  mailClass: "first_class",
  dripStartDate: tomorrow,
  dripPiecesPerDay: 50,
  sequenceTouches: [
    { id: "touch-1", templateId: null, daysAfter: 0 },
    { id: "touch-2", templateId: null, daysAfter: 14 },
  ],
  useTrackingPhone: false,
  trackingPhone: "",
  useTrackingUrl: false,
  trackingUrlSlug: "",
  landingPageHeadline: "Get Your Cash Offer Today",
  landingPageSubheadline: "We buy houses in any condition. Fast closing, no fees.",
  landingFormFields: ["name", "phone", "email", "address"],
  confirmLegitimate: false,
  confirmNoRecall: false,
};

// Mail pricing
const PRICING = {
  postcard_4x6: { first_class: 0.89, standard: 0.69 },
  postcard_6x9: { first_class: 1.19, standard: 0.89 },
  postcard_6x11: { first_class: 1.49, standard: 1.09 },
  letter: { first_class: 1.29, standard: 0.99 },
  yellow_letter: { first_class: 1.29, standard: 0.99 },
};

export default function MailCampaignWizard() {
  const navigate = useNavigate();
  const { data: templates } = useMailTemplates();
  const createCampaign = useCreateMailCampaign();
  
  const [currentStep, setCurrentStep] = React.useState(1);
  const [state, setState] = React.useState<WizardState>(initialState);
  const [showLaunchModal, setShowLaunchModal] = React.useState(false);

  const { data: matchingProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["campaign-properties-preview", state.statusFilters, state.sourceFilters, state.motivationRange, state.hasMailingAddress],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("id, address, city, state, owner_name, motivation_score, owner_mailing_address")
        .order("motivation_score", { ascending: false });

      if (state.statusFilters.length > 0) {
        query = query.in("status", state.statusFilters);
      }
      if (state.sourceFilters.length > 0) {
        query = query.in("source", state.sourceFilters);
      }
      if (state.motivationRange[0] > 0) {
        query = query.gte("motivation_score", state.motivationRange[0]);
      }
      if (state.motivationRange[1] < 1000) {
        query = query.lte("motivation_score", state.motivationRange[1]);
      }
      if (state.hasMailingAddress) {
        query = query.not("owner_mailing_address", "is", null);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
    enabled: state.listType === "database",
  });

  const selectedTemplate = templates?.find(t => t.id === state.templateId);
  const recipientCount = matchingProperties?.length || 0;

  // Calculate pricing
  const templateType = selectedTemplate?.type || "postcard_4x6";
  const pricePerPiece = PRICING[templateType as keyof typeof PRICING]?.[state.mailClass] || 0.89;
  const totalPieces = state.scheduleType === "multitouch" 
    ? recipientCount * state.sequenceTouches.length 
    : recipientCount;
  const estimatedCost = totalPieces * pricePerPiece;
  const trackingPhoneCost = state.useTrackingPhone ? 2.00 : 0;
  const totalCost = estimatedCost + trackingPhoneCost;

  // Calculate drip duration
  const dripDays = recipientCount > 0 ? Math.ceil(recipientCount / state.dripPiecesPerDay) : 0;
  const dripEndDate = dripDays > 0 ? format(addDays(new Date(state.dripStartDate), dripDays), "MMM d, yyyy") : "";

  // Calculate delivery dates
  const deliveryDays = state.mailClass === "first_class" ? { min: 3, max: 5 } : { min: 5, max: 14 };

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value) ? array.filter(v => v !== value) : [...array, value];
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: return state.name.trim() && state.templateId;
      case 2: return state.listType === "database" ? recipientCount > 0 : true;
      case 3: return state.sendDate || state.dripStartDate;
      case 4: return true;
      case 5: return state.confirmLegitimate && state.confirmNoRecall;
      default: return false;
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      await createCampaign.mutateAsync({
        name: state.name,
        description: state.description || null,
        template_id: state.templateId,
        status: "draft",
        list_type: state.listType === "database" ? "filtered_list" : state.listType === "upload" ? "uploaded_list" : "manual",
        list_filters: state.listType === "database" ? {
          statusFilters: state.statusFilters,
          motivationRange: state.motivationRange,
          sourceFilters: state.sourceFilters,
        } : null,
        total_recipients: recipientCount,
        is_drip: state.scheduleType === "drip",
        drip_settings: state.scheduleType === "drip" ? { piecesPerDay: state.dripPiecesPerDay } : null,
        tracking_phone: state.useTrackingPhone ? state.trackingPhone : null,
        tracking_url: state.useTrackingUrl ? state.trackingUrlSlug : null,
      });
      toast.success("Campaign saved as draft");
      navigate("/mail/campaigns");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLaunch = async () => {
    try {
      const isFuture = new Date(state.sendDate) > new Date();
      await createCampaign.mutateAsync({
        name: state.name,
        description: state.description || null,
        template_id: state.templateId,
        status: isFuture ? "scheduled" : "sending",
        list_type: state.listType === "database" ? "filtered_list" : state.listType === "upload" ? "uploaded_list" : "manual",
        list_filters: state.listType === "database" ? {
          statusFilters: state.statusFilters,
          motivationRange: state.motivationRange,
          sourceFilters: state.sourceFilters,
        } : null,
        total_recipients: recipientCount,
        scheduled_date: state.scheduleType === "single" ? state.sendDate : state.dripStartDate,
        is_drip: state.scheduleType === "drip",
        drip_settings: state.scheduleType === "drip" ? { piecesPerDay: state.dripPiecesPerDay } : 
                       state.scheduleType === "multitouch" ? { touches: state.sequenceTouches } : null,
        tracking_phone: state.useTrackingPhone ? state.trackingPhone : null,
        tracking_url: state.useTrackingUrl ? state.trackingUrlSlug : null,
        cost_per_piece: pricePerPiece,
        total_cost: totalCost,
      });
      toast.success("Campaign launched! 🚀");
      navigate("/mail/campaigns");
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Auto-generate URL slug from campaign name
  React.useEffect(() => {
    if (state.name && !state.trackingUrlSlug) {
      const slug = state.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      updateState({ trackingUrlSlug: slug });
    }
  }, [state.name]);

  // Sync first touch template with main template
  React.useEffect(() => {
    if (state.templateId && state.sequenceTouches[0]?.templateId !== state.templateId) {
      const updated = [...state.sequenceTouches];
      updated[0] = { ...updated[0], templateId: state.templateId };
      updateState({ sequenceTouches: updated });
    }
  }, [state.templateId]);

  return (
    <PageLayout>
      <PageHeader
        title="Create Mail Campaign"
        description="Send postcards and letters to property owners"
        action={
          <Button variant="ghost" onClick={() => navigate("/mail/campaigns")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        }
      />

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted && "bg-success border-success text-white",
                      isCurrent && "border-brand bg-brand/10 text-brand",
                      !isCompleted && !isCurrent && "border-border text-content-tertiary"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={cn("text-tiny font-medium", isCurrent && "text-brand", !isCompleted && !isCurrent && "text-content-tertiary")}>
                    {step.label}
                  </span>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2", isCompleted ? "bg-success" : "bg-border")} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <Progress value={(currentStep / WIZARD_STEPS.length) * 100} className="mt-4 max-w-3xl mx-auto" />
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <StepBasics state={state} updateState={updateState} templates={templates || []} selectedTemplate={selectedTemplate} />
        )}
        {currentStep === 2 && (
          <StepRecipients 
            state={state} 
            updateState={updateState} 
            toggleArrayValue={toggleArrayValue}
            matchingProperties={matchingProperties || []}
            propertiesLoading={propertiesLoading}
          />
        )}
        {currentStep === 3 && (
          <StepSchedule 
            state={state} 
            updateState={updateState}
            templates={templates || []}
            recipientCount={recipientCount}
            pricePerPiece={pricePerPiece}
            dripDays={dripDays}
            dripEndDate={dripEndDate}
            deliveryDays={deliveryDays}
          />
        )}
        {currentStep === 4 && (
          <StepTracking state={state} updateState={updateState} />
        )}
        {currentStep === 5 && (
          <StepReview 
            state={state} 
            updateState={updateState}
            selectedTemplate={selectedTemplate} 
            recipientCount={recipientCount}
            totalPieces={totalPieces}
            pricePerPiece={pricePerPiece}
            estimatedCost={estimatedCost}
            trackingPhoneCost={trackingPhoneCost}
            totalCost={totalCost}
            deliveryDays={deliveryDays}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-3">
          {currentStep === 5 && (
            <Button variant="secondary" onClick={handleSaveAsDraft} disabled={createCampaign.isPending}>
              Save As Draft
            </Button>
          )}
          
          {currentStep < 5 ? (
            <Button variant="primary" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canContinue()}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setShowLaunchModal(true)} 
              disabled={!canContinue() || createCampaign.isPending}
            >
              <Rocket className="h-4 w-4 mr-2" />
              {new Date(state.sendDate) > new Date() ? "Schedule Campaign" : "Launch Campaign"}
            </Button>
          )}
        </div>
      </div>

      {/* Launch Confirmation Modal */}
      <AlertDialog open={showLaunchModal} onOpenChange={setShowLaunchModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Launch Campaign?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You're about to send <strong>{totalPieces.toLocaleString()}</strong> mail pieces.</p>
                <p>Estimated cost: <strong>${totalCost.toFixed(2)}</strong></p>
                <p className="text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  This cannot be undone once Lob begins processing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLaunch} className="bg-brand text-white hover:bg-brand/90">
              Yes, Launch Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

// Step 1 - Basics
function StepBasics({ state, updateState, templates, selectedTemplate }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>Name your campaign and select a template</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="Q1 Absentee Owner Campaign"
              value={state.name}
              onChange={(e) => updateState({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Select Template *</Label>
            <Select value={state.templateId || ""} onValueChange={(v) => updateState({ templateId: v })}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template: any) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Targeting absentee owners with 50%+ equity..."
            value={state.description}
            onChange={(e) => updateState({ description: e.target.value })}
            rows={2}
          />
        </div>

        {selectedTemplate && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <div className="w-32 shrink-0 bg-white rounded-lg overflow-hidden border">
                  <AspectRatio ratio={3/2}>
                    <div 
                      className="p-1 text-[6px]"
                      style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.front_html || "" }}
                    />
                  </AspectRatio>
                </div>
                <div>
                  <p className="font-medium">{selectedTemplate.name}</p>
                  <Badge variant="secondary" size="sm" className="mt-1">{selectedTemplate.type}</Badge>
                  {selectedTemplate.description && (
                    <p className="text-small text-content-secondary mt-2">{selectedTemplate.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// Step 2 - Recipients (existing code)
function StepRecipients({ state, updateState, toggleArrayValue, matchingProperties, propertiesLoading }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Who are you mailing to?</CardTitle>
          <CardDescription>Choose your recipient source</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.listType}
            onValueChange={(v) => updateState({ listType: v })}
            className="grid gap-4 md:grid-cols-3"
          >
            {[
              { value: "database", icon: Database, title: "Properties in Database", desc: "Select from your existing properties" },
              { value: "upload", icon: Upload, title: "Upload a List", desc: "Import from CSV or Excel" },
              { value: "manual", icon: Edit, title: "Manual Entry", desc: "Add addresses one by one" },
            ].map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                  state.listType === option.value ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                <option.icon className="h-8 w-8 text-brand" />
                <div className="text-center">
                  <p className="font-medium">{option.title}</p>
                  <p className="text-tiny text-content-secondary">{option.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {state.listType === "database" && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Properties</CardTitle>
            <CardDescription>Narrow down which properties to include</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Property Status</Label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_STATUSES.map((status) => (
                  <label key={status.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={state.statusFilters.includes(status.value)}
                      onCheckedChange={() => updateState({ statusFilters: toggleArrayValue(state.statusFilters, status.value) })}
                    />
                    <span className="text-small">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Motivation Score Range</Label>
                <span className="text-small text-content-secondary">
                  {state.motivationRange[0]} - {state.motivationRange[1]}
                </span>
              </div>
              <Slider
                value={state.motivationRange}
                onValueChange={(v) => updateState({ motivationRange: v as [number, number] })}
                min={0}
                max={1000}
                step={50}
              />
            </div>

            <div className="space-y-3">
              <Label>Source</Label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_SOURCES.map((source) => (
                  <label key={source.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={state.sourceFilters.includes(source.value)}
                      onCheckedChange={() => updateState({ sourceFilters: toggleArrayValue(state.sourceFilters, source.value) })}
                    />
                    <span className="text-small">{source.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Contact</Label>
              <Select value={state.lastContactFilter} onValueChange={(v) => updateState({ lastContactFilter: v })}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAST_CONTACT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <Checkbox checked={state.neverMailed} onCheckedChange={(checked) => updateState({ neverMailed: !!checked })} />
                <span className="text-small">Only include properties never mailed before</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={state.hasMailingAddress} onCheckedChange={(checked) => updateState({ hasMailingAddress: !!checked })} />
                <span className="text-small">Must have valid mailing address</span>
              </label>
            </div>

            <Separator />

            <div className="p-4 bg-muted/50 rounded-lg">
              {propertiesLoading ? (
                <p className="text-small text-content-secondary">Calculating matches...</p>
              ) : (
                <>
                  <p className="text-h3 font-bold text-brand">{matchingProperties.length} properties match your filters</p>
                  {matchingProperties.length > 0 && (
                    <div className="mt-3 text-small text-content-secondary">
                      <p>Top matches:</p>
                      <ul className="mt-1 space-y-1">
                        {matchingProperties.slice(0, 3).map((p: any) => (
                          <li key={p.id}>{p.address}, {p.city} - Score: {p.motivation_score}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {state.listType === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your List</CardTitle>
            <CardDescription>Import addresses from a CSV or Excel file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-brand transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-content-tertiary mb-4" />
              <p className="font-medium">Drop your file here or click to browse</p>
              <p className="text-small text-content-secondary mt-1">Accepted formats: CSV, XLSX (max 50,000 records)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {state.listType === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Recipients Manually</CardTitle>
            <CardDescription>Enter addresses one at a time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input placeholder="John Smith" /></div>
              <div className="space-y-2"><Label>Address Line 1</Label><Input placeholder="123 Main St" /></div>
              <div className="space-y-2"><Label>City</Label><Input placeholder="Austin" /></div>
              <div className="space-y-2"><Label>State</Label><Input placeholder="TX" maxLength={2} /></div>
              <div className="space-y-2"><Label>ZIP</Label><Input placeholder="78701" maxLength={10} /></div>
              <div className="flex items-end"><Button variant="secondary">Verify & Add</Button></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Deduplication Settings</CardTitle>
          <CardDescription>Remove addresses that shouldn't receive mail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2"><Checkbox defaultChecked /><span className="text-small">Remove addresses mailed in the last 30 days</span></label>
          <label className="flex items-center gap-2"><Checkbox defaultChecked /><span className="text-small">Remove addresses on suppression list</span></label>
          <label className="flex items-center gap-2"><Checkbox defaultChecked /><span className="text-small">Remove duplicate addresses within this list</span></label>
          <label className="flex items-center gap-2"><Checkbox /><span className="text-small">Remove addresses from other active campaigns</span></label>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 3 - Schedule (ENHANCED)
function StepSchedule({ state, updateState, templates, recipientCount, pricePerPiece, dripDays, dripEndDate, deliveryDays }: any) {
  const addTouch = () => {
    if (state.sequenceTouches.length < 5) {
      const lastTouch = state.sequenceTouches[state.sequenceTouches.length - 1];
      updateState({
        sequenceTouches: [
          ...state.sequenceTouches,
          { id: `touch-${Date.now()}`, templateId: null, daysAfter: lastTouch.daysAfter + 14 }
        ]
      });
    }
  };

  const removeTouch = (id: string) => {
    if (state.sequenceTouches.length > 1) {
      updateState({
        sequenceTouches: state.sequenceTouches.filter((t: SequenceTouch) => t.id !== id)
      });
    }
  };

  const updateTouch = (id: string, updates: Partial<SequenceTouch>) => {
    updateState({
      sequenceTouches: state.sequenceTouches.map((t: SequenceTouch) => 
        t.id === id ? { ...t, ...updates } : t
      )
    });
  };

  const totalTouchDays = state.sequenceTouches[state.sequenceTouches.length - 1]?.daysAfter || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>When should we send?</CardTitle>
          <CardDescription>Choose your sending strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={state.scheduleType} onValueChange={(v) => updateState({ scheduleType: v })} className="space-y-4">
            {/* Option A: Send All at Once */}
            <Label
              htmlFor="single"
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                state.scheduleType === "single" ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground"
              )}
            >
              <RadioGroupItem value="single" id="single" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  <p className="font-medium">Send All at Once</p>
                </div>
                <p className="text-small text-content-secondary mt-1">Mail all pieces on a single date</p>
                
                {state.scheduleType === "single" && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-small">Send Date</Label>
                      <Input 
                        type="date" 
                        value={state.sendDate} 
                        min={tomorrow}
                        onChange={(e) => updateState({ sendDate: e.target.value })} 
                        className="w-auto" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-small">Mail Class</Label>
                      <RadioGroup value={state.mailClass} onValueChange={(v) => updateState({ mailClass: v })} className="space-y-2">
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="first_class" />
                            <span>USPS First Class</span>
                            <Badge variant="secondary" size="sm">3-5 business days</Badge>
                          </div>
                          <span className="font-medium">${pricePerPiece.toFixed(2)}/piece</span>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="standard" />
                            <span>USPS Standard</span>
                            <Badge variant="outline" size="sm">5-14 business days</Badge>
                          </div>
                          <span className="font-medium">${(pricePerPiece * 0.77).toFixed(2)}/piece</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </Label>

            {/* Option B: Drip Over Time */}
            <Label
              htmlFor="drip"
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                state.scheduleType === "drip" ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground"
              )}
            >
              <RadioGroupItem value="drip" id="drip" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-info" />
                  <p className="font-medium">Drip Over Time</p>
                </div>
                <p className="text-small text-content-secondary mt-1">Spread mailings across multiple days</p>
                
                {state.scheduleType === "drip" && (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-small">Start Date</Label>
                        <Input 
                          type="date" 
                          value={state.dripStartDate}
                          min={tomorrow}
                          onChange={(e) => updateState({ dripStartDate: e.target.value })} 
                          className="w-full" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-small">Pieces per day</Label>
                        <Input 
                          type="number" 
                          value={state.dripPiecesPerDay}
                          min={10}
                          max={500}
                          onChange={(e) => updateState({ dripPiecesPerDay: parseInt(e.target.value) || 50 })} 
                          className="w-full" 
                        />
                      </div>
                    </div>
                    
                    {recipientCount > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-small">
                          <strong>{recipientCount.toLocaleString()}</strong> pieces ÷ <strong>{state.dripPiecesPerDay}</strong>/day = <strong>{dripDays}</strong> days
                        </p>
                        <p className="text-small text-content-secondary mt-1">
                          Completes on <strong>{dripEndDate}</strong>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-small">Mail Class</Label>
                      <RadioGroup value={state.mailClass} onValueChange={(v) => updateState({ mailClass: v })} className="space-y-2">
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="first_class" />
                            <span>USPS First Class</span>
                            <Badge variant="secondary" size="sm">3-5 business days</Badge>
                          </div>
                          <span className="font-medium">${pricePerPiece.toFixed(2)}/piece</span>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="standard" />
                            <span>USPS Standard</span>
                            <Badge variant="outline" size="sm">5-14 business days</Badge>
                          </div>
                          <span className="font-medium">${(pricePerPiece * 0.77).toFixed(2)}/piece</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </Label>

            {/* Option C: Multi-Touch Sequence */}
            <Label
              htmlFor="multitouch"
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                state.scheduleType === "multitouch" ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground"
              )}
            >
              <RadioGroupItem value="multitouch" id="multitouch" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-success" />
                  <p className="font-medium">Multi-Touch Sequence</p>
                </div>
                <p className="text-small text-content-secondary mt-1">Send multiple pieces to each recipient over time</p>
                
                {state.scheduleType === "multitouch" && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-small">First Touch Date</Label>
                      <Input 
                        type="date" 
                        value={state.sendDate}
                        min={tomorrow}
                        onChange={(e) => updateState({ sendDate: e.target.value })} 
                        className="w-auto" 
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-small">Sequence Builder</Label>
                      {state.sequenceTouches.map((touch: SequenceTouch, index: number) => {
                        const touchDate = state.sendDate 
                          ? format(addDays(new Date(state.sendDate), touch.daysAfter), "MMM d, yyyy")
                          : "";
                        const touchTemplate = templates.find((t: any) => t.id === touch.templateId);
                        
                        return (
                          <div key={touch.id} className="p-3 rounded-lg border bg-background">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center text-tiny font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-medium">Touch {index + 1}</span>
                              </div>
                              {index > 0 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeTouch(touch.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-tiny">Template</Label>
                                {index === 0 ? (
                                  <div className="p-2 bg-muted rounded text-small">
                                    {touchTemplate?.name || "Current selection"} (locked)
                                  </div>
                                ) : (
                                  <Select 
                                    value={touch.templateId || ""} 
                                    onValueChange={(v) => updateTouch(touch.id, { templateId: v })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {templates.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-tiny">
                                  {index === 0 ? "Timing" : "Days after Touch 1"}
                                </Label>
                                {index === 0 ? (
                                  <div className="p-2 bg-muted rounded text-small">Day 0 (initial send)</div>
                                ) : (
                                  <Input
                                    type="number"
                                    value={touch.daysAfter}
                                    min={1}
                                    onChange={(e) => updateTouch(touch.id, { daysAfter: parseInt(e.target.value) || 14 })}
                                  />
                                )}
                              </div>
                            </div>
                            
                            <p className="text-tiny text-content-tertiary mt-2">
                              Estimated send: {touchDate}
                            </p>
                          </div>
                        );
                      })}
                      
                      {state.sequenceTouches.length < 5 && (
                        <Button variant="outline" size="sm" onClick={addTouch} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Touch (max 5)
                        </Button>
                      )}
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-small font-medium">
                        {state.sequenceTouches.length}-touch sequence over {totalTouchDays} days
                      </p>
                      <p className="text-small text-content-secondary mt-1">
                        {state.sequenceTouches.length} × {recipientCount.toLocaleString()} = <strong>{(state.sequenceTouches.length * recipientCount).toLocaleString()}</strong> total pieces
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-small">Mail Class</Label>
                      <RadioGroup value={state.mailClass} onValueChange={(v) => updateState({ mailClass: v })} className="space-y-2">
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="first_class" />
                            <span>USPS First Class</span>
                            <Badge variant="secondary" size="sm">3-5 business days</Badge>
                          </div>
                          <span className="font-medium">${pricePerPiece.toFixed(2)}/piece</span>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="standard" />
                            <span>USPS Standard</span>
                            <Badge variant="outline" size="sm">5-14 business days</Badge>
                          </div>
                          <span className="font-medium">${(pricePerPiece * 0.77).toFixed(2)}/piece</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sending Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Calendar className="h-8 w-8 text-brand" />
            <div>
              <p className="font-medium">
                {state.scheduleType === "single" && state.sendDate && format(new Date(state.sendDate), "MMMM d, yyyy")}
                {state.scheduleType === "drip" && `${format(new Date(state.dripStartDate), "MMM d")} - ${dripEndDate}`}
                {state.scheduleType === "multitouch" && state.sendDate && `${format(new Date(state.sendDate), "MMM d")} - ${format(addDays(new Date(state.sendDate), totalTouchDays), "MMM d, yyyy")}`}
              </p>
              <p className="text-small text-content-secondary">
                Estimated delivery: {deliveryDays.min}-{deliveryDays.max} business days after sending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 4 - Tracking (ENHANCED)
function StepTracking({ state, updateState }: any) {
  const formFieldOptions = [
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "address", label: "Property Address" },
    { value: "asking_price", label: "Asking Price" },
    { value: "timeframe", label: "Timeframe" },
  ];

  const toggleFormField = (field: string) => {
    const current = state.landingFormFields;
    const updated = current.includes(field)
      ? current.filter((f: string) => f !== field)
      : [...current, field];
    updateState({ landingFormFields: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Results</CardTitle>
          <CardDescription>Set up tracking to measure campaign performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tracking Phone */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand" />
                <div>
                  <p className="font-medium">Dedicated Tracking Number</p>
                  <p className="text-small text-content-secondary">Track calls from this campaign</p>
                </div>
              </div>
              <Switch
                checked={state.useTrackingPhone}
                onCheckedChange={(checked) => updateState({ useTrackingPhone: checked })}
              />
            </div>
            
            {state.useTrackingPhone && (
              <div className="ml-8 p-4 bg-muted/50 rounded-lg space-y-3">
                <p className="text-small">We'll assign a unique phone number to this campaign.</p>
                <p className="text-small">All calls to this number are attributed to this campaign.</p>
                <div className="flex items-center gap-2">
                  <span className="text-small text-content-secondary">Calls forward to:</span>
                  <span className="font-medium">Your phone from settings</span>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-small text-content-tertiary">Your tracking number:</p>
                  <p className="text-h3 font-bold font-mono">(555) 123-XXXX</p>
                </div>
                <div className="flex items-center gap-2 text-warning">
                  <Info className="h-4 w-4" />
                  <span className="text-tiny">Tracking numbers cost $2/month while campaign is active</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Tracking URL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-brand" />
                <div>
                  <p className="font-medium">Tracking Landing Page</p>
                  <p className="text-small text-content-secondary">Generate QR code and URL for this campaign</p>
                </div>
              </div>
              <Switch
                checked={state.useTrackingUrl}
                onCheckedChange={(checked) => updateState({ useTrackingUrl: checked })}
              />
            </div>
            
            {state.useTrackingUrl && (
              <div className="ml-8 space-y-4">
                <div className="space-y-2">
                  <Label className="text-small">Custom URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-small text-content-secondary whitespace-nowrap">yourdomain.com/sell/</span>
                    <Input
                      value={state.trackingUrlSlug}
                      onChange={(e) => updateState({ trackingUrlSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      placeholder="campaign-name"
                      className="max-w-[200px]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="h-24 w-24 bg-white rounded flex items-center justify-center border">
                      <QrCode className="h-16 w-16 text-content-tertiary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-small font-medium">Landing Page Settings</p>
                    <div className="space-y-2">
                      <Input
                        value={state.landingPageHeadline}
                        onChange={(e) => updateState({ landingPageHeadline: e.target.value })}
                        placeholder="Headline"
                      />
                      <Input
                        value={state.landingPageSubheadline}
                        onChange={(e) => updateState({ landingPageSubheadline: e.target.value })}
                        placeholder="Sub-headline"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-small">Form Fields to Collect</Label>
                  <div className="flex flex-wrap gap-2">
                    {formFieldOptions.map((field) => (
                      <label key={field.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={state.landingFormFields.includes(field.value)}
                          onCheckedChange={() => toggleFormField(field.value)}
                        />
                        <span className="text-small">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Attribution</CardTitle>
          <CardDescription>How responses are tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-info mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">When a response comes in, we'll:</p>
                <ul className="text-small space-y-1 ml-4 list-disc">
                  <li>Create a new property record (if doesn't exist)</li>
                  <li>Link to this campaign as source</li>
                  <li>Add "Direct Mail Response" tag</li>
                </ul>
                <p className="text-small text-content-secondary mt-2">
                  Calls to tracking number and landing page submissions are auto-attributed.
                  Other responses can be matched by address or manually tagged.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 5 - Review (ENHANCED)
function StepReview({ 
  state, 
  updateState,
  selectedTemplate, 
  recipientCount,
  totalPieces,
  pricePerPiece,
  estimatedCost,
  trackingPhoneCost,
  totalCost,
  deliveryDays,
}: any) {
  const sendDate = state.scheduleType === "single" || state.scheduleType === "multitouch" 
    ? state.sendDate 
    : state.dripStartDate;
  const deliveryStart = sendDate ? format(addDays(new Date(sendDate), deliveryDays.min), "MMMM d, yyyy") : "";
  const deliveryEnd = sendDate ? format(addDays(new Date(sendDate), deliveryDays.max), "MMMM d, yyyy") : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <div>
                <CardTitle>{state.name}</CardTitle>
                <Badge variant="success" className="mt-1">Ready to Launch</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Template</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-tiny">Change</Button>
                </div>
                {selectedTemplate && (
                  <div className="flex gap-3">
                    <div className="w-16 shrink-0 bg-white rounded overflow-hidden border">
                      <AspectRatio ratio={3/2}>
                        <div 
                          className="p-0.5 text-[4px]"
                          style={{ transform: "scale(0.15)", transformOrigin: "top left", width: "666%", height: "666%" }}
                          dangerouslySetInnerHTML={{ __html: selectedTemplate.front_html || "" }}
                        />
                      </AspectRatio>
                    </div>
                    <div>
                      <p className="font-medium">{selectedTemplate.name}</p>
                      <Badge variant="secondary" size="sm">{selectedTemplate.type}</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Recipients</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-tiny">View List</Button>
                </div>
                <p className="font-medium">{recipientCount.toLocaleString()} addresses</p>
                <p className="text-small text-content-secondary">
                  {state.listType === "database" ? "Filtered from database" : 
                   state.listType === "upload" ? "Uploaded list" : "Manual entry"}
                </p>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Schedule</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-tiny">Change</Button>
                </div>
                <p className="font-medium">
                  {state.scheduleType === "single" && "Single send"}
                  {state.scheduleType === "drip" && "Drip campaign"}
                  {state.scheduleType === "multitouch" && `${state.sequenceTouches.length}-touch sequence`}
                </p>
                <p className="text-small text-content-secondary">
                  {sendDate && format(new Date(sendDate), "MMMM d, yyyy")}
                </p>
                <p className="text-small text-content-secondary">
                  {state.mailClass === "first_class" ? "USPS First Class" : "USPS Standard"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Tracking */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Tracking</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-tiny">Change</Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small">
                      {state.useTrackingPhone ? "(555) 123-XXXX" : "Not enabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small">
                      {state.useTrackingUrl ? `yourdomain.com/sell/${state.trackingUrlSlug}` : "Not enabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="space-y-2">
                <p className="text-tiny text-content-tertiary uppercase tracking-wide">Estimated Delivery</p>
                <p className="font-medium">{deliveryStart} - {deliveryEnd}</p>
              </div>

              {/* Multi-touch timeline */}
              {state.scheduleType === "multitouch" && (
                <div className="space-y-2">
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">Sequence Timeline</p>
                  <div className="flex items-center gap-1">
                    {state.sequenceTouches.map((touch: SequenceTouch, index: number) => (
                      <React.Fragment key={touch.id}>
                        <div className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-tiny font-bold">
                          {index + 1}
                        </div>
                        {index < state.sequenceTouches.length - 1 && (
                          <div className="flex-1 h-0.5 bg-brand/30 max-w-[40px]" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{selectedTemplate?.type || "Mail pieces"}</TableCell>
                <TableCell className="text-right">{totalPieces.toLocaleString()}</TableCell>
                <TableCell className="text-right">${pricePerPiece.toFixed(2)}</TableCell>
                <TableCell className="text-right">${estimatedCost.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Postage</TableCell>
                <TableCell className="text-right">{totalPieces.toLocaleString()}</TableCell>
                <TableCell className="text-right">included</TableCell>
                <TableCell className="text-right">$0.00</TableCell>
              </TableRow>
              {state.useTrackingPhone && (
                <TableRow>
                  <TableCell>Tracking Number</TableCell>
                  <TableCell className="text-right">1</TableCell>
                  <TableCell className="text-right">$2.00/mo</TableCell>
                  <TableCell className="text-right">${trackingPhoneCost.toFixed(2)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>Address Verification</TableCell>
                <TableCell className="text-right">{totalPieces.toLocaleString()}</TableCell>
                <TableCell className="text-right">included</TableCell>
                <TableCell className="text-right">$0.00</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right text-brand">${totalCost.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-tiny text-content-tertiary mt-3">
            You'll be charged when the campaign is sent
          </p>
        </CardContent>
      </Card>

      {/* Terms & Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Terms & Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={state.confirmLegitimate}
              onCheckedChange={(checked) => updateState({ confirmLegitimate: !!checked })}
              className="mt-0.5"
            />
            <span className="text-small">
              I confirm that all recipients have a legitimate business reason to receive this mail (no spam)
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={state.confirmNoRecall}
              onCheckedChange={(checked) => updateState({ confirmNoRecall: !!checked })}
              className="mt-0.5"
            />
            <span className="text-small">
              I understand that mail cannot be recalled once sent to Lob for printing
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
