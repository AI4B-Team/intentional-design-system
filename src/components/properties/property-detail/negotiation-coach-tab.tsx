import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useNegotiationAI, type NegotiationAnalysis } from "@/hooks/useNegotiationAI";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  Zap,
  Shield,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Calendar,
  Phone,
  Sparkles,
  User,
  Target,
  Brain,
  Lightbulb,
  Calculator,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  FileText,
  HandshakeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NegotiationCoachTabProps {
  property: {
    id: string;
    address?: string;
    ownerName?: string;
    ownerPhone?: string;
    score: number;
    distressSignals?: string[];
    mortgageBalance?: number;
    arv?: number;
    repairs?: number;
    source?: string;
    addedDate?: string;
  };
  mao?: number;
  onCompleteProfile?: () => void;
}

interface CounterAnalysis {
  acceptCeiling: number;
  counterAt: number;
  counterTerms: string;
  walkAwayMax: number;
  spreadAtCounter: number;
  roiAtCounter: number;
  recommendation: "accept" | "counter" | "walk";
}

function analyzeCounter(
  initialOffer: number,
  sellerAsks: number,
  arv: number,
  repairs: number,
  profitMargin: number = 0.15
): CounterAnalysis {
  // Calculate ceiling (max we can pay and still hit profit margin)
  const maxAllowable = arv * (1 - profitMargin) - repairs;
  const acceptCeiling = Math.round(maxAllowable * 0.95); // 95% of max
  const walkAwayMax = Math.round(maxAllowable);
  
  // Counter at midpoint between initial and ceiling, but not above ceiling
  const midpoint = (initialOffer + sellerAsks) / 2;
  const counterAt = Math.min(Math.round(midpoint), acceptCeiling);
  
  // Determine recommendation
  let recommendation: "accept" | "counter" | "walk" = "counter";
  if (sellerAsks <= acceptCeiling) {
    recommendation = "accept";
  } else if (sellerAsks > walkAwayMax) {
    recommendation = "walk";
  }
  
  // Calculate spread and ROI at counter price
  const spreadAtCounter = arv - repairs - counterAt;
  const roiAtCounter = ((spreadAtCounter / counterAt) * 100);
  
  // Suggest terms based on situation
  let counterTerms = "standard terms";
  if (sellerAsks > walkAwayMax * 0.9) {
    counterTerms = "seller financing (monthly payments)";
  } else if (sellerAsks > acceptCeiling) {
    counterTerms = "faster 7-day close";
  }
  
  return {
    acceptCeiling,
    counterAt,
    counterTerms,
    walkAwayMax,
    spreadAtCounter,
    roiAtCounter,
    recommendation,
  };
}

interface CallScript {
  id: string;
  title: string;
  script: string;
  rawScript: string; // Template with placeholders
}

interface PropertyVariables {
  ownerName: string;
  streetName: string;
  offerAmount: string;
  timeline: string;
  arv?: number;
  repairs?: number;
}

function replaceVariables(template: string, vars: PropertyVariables): string {
  return template
    .replace(/\[Owner Name\]/g, vars.ownerName)
    .replace(/\[Your Name\]/g, "[Your Name]")
    .replace(/\[Company\]/g, "[Company]")
    .replace(/\[Street Name\]/g, vars.streetName)
    .replace(/\[ADDRESS\]/g, vars.streetName)
    .replace(/\[Offer Amount\]/g, vars.offerAmount)
    .replace(/\[Timeline\]/g, vars.timeline);
}

