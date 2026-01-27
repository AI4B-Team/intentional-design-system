import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Home,
  Plus,
  Download,
  Calculator,
  CheckCircle,
  Trash2,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  useRentComps,
  useCreateRentComp,
  useDeleteRentComp,
  calculateRentAnalysis,
  calculateQuickRentEstimate,
} from "@/hooks/useRentComps";
import { AddRentCompModal } from "./add-rent-comp-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RentalAnalysisCardProps {
  propertyId: string;
  propertyValue: number | null;
  propertySqft: number | null;
  estimatedRent: number | null;
  onSetEstimatedRent: (rent: number, confidence: string, source: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function RentalAnalysisCard({
  propertyId,
  propertyValue,
  propertySqft,
  estimatedRent,
  onSetEstimatedRent,
}: RentalAnalysisCardProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showQuickEstimate, setShowQuickEstimate] = React.useState(false);
  const [manualRent, setManualRent] = React.useState("");

  const { data: rentComps = [], isLoading } = useRentComps(propertyId);
  const createRentComp = useCreateRentComp();
  const deleteRentComp = useDeleteRentComp();

  const analysis = React.useMemo(
    () => calculateRentAnalysis(rentComps, propertySqft),
    [rentComps, propertySqft]
  );

  const quickEstimate = propertyValue ? calculateQuickRentEstimate(propertyValue) : null;

  // Check 1% rule
  const meetsOnePercentRule = estimatedRent && propertyValue
    ? estimatedRent >= propertyValue / 100
    : null;

  // Simple cash flow estimate
  const roughPITI = propertyValue ? propertyValue * 0.007 : 0;
  const potentialCashFlow = estimatedRent ? estimatedRent - roughPITI : null;

  const handleAddComp = (data: any) => {
    createRentComp.mutate(data, {
      onSuccess: () => setShowAddModal(false),
    });
  };

  const handleApplyQuickEstimate = () => {
    if (quickEstimate) {
      onSetEstimatedRent(quickEstimate, "LOW", "1% Rule Estimate");
      setShowQuickEstimate(false);
      toast.success("Quick estimate applied");
    }
  };

  const handleApplyManualRent = () => {
    const rent = parseFloat(manualRent);
    if (rent > 0) {
      onSetEstimatedRent(rent, "LOW", "Manual Entry");
      setManualRent("");
      toast.success("Rent estimate applied");
    }
  };

  const handleApplyAnalysis = () => {
    if (analysis) {
      onSetEstimatedRent(analysis.recommendedRent, analysis.confidence, `${analysis.compCount} Rent Comps`);
      toast.success("Rent estimate applied from comps");
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "HIGH":
        return <Badge variant="success">High Confidence</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium Confidence</Badge>;
      default:
        return <Badge variant="secondary">Low Confidence</Badge>;
    }
  };

  return (
    <>
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-brand-accent" />
            <h3 className="text-body font-semibold">Rental Analysis</h3>
          </div>
          {estimatedRent && (
            <div className="flex items-center gap-2">
              <span className="text-h3 font-bold text-success">
                {formatCurrency(estimatedRent)}/mo
              </span>
              {meetsOnePercentRule !== null && (
                <Badge variant={meetsOnePercentRule ? "success" : "warning"} size="sm">
                  {meetsOnePercentRule ? "✓ 1% Rule" : "Below 1%"}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Current Rent Summary if set */}
        {estimatedRent && potentialCashFlow !== null && (
          <div className="p-3 bg-success/5 border border-success/20 rounded-lg mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-tiny text-muted-foreground">Est. Rent</div>
                <div className="text-body font-semibold">{formatCurrency(estimatedRent)}</div>
              </div>
              <div>
                <div className="text-tiny text-muted-foreground">Est. PITI</div>
                <div className="text-body font-semibold">-{formatCurrency(roughPITI)}</div>
              </div>
              <div>
                <div className="text-tiny text-muted-foreground">Cash Flow</div>
                <div className={cn(
                  "text-body font-semibold",
                  potentialCashFlow >= 0 ? "text-success" : "text-destructive"
                )}>
                  {formatCurrency(potentialCashFlow)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No comps state */}
        {rentComps.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No rent comps yet. Estimate rental income to analyze cash flow.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Download />}
                onClick={() => toast.info("Rent data API integration coming soon")}
              >
                Fetch Rent Comps
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus />}
                onClick={() => setShowAddModal(true)}
              >
                Enter Manually
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Calculator />}
                onClick={() => setShowQuickEstimate(true)}
              >
                Quick Estimate
              </Button>
            </div>

            {/* Quick Estimate Panel */}
            {showQuickEstimate && quickEstimate && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <h4 className="font-medium mb-2">Quick Rent Estimate (1% Rule)</h4>
                <div className="text-small text-muted-foreground mb-3">
                  Property Value × 1% = Estimated Monthly Rent
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <span className="text-muted-foreground">
                      {formatCurrency(propertyValue || 0)} × 1% =
                    </span>
                    <span className="text-h3 font-bold text-success ml-2">
                      {formatCurrency(quickEstimate)}/mo
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleApplyQuickEstimate}>
                    Apply Estimate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowQuickEstimate(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Rent Entry */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Input
                type="number"
                placeholder="Enter rent manually"
                value={manualRent}
                onChange={setManualRent}
                className="w-40"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyManualRent}
                disabled={!manualRent}
              >
                Set Rent
              </Button>
            </div>
          </div>
        )}

        {/* Comps exist - show analysis */}
        {rentComps.length > 0 && (
          <>
            {/* Analysis Summary */}
            {analysis && (
              <div className="p-4 bg-info/5 border border-info/20 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-info" />
                    Rent Analysis
                  </h4>
                  {getConfidenceBadge(analysis.confidence)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-tiny text-muted-foreground">Rent Range</div>
                    <div className="font-semibold">
                      {formatCurrency(analysis.rentRange.min)} - {formatCurrency(analysis.rentRange.max)}
                    </div>
                  </div>
                  <div>
                    <div className="text-tiny text-muted-foreground">Recommended</div>
                    <div className="font-semibold text-success">
                      {formatCurrency(analysis.recommendedRent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-tiny text-muted-foreground">Avg $/SqFt</div>
                    <div className="font-semibold">${analysis.avgPerSqFt.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-tiny text-muted-foreground">Comps Used</div>
                    <div className="font-semibold">{analysis.compCount}</div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  icon={<CheckCircle />}
                  onClick={handleApplyAnalysis}
                >
                  Set Estimated Rent to {formatCurrency(analysis.recommendedRent)}
                </Button>
              </div>
            )}

            {/* Comps Table */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-small font-medium">Rent Comps</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus />}
                  onClick={() => setShowAddModal(true)}
                >
                  Add Comp
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Rent</TableHead>
                      <TableHead className="text-center">Beds/Baths</TableHead>
                      <TableHead className="text-right">SqFt</TableHead>
                      <TableHead className="text-right">$/SqFt</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentComps.map((comp) => (
                      <TableRow key={comp.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {comp.comp_address}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {comp.rent_amount ? formatCurrency(comp.rent_amount) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {comp.beds || "-"}/{comp.baths || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {comp.sqft?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {comp.rent_amount && comp.sqft
                            ? `$${(comp.rent_amount / comp.sqft).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {comp.distance_miles ? `${comp.distance_miles} mi` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {comp.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              deleteRentComp.mutate({ id: comp.id, propertyId })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* STR Potential Placeholder */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-small font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                STR Potential
              </h4>
              <p className="text-tiny text-muted-foreground">
                Short-term rental analysis coming soon
              </p>
            </div>
            {estimatedRent && (
              <div className="text-right">
                <div className="text-tiny text-muted-foreground">Estimated STR</div>
                <div className="font-semibold text-success">
                  {formatCurrency(Math.round(estimatedRent * 1.5))}/mo
                </div>
                <div className="text-tiny text-muted-foreground">
                  (1.5× LTR estimate)
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <AddRentCompModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        propertyId={propertyId}
        onSave={handleAddComp}
        isLoading={createRentComp.isPending}
      />
    </>
  );
}
