import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  Download,
  ArrowUpRight,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  format?: "number" | "currency" | "percentage" | "progress";
  sortable?: boolean;
}

interface AnalyticsTableProps {
  title?: string;
  columns: Column[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  onExport?: (format: "csv" | "pdf") => void;
  className?: string;
}

function formatValue(value: any, format?: string): React.ReactNode {
  if (value === null || value === undefined) return "—";

  switch (format) {
    case "currency":
      return `$${Number(value).toLocaleString()}`;
    case "percentage":
      return `${Number(value).toFixed(1)}%`;
    case "progress":
      const percent = Number(value);
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-accent rounded-full transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <span className="text-tiny text-content-secondary w-10 text-right tabular-nums">
            {percent.toFixed(0)}%
          </span>
        </div>
      );
    default:
      return typeof value === "number" ? value.toLocaleString() : value;
  }
}

export function AnalyticsTable({
  title,
  columns,
  data,
  onRowClick,
  onExport,
  className,
}: AnalyticsTableProps) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDirection]);

  return (
    <Card variant="default" padding="none" className={className}>
      {/* Header */}
      {(title || onExport) && (
        <div className="px-md py-4 border-b border-border-subtle flex items-center justify-between">
          {title && <h3 className="text-h3 font-medium text-content">{title}</h3>}
          {onExport && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExport("csv")}
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExport("pdf")}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-secondary/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-tiny font-medium uppercase tracking-wide text-content-secondary",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sortable && "cursor-pointer hover:text-content transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}
                  >
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {onRowClick && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "h-12 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30",
                  onRowClick && "cursor-pointer hover:bg-brand-accent/5"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 text-body",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.format === "number" || col.format === "currency" || col.format === "percentage"
                        ? "tabular-nums"
                        : ""
                    )}
                  >
                    {formatValue(row[col.key], col.format)}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-4">
                    <ArrowUpRight className="h-4 w-4 text-content-tertiary" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-body text-content-secondary">No data available</p>
        </div>
      )}
    </Card>
  );
}
