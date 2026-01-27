import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Phone,
  Trash2,
  Mail,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, parseISO, format } from "date-fns";
import type { DealSource } from "@/hooks/useDealSources";

interface DealSourcesTableProps {
  data: DealSource[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onLogContact: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeColors: Record<string, string> = {
  agent: "bg-info/10 text-info",
  wholesaler: "bg-success/10 text-success",
  lender: "bg-brand-accent/10 text-brand-accent",
};

const statusColors: Record<string, string> = {
  cold: "bg-surface-secondary text-content-tertiary",
  contacted: "bg-info/10 text-info",
  responded: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  inactive: "bg-destructive/10 text-destructive",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(value: number | null): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealSourcesTable({
  data,
  isLoading,
  selectedIds,
  onSelect,
  onSelectAll,
  onLogContact,
  onDelete,
}: DealSourcesTableProps) {
  const navigate = useNavigate();
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-secondary/50 rounded-medium border border-border-subtle">
        <p className="text-body text-content-secondary mb-2">No deal sources found</p>
        <p className="text-small text-content-tertiary">
          Add your first agent, wholesaler, or lender to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-medium border border-border-subtle overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Name
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Type
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Company
              </th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Status
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Contact
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Sent
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Closed
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Conv %
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Profit
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Last Contact
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                Follow-up
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.map((source, index) => {
              const conversionRate =
                source.deals_sent && source.deals_sent > 0
                  ? ((source.deals_closed || 0) / source.deals_sent) * 100
                  : 0;
              const isOverdue =
                source.next_followup_date &&
                isPast(parseISO(source.next_followup_date));

              return (
                <tr
                  key={source.id}
                  className={cn(
                    "h-14 transition-colors hover:bg-surface-secondary/50 cursor-pointer",
                    index % 2 === 0 ? "bg-white" : "bg-surface-secondary/20"
                  )}
                  onClick={() => navigate(`/deal-sources/${source.id}`)}
                >
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(source.id)}
                      onCheckedChange={() => onSelect(source.id)}
                      aria-label={`Select ${source.name}`}
                    />
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-medium text-small flex-shrink-0">
                        {getInitials(source.name)}
                      </div>
                      <span className="text-body font-medium text-content truncate max-w-[150px]">
                        {source.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4">
                    <Badge className={cn("capitalize", typeColors[source.type])} size="sm">
                      {source.type}
                    </Badge>
                  </td>
                  <td className="px-4 text-small text-content-secondary truncate max-w-[120px]">
                    {source.company || "—"}
                  </td>
                  <td className="px-4 text-center">
                    <Badge className={cn("capitalize", statusColors[source.status || "cold"])} size="sm">
                      {source.status || "cold"}
                    </Badge>
                  </td>
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {source.phone && (
                        <a
                          href={`tel:${source.phone}`}
                          className="p-1.5 rounded-small hover:bg-surface-tertiary transition-colors"
                          title={source.phone}
                        >
                          <Phone className="h-4 w-4 text-content-tertiary hover:text-content" />
                        </a>
                      )}
                      {source.email && (
                        <a
                          href={`mailto:${source.email}`}
                          className="p-1.5 rounded-small hover:bg-surface-tertiary transition-colors"
                          title={source.email}
                        >
                          <Mail className="h-4 w-4 text-content-tertiary hover:text-content" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 text-right text-small tabular-nums text-content">
                    {source.deals_sent || 0}
                  </td>
                  <td className="px-4 text-right text-small tabular-nums font-medium text-content">
                    {source.deals_closed || 0}
                  </td>
                  <td className="px-4 text-right text-small tabular-nums">
                    <span
                      className={cn(
                        conversionRate >= 20
                          ? "text-success"
                          : conversionRate >= 10
                          ? "text-warning"
                          : "text-content-secondary"
                      )}
                    >
                      {conversionRate.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 text-right text-small tabular-nums font-medium text-success">
                    {formatCurrency(Number(source.total_profit))}
                  </td>
                  <td className="px-4 text-right text-small text-content-secondary">
                    {source.last_contact_date
                      ? formatDistanceToNow(parseISO(source.last_contact_date), { addSuffix: true })
                      : "—"}
                  </td>
                  <td className="px-4 text-right">
                    {source.next_followup_date ? (
                      <span
                        className={cn(
                          "text-small",
                          isOverdue ? "text-destructive font-medium" : "text-content-secondary"
                        )}
                      >
                        {isOverdue ? "Overdue" : format(parseISO(source.next_followup_date), "MMM d")}
                      </span>
                    ) : (
                      <span className="text-small text-content-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 hover:bg-surface-tertiary rounded-small transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white">
                        <DropdownMenuItem onClick={() => navigate(`/deal-sources/${source.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onLogContact(source.id)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Log Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(source.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
