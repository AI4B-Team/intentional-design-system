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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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
  scheduleType: "now" | "scheduled" | "drip";
  scheduledDate: string;
  scheduledTime: string;
  dripPiecesPerDay: number;
  dripIntervalDays: number;
  dripTotalTouches: number;
  trackingPhone: string;
  trackingUrl: string;
}

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
  scheduleType: "now",
  scheduledDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  scheduledTime: "09:00",
  dripPiecesPerDay: 50,
  dripIntervalDays: 7,
  dripTotalTouches: 3,
  trackingPhone: "",
  trackingUrl: "",
};

export default function MailCampaignWizard() {
  const navigate = useNavigate();
  const { data: templates } = useMailTemplates();
  const createCampaign = useCreateMailCampaign();
  
  const [currentStep, setCurrentStep] = React.useState(1);
  const [state, setState] = React.useState<WizardState>(initialState);

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

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: return state.name.trim() && state.templateId;
      case 2: return state.listType === "database" ? recipientCount > 0 : true;
      case 3: return state.scheduleType === "now" || (state.scheduledDate && state.scheduledTime);
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    try {
      await createCampaign.mutateAsync({
        name: state.name,
        description: state.description || null,
        template_id: state.templateId,
        list_type: state.listType === "database" ? "filtered_list" : state.listType === "upload" ? "uploaded_list" : "manual",
        list_filters: state.listType === "database" ? {
          statusFilters: state.statusFilters,
          motivationRange: state.motivationRange,
          sourceFilters: state.sourceFilters,
          lastContactFilter: state.lastContactFilter,
          neverMailed: state.neverMailed,
          hasMailingAddress: state.hasMailingAddress,
        } : null,
        total_recipients: recipientCount,
        scheduled_date: state.scheduleType === "scheduled" ? state.scheduledDate : null,
        send_time: state.scheduleType === "scheduled" ? state.scheduledTime : null,
        is_drip: state.scheduleType === "drip",
        drip_settings: state.scheduleType === "drip" ? {
          piecesPerDay: state.dripPiecesPerDay,
          intervalDays: state.dripIntervalDays,
          totalTouches: state.dripTotalTouches,
        } : null,
        tracking_phone: state.trackingPhone || null,
        tracking_url: state.trackingUrl || null,
        status: state.scheduleType === "now" ? "sending" : "scheduled",
      });
      navigate("/mail/campaigns");
    } catch (error) {
      // Error handled by mutation
    }
  };

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
        {currentStep === 3 && <StepSchedule state={state} updateState={updateState} />}
        {currentStep === 4 && <StepTracking state={state} updateState={updateState} />}
        {currentStep === 5 && <StepReview state={state} selectedTemplate={selectedTemplate} recipientCount={recipientCount} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < 5 ? (
          <Button variant="primary" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canContinue()}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={createCampaign.isPending}>
            <Rocket className="h-4 w-4 mr-2" />
            {createCampaign.isPending ? "Creating..." : "Launch Campaign"}
          </Button>
        )}
      </div>
    </PageLayout>
  );
}

// Step Components
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