function generateCallScripts(
  ownerName: string,
  streetName: string,
  offerAmount: string,
  timeline: string,
  arv?: number,
  repairs?: number
): CallScript[] {
  const scripts: CallScript[] = [];
  const vars: PropertyVariables = { ownerName, streetName, offerAmount, timeline, arv, repairs };
  
  // 1. Opening Script
  const openingRaw = `Hi, is this [Owner Name]? Great! This is [Your Name] with [Company]. I'm calling about your property on [Street Name]. Do you have a few minutes to chat about possibly selling?`;
  scripts.push({
    id: "opening",
    title: "Opening Script",
    script: replaceVariables(openingRaw, vars),
    rawScript: openingRaw,
  });

  // 2. Qualifying Questions Script
  const qualifyingRaw = `"What's the main reason you're considering selling?"

"On a scale of 1-10, how motivated are you to sell quickly?"

"Is there a mortgage on the property? Roughly what's owed?"

"Are the payments current?"

"What condition is the property in?"

"Have you had it listed or tried selling before?"

"If we could agree on terms, when would you ideally want to close?"`;
  scripts.push({
    id: "qualifying",
    title: "Qualifying Questions",
    script: qualifyingRaw,
    rawScript: qualifyingRaw,
  });

  // 3. Making the Offer Script
  const offerRaw = `Based on what you've told me and my research on the property, I can offer [Offer Amount] cash, close in as little as [Timeline]. You wouldn't need to make any repairs or clean anything out. How does that sound as a starting point?`;
  scripts.push({
    id: "offer",
    title: "Making the Offer",
    script: replaceVariables(offerRaw, vars),
    rawScript: offerRaw,
  });

  // 4. Handling "Too Low" Script
  const tooLowRaw = `I completely understand that's less than you hoped for. Let me walk you through how I got to that number...

[Explain: repairs needed, current market conditions, timeline benefits, certainty value]

What number would you need to make this work for you?`;
  scripts.push({
    id: "too-low",
    title: "Handling 'Too Low'",
    script: tooLowRaw,
    rawScript: tooLowRaw,
  });

  // 5. Closing for Appointment Script
  const closingRaw = `It sounds like we might be able to work something out. The next step would be for me to come see the property in person. Would tomorrow at [time] or [alternative time] work better for you?`;
  scripts.push({
    id: "closing",
    title: "Closing for Appointment",
    script: closingRaw,
    rawScript: closingRaw,
  });

  return scripts;
}

// Strategy mapping based on distress signals
function getLeadStrategy(signals: string[], score: number) {
  const signalSet = new Set(signals.map(s => s.toLowerCase()));
  
  if (signalSet.has("foreclosure") || signalSet.has("pre-foreclosure") || signalSet.has("tax lien") || score >= 800) {
    return {
      approach: "SPEED",
      description: "They need this solved fast",
      icon: Zap,
      color: "text-destructive",
      bg: "bg-destructive/10",
    };
  }
  if (signalSet.has("bankruptcy") || signalSet.has("high debt") || signalSet.has("code violation")) {
    return {
      approach: "CERTAINTY",
      description: "No financing contingencies, guaranteed close",
      icon: Shield,
      color: "text-success",
      bg: "bg-success/10",
    };
  }
  if (signalSet.has("tired landlord") || signalSet.has("out of state owner") || signalSet.has("vacant")) {
    return {
      approach: "CONVENIENCE",
      description: "You handle everything, they just sign",
      icon: CheckCircle2,
      color: "text-brand",
      bg: "bg-brand/10",
    };
  }
  if (signalSet.has("divorce") || signalSet.has("death") || signalSet.has("probate") || signalSet.has("inherited")) {
    return {
      approach: "DISCRETION & FLEXIBILITY",
      description: "Sensitive timeline, private transaction",
      icon: Heart,
      color: "text-info",
      bg: "bg-info/10",
    };
  }
  
  return {
    approach: "VALUE",
    description: "Focus on fair deal and smooth process",
    icon: Target,
    color: "text-content",
    bg: "bg-muted",
  };
}

