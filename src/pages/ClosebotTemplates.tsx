import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Copy,
  ExternalLink,
  Sparkles,
  MessageSquare,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Home,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  objective: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  category: "qualification" | "followup" | "discovery";
  questions: string[];
  branchingLogic: string[];
  tagsApplied: string[];
  expectedOutcomes: string[];
  dataCollected: string[];
}

const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: "seller-qualification",
    name: "Seller Qualification Bot",
    description: "Qualify motivated sellers by understanding their situation, timeline, and property condition",
    objective: "Identify motivated sellers and gather key information for offer preparation",
    icon: Sparkles,
    iconColor: "text-brand",
    iconBg: "bg-brand/10",
    category: "qualification",
    questions: [
      "What's your current situation with the property?",
      "On a scale of 1-10, how motivated are you to sell?",
      "What's your ideal timeline to close?",
      "Do you have a mortgage on the property? What's the approximate balance?",
      "What condition is the property in?",
      "Have you received any other offers?",
      "What price are you hoping to get?",
    ],
    branchingLogic: [
      "If motivation < 5 → Follow-up nurture sequence",
      "If mortgage > value → Creative finance discovery",
      "If timeline < 30 days → Priority lead flag",
      "If condition = needs work → Send repair estimate",
    ],
    tagsApplied: ["motivated-seller", "timeline-{response}", "condition-{response}"],
    expectedOutcomes: ["Qualified Lead", "Not Qualified", "Appointment Set", "Creative Finance Candidate"],
    dataCollected: ["motivation_level", "seller_timeline", "mortgage_balance", "property_condition", "asking_price"],
  },
  {
    id: "creative-finance",
    name: "Creative Finance Discovery",
    description: "Identify sub-to and seller financing candidates by exploring their financial situation",
    objective: "Find sellers who may benefit from creative financing solutions",
    icon: DollarSign,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    category: "discovery",
    questions: [
      "What's your current mortgage payment?",
      "Are you current on payments or behind?",
      "What interest rate do you have on your mortgage?",
      "Would you be open to creative solutions that could help you avoid foreclosure fees?",
      "Are there any liens or judgments on the property?",
      "Would you consider staying in the property as a renter temporarily?",
    ],
    branchingLogic: [
      "If behind on payments → Emphasize urgency",
      "If good interest rate → Sub-to opportunity",
      "If open to creative → Schedule consultation",
      "If has liens → Discuss payoff strategies",
    ],
    tagsApplied: ["sub-to-candidate", "seller-finance", "distressed", "creative-deal"],
    expectedOutcomes: ["Sub-To Candidate", "Seller Finance Candidate", "Not a Fit", "Needs Education"],
    dataCollected: ["mortgage_payment", "payment_status", "interest_rate", "liens_info", "creative_openness"],
  },
  {
    id: "cash-buyer",
    name: "Cash Buyer Qualification",
    description: "Qualify cash buyers for your deals by understanding their buy box and funding",
    objective: "Build a qualified cash buyer list with verified criteria",
    icon: Users,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    category: "qualification",
    questions: [
      "What types of properties are you looking for?",
      "What areas do you invest in?",
      "What's your typical purchase price range?",
      "How quickly can you close?",
      "Do you have proof of funds available?",
      "How many deals have you closed in the last 12 months?",
      "What's your preferred contact method for deals?",
    ],
    branchingLogic: [
      "If POF ready → Priority buyer list",
      "If closes > 5 deals/year → VIP buyer",
      "If timeline < 14 days → Fast closer tag",
      "If wide buy box → Multi-deal potential",
    ],
    tagsApplied: ["cash-buyer", "pof-verified", "fast-closer", "vip-buyer"],
    expectedOutcomes: ["Qualified Buyer", "Needs POF", "Not Active", "Added to List"],
    dataCollected: ["property_types", "target_areas", "price_range", "close_timeline", "pof_status", "deal_volume"],
  },
  {
    id: "followup-nurture",
    name: "Follow-up Nurture Bot",
    description: "Re-engage cold leads and check in on their current situation",
    objective: "Warm up cold leads and identify changes in motivation",
    icon: MessageSquare,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-100",
    category: "followup",
    questions: [
      "Hi! I wanted to check in - is the property still available?",
      "Has anything changed with your situation since we last spoke?",
      "Are you still thinking about selling?",
      "Is there anything I can help answer about the process?",
      "Would you like to schedule a quick call to discuss options?",
    ],
    branchingLogic: [
      "If property sold → Remove from list",
      "If still interested → Re-qualify",
      "If changed situation → Update records",
      "If wants call → Schedule appointment",
    ],
    tagsApplied: ["re-engaged", "cold-lead", "warmed-up", "callback-requested"],
    expectedOutcomes: ["Re-Qualified", "Not Interested", "Appointment Set", "Still Thinking"],
    dataCollected: ["current_status", "motivation_change", "callback_preference"],
  },
  {
    id: "appointment-confirmation",
    name: "Appointment Confirmation Bot",
    description: "Confirm upcoming appointments and reduce no-shows",
    objective: "Maximize appointment attendance and gather pre-meeting info",
    icon: Calendar,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    category: "followup",
    questions: [
      "Hi! Just confirming our appointment on {date} at {time}. Does this still work for you?",
      "Great! Is there anything specific you'd like to discuss?",
      "Will you be at the property or should we meet elsewhere?",
      "Is there anyone else who should be at the meeting?",
      "Any questions before we meet?",
    ],
    branchingLogic: [
      "If can't make it → Offer reschedule",
      "If needs to reschedule → Show available times",
      "If confirmed → Send reminder day-of",
      "If has questions → Flag for review",
    ],
    tagsApplied: ["confirmed", "rescheduled", "has-questions", "no-show-risk"],
    expectedOutcomes: ["Confirmed", "Rescheduled", "Cancelled", "No Response"],
    dataCollected: ["confirmation_status", "meeting_location", "attendees", "pre_meeting_questions"],
  },
];

