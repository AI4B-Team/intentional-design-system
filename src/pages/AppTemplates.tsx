import React, { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Copy,
  Star,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  DollarSign,
  Key,
  Wallet,
  Layers,
  Handshake,
  Building,
  UserPlus,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  description: string;
  category: "offer" | "email" | "sms" | "script";
  subcategory?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  tags: string[];
  isBuiltIn?: boolean;
  isFeatured?: boolean;
  content?: string;
}

// ─── Pre-built Template Libraries ────────────────────────────────────────────

const OFFER_TEMPLATES: Template[] = [
  {
    id: "offer-cash",
    name: "Cash Offer",
    description: "Quick closing with cash offer, no financing contingencies",
    category: "offer",
    subcategory: "Investor",
    icon: DollarSign,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    tags: ["Fast Close", "No Contingency"],
    isBuiltIn: true,
    isFeatured: true,
  },
  {
    id: "offer-subject-to",
    name: "Subject-To",
    description: "Take over existing mortgage payments with favorable loan terms",
    category: "offer",
    subcategory: "Investor",
    icon: Key,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    tags: ["Creative Finance", "Low Cash"],
    isBuiltIn: true,
  },
  {
    id: "offer-seller-financing",
    name: "Seller Financing",
    description: "Seller acts as the bank with monthly income stream",
    category: "offer",
    subcategory: "Investor",
    icon: Wallet,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    tags: ["No Bank", "Win-Win"],
    isBuiltIn: true,
  },
  {
    id: "offer-hybrid",
    name: "Hybrid Offer",
    description: "Cash down payment combined with seller financing",
    category: "offer",
    subcategory: "Investor",
    icon: Layers,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    tags: ["Creative", "Flexible"],
    isBuiltIn: true,
  },
  {
    id: "offer-novation",
    name: "Novation Agreement",
    description: "Control property and market it without purchasing upfront",
    category: "offer",
    subcategory: "Investor",
    icon: Handshake,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    tags: ["No Capital", "Profit Share"],
    isBuiltIn: true,
  },
  {
    id: "offer-listing",
    name: "Listing Agreement",
    description: "Offer to list property on MLS (requires license)",
    category: "offer",
    subcategory: "Licensed",
    icon: Building,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    tags: ["MLS", "License Req."],
    isBuiltIn: true,
  },
  {
    id: "offer-referral",
    name: "Agent Referral",
    description: "Refer lead to licensed agent for referral fee",
    category: "offer",
    subcategory: "Licensed",
    icon: UserPlus,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
    tags: ["Passive", "25-35% Fee"],
    isBuiltIn: true,
  },
];

const EMAIL_TEMPLATES: Template[] = [
  {
    id: "email-initial-outreach",
    name: "Initial Seller Outreach",
    description: "First contact email to a motivated seller with property interest",
    category: "email",
    subcategory: "Outreach",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    tags: ["Cold Outreach", "Seller"],
    isBuiltIn: true,
    isFeatured: true,
    content: `Subject: Quick Question About {{property_address}}

Hi {{seller_name}},

My name is {{buyer_name}} and I'm a local real estate investor. I noticed your property at {{property_address}} and wanted to reach out.

I help homeowners with quick, hassle-free closings — no repairs, no commissions, no fees. If you've been thinking about selling, I'd love to chat.

Would you be open to a quick call this week?

Best,
{{buyer_name}}
{{buyer_phone}}`,
  },
  {
    id: "email-follow-up-1",
    name: "Follow-Up #1 (3 Days)",
    description: "First follow-up email sent 3 days after initial outreach",
    category: "email",
    subcategory: "Follow-Up",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    tags: ["Follow-Up", "Drip"],
    isBuiltIn: true,
    content: `Subject: Re: {{property_address}} — Still Interested

Hi {{seller_name}},

Just circling back on my previous email about {{property_address}}. I understand you may be busy, so I wanted to keep this brief.

I can make a fair cash offer and close on your timeline — even as fast as 7 days if needed.

No obligation to accept, but I'd love to at least chat. What works for you?

{{buyer_name}}
{{buyer_phone}}`,
  },
  {
    id: "email-follow-up-2",
    name: "Follow-Up #2 (7 Days)",
    description: "Second follow-up emphasizing urgency and value",
    category: "email",
    subcategory: "Follow-Up",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    tags: ["Follow-Up", "Urgency"],
    isBuiltIn: true,
  },
  {
    id: "email-agent-outreach",
    name: "Agent Introduction",
    description: "Professional introduction email to listing agents for MLS properties",
    category: "email",
    subcategory: "Agent",
    icon: Mail,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    tags: ["Agent", "MLS"],
    isBuiltIn: true,
    isFeatured: true,
    content: `Subject: Cash Offer for {{property_address}} — {{buyer_name}}

Dear {{agent_name}},

I hope this message finds you well. I'm reaching out regarding your listing at {{property_address}}.

I'm a local cash buyer and would like to submit an offer. Here are the highlights:

• All cash, no financing contingency
• Close in {{closing_days}} days
• Proof of funds available upon request

Would you be open to presenting this to your seller? I'm happy to send a formal LOI at your convenience.

Best regards,
{{buyer_name}}
{{buyer_company}}
{{buyer_phone}}`,
  },
  {
    id: "email-buyer-deal-blast",
    name: "Deal Blast to Buyers",
    description: "Send new wholesale deal to your cash buyer list",
    category: "email",
    subcategory: "Buyer",
    icon: Mail,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    tags: ["Buyers", "Wholesale"],
    isBuiltIn: true,
  },
  {
    id: "email-pof-request",
    name: "Proof of Funds Request",
    description: "Request POF from buyers before showing deals",
    category: "email",
    subcategory: "Buyer",
    icon: Mail,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    tags: ["POF", "Verification"],
    isBuiltIn: true,
  },
];

