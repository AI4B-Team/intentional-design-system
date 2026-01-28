import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstimateSummary as EstimateSummaryType, RepairCategory } from "./types";

interface EstimateSummaryProps {
  summary: EstimateSummaryType;
  onContingencyChange: (pct: number) => void;
  onSave: () => void;
  onUseInAnalysis?: () => void;
  isSaving?: boolean;
  sqft?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function EstimateSummary({
  summary,
  onContingencyChange,
  onSave,
  onUseInAnalysis,
  isSaving,
  sqft,
}: EstimateSummaryProps) {
  return (
    <Card className="p-4 sticky top-4">
      <h3 className="font-semibold text-center mb-4 pb-3 border-b">
        ESTIMATE SUMMARY
      </h3>

      {/* Category breakdown */}
      <div className="space-y-2 mb-4">
        {summary.categoryTotals
          .filter((c) => c.total > 0)
          .map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between text-small"
            >
              <span className="text-muted-foreground">{cat.category}:</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(cat.total)}
              </span>
            </div>
          ))}
      </div>

      {/* Subtotal */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center justify-between text-small">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium tabular-nums">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {/* Contingency */}
        <div className="flex items-center justify-between text-small">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Contingency</span>
            <Select
              value={summary.contingencyPct.toString()}
              onValueChange={(v) => onContingencyChange(parseInt(v))}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="font-medium tabular-nums">
            {formatCurrency(summary.contingencyAmount)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t mt-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-bold">TOTAL:</span>
          <span className="text-xl font-bold text-primary tabular-nums">
            {formatCurrency(summary.total)}
          </span>
        </div>
        {summary.perSqft !== null && (
          <div className="text-right text-small text-muted-foreground mt-1">
            ${summary.perSqft.toFixed(2)}/sqft
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-6">
        <Button
          className="w-full"
          onClick={onSave}
          disabled={isSaving}
          icon={<Save />}
        >
          {isSaving ? "Saving..." : "Save Estimate"}
        </Button>
        {onUseInAnalysis && (
          <Button variant="secondary" className="w-full" onClick={onUseInAnalysis}>
            Use in Analysis
          </Button>
        )}
      </div>

      {/* Export */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button variant="ghost" size="sm" className="flex-1">
          <FileText className="h-3.5 w-3.5 mr-1" />
          PDF
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
          Excel
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <Printer className="h-3.5 w-3.5 mr-1" />
          Print
        </Button>
      </div>
    </Card>
  );
}
