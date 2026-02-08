import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  FileText,
  Info,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceWarning {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  howToFix?: string;
  link?: string;
}

interface StateDisclosure {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

interface ComplianceWarningsProps {
  state: string;
  offerType: string;
  offerAmount: number;
  warnings: ComplianceWarning[];
  disclosures: StateDisclosure[];
  allCleared: boolean;
  onViewDetails?: () => void;
}

// Mock compliance data by state
const STATE_COMPLIANCE_DATA: Record<string, { warnings: ComplianceWarning[]; disclosures: StateDisclosure[] }> = {
  TX: {
    warnings: [],
    disclosures: [
      { id: "tx1", name: "Seller's Disclosure Notice", required: true, description: "Required for residential properties" },
      { id: "tx2", name: "Lead-Based Paint Disclosure", required: true, description: "Required for homes built before 1978" },
      { id: "tx3", name: "MUD/PID Disclosure", required: false, description: "If property is in a special taxing district" },
    ],
  },
  FL: {
    warnings: [
      { id: "fl_w1", type: "info", title: "As-Is Contract Notice", description: "Florida requires specific as-is language for investment purchases" },
    ],
    disclosures: [
      { id: "fl1", name: "Seller's Property Disclosure", required: true, description: "Required for residential sales" },
      { id: "fl2", name: "Radon Gas Disclosure", required: true, description: "Required for all real property transactions" },
      { id: "fl3", name: "Coastal Construction Control Line", required: false, description: "If property is near coast" },
    ],
  },
  CA: {
    warnings: [
      { id: "ca_w1", type: "warning", title: "Additional Disclosures Required", description: "California requires extensive seller disclosures including TDS, NHD, and more" },
    ],
    disclosures: [
      { id: "ca1", name: "Transfer Disclosure Statement (TDS)", required: true, description: "Comprehensive property condition disclosure" },
      { id: "ca2", name: "Natural Hazard Disclosure (NHD)", required: true, description: "Flood zones, earthquake faults, fire hazards" },
      { id: "ca3", name: "Megan's Law Disclosure", required: true, description: "Required for all residential sales" },
      { id: "ca4", name: "Statewide Buyer & Seller Advisory", required: true, description: "General advisory document" },
    ],
  },
};

export function ComplianceWarnings({
  state,
  offerType,
  offerAmount,
  onViewDetails,
}: ComplianceWarningsProps) {
  const stateData = STATE_COMPLIANCE_DATA[state] || { warnings: [], disclosures: [] };
  const { warnings, disclosures } = stateData;
  
  const hasErrors = warnings.some((w) => w.type === "error");
  const hasWarnings = warnings.some((w) => w.type === "warning");
  const requiredDisclosures = disclosures.filter((d) => d.required);

  return (
    <Card className={cn(
      "p-4",
      hasErrors && "border-destructive/50 bg-destructive/5",
      !hasErrors && hasWarnings && "border-warning/50 bg-warning/5",
      !hasErrors && !hasWarnings && "border-success/50 bg-success/5"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          hasErrors ? "bg-destructive/10" : hasWarnings ? "bg-warning/10" : "bg-success/10"
        )}>
          {hasErrors ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : hasWarnings ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <Shield className="h-5 w-5 text-success" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">
                {state} Compliance Check
              </h4>
              <Badge
                variant={hasErrors ? "destructive" : hasWarnings ? "warning" : "success"}
                size="sm"
              >
                {hasErrors ? "Issues Found" : hasWarnings ? "Review Required" : "All Clear"}
              </Badge>
            </div>
            {onViewDetails && (
              <Button variant="ghost" size="sm" onClick={onViewDetails} className="gap-1">
                Details
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {warnings.map((warning) => (
                <div
                  key={warning.id}
                  className={cn(
                    "p-2 rounded-lg text-sm",
                    warning.type === "error" && "bg-destructive/10 border border-destructive/20",
                    warning.type === "warning" && "bg-warning/10 border border-warning/20",
                    warning.type === "info" && "bg-info/10 border border-info/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {warning.type === "error" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    ) : warning.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{warning.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{warning.description}</p>
                      {warning.howToFix && (
                        <p className="text-xs mt-1">
                          <span className="font-medium">How to fix:</span> {warning.howToFix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Required Disclosures */}
          {requiredDisclosures.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Required Disclosures ({requiredDisclosures.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {requiredDisclosures.map((disclosure) => (
                  <Badge key={disclosure.id} variant="outline" size="sm" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {disclosure.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* All Clear Message */}
          {!hasErrors && !hasWarnings && (
            <div className="flex items-center gap-2 mt-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your offer complies with {state} regulations</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function getComplianceData(state: string) {
  return STATE_COMPLIANCE_DATA[state] || { warnings: [], disclosures: [] };
}