const SMS_TEMPLATES: Template[] = [
  {
    id: "sms-initial-outreach",
    name: "Initial Seller Text",
    description: "Short first-contact text to motivated sellers",
    category: "sms",
    subcategory: "Outreach",
    icon: MessageSquare,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    tags: ["Cold", "Seller"],
    isBuiltIn: true,
    isFeatured: true,
    content: "Hi {{seller_name}}, this is {{buyer_name}}. I'm interested in your property at {{property_address}}. Would you consider a cash offer? Reply YES and I'll send details.",
  },
  {
    id: "sms-follow-up",
    name: "Follow-Up Text",
    description: "Quick follow-up after no response to initial text",
    category: "sms",
    subcategory: "Follow-Up",
    icon: MessageSquare,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    tags: ["Follow-Up", "Short"],
    isBuiltIn: true,
    content: "Hi {{seller_name}}, just following up on {{property_address}}. Still open to chatting? I can make a no-hassle offer. Reply CALL and I'll ring you.",
  },
  {
    id: "sms-appointment-confirm",
    name: "Appointment Confirmation",
    description: "Confirm scheduled appointment with seller",
    category: "sms",
    subcategory: "Appointment",
    icon: MessageSquare,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    tags: ["Appointment", "Confirm"],
    isBuiltIn: true,
    content: "Hi {{seller_name}}, confirming our appointment at {{property_address}} on {{appointment_date}} at {{appointment_time}}. See you then! — {{buyer_name}}",
  },
  {
    id: "sms-offer-sent",
    name: "Offer Sent Notification",
    description: "Notify seller that offer has been emailed",
    category: "sms",
    subcategory: "Offer",
    icon: MessageSquare,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    tags: ["Offer", "Notification"],
    isBuiltIn: true,
  },
  {
    id: "sms-buyer-deal-alert",
    name: "New Deal Alert (Buyer)",
    description: "Quick text to buyers about a new deal",
    category: "sms",
    subcategory: "Buyer",
    icon: MessageSquare,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    tags: ["Buyers", "Alert"],
    isBuiltIn: true,
    content: "🏠 New Deal! {{property_address}} | ARV: {{arv}} | Asking: {{asking_price}} | Rehab: {{rehab_estimate}}. Reply INFO for details. — {{buyer_name}}",
  },
  {
    id: "sms-drip-day-3",
    name: "Drip Day 3",
    description: "Automated drip sequence message for day 3",
    category: "sms",
    subcategory: "Drip",
    icon: MessageSquare,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    tags: ["Drip", "Auto"],
    isBuiltIn: true,
  },
];