function TemplateCard({ template }: { template: BotTemplate }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const Icon = template.icon;

  const copyTemplate = () => {
    // Copy template config as JSON
    const templateConfig = {
      name: template.name,
      objective: template.objective,
      questions: template.questions,
      branchingLogic: template.branchingLogic,
      tagsApplied: template.tagsApplied,
      expectedOutcomes: template.expectedOutcomes,
    };
    navigator.clipboard.writeText(JSON.stringify(templateConfig, null, 2));
    toast.success("Template copied to clipboard");
  };

  return (
    <Card variant="default" padding="none">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", template.iconBg)}>
                <Icon className={cn("h-6 w-6", template.iconColor)} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {template.name}
                  <Badge
                    variant={
                      template.category === "qualification"
                        ? "default"
                        : template.category === "discovery"
                        ? "success"
                        : "secondary"
                    }
                    size="sm"
                  >
                    {template.category}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">{template.description}</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={copyTemplate}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-4 space-y-6">
            {/* Objective */}
            <div className="p-4 bg-brand/5 border border-brand/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-brand" />
                <p className="text-small font-medium text-brand">Objective</p>
              </div>
              <p className="text-small text-content-secondary">{template.objective}</p>
            </div>

            {/* Questions Sequence */}
            <div>
              <p className="text-small font-medium text-content mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Question Sequence
              </p>
              <div className="space-y-2">
                {template.questions.map((question, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-tiny font-medium shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-small text-content-secondary">{question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Branching Logic */}
            <div>
              <p className="text-small font-medium text-content mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Branching Logic
              </p>
              <div className="grid gap-2">
                {template.branchingLogic.map((logic, i) => (
                  <div key={i} className="p-2 bg-muted/30 rounded-md text-tiny text-content-secondary font-mono">
                    {logic}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags & Outcomes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-small font-medium text-content mb-2">Tags Applied</p>
                <div className="flex flex-wrap gap-1">
                  {template.tagsApplied.map((tag) => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-small font-medium text-content mb-2">Expected Outcomes</p>
                <div className="flex flex-wrap gap-1">
                  {template.expectedOutcomes.map((outcome) => (
                    <Badge key={outcome} variant="outline" size="sm">
                      {outcome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Collected */}
            <div>
              <p className="text-small font-medium text-content mb-2">Data Collected</p>
              <div className="flex flex-wrap gap-2">
                {template.dataCollected.map((field) => (
                  <code key={field} className="text-tiny bg-muted px-2 py-1 rounded">
                    {field}
                  </code>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>

        {!isExpanded && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-tiny text-content-tertiary">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {template.questions.length} questions
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {template.branchingLogic.length} branches
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {template.expectedOutcomes.length} outcomes
              </span>
            </div>
          </CardContent>
        )}
      </Collapsible>
    </Card>
  );
}

export default function ClosebotTemplates() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Integrations", href: "/settings/integrations" },
        { label: "Closebot Templates" },
      ]}
    >
      <PageHeader
        title="Closebot Bot Templates"
        description="Pre-built conversation flows for AI-powered lead qualification"
        actions={
          <Button variant="secondary" asChild>
            <a href="https://closebot.ai" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Closebot
            </a>
          </Button>
        }
      />

      <div className="space-y-lg">
        {/* Intro Card */}
        <Card variant="default" padding="md" className="bg-gradient-to-br from-brand/5 to-transparent">
          <CardContent className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <Bot className="h-6 w-6 text-brand" />
            </div>
            <div>
              <p className="text-body font-medium text-content mb-1">
                Import these templates into your Closebot account
              </p>
              <p className="text-small text-content-secondary mb-3">
                Click "Copy" on any template to copy its configuration. Then paste into Closebot's bot builder
                to create a customized version for your business.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" asChild>
                  <a href="/settings/integrations">
                    <Home className="h-4 w-4 mr-2" />
                    Configure Integration
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Request Custom Bot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="space-y-4">
          {BOT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
