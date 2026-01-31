import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfferTerms, OfferType } from "./types";
import { DollarSign, Calendar, Clock, FileCheck } from "lucide-react";

interface OfferTermsSectionProps {
  terms: OfferTerms;
  offerType: OfferType;
  onChange: (terms: OfferTerms) => void;
}

export function OfferTermsSection({
  terms,
  offerType,
  onChange,
}: OfferTermsSectionProps) {
  const showCreativeTerms = ["seller_financing", "hybrid", "subject_to"].includes(offerType);
  const showNovationTerms = offerType === "novation";

  const updateField = <K extends keyof OfferTerms>(
    field: K,
    value: OfferTerms[K]
  ) => {
    onChange({ ...terms, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Deposit Section */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-success" />
          <h4 className="font-semibold text-foreground">Earnest Money Deposit</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amount</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={terms.depositAmount}
                onChange={(e) =>
                  updateField("depositAmount", Number(e.target.value))
                }
                className="flex-1"
              />
              <Select
                value={terms.depositType}
                onValueChange={(v) =>
                  updateField("depositType", v as "flat" | "percentage")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">$ Flat</SelectItem>
                  <SelectItem value="percentage">% of Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-tiny text-muted-foreground mt-1">
              {terms.depositType === "flat"
                ? `$${terms.depositAmount.toLocaleString()}`
                : `${terms.depositAmount}% of purchase price`}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline Section */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-info" />
          <h4 className="font-semibold text-foreground">Timeline</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label>Inspection Period</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                value={terms.inspectionPeriod}
                onChange={(e) =>
                  updateField("inspectionPeriod", Number(e.target.value))
                }
                className="flex-1"
              />
              <Select
                value={terms.inspectionDayType}
                onValueChange={(v) =>
                  updateField("inspectionDayType", v as "calendar" | "business")
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Offer Expires In</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={terms.offerExpiration}
                onChange={(e) =>
                  updateField("offerExpiration", Number(e.target.value))
                }
              />
              <span className="text-muted-foreground text-small">hours</span>
            </div>
          </div>

          <div>
            <Label>Closing Timeline</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={terms.closingTimeline}
                onChange={(e) =>
                  updateField("closingTimeline", Number(e.target.value))
                }
              />
              <span className="text-muted-foreground text-small">days</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Contingencies Section */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-5 w-5 text-warning" />
          <h4 className="font-semibold text-foreground">Contingencies</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-background-secondary rounded-md">
            <Label htmlFor="inspection-contingency" className="cursor-pointer">
              Inspection Contingency
            </Label>
            <Switch
              id="inspection-contingency"
              checked={terms.inspectionContingency}
              onCheckedChange={(checked) =>
                updateField("inspectionContingency", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-background-secondary rounded-md">
            <Label htmlFor="title-contingency" className="cursor-pointer">
              Title Contingency
            </Label>
            <Switch
              id="title-contingency"
              checked={terms.titleContingency}
              onCheckedChange={(checked) =>
                updateField("titleContingency", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-background-secondary rounded-md">
            <Label htmlFor="financing-contingency" className="cursor-pointer">
              Financing Contingency
            </Label>
            <Switch
              id="financing-contingency"
              checked={terms.financingContingency}
              onCheckedChange={(checked) =>
                updateField("financingContingency", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-background-secondary rounded-md">
            <Label htmlFor="appraisal-contingency" className="cursor-pointer">
              Appraisal Contingency
            </Label>
            <Switch
              id="appraisal-contingency"
              checked={terms.appraisalContingency}
              onCheckedChange={(checked) =>
                updateField("appraisalContingency", checked)
              }
            />
          </div>
        </div>
      </Card>

      {/* Creative Terms */}
      {showCreativeTerms && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-500" />
            <h4 className="font-semibold text-foreground">Financing Terms</h4>
            <Badge variant="secondary" size="sm">Creative</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {offerType !== "subject_to" && (
              <>
                <div>
                  <Label>Down Payment %</Label>
                  <Input
                    type="number"
                    value={terms.downPayment || 10}
                    onChange={(e) =>
                      updateField("downPayment", Number(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Interest Rate %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={terms.interestRate || 6}
                    onChange={(e) =>
                      updateField("interestRate", Number(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Term (Months)</Label>
                  <Input
                    type="number"
                    value={terms.termMonths || 360}
                    onChange={(e) =>
                      updateField("termMonths", Number(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Balloon (Months)</Label>
                  <Input
                    type="number"
                    value={terms.balloonMonths || 60}
                    onChange={(e) =>
                      updateField("balloonMonths", Number(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {offerType === "subject_to" && (
              <>
                <div>
                  <Label>Existing Loan Balance</Label>
                  <Input
                    type="number"
                    value={terms.existingLoanBalance || 0}
                    onChange={(e) =>
                      updateField("existingLoanBalance", Number(e.target.value))
                    }
                    className="mt-2"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <Label>Existing Monthly Payment</Label>
                  <Input
                    type="number"
                    value={terms.existingPayment || 0}
                    onChange={(e) =>
                      updateField("existingPayment", Number(e.target.value))
                    }
                    className="mt-2"
                    placeholder="$0"
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Novation Terms */}
      {showNovationTerms && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-accent" />
            <h4 className="font-semibold text-foreground">Novation Terms</h4>
            <Badge variant="info" size="sm">Novation</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Marketing Period (Days)</Label>
              <Input
                type="number"
                value={terms.marketingPeriod || 90}
                onChange={(e) =>
                  updateField("marketingPeriod", Number(e.target.value))
                }
                className="mt-2"
              />
              <p className="text-tiny text-muted-foreground mt-1">
                Time allowed to find a buyer
              </p>
            </div>
            <div>
              <Label>Profit Split %</Label>
              <Input
                type="number"
                value={terms.profitSplit || 50}
                onChange={(e) =>
                  updateField("profitSplit", Number(e.target.value))
                }
                className="mt-2"
              />
              <p className="text-tiny text-muted-foreground mt-1">
                Your percentage of the profit
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
