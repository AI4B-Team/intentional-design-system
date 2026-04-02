import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditableMetrics } from "./types";

interface EditableMetricsPanelProps {
  metrics: EditableMetrics;
  onChange: (metrics: EditableMetrics) => void;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
}

function parseNumber(value: string): number {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

const metricFields: { key: keyof EditableMetrics; label: string; description: string }[] = [
  { key: "arv", label: "ARV", description: "After Repair Value" },
  { key: "asIsValue", label: "As-Is Value", description: "Current market value" },
  { key: "mortgageBalance", label: "Mortgage Balance", description: "Remaining loan balance" },
  { key: "repairEstimate", label: "Repair Estimate", description: "Estimated rehab costs" },
];

export function EditableMetricsPanel({ metrics, onChange }: EditableMetricsPanelProps) {
  const [editingField, setEditingField] = React.useState<keyof EditableMetrics | null>(null);
  const [tempValue, setTempValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleStartEdit = (key: keyof EditableMetrics) => {
    setEditingField(key);
    setTempValue(metrics[key].toString());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = (key: keyof EditableMetrics) => {
    onChange({ ...metrics, [key]: parseNumber(tempValue) });
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof EditableMetrics) => {
    if (e.key === "Enter") handleSave(key);
    if (e.key === "Escape") setEditingField(null);
  };

  return (
    <Card className="p-4">
      <h4 className="text-small font-semibold text-foreground mb-3 flex items-center gap-2">
        <Pencil className="h-3.5 w-3.5 text-primary" />
        Editable Metrics
        <span className="text-tiny text-muted-foreground font-normal">(click to override)</span>
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {metricFields.map(({ key, label, description }) => (
          <div
            key={key}
            onClick={() => editingField !== key && handleStartEdit(key)}
            className={cn(
              "p-3 rounded-lg border transition-all cursor-pointer group",
              editingField === key
                ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                : "border-border-subtle hover:border-primary/40 hover:bg-surface-secondary/30"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <Label className="text-tiny text-muted-foreground">{label}</Label>
              {editingField === key ? (
                <button onClick={(e) => { e.stopPropagation(); handleSave(key); }}>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                </button>
              ) : (
                <Pencil className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-opacity" />
              )}
            </div>
            
            {editingField === key ? (
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={formatNumber(tempValue)}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  onBlur={() => handleSave(key)}
                  className="h-8 pl-7 text-sm font-semibold"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <div className="font-semibold text-foreground tabular-nums">{fmt(metrics[key])}</div>
            )}
            <div className="text-[10px] text-muted-foreground mt-0.5">{description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
