import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, Lightbulb, Briefcase, Heart, ChevronDown, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TermsData {
  depositAmount?: number;
  inspectionPeriod?: number;
  inspectionPeriodType?: string;
  closingTimeline?: number;
  closingTimelineType?: string;
  financingType?: string;
  asIsPurchase?: boolean;
  flexiblePossession?: boolean;
  // Hybrid/Creative terms
  cashToSeller?: number;
  downPayment?: number;
  interestRate?: number;
  amortizationPeriod?: number;
  balloonPayment?: number;
  [key: string]: any;
}

interface TemplateTermsFormProps {
  terms: TermsData;
  offerType: string;
  onChange: (terms: TermsData) => void;
}

export function TemplateTermsForm({ terms, offerType, onChange }: TemplateTermsFormProps) {
  const showHybridTerms = offerType === "hybrid" || offerType === "seller_financing";
  const [hybridExpanded, setHybridExpanded] = React.useState(showHybridTerms);

  // Seller Perception Logic
  const sellerPerception = useMemo(() => {
    let score = 0;
    
    // Earnest money: higher is better for seller
    const earnest = terms.depositAmount || 5000;
    if (earnest >= 10000) score += 2;
    else if (earnest >= 5000) score += 1;
    
    // Due diligence: shorter is better for seller
    const dd = terms.inspectionPeriod || 10;
    if (dd <= 7) score += 2;
    else if (dd <= 10) score += 1;
    else if (dd >= 21) score -= 1;
    
    // Closing timeline: shorter is better
    const closing = terms.closingTimeline || 30;
    if (closing <= 14) score += 2;
    else if (closing <= 30) score += 1;
    else if (closing >= 60) score -= 1;
    
    // Financing type
    if (terms.financingType === "cash") score += 2;
    else if (terms.financingType === "conventional") score += 1;
    else if (terms.financingType === "seller_financing") score -= 1;
    
    // Seller-friendly conditions
    if (terms.asIsPurchase) score += 1;
    if (terms.flexiblePossession) score += 1;
    
    if (score >= 6) return { level: "friendly", label: "Seller-Friendly", color: "success" as const };
    if (score >= 3) return { level: "neutral", label: "Neutral", color: "warning" as const };
    return { level: "aggressive", label: "Aggressive", color: "error" as const };
  }, [terms]);

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg" className="border-border">
        {/* Header with Seller Perception */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <h4 className="font-semibold text-foreground">Customize Offer Terms</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-tiny text-muted-foreground">Seller Perception:</span>
            <Badge variant={sellerPerception.color} size="sm">
              {sellerPerception.label}
            </Badge>
          </div>
        </div>
        <p className="text-small text-muted-foreground mb-6">
          Set default values for this package. These will auto-populate in your LOI.
        </p>

        {/* Section A: Acquisition Basics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-small font-semibold text-foreground">Acquisition Basics</span>
          </div>

          <div className="space-y-2">
            <Label className="text-small">Earnest Money</Label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="text"
                value={terms.depositAmount?.toLocaleString() || "5,000"}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/,/g, "")) || 0;
                  onChange({ ...terms, depositAmount: value });
                }}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-small">Due Diligence Period</Label>
            <div className="flex gap-2 max-w-md">
              <Select
                value={terms.inspectionPeriod?.toString() || "10"}
                onValueChange={(v) => onChange({ ...terms, inspectionPeriod: parseInt(v) })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 10, 14, 15, 21, 30].map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={terms.inspectionPeriodType || "days"}
                onValueChange={(v) => onChange({ ...terms, inspectionPeriodType: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="business">Business Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-small">Closing Timeline</Label>
              <div className="flex gap-2">
                <Select
                  value={terms.closingTimeline?.toString() || "30"}
                  onValueChange={(v) => onChange({ ...terms, closingTimeline: parseInt(v) })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[7, 10, 14, 21, 30, 45, 60, 90].map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={terms.closingTimelineType || "days"}
                  onValueChange={(v) => onChange({ ...terms, closingTimelineType: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="business_days">business days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-small">Financing Type</Label>
              <Select
                value={terms.financingType || "cash"}
                onValueChange={(v) => onChange({ ...terms, financingType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">All Cash</SelectItem>
                  <SelectItem value="conventional">Conventional</SelectItem>
                  <SelectItem value="fha">FHA</SelectItem>
                  <SelectItem value="hard_money">Hard Money</SelectItem>
                  <SelectItem value="seller_financing">Seller Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <Separator className="my-6" />

        {/* Section B: Seller-Friendly Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-success" />
            <span className="text-small font-semibold text-foreground">Seller-Friendly Conditions</span>
          </div>
          <p className="text-tiny text-muted-foreground -mt-2">
            These options can make your offer more attractive to sellers.
          </p>

          <div className="space-y-3 bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="as-is"
                checked={terms.asIsPurchase ?? true}
                onCheckedChange={(checked) => onChange({ ...terms, asIsPurchase: !!checked })}
              />
              <Label htmlFor="as-is" className="text-small cursor-pointer">
                As-is purchase (no repair requests)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="flexible"
                checked={terms.flexiblePossession ?? true}
                onCheckedChange={(checked) => onChange({ ...terms, flexiblePossession: !!checked })}
              />
              <Label htmlFor="flexible" className="text-small cursor-pointer">
                Flexible on possession date
              </Label>
            </div>
          </div>
        </div>

        {/* Section C: Hybrid Structure Terms - Collapsible */}
        {showHybridTerms && (
          <Collapsible open={hybridExpanded} onOpenChange={setHybridExpanded} className="mt-6">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-small font-semibold text-foreground">Seller Financing / Hybrid Terms</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", hybridExpanded && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-small">Cash to Seller (if any)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="text"
                    value={terms.cashToSeller?.toLocaleString() || "30,000"}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/,/g, "")) || 0;
                      onChange({ ...terms, cashToSeller: value });
                    }}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-small">Down Payment (to seller note)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="text"
                    value={terms.downPayment?.toLocaleString() || "10,000"}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/,/g, "")) || 0;
                      onChange({ ...terms, downPayment: value });
                    }}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-small">Interest Rate</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={terms.interestRate || 6}
                    onChange={(e) => onChange({ ...terms, interestRate: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-small">Amortization Period</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={terms.amortizationPeriod || 30}
                    onChange={(e) => onChange({ ...terms, amortizationPeriod: parseInt(e.target.value) || 0 })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">years</span>
                </div>
              </div>
            </div>

                <div className="space-y-2">
                  <Label className="text-small">Balloon Payment</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={terms.balloonPayment || 5}
                      onChange={(e) => onChange({ ...terms, balloonPayment: parseInt(e.target.value) || 0 })}
                      className="max-w-[200px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">years</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Info Box */}
        <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-small text-warning">
            Set your default offer terms here. These become placeholders in your LOI and can be customized per property before sending.
          </p>
        </div>
      </Card>
    </div>
  );
}
