import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DollarSign, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { DealInput, CalculatorType } from "./types";
import { cn } from "@/lib/utils";

interface DealInputFormProps {
  data: DealInput;
  onChange: (data: Partial<DealInput>) => void;
  calculatorType: CalculatorType;
}

const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "fourplex", label: "Fourplex" },
  { value: "land", label: "Land" },
];

export function DealInputForm({ data, onChange, calculatorType }: DealInputFormProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? Number(num).toLocaleString() : "";
  };

  const parseNumber = (value: string) => {
    return Number(value.replace(/[^0-9]/g, "")) || 0;
  };

  const showRentalFields = ["rental", "brrrr", "str"].includes(calculatorType);
  const showRepairFields = ["flip", "brrrr", "wholesale"].includes(calculatorType);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Deal Details</h3>
      </div>

      <div className="space-y-4">
        {/* Core Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="askingPrice" className="text-small">Asking Price *</Label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="askingPrice"
                className="pl-9"
                placeholder="250,000"
                value={data.askingPrice ? formatNumber(data.askingPrice.toString()) : ""}
                onChange={(e) => onChange({ askingPrice: parseNumber(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="arv" className="text-small">ARV (After Repair Value)</Label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="arv"
                className="pl-9"
                placeholder="350,000"
                value={data.arv ? formatNumber(data.arv.toString()) : ""}
                onChange={(e) => onChange({ arv: parseNumber(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {showRepairFields && (
          <div>
            <Label htmlFor="repairEstimate" className="text-small">Repair Estimate</Label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="repairEstimate"
                className="pl-9"
                placeholder="45,000"
                value={data.repairEstimate ? formatNumber(data.repairEstimate.toString()) : ""}
                onChange={(e) => onChange({ repairEstimate: parseNumber(e.target.value) })}
              />
            </div>
          </div>
        )}

        {showRentalFields && (
          <div>
            <Label htmlFor="monthlyRent" className="text-small">
              {calculatorType === "str" ? "Est. Monthly Revenue" : "Monthly Rent"}
            </Label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="monthlyRent"
                className="pl-9"
                placeholder={calculatorType === "str" ? "4,500" : "2,200"}
                value={data.monthlyRent ? formatNumber(data.monthlyRent.toString()) : ""}
                onChange={(e) => onChange({ monthlyRent: parseNumber(e.target.value) })}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="propertyType" className="text-small">Property Type</Label>
          <Select
            value={data.propertyType}
            onValueChange={(v) => onChange({ propertyType: v })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Fields */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              Advanced Options
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="beds" className="text-small">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  className="mt-1.5"
                  placeholder="3"
                  value={data.beds || ""}
                  onChange={(e) => onChange({ beds: Number(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="baths" className="text-small">Baths</Label>
                <Input
                  id="baths"
                  type="number"
                  step="0.5"
                  className="mt-1.5"
                  placeholder="2"
                  value={data.baths || ""}
                  onChange={(e) => onChange({ baths: Number(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="sqft" className="text-small">Sq Ft</Label>
                <Input
                  id="sqft"
                  type="number"
                  className="mt-1.5"
                  placeholder="1,800"
                  value={data.sqft || ""}
                  onChange={(e) => onChange({ sqft: Number(e.target.value) || undefined })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="yearBuilt" className="text-small">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                className="mt-1.5"
                placeholder="1995"
                value={data.yearBuilt || ""}
                onChange={(e) => onChange({ yearBuilt: Number(e.target.value) || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-small">Notes</Label>
              <Textarea
                id="notes"
                className="mt-1.5"
                placeholder="Additional details about the property, seller motivation, condition..."
                value={data.notes || ""}
                onChange={(e) => onChange({ notes: e.target.value })}
                rows={3}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
