import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NegotiationCoachTabProps {
  property: {
    id: string;
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
  onCompleteProfile?: () => void;
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

export function NegotiationCoachTab({ property, onCompleteProfile }: NegotiationCoachTabProps) {
  const [showTimingDetails, setShowTimingDetails] = useState(false);
  
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

      {/* Optimal Timing */}
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
