import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompResult, CompAdjustment, SubjectProperty } from "./types";

interface EditValues {
  sqftAdj: number;
  bedsAdj: number;
  bathsAdj: number;
  conditionAdj: number;
  poolAdj: number;
  garageAdj: number;
  customAdj: number;
  weight?: number;
}
import { defaultAdjustmentRates } from "./types";

interface CompAdjustmentsPanelProps {
  selectedComps: CompResult[];
  adjustments: Record<string, CompAdjustment>;
  subject?: SubjectProperty | null;
  onAdjustmentChange: (compId: string, adjustment: Partial<CompAdjustment>) => void;
  onRemoveComp: (compId: string) => void;
  onClearAll: () => void;
  onCalculateARV: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAdjustment(value: number): string {
  if (value === 0) return "—";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCurrency(value)}`;
}

export function CompAdjustmentsPanel({
  selectedComps,
  adjustments,
  subject,
  onAdjustmentChange,
  onRemoveComp,
  onClearAll,
  onCalculateARV,
}: CompAdjustmentsPanelProps) {
  const [editingCompId, setEditingCompId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<EditValues>({
    sqftAdj: 0,
    bedsAdj: 0,
    bathsAdj: 0,
    conditionAdj: 0,
    poolAdj: 0,
    garageAdj: 0,
    customAdj: 0,
  });

  // Calculate ARV summary
  const arvCalculation = React.useMemo(() => {
    if (selectedComps.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalSqft = 0;

    selectedComps.forEach((comp) => {
      const adj = adjustments[comp.id];
      const adjustedPrice = adj?.adjustedPrice || comp.salePrice;
      const weight = adj?.weight || 1;

      totalWeight += weight;
      weightedSum += adjustedPrice * weight;
      minPrice = Math.min(minPrice, adjustedPrice);
      maxPrice = Math.max(maxPrice, adjustedPrice);
      totalSqft += comp.sqft;
    });

    const arv = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const avgSqft = selectedComps.length > 0 ? totalSqft / selectedComps.length : 0;
    const pricePerSqft = avgSqft > 0 ? arv / (subject?.sqft || avgSqft) : 0;

    return {
      arv: Math.round(arv),
      low: Math.round(minPrice),
      high: Math.round(maxPrice),
      pricePerSqft: Math.round(pricePerSqft),
      count: selectedComps.length,
    };
  }, [selectedComps, adjustments, subject]);

  const startEditing = (compId: string) => {
    const current = adjustments[compId];
    setEditValues({
      sqftAdj: current?.sqftAdj ?? 0,
      bedsAdj: current?.bedsAdj ?? 0,
      bathsAdj: current?.bathsAdj ?? 0,
      conditionAdj: current?.conditionAdj ?? 0,
      poolAdj: current?.poolAdj ?? 0,
      garageAdj: current?.garageAdj ?? 0,
      customAdj: current?.customAdj ?? 0,
      weight: current?.weight ?? 1,
    });
    setEditingCompId(compId);
  };

  const saveEdit = () => {
    if (!editingCompId) return;
    onAdjustmentChange(editingCompId, editValues);
    setEditingCompId(null);
  };

  const cancelEdit = () => {
    setEditingCompId(null);
    setEditValues({
      sqftAdj: 0,
      bedsAdj: 0,
      bathsAdj: 0,
      conditionAdj: 0,
      poolAdj: 0,
      garageAdj: 0,
      customAdj: 0,
    });
  };

  if (selectedComps.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select comparable properties to calculate ARV
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected comps table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-surface-secondary">
          <h3 className="font-semibold">Selected ({selectedComps.length})</h3>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comp</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">$/SqFt</TableHead>
                <TableHead className="text-right">Adjustments</TableHead>
                <TableHead className="text-right">Adj. Price</TableHead>
                <TableHead className="text-center">Weight</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedComps.map((comp) => {
                const adj = adjustments[comp.id] || {
                  totalAdj: 0,
                  adjustedPrice: comp.salePrice,
                  weight: 1,
                };
                const isEditing = editingCompId === comp.id;

                return (
                  <TableRow key={comp.id}>
                    <TableCell>
                      <div className="font-medium truncate max-w-[150px]">
                        {comp.address}
                      </div>
                      <div className="text-tiny text-muted-foreground">
                        {comp.distance.toFixed(1)} mi
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(comp.salePrice)}
                    </TableCell>
                    <TableCell className="text-right">${comp.pricePerSqft}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        adj.totalAdj > 0 && "text-success",
                        adj.totalAdj < 0 && "text-destructive"
                      )}
                    >
                      {formatAdjustment(adj.totalAdj)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(adj.adjustedPrice)}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="2"
                          value={editValues.weight || adj.weight}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              weight: parseFloat(e.target.value) || 1,
                            }))
                          }
                          className="w-16 h-8 text-center"
                        />
                      ) : (
                        <span className="text-center block">{adj.weight}x</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={saveEdit}
                            >
                              <Check className="h-3.5 w-3.5 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={cancelEdit}
                            >
                              <X className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => startEditing(comp.id)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onRemoveComp(comp.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Adjustment editor */}
      {editingCompId && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">
            Adjustments for {selectedComps.find((c) => c.id === editingCompId)?.address}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "sqftAdj", label: "SqFt Adj" },
              { key: "bedsAdj", label: "Beds Adj" },
              { key: "bathsAdj", label: "Baths Adj" },
              { key: "conditionAdj", label: "Condition" },
              { key: "poolAdj", label: "Pool" },
              { key: "garageAdj", label: "Garage" },
              { key: "customAdj", label: "Custom" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-tiny">{label}</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-small">
                    $
                  </span>
                  <Input
                    type="number"
                    className="pl-7 h-9"
                    value={(editValues as any)[key] || 0}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        [key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <span className="text-small text-muted-foreground">
              Net Adjustment:{" "}
              {formatAdjustment(
                Object.values(editValues).reduce(
                  (sum, v) => sum + (typeof v === "number" ? v : 0),
                  0
                )
              )}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit}>
                Apply
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ARV Summary */}
      {arvCalculation && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h4 className="font-semibold mb-3">ARV Calculation</h4>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <div className="text-tiny text-muted-foreground">Weighted Avg ARV</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(arvCalculation.arv)}
              </div>
            </div>
            <div>
              <div className="text-tiny text-muted-foreground">Low</div>
              <div className="text-body font-semibold">
                {formatCurrency(arvCalculation.low)}
              </div>
            </div>
            <div>
              <div className="text-tiny text-muted-foreground">High</div>
              <div className="text-body font-semibold">
                {formatCurrency(arvCalculation.high)}
              </div>
            </div>
            <div>
              <div className="text-tiny text-muted-foreground">$/SqFt</div>
              <div className="text-body font-semibold">
                ${arvCalculation.pricePerSqft}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" className="flex-1">
              Save Comp Report
            </Button>
            <Button size="sm" className="flex-1" onClick={onCalculateARV}>
              Use This ARV
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
