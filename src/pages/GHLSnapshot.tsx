import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Download,
  FileJson,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Workflow,
  Tag,
  FormInput,
  GitBranch,
  MessageSquare,
  Mail,
  Clock,
  Zap,
  CheckCircle2,
  Play,
  ExternalLink,
  Copy,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============ SNAPSHOT DATA ============

const PIPELINES = {
  seller_acquisition: {
    name: "Seller Acquisition Pipeline",
    stages: [
      "New Lead",
      "Contacted",
      "Qualified",
      "Appointment Set",
      "Offer Made",
      "Negotiating",
      "Under Contract",
      "Due Diligence",
      "Closing",
      "Closed Won",
      "Closed Lost",
    ],
  },
  disposition: {
    name: "Disposition Pipeline",
    stages: [
      "New Deal",
      "Marketing",
      "Buyer Interest",
      "Showing Scheduled",
      "Offer Received",
      "Negotiating",
      "Assignment Signed",
      "Closing",
      "Closed",
    ],
  },
  creative_deals: {
    name: "Creative Deals Pipeline",
    stages: [
      "New Lead",
      "Discovery Call",
      "Terms Proposed",
      "Seller Reviewing",
      "Terms Agreed",
      "Docs Prepared",
      "Docs Signed",
      "Recording",
      "Completed",
    ],
  },
};

const CUSTOM_FIELDS = {
  property: [
    { key: "property_address", label: "Property Address", type: "text" },
    { key: "property_city", label: "City", type: "text" },
    { key: "property_state", label: "State", type: "text" },
    { key: "property_zip", label: "ZIP", type: "text" },
    { key: "property_type", label: "Property Type", type: "dropdown", options: ["Single Family", "Multi-Family", "Condo", "Townhouse", "Land", "Commercial"] },
    { key: "beds", label: "Bedrooms", type: "number" },
    { key: "baths", label: "Bathrooms", type: "number" },
    { key: "sqft", label: "Square Feet", type: "number" },
    { key: "year_built", label: "Year Built", type: "number" },
  ],
  financial: [
    { key: "arv", label: "ARV", type: "currency" },
    { key: "repair_estimate", label: "Repair Estimate", type: "currency" },
    { key: "mao", label: "MAO", type: "currency" },
    { key: "asking_price", label: "Asking Price", type: "currency" },
    { key: "offer_amount", label: "Offer Amount", type: "currency" },
    { key: "spread", label: "Spread", type: "currency" },
    { key: "mortgage_balance", label: "Mortgage Balance", type: "currency" },
    { key: "equity_percent", label: "Equity %", type: "number" },
  ],
  scoring: [
    { key: "motivation_score", label: "Motivation Score", type: "number" },
    { key: "velocity_score", label: "Velocity Score", type: "number" },
    { key: "lead_source", label: "Lead Source", type: "dropdown", options: ["D4D", "Direct Mail", "Cold Calling", "Agent Referral", "Wholesaler", "Marketing", "Website", "Other"] },
    { key: "deal_type", label: "Deal Type", type: "dropdown", options: ["Wholesale", "Fix & Flip", "Buy & Hold", "Subject-To", "Seller Finance", "Lease Option"] },
  ],
};

const TAGS = {
  status: ["Hot Lead", "Warm Lead", "Cold Lead", "Appointment Set", "Offer Made", "Under Contract"],
  type: ["Wholesale", "Fix & Flip", "Buy & Hold", "Subject-To", "Seller Finance", "Lease Option"],
  source: ["D4D", "Direct Mail", "Cold Calling", "Agent Referral", "Wholesaler", "Marketing"],
};