function generateTalkingPoints(signals: string[], score: number, mortgageBalance?: number, arv?: number) {
  const points: string[] = [];
  const signalSet = new Set(signals.map(s => s.toLowerCase()));
  
  // High motivation acknowledgment
  if (score >= 800) {
    points.push("High urgency detected. Express understanding of their time pressure and your ability to move quickly.");
  } else if (score >= 500) {
    points.push("Moderate motivation. They're open to solutions but may be weighing options.");
  }
  
  // Specific signal-based points
  if (signalSet.has("foreclosure") || signalSet.has("pre-foreclosure")) {
    points.push("They're facing foreclosure - acknowledge this sensitively. Emphasize you can stop the process and protect their credit.");
  }
  if (signalSet.has("divorce")) {
    points.push("Divorce situation requires discretion. Focus on quick, clean resolution so both parties can move forward.");
  }
  if (signalSet.has("probate") || signalSet.has("inherited") || signalSet.has("death")) {
    points.push("Inherited property often comes with emotional weight. Be patient and respectful of their processing time.");
  }
  if (signalSet.has("tired landlord")) {
    points.push("Tired landlord wants OUT. Paint a picture of freedom - no more tenant calls, repairs, or vacancy worries.");
  }
  if (signalSet.has("vacant")) {
    points.push("Vacant property = carrying costs. Mention they're paying insurance, taxes, and maintenance on an empty house.");
  }
  if (signalSet.has("tax lien") || signalSet.has("code violation")) {
    points.push("Outstanding liens/violations add pressure. You can take these off their hands as part of the deal.");
  }
  
  // Equity-based point
  if (mortgageBalance && arv) {
    const equity = arv - mortgageBalance;
    const equityPercent = (equity / arv) * 100;
    if (equityPercent > 50) {
      points.push(`High equity position (${Math.round(equityPercent)}%) means they have flexibility. Don't start too low.`);
    } else if (equityPercent < 20) {
      points.push("Low equity situation. Creative terms or short sale may be needed. Focus on solving their problem.");
    }
  }
  
  // Ensure minimum points
  if (points.length < 3) {
    points.push("Build rapport first. Ask about their situation before presenting numbers.");
    points.push("Emphasize your track record of closing deals smoothly and on time.");
  }
  
  return points.slice(0, 4);
}

function generateAvoidPoints(signals: string[], score: number, mortgageBalance?: number, arv?: number) {
  const avoids: string[] = [];
  const signalSet = new Set(signals.map(s => s.toLowerCase()));
  
  // Equity-based avoids
  if (mortgageBalance && arv) {
    const equity = arv - mortgageBalance;
    if (equity > 100000) {
      avoids.push("Don't lowball aggressively - they have significant equity and options.");
    }
  }
  
  // Emotional situations
  if (signalSet.has("death") || signalSet.has("probate") || signalSet.has("divorce")) {
    avoids.push("Don't rush the conversation - they need time to process emotionally.");
    avoids.push("Don't focus only on numbers. Acknowledge the human element first.");
  }
  
  // High distress
  if (score >= 800 || signalSet.has("foreclosure")) {
    avoids.push("Don't seem too eager or predatory - even distressed sellers have pride.");
  }
  
  // General avoids
  avoids.push("Don't badmouth other investors or real estate agents they may be talking to.");
  
  if (signalSet.has("tired landlord")) {
    avoids.push("Don't ask about the condition of tenants or suggest they're the problem.");
  }
  
  return avoids.slice(0, 3);
}

interface Objection {
  objection: string;
  response: string;
  redirect: string;
}

