import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Lightbulb } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg" className="border-border">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-accent" />
          <h4 className="font-semibold text-foreground">Customize Offer Terms</h4>
        </div>
        <p className="text-small text-muted-foreground mb-6">
          Set default values for this package. These will auto-populate in your LOI.
        </p>

        {/* General Terms Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-small font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            General Terms
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-small">Earnest Money</Label>
              <div className="relative">
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
              <div className="flex gap-2">
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
                  value={terms.inspectionPeriodType || "business"}
                  onValueChange={(v) => onChange({ ...terms, inspectionPeriodType: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">business days</SelectItem>
                    <SelectItem value="calendar">calendar days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
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

        {/* Hybrid Structure Terms */}
        {showHybridTerms && (
          <div className="border-t pt-6 mt-6 space-y-4">
            <div className="flex items-center gap-2 text-small font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Hybrid Structure Terms
            </div>

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
        )}

        {/* Info Box */}
        <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-small text-warning">
            These values will auto-populate in your LOI document and can be adjusted when sending to specific properties.
          </p>
        </div>
      </Card>
    </div>
  );
}
