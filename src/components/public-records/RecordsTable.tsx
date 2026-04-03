import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  Mail,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Plus,
  MapPin,
} from "lucide-react";
import { type PublicRecord } from "./public-records-data";
import { RECORD_CATEGORIES } from "./public-records-config";

interface RecordsTableProps {
  records: PublicRecord[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  onAddToPipeline: (record: PublicRecord) => void;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "h-2 w-2 rounded-full",
        score >= 80 ? "bg-red-400" : score >= 60 ? "bg-amber-400" : "bg-emerald-400"
      )} />
      <span className="tabular-nums font-medium text-small">{score}</span>
    </div>
  );
}

function FlagDots({ flags }: { flags: string[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {flags.slice(0, 5).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i < 2 ? "bg-red-400" : i < 4 ? "bg-amber-400" : "bg-emerald-400"
          )}
          title={flags[i]}
        />
      ))}
      {flags.length > 5 && (
        <span className="text-[9px] text-content-tertiary ml-0.5">+{flags.length - 5}</span>
      )}
    </div>
  );
}

const COLUMNS = [
  { id: "address", label: "Address", sortable: true, width: "flex-1 min-w-[200px]" },
  { id: "owner", label: "Owner", sortable: true, width: "w-[180px]" },
  { id: "category", label: "Category", sortable: true, width: "w-[140px]" },
  { id: "docType", label: "Doc Type", sortable: true, width: "w-[140px]" },
  { id: "filedDate", label: "Filed", sortable: true, width: "w-[90px]" },
  { id: "amountDue", label: "Amt Due", sortable: true, width: "w-[100px]" },
  { id: "sellerScore", label: "Score", sortable: true, width: "w-[70px]" },
  { id: "flags", label: "MS Flags", sortable: false, width: "w-[80px]" },
  { id: "actions", label: "", sortable: false, width: "w-[40px]" },
];

export function RecordsTable({
  records,
  selectedIds,
  onSelectionChange,
  sortField,
  sortDir,
  onSort,
  onAddToPipeline,
}: RecordsTableProps) {
  const allSelected = records.length > 0 && selectedIds.length === records.length;

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : records.map(r => r.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  };

  const getCategoryMeta = (cat: string) => {
    return RECORD_CATEGORIES.find(c => c.id === cat);
  };

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-0 px-3 py-2 bg-surface border-b border-border-subtle text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
        <div className="w-8 shrink-0">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
        </div>
        {COLUMNS.map(col => (
          <div
            key={col.id}
            className={cn("px-2 flex items-center gap-1", col.width, col.sortable && "cursor-pointer hover:text-content")}
            onClick={() => col.sortable && onSort(col.id)}
          >
            <span>{col.label}</span>
            {col.sortable && sortField === col.id && (
              sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            )}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-subtle max-h-[calc(100vh-320px)] overflow-y-auto">
        {records.map(record => {
          const catMeta = getCategoryMeta(record.category);
          const isSelected = selectedIds.includes(record.id);

          return (
            <div
              key={record.id}
              className={cn(
                "flex items-center gap-0 px-3 py-2.5 transition-colors hover:bg-surface-hover",
                isSelected && "bg-brand/5"
              )}
            >
              <div className="w-8 shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOne(record.id)}
                  className="h-3.5 w-3.5"
                />
              </div>

              {/* Address */}
              <div className="flex-1 min-w-[200px] px-2">
                <p className="text-small font-semibold text-content whitespace-nowrap truncate">
                  {record.address}
                </p>
                <p className="text-[11px] text-content-tertiary">
                  {record.city}, {record.state}
                </p>
              </div>

              {/* Owner */}
              <div className="w-[180px] px-2">
                <p className="text-small text-content truncate whitespace-nowrap">{record.owner}</p>
              </div>

              {/* Category */}
              <div className="w-[140px] px-2">
                {catMeta && (
                  <Badge variant="outline" size="sm" className={cn("text-[10px]", catMeta.color)}>
                    {catMeta.label.split(" / ")[0]}
                  </Badge>
                )}
              </div>

              {/* Doc Type */}
              <div className="w-[140px] px-2">
                <span className="text-tiny text-content-secondary whitespace-nowrap truncate block">
                  {record.docType}
                </span>
              </div>

              {/* Filed */}
              <div className="w-[90px] px-2">
                <span className="text-tiny text-content-secondary tabular-nums whitespace-nowrap">
                  {record.filedDate}
                </span>
              </div>

              {/* Amount Due */}
              <div className="w-[100px] px-2">
                <span className="text-small font-medium text-content tabular-nums whitespace-nowrap">
                  {record.amountDue
                    ? `$${record.amountDue.toLocaleString()}`
                    : "—"}
                </span>
              </div>

              {/* Score */}
              <div className="w-[70px] px-2">
                <ScoreBadge score={record.sellerScore} />
              </div>

              {/* Flags */}
              <div className="w-[80px] px-2">
                <FlagDots flags={record.flags} />
              </div>

              {/* Actions */}
              <div className="w-[40px] px-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onAddToPipeline(record)}
                  title="Add to Pipeline"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {records.length === 0 && (
          <div className="py-16 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-3 text-content-tertiary" />
            <p className="text-body font-medium text-content-secondary">No Records Found</p>
            <p className="text-small text-content-tertiary mt-1">Try adjusting your filters or search area</p>
          </div>
        )}
      </div>
    </div>
  );
}
