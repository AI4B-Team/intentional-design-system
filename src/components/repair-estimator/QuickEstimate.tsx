import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Calculator, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPAIR_SCOPES, type RepairScope } from "./types";

interface QuickEstimateProps {
  initialSqft?: number;
  initialScope?: RepairScope;
  onUseEstimate?: (estimate: QuickEstimateResult) => void;
  onCreateDetailed?: (sqft: number, scope: RepairScope) => void;
}

export interface QuickEstimateResult {
  sqft: number;
  scope: RepairScope;
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  contingencyPct: number;
  contingencyAmount: number;
  total: number;
  perSqft: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuickEstimate({
  initialSqft = 1850,
  initialScope = "medium",
  onUseEstimate,
  onCreateDetailed,
}: QuickEstimateProps) {
  const [sqft, setSqft] = React.useState(initialSqft);
  const [scope, setScope] = React.useState<RepairScope>(initialScope);
  const [contingencyPct, setContingencyPct] = React.useState(10);

  const scopeDef = REPAIR_SCOPES.find((s) => s.value === scope)!;
  const midPerSqft = (scopeDef.lowPerSqft + scopeDef.highPerSqft) / 2;

  const lowEstimate = sqft * scopeDef.lowPerSqft;
  const midEstimate = sqft * midPerSqft;
  const highEstimate = sqft * scopeDef.highPerSqft;
  const contingencyAmount = midEstimate * (contingencyPct / 100);
  const total = midEstimate + contingencyAmount;
  const perSqft = sqft > 0 ? total / sqft : 0;

  const handleUseEstimate = () => {
    onUseEstimate?.({
      sqft,
      scope,
      lowEstimate,
      midEstimate,
      highEstimate,
      contingencyPct,
      contingencyAmount,
      total,
      perSqft,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Inputs */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Property Details</h3>

        <div className="space-y-6">
          {/* Square footage */}
          <div>
            <Label htmlFor="quick-sqft">Property Square Footage</Label>
            <Input
              id="quick-sqft"
              type="number"
              value={sqft}
              onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
              className="mt-1.5"
              placeholder="1850"
            />
          </div>

          {/* Scope selection */}
          <div>
            <Label className="mb-3 block">Rehab Scope</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as RepairScope)}
              className="space-y-2"
            >
              {REPAIR_SCOPES.map((s) => (
                <div
                  key={s.value}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    scope === s.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-surface-secondary/50"
                  )}
                  onClick={() => setScope(s.value)}
                >
                  <RadioGroupItem value={s.value} id={s.value} />
                  <div className="flex-1">
                    <label
                      htmlFor={s.value}
                      className="font-medium cursor-pointer flex items-center justify-between"
                    >
                      <span>{s.label}</span>
                      <span className="text-small text-muted-foreground">
                        ${s.lowPerSqft}-${s.highPerSqft}/sqft
                      </span>
                    </label>
                    <p className="text-small text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Contingency slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Contingency</Label>
              <span className="text-small font-medium">{contingencyPct}%</span>
            </div>
            <Slider
              value={[contingencyPct]}
              onValueChange={([v]) => setContingencyPct(v)}
              min={0}
              max={25}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-tiny text-muted-foreground mt-1">
              <span>0%</span>
              <span>25%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Right: Results */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Estimate</h3>
        </div>

        <div className="space-y-4">
          {/* Range display */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-background rounded-lg">
              <div className="text-tiny text-muted-foreground mb-1">Low</div>
              <div className="font-semibold">{formatCurrency(lowEstimate)}</div>
              <div className="text-tiny text-muted-foreground">
                ${scopeDef.lowPerSqft}/sqft
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg border-2 border-primary">
              <div className="text-tiny text-muted-foreground mb-1">Mid</div>
              <div className="font-bold text-primary">{formatCurrency(midEstimate)}</div>
              <div className="text-tiny text-muted-foreground">
                ${midPerSqft.toFixed(1)}/sqft
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-tiny text-muted-foreground mb-1">High</div>
              <div className="font-semibold">{formatCurrency(highEstimate)}</div>
              <div className="text-tiny text-muted-foreground">
                ${scopeDef.highPerSqft}/sqft
              </div>
            </div>
          </div>

          {/* Contingency */}
          <div className="flex items-center justify-between py-3 border-t border-primary/20">
            <span className="text-muted-foreground">
              Contingency ({contingencyPct}%)
            </span>
            <span className="font-medium">{formatCurrency(contingencyAmount)}</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t border-primary/20">
            <span className="font-semibold text-lg">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(total)}
              </div>
              <div className="text-small text-muted-foreground">
                ${perSqft.toFixed(2)}/sqft
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleUseEstimate}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Use Estimate
            </Button>
            <Button
              className="flex-1"
              onClick={() => onCreateDetailed?.(sqft, scope)}
            >
              Create Detailed
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