function StepSchedule({ state, updateState }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>When should we send?</CardTitle>
        <CardDescription>Choose when your mail pieces will be sent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={state.scheduleType} onValueChange={(v) => updateState({ scheduleType: v })} className="space-y-4">
          {[
            { value: "now", title: "Send Immediately", desc: "Start sending as soon as campaign is created" },
            { value: "scheduled", title: "Schedule for Later", desc: "Pick a specific date and time" },
            { value: "drip", title: "Drip Campaign", desc: "Send pieces gradually over time" },
          ].map((option) => (
            <Label
              key={option.value}
              htmlFor={option.value}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                state.scheduleType === option.value ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground"
              )}
            >
              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
              <div className="flex-1">
                <p className="font-medium">{option.title}</p>
                <p className="text-small text-content-secondary">{option.desc}</p>
                {state.scheduleType === "scheduled" && option.value === "scheduled" && (
                  <div className="flex gap-3 mt-3">
                    <Input type="date" value={state.scheduledDate} onChange={(e) => updateState({ scheduledDate: e.target.value })} className="w-auto" />
                    <Input type="time" value={state.scheduledTime} onChange={(e) => updateState({ scheduledTime: e.target.value })} className="w-auto" />
                  </div>
                )}
                {state.scheduleType === "drip" && option.value === "drip" && (
                  <div className="grid gap-4 mt-3 md:grid-cols-3">
                    <div className="space-y-1"><Label className="text-tiny">Pieces per day</Label><Input type="number" value={state.dripPiecesPerDay} onChange={(e) => updateState({ dripPiecesPerDay: parseInt(e.target.value) || 50 })} /></div>
                    <div className="space-y-1"><Label className="text-tiny">Days between touches</Label><Input type="number" value={state.dripIntervalDays} onChange={(e) => updateState({ dripIntervalDays: parseInt(e.target.value) || 7 })} /></div>
                    <div className="space-y-1"><Label className="text-tiny">Total touches</Label><Input type="number" value={state.dripTotalTouches} onChange={(e) => updateState({ dripTotalTouches: parseInt(e.target.value) || 3 })} /></div>
                  </div>
                )}
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function StepTracking({ state, updateState }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Tracking</CardTitle>
        <CardDescription>Track responses with unique phone numbers and URLs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="trackingPhone" className="flex items-center gap-2"><Phone className="h-4 w-4" />Tracking Phone Number</Label>
          <Input id="trackingPhone" placeholder="(555) 123-4567" value={state.trackingPhone} onChange={(e) => updateState({ trackingPhone: e.target.value })} />
          <p className="text-tiny text-content-tertiary">Use a unique number for this campaign to track response rates</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trackingUrl" className="flex items-center gap-2"><LinkIcon className="h-4 w-4" />Tracking URL</Label>
          <Input id="trackingUrl" placeholder="https://yourdomain.com/offer/campaign-name" value={state.trackingUrl} onChange={(e) => updateState({ trackingUrl: e.target.value })} />
          <p className="text-tiny text-content-tertiary">Include a unique landing page URL to track online responses</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StepReview({ state, selectedTemplate, recipientCount }: any) {
  const estimatedCost = recipientCount * 0.75;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Campaign</CardTitle>
        <CardDescription>Double-check everything before launching</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1"><p className="text-tiny text-content-tertiary uppercase tracking-wide">Campaign Name</p><p className="font-medium">{state.name}</p></div>
          <div className="space-y-1"><p className="text-tiny text-content-tertiary uppercase tracking-wide">Template</p><p className="font-medium">{selectedTemplate?.name || "None selected"}</p></div>
          <div className="space-y-1"><p className="text-tiny text-content-tertiary uppercase tracking-wide">Recipients</p><p className="font-medium">{recipientCount.toLocaleString()} addresses</p></div>
          <div className="space-y-1">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide">Schedule</p>
            <p className="font-medium">
              {state.scheduleType === "now" && "Send Immediately"}
              {state.scheduleType === "scheduled" && `${state.scheduledDate} at ${state.scheduledTime}`}
              {state.scheduleType === "drip" && `Drip: ${state.dripPiecesPerDay}/day for ${state.dripTotalTouches} touches`}
            </p>
          </div>
          {state.trackingPhone && <div className="space-y-1"><p className="text-tiny text-content-tertiary uppercase tracking-wide">Tracking Phone</p><p className="font-medium">{state.trackingPhone}</p></div>}
          {state.trackingUrl && <div className="space-y-1"><p className="text-tiny text-content-tertiary uppercase tracking-wide">Tracking URL</p><p className="font-medium truncate">{state.trackingUrl}</p></div>}
        </div>

        <Separator />

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estimated Cost</p>
              <p className="text-tiny text-content-tertiary">{recipientCount.toLocaleString()} pieces × $0.75/piece</p>
            </div>
            <p className="text-h2 font-bold text-brand">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