const WORKFLOWS = [
  {
    id: "speed_to_lead",
    name: "Speed-to-Lead",
    trigger: "New contact created",
    steps: [
      { type: "wait", duration: "1 minute" },
      { type: "sms", content: "Hi {{contact.first_name}}, thanks for reaching out about your property at {{custom.property_address}}. I'm an investor looking to buy houses in your area. Is now a good time to chat?" },
      { type: "action", content: "Trigger Closebot qualification bot" },
      { type: "condition", content: "Wait for response" },
      { type: "notification", content: "If response: Notify team member" },
    ],
  },
  {
    id: "appointment_reminder",
    name: "Appointment Reminder",
    trigger: "Appointment scheduled",
    steps: [
      { type: "wait", duration: "24 hours before" },
      { type: "sms", content: "Hi {{contact.first_name}}, just a reminder about our appointment tomorrow to look at {{custom.property_address}}. Looking forward to meeting you!" },
      { type: "wait", duration: "1 hour before" },
      { type: "sms", content: "Hi {{contact.first_name}}, I'll be heading to {{custom.property_address}} in about an hour. See you soon!" },
      { type: "wait", duration: "15 minutes before" },
      { type: "sms", content: "On my way! See you in 15 minutes." },
    ],
  },
  {
    id: "offer_followup",
    name: "Offer Follow-up Sequence",
    trigger: "Tag 'Offer Made' added",
    steps: [
      { type: "wait", duration: "48 hours" },
      { type: "condition", content: "Check if no response tag" },
      { type: "sms", content: "Hi {{contact.first_name}}, I wanted to follow up on the offer I sent for {{custom.property_address}}. Have you had a chance to review it? I'm happy to discuss any questions." },
      { type: "wait", duration: "5 days" },
      { type: "sms", content: "{{contact.first_name}}, checking in one more time on my offer. I can be flexible on terms if that helps. Would you be open to a quick call?" },
      { type: "wait", duration: "7 days" },
      { type: "sms", content: "{{contact.first_name}}, I haven't heard back so I'll assume you've decided to go a different direction. If anything changes, my offer stands. Best of luck!" },
    ],
  },
];

const MESSAGE_TEMPLATES = {
  sms: [
    { name: "Initial Outreach", content: "Hi {{contact.first_name}}, I'm a local investor and noticed your property at {{custom.property_address}}. Would you be open to a cash offer? No repairs needed and we can close on your timeline." },
    { name: "Follow-up 1", content: "Hi {{contact.first_name}}, following up on my message about {{custom.property_address}}. Still interested in a no-hassle cash offer?" },
    { name: "Follow-up 2", content: "{{contact.first_name}}, just checking in one more time. I can make you a fair cash offer and close in as little as 2 weeks. Interested?" },
    { name: "Appointment Confirm", content: "Confirmed! I'll see you at {{custom.property_address}} on {{appointment.date}} at {{appointment.time}}. Looking forward to it!" },
  ],
  email: [
    { name: "Offer Letter", subject: "Cash Offer for {{custom.property_address}}", content: "Dear {{contact.first_name}},\n\nThank you for speaking with me about your property at {{custom.property_address}}.\n\nAfter reviewing the property, I'm pleased to present you with a cash offer of {{custom.offer_amount}}.\n\nOffer highlights:\n• All-cash purchase - no financing contingencies\n• Close in as little as 14 days (or on your timeline)\n• Property sold as-is - no repairs needed\n• We cover standard closing costs\n\nThis offer is valid for 7 days. Please let me know if you have any questions.\n\nBest regards" },
    { name: "Under Contract", subject: "Great news! We're under contract", content: "Hi {{contact.first_name}},\n\nExciting news - we're officially under contract for {{custom.property_address}}!\n\nNext steps:\n1. Title company will reach out within 48 hours\n2. We'll schedule the home inspection\n3. Closing is scheduled for {{custom.closing_date}}\n\nI'll keep you updated throughout the process.\n\nTalk soon!" },
  ],
};

// ============ GENERATE SNAPSHOT JSON ============

function generateSnapshotJSON() {
  const snapshot = {
    version: "1.0",
    name: "RealElite Pro - Real Estate Investing Snapshot",
    description: "Complete GHL configuration for real estate wholesaling and investing businesses",
    created_at: new Date().toISOString(),
    pipelines: Object.entries(PIPELINES).map(([key, pipeline]) => ({
      id: key,
      name: pipeline.name,
      stages: pipeline.stages.map((name, index) => ({
        id: `${key}_stage_${index}`,
        name,
        order: index,
      })),
    })),
    custom_fields: [
      ...CUSTOM_FIELDS.property.map(f => ({ ...f, group: "Property Info" })),
      ...CUSTOM_FIELDS.financial.map(f => ({ ...f, group: "Financial" })),
      ...CUSTOM_FIELDS.scoring.map(f => ({ ...f, group: "Scoring" })),
    ],
    tags: [
      ...TAGS.status.map(t => ({ name: t, category: "Status" })),
      ...TAGS.type.map(t => ({ name: t, category: "Deal Type" })),
      ...TAGS.source.map(t => ({ name: t, category: "Lead Source" })),
    ],
    workflows: WORKFLOWS.map(w => ({
      id: w.id,
      name: w.name,
      trigger: w.trigger,
      steps: w.steps,
    })),
    templates: {
      sms: MESSAGE_TEMPLATES.sms,
      email: MESSAGE_TEMPLATES.email,
    },
  };

  return JSON.stringify(snapshot, null, 2);
}