const SCRIPT_TEMPLATES: Template[] = [
  {
    id: "script-cold-call",
    name: "Cold Call Script",
    description: "Opening script for cold calling property owners",
    category: "script",
    subcategory: "Cold Call",
    icon: Phone,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    tags: ["Cold Call", "Opening"],
    isBuiltIn: true,
    isFeatured: true,
    content: `OPENING:
"Hi, is this {{seller_name}}? Great — my name is {{buyer_name}}, I'm a local real estate investor. I'm calling about your property at {{property_address}}. Do you have a quick minute?"

IF YES:
"I help homeowners sell quickly without repairs, commissions, or fees. Would you be open to hearing a cash offer?"

OBJECTIONS:
• "Not interested" → "I totally understand. Just curious — is there a price that would make you consider?"
• "How did you get my number?" → "Public records. I reach out to homeowners in the area."
• "What would you offer?" → "It depends on condition and repairs. Can I ask a few quick questions?"

QUALIFYING QUESTIONS:
1. How long have you owned the property?
2. Is anyone currently living there?
3. What condition is the property in on a 1-10 scale?
4. What's your ideal timeline to sell?
5. Is there a mortgage on the property?

CLOSE:
"Based on what you've told me, I'd love to take a closer look. Can we schedule a quick walkthrough this week?"`,
  },
  {
    id: "script-follow-up-call",
    name: "Follow-Up Call Script",
    description: "Script for following up with warm leads",
    category: "script",
    subcategory: "Follow-Up",
    icon: Phone,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    tags: ["Warm Lead", "Follow-Up"],
    isBuiltIn: true,
  },
  {
    id: "script-appointment-set",
    name: "Appointment Setting Script",
    description: "Script optimized for booking property walkthrough appointments",
    category: "script",
    subcategory: "Appointment",
    icon: Phone,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    tags: ["Appointment", "Conversion"],
    isBuiltIn: true,
  },
  {
    id: "script-agent-call",
    name: "Agent Call Script",
    description: "Professional script for calling listing agents about MLS properties",
    category: "script",
    subcategory: "Agent",
    icon: Phone,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    tags: ["Agent", "MLS"],
    isBuiltIn: true,
    isFeatured: true,
  },
  {
    id: "script-objection-handler",
    name: "Objection Handlers",
    description: "Common objections and proven responses for negotiations",
    category: "script",
    subcategory: "Objection",
    icon: Phone,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    tags: ["Objections", "Negotiation"],
    isBuiltIn: true,
  },
];

const ALL_TEMPLATES = [...OFFER_TEMPLATES, ...EMAIL_TEMPLATES, ...SMS_TEMPLATES, ...SCRIPT_TEMPLATES];

const TAB_CONFIG = [
  { id: "all", label: "All", count: ALL_TEMPLATES.length },
  { id: "offer", label: "Offers", count: OFFER_TEMPLATES.length },
  { id: "email", label: "Email", count: EMAIL_TEMPLATES.length },
  { id: "sms", label: "SMS", count: SMS_TEMPLATES.length },
  { id: "script", label: "Scripts", count: SCRIPT_TEMPLATES.length },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AppTemplates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === "all" || t.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const featured = filteredTemplates.filter((t) => t.isFeatured);
  const rest = filteredTemplates.filter((t) => !t.isFeatured);

  const handleCopy = (template: Template) => {
    const text = template.content || `${template.name}\n\n${template.description}`;
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    toast.success("Template copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (template: Template) => {
    if (template.category === "offer") {
      navigate("/tools/offer-templates");
    } else {
      handleCopy(template);
    }
  };

  // Group non-featured templates by subcategory
  const grouped = rest.reduce<Record<string, Template[]>>((acc, t) => {
    const key = t.subcategory || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <PageLayout>
      <PageHeader
        title="Templates"
        description="Reusable templates for offers, emails, texts, and call scripts"
      />

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && !searchQuery && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Featured Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                copiedId={copiedId}
                onCopy={handleCopy}
                onUse={handleUse}
                variant="featured"
              />
            ))}
          </div>
        </div>
      )}

      {/* Grouped Templates */}
      {Object.entries(grouped).map(([subcategory, templates]) => (
        <div key={subcategory} className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {subcategory}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                copiedId={copiedId}
                onCopy={handleCopy}
                onUse={handleUse}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-foreground mb-1">No Templates Found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </PageLayout>
  );
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  copiedId,
  onCopy,
  onUse,
  variant = "default",
}: {
  template: Template;
  copiedId: string | null;
  onCopy: (t: Template) => void;
  onUse: (t: Template) => void;
  variant?: "default" | "featured";
}) {
  const isCopied = copiedId === template.id;
  const Icon = template.icon;

  if (variant === "featured") {
    return (
      <Card
        padding="lg"
        className="group hover:shadow-lg transition-all hover:border-primary/30 bg-gradient-to-br from-background to-muted/30"
      >
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl shrink-0", template.iconBg)}>
            <Icon className={cn("h-6 w-6", template.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              <Badge variant="default" size="sm" className="bg-primary/10 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {template.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onCopy(template)}>
                {isCopied ? <Check className="h-3 w-3 mr-1 text-success" /> : <Copy className="h-3 w-3 mr-1" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => onUse(template)}>
                Use Template
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="md"
      className="group hover:shadow-md transition-all hover:border-primary/30"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2.5 rounded-lg shrink-0", template.iconBg)}>
          <Icon className={cn("h-5 w-5", template.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate mb-0.5">{template.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {template.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => onCopy(template)}>
              {isCopied ? <Check className="h-3 w-3 mr-1 text-success" /> : <Copy className="h-3 w-3 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => onUse(template)}>
              Use
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