function generateObjections(signals: string[], score: number, mortgageBalance?: number, arv?: number, repairs?: number): Objection[] {
  const objections: Objection[] = [];
  const signalSet = new Set(signals.map(s => s.toLowerCase()));
  
  // Universal objections
  objections.push({
    objection: "Your offer is too low",
    response: "I understand your concern. Our offer reflects the repairs needed and market conditions. Can we walk through the numbers together?",
    redirect: "What number would you need to make this work for you?",
  });
  
  objections.push({
    objection: "I need to think about it / talk to my spouse",
    response: "Absolutely, take your time. This is a big decision. What questions can I answer to help with that conversation?",
    redirect: "When would be a good time to reconnect after you've had a chance to discuss?",
  });
  
  objections.push({
    objection: "How do I know you're legitimate?",
    response: "That's a fair question. We're a local investment company with a track record of closing. I can provide references from previous sellers and our business credentials.",
    redirect: "Would you like me to send over some testimonials or proof of funds?",
  });
  
  // Situation-specific objections
  if (signalSet.has("foreclosure") || signalSet.has("pre-foreclosure")) {
    objections.push({
      objection: "My bank/attorney says I shouldn't sell",
      response: "I understand they want to protect you. Our solution might actually work alongside their advice. A quick sale can prevent a foreclosure on your credit.",
      redirect: "Would it help if I spoke with your attorney to explain how this works?",
    });
  }
  
  if (score < 500) {
    objections.push({
      objection: "I'm in no rush to sell",
      response: "I get it - you have time. But market conditions can change. Right now, we can offer [X] with a quick close. That certainty has value.",
      redirect: "What would need to happen for you to consider selling sooner?",
    });
  }
  
  objections.push({
    objection: "I'm getting other offers",
    response: "That's smart to explore your options. What's most important to you in choosing a buyer - price, timing, or certainty of close?",
    redirect: "I'd love to understand what those offers look like so I can see if we can be competitive.",
  });
  
  if (repairs && repairs > 30000) {
    objections.push({
      objection: "Those repair estimates are too high",
      response: "I hear you. These are based on contractor quotes, but I'm happy to walk through each item. Some might be negotiable depending on what you're willing to leave as-is.",
      redirect: "Which repairs do you think we've overestimated?",
    });
  }
  
  return objections.slice(0, 4);
}