// ============ COMPONENTS ============

function PipelineCard({ name, stages }: { name: string; stages: string[] }) {
  return (
    <div className="p-4 bg-surface-secondary rounded-lg">
      <p className="text-small font-medium text-content mb-3">{name}</p>
      <div className="flex flex-wrap gap-1">
        {stages.map((stage, i) => (
          <Badge key={stage} variant="secondary" size="sm" className="font-normal">
            <span className="text-content-tertiary mr-1">{i + 1}.</span>
            {stage}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function FieldGroup({ title, fields }: { title: string; fields: typeof CUSTOM_FIELDS.property }) {
  return (
    <div className="p-4 bg-surface-secondary rounded-lg">
      <p className="text-small font-medium text-content mb-3">{title}</p>
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <code className="text-tiny bg-muted px-1.5 py-0.5 rounded">{field.key}</code>
              <span className="text-tiny text-content-secondary">{field.label}</span>
            </div>
            <Badge variant="outline" size="sm">{field.type}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: typeof WORKFLOWS[0] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border border-border-subtle rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Workflow className="h-5 w-5 text-brand" />
              </div>
              <div className="text-left">
                <p className="text-small font-medium text-content">{workflow.name}</p>
                <p className="text-tiny text-content-tertiary">Trigger: {workflow.trigger}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">{workflow.steps.length} steps</Badge>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2 border-t border-border-subtle pt-4">
            {workflow.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-tiny font-medium shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      step.type === "sms" ? "info" :
                      step.type === "wait" ? "secondary" :
                      step.type === "condition" ? "warning" :
                      step.type === "notification" ? "success" : "outline"
                    } size="sm">
                      {step.type === "sms" && <MessageSquare className="h-3 w-3 mr-1" />}
                      {step.type === "wait" && <Clock className="h-3 w-3 mr-1" />}
                      {step.type === "action" && <Zap className="h-3 w-3 mr-1" />}
                      {step.type}
                    </Badge>
                    {step.type === "wait" && (
                      <span className="text-tiny text-content-secondary">{step.duration}</span>
                    )}
                  </div>
                  {step.content && (
                    <p className="text-tiny text-content-secondary">{step.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function GHLSnapshot() {
  const [showPreview, setShowPreview] = React.useState(false);

  const handleDownload = () => {
    const json = generateSnapshotJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "realelite-ghl-snapshot.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Snapshot downloaded!");
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(generateSnapshotJSON());
    toast.success("JSON copied to clipboard");
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Integrations", href: "/settings/integrations" },
        { label: "GHL Snapshot" },
      ]}
    >
      <PageHeader
        title="GHL Snapshot"
        description="Pre-built GoHighLevel configuration for real estate investing"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={copyJSON}>
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
            <Button variant="primary" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Snapshot
            </Button>
          </div>
        }
      />

      <div className="space-y-lg">
        {/* Intro Card */}
        <Card variant="default" padding="md" className="bg-gradient-to-br from-brand/5 to-transparent">
          <CardContent className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <FileJson className="h-6 w-6 text-brand" />
            </div>
            <div className="flex-1">
              <p className="text-body font-medium text-content mb-1">
                What is a GHL Snapshot?
              </p>
              <p className="text-small text-content-secondary mb-4">
                A GHL Snapshot is a pre-built configuration you can import into your GoHighLevel account. 
                It includes pipelines, custom fields, workflows, and templates designed specifically for 
                real estate investing businesses.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-tiny text-content-secondary">
                  <GitBranch className="h-4 w-4" />
                  3 Pipelines
                </div>
                <div className="flex items-center gap-2 text-tiny text-content-secondary">
                  <FormInput className="h-4 w-4" />
                  21 Custom Fields
                </div>
                <div className="flex items-center gap-2 text-tiny text-content-secondary">
                  <Tag className="h-4 w-4" />
                  18 Tags
                </div>
                <div className="flex items-center gap-2 text-tiny text-content-secondary">
                  <Workflow className="h-4 w-4" />
                  3 Workflows
                </div>
                <div className="flex items-center gap-2 text-tiny text-content-secondary">
                  <MessageSquare className="h-4 w-4" />
                  6 Templates
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card variant="default" padding="md">
          <CardHeader className="border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>How to import this snapshot into your GHL account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { step: 1, title: "Download the Snapshot", desc: "Click the 'Download Snapshot' button above to get the JSON file" },
                { step: 2, title: "Open GHL Settings", desc: "In your GHL account, go to Settings → Business Profile → Snapshots" },
                { step: 3, title: "Import Snapshot", desc: "Click 'Import Snapshot' and upload the downloaded JSON file" },
                { step: 4, title: "Review & Apply", desc: "Review the imported items and click 'Apply Snapshot' to add them to your account" },
                { step: 5, title: "Connect to RealElite", desc: "Return to Settings → Integrations → GHL in RealElite to connect your account" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-small font-semibold text-brand shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-small font-medium text-content">{item.title}</p>
                    <p className="text-tiny text-content-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-info" />
                <p className="text-small font-medium text-info">Need help?</p>
              </div>
              <p className="text-tiny text-info/80">
                Watch our video tutorial for a step-by-step walkthrough of the import process.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href="https://go.gohighlevel.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open GoHighLevel
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Snapshot */}
        <Card variant="default" padding="none">
          <Collapsible open={showPreview} onOpenChange={setShowPreview}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-body font-medium text-content">Preview Snapshot Contents</p>
                    <p className="text-small text-content-secondary">See exactly what's included in this snapshot</p>
                  </div>
                </div>
                {showPreview ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-border-subtle">
                <Tabs defaultValue="pipelines" className="w-full">
                  <TabsList className="w-full justify-start border-b border-border-subtle rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger value="pipelines" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Pipelines
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand">
                      <FormInput className="h-4 w-4 mr-2" />
                      Custom Fields
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand">
                      <Tag className="h-4 w-4 mr-2" />
                      Tags
                    </TabsTrigger>
                    <TabsTrigger value="workflows" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand">
                      <Workflow className="h-4 w-4 mr-2" />
                      Workflows
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Templates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pipelines" className="p-4 space-y-4">
                    {Object.entries(PIPELINES).map(([key, pipeline]) => (
                      <PipelineCard key={key} name={pipeline.name} stages={pipeline.stages} />
                    ))}
                  </TabsContent>

                  <TabsContent value="fields" className="p-4 space-y-4">
                    <FieldGroup title="Property Information" fields={CUSTOM_FIELDS.property} />
                    <FieldGroup title="Financial Fields" fields={CUSTOM_FIELDS.financial} />
                    <FieldGroup title="Scoring & Classification" fields={CUSTOM_FIELDS.scoring} />
                  </TabsContent>

                  <TabsContent value="tags" className="p-4 space-y-4">
                    <div className="p-4 bg-surface-secondary rounded-lg">
                      <p className="text-small font-medium text-content mb-3">Status Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {TAGS.status.map((tag) => (
                          <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-surface-secondary rounded-lg">
                      <p className="text-small font-medium text-content mb-3">Deal Type Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {TAGS.type.map((tag) => (
                          <Badge key={tag} variant="success" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-surface-secondary rounded-lg">
                      <p className="text-small font-medium text-content mb-3">Lead Source Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {TAGS.source.map((tag) => (
                          <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="workflows" className="p-4 space-y-4">
                    {WORKFLOWS.map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </TabsContent>

                  <TabsContent value="templates" className="p-4 space-y-4">
                    <div className="p-4 bg-surface-secondary rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-info" />
                        <p className="text-small font-medium text-content">SMS Templates</p>
                      </div>
                      <div className="space-y-3">
                        {MESSAGE_TEMPLATES.sms.map((template) => (
                          <div key={template.name} className="p-3 bg-background rounded-md">
                            <p className="text-tiny font-medium text-content mb-1">{template.name}</p>
                            <p className="text-tiny text-content-secondary">{template.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-surface-secondary rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-brand" />
                        <p className="text-small font-medium text-content">Email Templates</p>
                      </div>
                      <div className="space-y-3">
                        {MESSAGE_TEMPLATES.email.map((template) => (
                          <div key={template.name} className="p-3 bg-background rounded-md">
                            <p className="text-tiny font-medium text-content mb-1">{template.name}</p>
                            <p className="text-tiny text-content-tertiary mb-1">Subject: {template.subject}</p>
                            <pre className="text-tiny text-content-secondary whitespace-pre-wrap font-sans">{template.content}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </DashboardLayout>
  );
}
