import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inbox, Sparkles, Clock, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuyerIntelligence } from "./BuyerIntelligenceCard";

interface AIFollowUpRecommendationProps {
  autoFollowUp: boolean;
  onAutoFollowUpChange: (value: boolean) => void;
  followUpDays: number;
  onFollowUpDaysChange: (value: number) => void;
  buyerIntelligence?: BuyerIntelligence | null;
  offerPercentage: number;
}

// AI-calculated optimal follow-up timing based on market data
function calculateOptimalFollowUp(
  buyerIntelligence?: BuyerIntelligence | null,
  offerPercentage?: number
): { days: number; reason: string; confidence: "high" | "medium" | "low" } {
  if (!buyerIntelligence || buyerIntelligence.matchingBuyers === 0) {
    return {
      days: 3,
      reason: "Default timing based on industry best practices",
      confidence: "low",
    };
  }

  const { avgArvPercentage, matchingBuyers } = buyerIntelligence;
  const arvPct = avgArvPercentage || 70;

  // If many matching buyers and competitive market → shorter follow-up
  if (matchingBuyers >= 5 && arvPct >= 72) {
    return {
      days: 2,
      reason: `${matchingBuyers} active buyers in this market move fast—agents respond quicker`,
      confidence: "high",
    };
  }

  // Moderate competition
  if (matchingBuyers >= 3 || arvPct >= 68) {
    return {
      days: 3,
      reason: `Based on ${matchingBuyers} buyer activity patterns in this ZIP code`,
      confidence: "high",
    };
  }

  // Lower competition → can wait a bit longer
  if (matchingBuyers >= 1) {
    return {
      days: 5,
      reason: "Less competitive market allows more time for seller consideration",
      confidence: "medium",
    };
  }

  return {
    days: 3,
    reason: "Standard follow-up timing for new markets",
    confidence: "low",
  };
}

export function AIFollowUpRecommendation({
  autoFollowUp,
  onAutoFollowUpChange,
  followUpDays,
  onFollowUpDaysChange,
  buyerIntelligence,
  offerPercentage,
}: AIFollowUpRecommendationProps) {
  const aiRecommendation = calculateOptimalFollowUp(buyerIntelligence, offerPercentage);
  const isUsingAiRecommendation = followUpDays === aiRecommendation.days;

  // Apply AI recommendation on component mount if buyer data available
  React.useEffect(() => {
    if (buyerIntelligence && buyerIntelligence.matchingBuyers > 0 && autoFollowUp) {
      onFollowUpDaysChange(aiRecommendation.days);
    }
  }, [buyerIntelligence?.matchingBuyers]);

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Inbox className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Auto Follow-Up</p>
              <p className="text-sm text-muted-foreground">
                Automatically follow up if no reply. All communication syncs to your Inbox.
              </p>
            </div>
            <Switch checked={autoFollowUp} onCheckedChange={onAutoFollowUpChange} />
          </div>

          {autoFollowUp && (
            <div className="mt-4 pt-4 border-t border-primary/20 space-y-4">
              {/* AI Recommendation Banner */}
              {buyerIntelligence && buyerIntelligence.matchingBuyers > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background border border-border">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">AI Suggests: {aiRecommendation.days} days</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          aiRecommendation.confidence === "high" && "border-success text-success",
                          aiRecommendation.confidence === "medium" && "border-warning text-warning",
                          aiRecommendation.confidence === "low" && "border-muted-foreground text-muted-foreground"
                        )}
                      >
                        {aiRecommendation.confidence === "high" && "High Confidence"}
                        {aiRecommendation.confidence === "medium" && "Medium Confidence"}
                        {aiRecommendation.confidence === "low" && "Low Confidence"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{aiRecommendation.reason}</p>
                    
                    {/* Quick stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {buyerIntelligence.matchingBuyers} matching buyers
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Avg {buyerIntelligence.avgArvPercentage}% ARV
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up Selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <Label className="text-sm whitespace-nowrap">Follow up after</Label>
                <Select
                  value={followUpDays.toString()}
                  onValueChange={(v) => onFollowUpDaysChange(Number(v))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <span className="flex items-center gap-2">
                        1 day
                        {aiRecommendation.days === 1 && (
                          <Sparkles className="h-3 w-3 text-primary" />
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="2">
                      <span className="flex items-center gap-2">
                        2 days
                        {aiRecommendation.days === 2 && (
                          <Sparkles className="h-3 w-3 text-primary" />
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="3">
                      <span className="flex items-center gap-2">
                        3 days
                        {aiRecommendation.days === 3 && (
                          <Sparkles className="h-3 w-3 text-primary" />
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="5">
                      <span className="flex items-center gap-2">
                        5 days
                        {aiRecommendation.days === 5 && (
                          <Sparkles className="h-3 w-3 text-primary" />
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="7">
                      <span className="flex items-center gap-2">
                        7 days
                        {aiRecommendation.days === 7 && (
                          <Sparkles className="h-3 w-3 text-primary" />
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="0">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">if no response</span>
                
                {isUsingAiRecommendation && buyerIntelligence && buyerIntelligence.matchingBuyers > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Optimized
                  </Badge>
                )}
              </div>

              {followUpDays === 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  You'll need to manually follow up from your Inbox
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