function getOptimalTiming() {
  // Best practices for real estate calls
  const bestDays = ["Tuesday", "Wednesday", "Thursday"];
  const bestTimes = ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"];
  
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Find next best day
  const daysUntilBest = [2, 3, 4].map(d => (d - dayOfWeek + 7) % 7 || 7);
  const nextBestIn = Math.min(...daysUntilBest);
  const nextBestDate = new Date(today);
  nextBestDate.setDate(today.getDate() + nextBestIn);
  
  return {
    bestDay: bestDays[Math.floor(Math.random() * bestDays.length)],
    bestTime: bestTimes[Math.floor(Math.random() * bestTimes.length)],
    followUpInterval: 3,
    nextRecommended: nextBestDate,
    factors: [
      "Mid-week calls have 23% higher answer rates",
      "Late morning avoids busy periods",
      "3-day follow-up balances persistence with respect",
    ],
  };
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function NegotiationCoachTab({ property, mao, onCompleteProfile }: NegotiationCoachTabProps) {
  const [showTimingDetails, setShowTimingDetails] = useState(false);
  const [sellerAsks, setSellerAsks] = useState<string>("");
  const [counterAnalysis, setCounterAnalysis] = useState<CounterAnalysis | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [customizingScript, setCustomizingScript] = useState<CallScript | null>(null);
  const [editedScript, setEditedScript] = useState<string>("");
  
  // Check if we have sufficient data
  const hasOwnerInfo = property.ownerName;
  const hasMotivation = property.score > 0;
  const hasDistressSignals = property.distressSignals && property.distressSignals.length > 0;
  
  const hasSufficientData = hasOwnerInfo && hasMotivation;
  
  // Generate strategy data
  const signals = property.distressSignals || [];
  const strategy = getLeadStrategy(signals, property.score);
  const talkingPoints = generateTalkingPoints(signals, property.score, property.mortgageBalance, property.arv);
  const avoidPoints = generateAvoidPoints(signals, property.score, property.mortgageBalance, property.arv);
  const objections = generateObjections(signals, property.score, property.mortgageBalance, property.arv, property.repairs);
  const timing = getOptimalTiming();
  const StrategyIcon = strategy.icon;
  
  // Initial offer calculation
  const initialOffer = mao || (property.arv && property.repairs 
    ? (property.arv * 0.7) - property.repairs 
    : 0);
  
  // Extract street name from address (simplified)
  const streetName = property.address?.split(',')[0] || "[Street Name]";
  
  // Generate call scripts with property-specific variables
  const callScripts = generateCallScripts(
    property.ownerName || "Owner",
    streetName,
    formatCurrency(initialOffer),
    "7-10 days",
    property.arv,
    property.repairs
  );
  
  const handleCustomizeScript = (script: CallScript) => {
    setCustomizingScript(script);
    setEditedScript(script.script);
  };
  
  const handleCopyCustomizedScript = async () => {
    try {
      await navigator.clipboard.writeText(editedScript);
      toast.success("Customized script copied!");
      setCustomizingScript(null);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleAnalyzeCounter = () => {
    const askAmount = parseFloat(sellerAsks.replace(/[^0-9.-]+/g, ""));
    if (isNaN(askAmount) || askAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const analysis = analyzeCounter(
      initialOffer,
      askAmount,
      property.arv || 0,
      property.repairs || 0
    );
    setCounterAnalysis(analysis);
  };

  const handleCopyScript = async (scriptId: string, scriptText: string) => {
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopiedScript(scriptId);
      toast.success("Script copied to clipboard");
      setTimeout(() => setCopiedScript(null), 2000);
    } catch {
      toast.error("Failed to copy script");
    }
  };

  // Calculate range positions for visual
  const getPositionPercent = (value: number, min: number, max: number) => {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  };

  // Insufficient data state
  if (!hasSufficientData) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card variant="default" padding="lg" className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-h2 font-semibold text-content mb-2">Negotiation Coach</h2>
          <p className="text-body text-content-secondary mb-6">
            Add more property details to get AI-powered negotiation guidance tailored to this specific situation.
          </p>

          <Card variant="default" padding="md" className="text-left mb-6 bg-warning/5 border-warning/20">
            <h3 className="text-small font-medium text-content mb-3">Missing Information:</h3>
            <div className="space-y-2">
              {!hasOwnerInfo && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-warning" />
                  <span className="text-small text-content-secondary">Owner name and contact info</span>
                </div>
              )}
              {!hasMotivation && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-warning" />
                  <span className="text-small text-content-secondary">Motivation score (run MotivationIQ)</span>
                </div>
              )}
              {!hasDistressSignals && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-warning" />
                  <span className="text-small text-content-secondary">Distress signals for deeper insights</span>
                </div>
              )}
              {!property.mortgageBalance && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-small text-content-tertiary">Mortgage details (optional but helpful)</span>
                </div>
              )}
            </div>
          </Card>

          <Button variant="primary" onClick={onCompleteProfile}>
            Complete Property Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Strategy Brief */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-content">Strategy Brief for {property.ownerName}</h2>
            <p className="text-small text-content-secondary">Based on MotivationIQ analysis • Score: {property.score}/1000</p>
          </div>
        </div>

        {/* Lead Strategy */}
        <div className={cn("p-4 rounded-medium mb-4", strategy.bg)}>
          <div className="flex items-center gap-3 mb-2">
            <StrategyIcon className={cn("h-6 w-6", strategy.color)} />
            <div>
              <span className="text-small text-content-secondary">Lead with:</span>
              <h3 className={cn("text-h3 font-bold", strategy.color)}>{strategy.approach}</h3>
            </div>
          </div>
          <p className="text-body text-content-secondary ml-9">{strategy.description}</p>
        </div>

        {/* Talking Points */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-content-tertiary" />
            <h3 className="text-body font-semibold text-content">Key Talking Points</h3>
          </div>
          <div className="space-y-2">
            {talkingPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-small text-content">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What to Avoid */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-body font-semibold text-content">What to Avoid</h3>
          </div>
          <div className="space-y-2">
            {avoidPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-small text-content">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Objection Prediction */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-content-tertiary" />
            <h2 className="text-h3 font-semibold text-content">Likely Objections</h2>
          </div>
          <Button variant="secondary" size="sm" icon={<Sparkles />}>
            Generate More
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Likely Objection</TableHead>
              <TableHead className="w-1/3">Recommended Response</TableHead>
              <TableHead className="w-1/3">Redirect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objections.map((obj, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" size="sm" className="mt-0.5">{index + 1}</Badge>
                    <span className="text-small font-medium text-content">"{obj.objection}"</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-small text-content-secondary">{obj.response}</span>
                </TableCell>
                <TableCell>
                  <span className="text-small text-brand italic">"{obj.redirect}"</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Counter-Offer Strategy */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <HandshakeIcon className="h-5 w-5 text-content-tertiary" />
          <h2 className="text-h3 font-semibold text-content">If They Counter...</h2>
        </div>

        {/* Interactive Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-small text-content-secondary">Your Initial Offer</Label>
            <div className="text-h2 font-bold text-content mt-1">{formatCurrency(initialOffer)}</div>
            <p className="text-tiny text-content-tertiary">Based on MAO calculation</p>
          </div>
          <div>
            <Label className="text-small text-content-secondary">Seller Asks For</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="$150,000"
                value={sellerAsks}
                onChange={(v) => setSellerAsks(v)}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleAnalyzeCounter} icon={<Calculator />}>
                Analyze
              </Button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {counterAnalysis && (
          <div className="space-y-4">
            {/* Recommendation Panel */}
            <div className={cn(
              "p-4 rounded-medium border-2",
              counterAnalysis.recommendation === "accept" ? "bg-success/5 border-success/20" :
              counterAnalysis.recommendation === "walk" ? "bg-destructive/5 border-destructive/20" :
              "bg-warning/5 border-warning/20"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {counterAnalysis.recommendation === "accept" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-body font-semibold text-success">Accept This Counter</span>
                  </>
                ) : counterAnalysis.recommendation === "walk" ? (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-body font-semibold text-destructive">Walk Away</span>
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 text-warning" />
                    <span className="text-body font-semibold text-warning">Counter Offer Recommended</span>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-background-secondary rounded-small">
                  <div className="flex items-center gap-1 text-tiny text-success mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Accept if under
                  </div>
                  <span className="text-body font-bold text-content">{formatCurrency(counterAnalysis.acceptCeiling)}</span>
                </div>
                <div className="p-3 bg-background-secondary rounded-small">
                  <div className="flex items-center gap-1 text-tiny text-warning mb-1">
                    <Target className="h-3 w-3" />
                    Counter at
                  </div>
                  <span className="text-body font-bold text-content">{formatCurrency(counterAnalysis.counterAt)}</span>
                  <p className="text-tiny text-content-tertiary mt-1">with {counterAnalysis.counterTerms}</p>
                </div>
                <div className="p-3 bg-background-secondary rounded-small">
                  <div className="flex items-center gap-1 text-tiny text-destructive mb-1">
                    <XCircle className="h-3 w-3" />
                    Walk away if above
                  </div>
                  <span className="text-body font-bold text-content">{formatCurrency(counterAnalysis.walkAwayMax)}</span>
                </div>
              </div>
            </div>

            {/* Calculation Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card variant="default" padding="sm" className="text-center">
                <p className="text-tiny text-content-tertiary">Spread at Counter</p>
                <p className={cn("text-h3 font-bold", counterAnalysis.spreadAtCounter > 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(counterAnalysis.spreadAtCounter)}
                </p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <p className="text-tiny text-content-tertiary">ROI at Counter</p>
                <p className={cn("text-h3 font-bold", counterAnalysis.roiAtCounter > 15 ? "text-success" : "text-warning")}>
                  {counterAnalysis.roiAtCounter.toFixed(1)}%
                </p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <p className="text-tiny text-content-tertiary">ARV</p>
                <p className="text-h3 font-bold text-content">{formatCurrency(property.arv)}</p>
              </Card>
              <Card variant="default" padding="sm" className="text-center">
                <p className="text-tiny text-content-tertiary">Est. Repairs</p>
                <p className="text-h3 font-bold text-content">{formatCurrency(property.repairs)}</p>
              </Card>
            </div>

            {/* Visual Negotiation Range */}
            <div className="p-4 bg-muted/30 rounded-medium">
              <p className="text-small font-medium text-content mb-3">Negotiation Range</p>
              <div className="relative h-8 bg-gradient-to-r from-success/30 via-warning/30 to-destructive/30 rounded-full overflow-hidden">
                {/* Initial offer marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-success"
                  style={{ left: `${getPositionPercent(initialOffer, initialOffer, counterAnalysis.walkAwayMax * 1.2)}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-tiny text-success font-medium whitespace-nowrap">
                    Initial
                  </div>
                </div>
                
                {/* Counter zone marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-warning"
                  style={{ left: `${getPositionPercent(counterAnalysis.counterAt, initialOffer, counterAnalysis.walkAwayMax * 1.2)}%` }}
                >
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-tiny text-warning font-medium whitespace-nowrap">
                    Counter
                  </div>
                </div>
                
                {/* Walk away marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-destructive"
                  style={{ left: `${getPositionPercent(counterAnalysis.walkAwayMax, initialOffer, counterAnalysis.walkAwayMax * 1.2)}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-tiny text-destructive font-medium whitespace-nowrap">
                    Max
                  </div>
                </div>

                {/* Seller asks marker */}
                <div 
                  className="absolute top-1 bottom-1 w-2 bg-content rounded-full border-2 border-background"
                  style={{ left: `${getPositionPercent(parseFloat(sellerAsks.replace(/[^0-9.-]+/g, "")), initialOffer, counterAnalysis.walkAwayMax * 1.2)}%` }}
                />
              </div>
              <div className="flex justify-between mt-6 text-tiny text-content-tertiary">
                <span>{formatCurrency(initialOffer)}</span>
                <span>Seller: {sellerAsks}</span>
                <span>{formatCurrency(counterAnalysis.walkAwayMax)}</span>
              </div>
            </div>

            {/* Alternative Offers */}
            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-small font-semibold text-content mb-3">
                If price is stuck, try these alternatives:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-background-secondary rounded-small">
                  <Zap className="h-4 w-4 text-brand mt-0.5" />
                  <div>
                    <p className="text-small font-medium text-content">Faster Close</p>
                    <p className="text-tiny text-content-secondary">Offer 7-day close - reduces their holding costs</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-background-secondary rounded-small">
                  <TrendingUp className="h-4 w-4 text-brand mt-0.5" />
                  <div>
                    <p className="text-small font-medium text-content">Seller Financing</p>
                    <p className="text-tiny text-content-secondary">Higher price with monthly payments - income appeal</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-background-secondary rounded-small">
                  <TrendingDown className="h-4 w-4 text-brand mt-0.5" />
                  <div>
                    <p className="text-small font-medium text-content">Cover Moving Costs</p>
                    <p className="text-tiny text-content-secondary">Add $2-5K for moving expenses instead of price</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-background-secondary rounded-small">
                  <Calendar className="h-4 w-4 text-brand mt-0.5" />
                  <div>
                    <p className="text-small font-medium text-content">Leaseback Period</p>
                    <p className="text-tiny text-content-secondary">Let them stay 30-60 days rent-free after close</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!counterAnalysis && (
          <div className="text-center py-6 bg-muted/20 rounded-medium">
            <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-small text-content-secondary">Enter the seller's counter to see strategy recommendations</p>
          </div>
        )}
      </Card>

      {/* Call Scripts */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-content-tertiary" />
          <h2 className="text-h3 font-semibold text-content">Call Scripts</h2>
        </div>
        <p className="text-small text-content-secondary mb-4">
          Pre-filled with {property.ownerName}'s details. Copy or customize for your style.
        </p>

        <Accordion type="single" collapsible className="space-y-2">
          {callScripts.map((script) => (
            <AccordionItem 
              key={script.id} 
              value={script.id}
              className="border rounded-medium px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" size="sm">{script.id.toUpperCase()}</Badge>
                  <span className="font-medium">{script.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <pre className="whitespace-pre-wrap text-small text-content bg-background-secondary p-4 rounded-medium font-sans leading-relaxed">
                    {script.script}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyScript(script.id, script.script)}
                      icon={copiedScript === script.id ? <Check className="text-success" /> : <Copy />}
                    >
                      {copiedScript === script.id ? "Copied!" : "Copy Script"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCustomizeScript(script)}
                      icon={<FileText />}
                    >
                      Customize for This Property
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Customize Script Modal */}
        {customizingScript && (
          <Dialog open={!!customizingScript} onOpenChange={() => setCustomizingScript(null)}>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle>Customize: {customizingScript.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-tiny text-content-secondary">
                  Edit the script below to match your style. Variables like [Your Name], [Company] can be filled in.
                </div>
                <Textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="min-h-[200px] font-mono text-small"
                  placeholder="Edit your script..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setCustomizingScript(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleCopyCustomizedScript}
                    icon={<Copy />}
                  >
                    Copy Customized Script
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-content-tertiary" />
          <h2 className="text-h3 font-semibold text-content">Optimal Timing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card variant="default" padding="sm" className="bg-brand/5 border-brand/10">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide mb-1">Best Day to Call</p>
            <p className="text-h3 font-semibold text-content">{timing.bestDay}</p>
          </Card>
          <Card variant="default" padding="sm" className="bg-brand/5 border-brand/10">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide mb-1">Best Time</p>
            <p className="text-h3 font-semibold text-content">{timing.bestTime}</p>
          </Card>
          <Card variant="default" padding="sm" className="bg-brand/5 border-brand/10">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide mb-1">Follow-up Interval</p>
            <p className="text-h3 font-semibold text-content">{timing.followUpInterval} days</p>
          </Card>
        </div>

        <Collapsible open={showTimingDetails} onOpenChange={setShowTimingDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-small text-content-secondary">Based on {timing.factors.length} factors</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showTimingDetails && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3 space-y-2">
              {timing.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-small text-content-secondary">{factor}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-4 pt-4 border-t border-border-subtle flex flex-wrap gap-3">
          <Button variant="primary" icon={<Phone />}>
            Call Now
          </Button>
          <Button variant="secondary" icon={<Calendar />}>
            Schedule for {timing.nextRecommended.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </Button>
        </div>
      </Card>

      {/* Quick Reference Card */}
      <Card variant="default" padding="md" className="bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-content-tertiary" />
          <h3 className="text-small font-semibold text-content">Quick Reference</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-small">
          <div>
            <span className="text-content-tertiary">Owner</span>
            <p className="font-medium text-content">{property.ownerName || "—"}</p>
          </div>
          <div>
            <span className="text-content-tertiary">Phone</span>
            <p className="font-medium text-content">{property.ownerPhone || "—"}</p>
          </div>
          <div>
            <span className="text-content-tertiary">Est. Equity</span>
            <p className="font-medium text-content">
              {property.arv && property.mortgageBalance
                ? formatCurrency(property.arv - property.mortgageBalance)
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-content-tertiary">Motivation</span>
            <Badge 
              size="sm"
              className={cn(
                property.score >= 800 ? "bg-destructive/10 text-destructive" :
                property.score >= 500 ? "bg-warning/10 text-warning" :
                "bg-muted text-muted-foreground"
              )}
            >
              {property.score}/1000
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
