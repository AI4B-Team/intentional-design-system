import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  FileText,
  Info,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStateRegulations,
  useRunComplianceCheck,
  useSaveComplianceCheck,
} from "@/hooks/useCompliance";
import {
  type ComplianceResult,
  type DealType,
  type DealTerms,
  getDealTypeLabel,
  getComplianceScore,
  getComplianceStatus,
} from "@/lib/compliance";

interface ComplianceCheckCardProps {
  dealType: DealType;
  terms: DealTerms;
  propertyId?: string;
  initialState?: string;
}

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export function ComplianceCheckCard({
  dealType,
  terms,
  propertyId,
  initialState,
}: ComplianceCheckCardProps) {
  const [selectedState, setSelectedState] = React.useState(initialState || "");
  const [result, setResult] = React.useState<ComplianceResult | null>(null);
  const [showDisclosures, setShowDisclosures] = React.useState(false);
  const [showRecommendations, setShowRecommendations] = React.useState(false);
  const [checkedDisclosures, setCheckedDisclosures] = React.useState<Set<string>>(new Set());

  const { data: regulations, isLoading: loadingRegulations } = useStateRegulations();
  const { runCheck, isLoading: checkLoading } = useRunComplianceCheck();
  const saveCheck = useSaveComplianceCheck();

  const hasRegulation = React.useMemo(() => {
    if (!regulations || !selectedState) return false;
    return regulations.some(r => r.state_code === selectedState);
  }, [regulations, selectedState]);

  const handleCheck = () => {
    if (!selectedState) return;
    const checkResult = runCheck(selectedState, dealType, terms);
    setResult(checkResult);
  };

  const handleSave = () => {
    if (!result || !selectedState) return;
    saveCheck.mutate({
      propertyId,
      checkType: dealType,
      state: selectedState,
      dealTerms: terms,
      result,
    });
  };

  const toggleDisclosure = (disclosure: string) => {
    setCheckedDisclosures(prev => {
      const next = new Set(prev);
      if (next.has(disclosure)) {
        next.delete(disclosure);
      } else {
        next.add(disclosure);
      }
      return next;
    });
  };

  const status = result ? getComplianceStatus(result) : null;
  const score = result ? getComplianceScore(result) : null;

  const getStatusIcon = () => {
    if (!status) return null;
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    switch (status) {
      case "pass":
        return <Badge variant="success">Compliant</Badge>;
      case "warning":
        return <Badge variant="warning">Warnings</Badge>;
      case "fail":
        return <Badge variant="destructive">Issues Found</Badge>;
    }
  };

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-accent" />
          <h3 className="text-body font-semibold">Compliance Check</h3>
        </div>
        {result && getStatusBadge()}
      </div>

      {/* State Selection */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {US_STATES.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name} ({state.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="primary"
          onClick={handleCheck}
          disabled={!selectedState || checkLoading}
        >
          {checkLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Check Compliance
        </Button>
      </div>

      {/* No result yet */}
      {!result && selectedState && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Click "Check Compliance" to verify your {getDealTypeLabel(dealType)} terms against {selectedState} regulations.</p>
          {!hasRegulation && (
            <p className="text-warning mt-2 text-small">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              No specific data for {selectedState}. General guidelines will be provided.
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Status Summary */}
          <div
            className={cn(
              "p-4 rounded-lg border flex items-center justify-between",
              status === "pass" && "bg-success/5 border-success/20",
              status === "warning" && "bg-warning/5 border-warning/20",
              status === "fail" && "bg-destructive/5 border-destructive/20"
            )}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h4 className="font-semibold">
                  {status === "pass" && `Terms comply with ${selectedState} regulations`}
                  {status === "warning" && "Compliance with warnings"}
                  {status === "fail" && "Compliance issues found"}
                </h4>
                <p className="text-small text-muted-foreground">
                  {result.errors.length} errors, {result.warnings.length} warnings
                </p>
              </div>
            </div>
            {score !== null && (
              <div className="text-right">
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-tiny text-muted-foreground">Score</div>
              </div>
            )}
          </div>

          {/* State Info */}
          {result.state_info.usury_limit !== null && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-muted rounded">
                <div className="text-tiny text-muted-foreground">Usury Limit</div>
                <div className="font-semibold">{result.state_info.usury_limit}%</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-tiny text-muted-foreground">Foreclosure</div>
                <div className="font-semibold capitalize">{result.state_info.foreclosure_type || "—"}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="text-tiny text-muted-foreground">Redemption</div>
                <div className="font-semibold">
                  {result.state_info.redemption_period 
                    ? `${result.state_info.redemption_period} days`
                    : "None"}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-small font-medium text-destructive flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Issues ({result.errors.length})
              </h4>
              {result.errors.map((error, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                >
                  <div className="font-medium text-destructive">{error.message}</div>
                  <div className="text-small text-muted-foreground mt-1">
                    Reference: {error.regulation_reference}
                  </div>
                  {error.how_to_fix && (
                    <div className="mt-2 p-2 bg-background rounded text-small">
                      <span className="font-medium">How to Fix:</span> {error.how_to_fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-small font-medium text-warning flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warnings ({result.warnings.length})
              </h4>
              {result.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border",
                    warning.severity === "high" && "bg-warning/10 border-warning/30",
                    warning.severity === "medium" && "bg-warning/5 border-warning/20",
                    warning.severity === "low" && "bg-muted border-border"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={warning.severity === "high" ? "warning" : "secondary"}
                      size="sm"
                    >
                      {warning.severity}
                    </Badge>
                    <span className="text-small">{warning.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Required Disclosures */}
          <Collapsible open={showDisclosures} onOpenChange={setShowDisclosures}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Required Disclosures ({result.required_disclosures.length})
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showDisclosures && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                {result.required_disclosures.map((disclosure, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checkedDisclosures.has(disclosure)}
                      onChange={() => toggleDisclosure(disclosure)}
                      className="rounded border-border"
                    />
                    <span className={cn(
                      "text-small",
                      checkedDisclosures.has(disclosure) && "line-through text-muted-foreground"
                    )}>
                      {disclosure}
                    </span>
                  </label>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {/* Placeholder */}}
                >
                  Generate Disclosure Documents
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Collapsible open={showRecommendations} onOpenChange={setShowRecommendations}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Recommendations ({result.recommendations.length})
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showRecommendations && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-2 p-3 bg-info/5 border border-info/20 rounded-lg">
                  {result.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-small">{rec}</p>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Save />}
              onClick={handleSave}
              disabled={saveCheck.isPending}
            >
              Save Compliance Check
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
