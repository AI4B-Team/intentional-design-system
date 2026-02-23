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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Phone,
  Trash2,
  Mail,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DealSource } from "@/hooks/useDealSources";

interface DealSourcesTableProps {
  data: DealSource[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onLogContact: (id: string) => void;
  onDelete: (id: string) => void;
  onAddContact?: () => void;
}

// Monday.com style status colors with left border accent
const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  cold: { bg: "bg-slate-100", text: "text-slate-600", border: "border-l-slate-400" },
  contacted: { bg: "bg-sky-100", text: "text-sky-700", border: "border-l-sky-500" },
  responded: { bg: "bg-amber-100", text: "text-amber-700", border: "border-l-amber-500" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-l-emerald-500" },
  inactive: { bg: "bg-red-100", text: "text-red-700", border: "border-l-red-500" },
};

const typeConfig: Record<string, { bg: string; text: string }> = {
  agent: { bg: "bg-violet-100", text: "text-violet-700" },
  wholesaler: { bg: "bg-cyan-100", text: "text-cyan-700" },
  lender: { bg: "bg-rose-100", text: "text-rose-700" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  // Simple format: (XXX) XXX-XXXX
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

// Column header component for consistency
function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500",
      className
    )}>
      {children}
    </th>
  );
}

// Column cell component
function TableCell({ 
  children, 
  className,
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <td className={cn("px-4 py-3", className)} onClick={onClick}>
      {children}
    </td>
  );
}

export function DealSourcesTable({
  data,
  isLoading,
  selectedIds,
  onSelect,
  onSelectAll,
  onLogContact,
  onDelete,
  onAddContact,
}: DealSourcesTableProps) {
  const navigate = useNavigate();
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Contacts Found</h3>
          <p className="text-sm text-slate-500 mb-6">
            Add your first contact to get started
          </p>
          {onAddContact && (
            <Button variant="primary" icon={<Plus />} onClick={onAddContact}>
              Add Contact
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="w-12 px-4 py-3.5">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </th>
              <TableHeader>Contact</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>City</TableHeader>
              <TableHeader>State</TableHeader>
              <TableHeader className="text-center">Type</TableHeader>
              <TableHeader className="text-center">Status</TableHeader>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((source) => {
              const isSelected = selectedIds.includes(source.id);
              const status = source.status || "cold";
              const statusStyle = statusConfig[status] || statusConfig.cold;
              const typeStyle = typeConfig[source.type] || typeConfig.agent;

              return (
                <tr
                  key={source.id}
                  className={cn(
                    "group transition-colors cursor-pointer",
                    isSelected 
                      ? "bg-primary/5" 
                      : "hover:bg-slate-50/80"
                  )}
                  onClick={() => navigate(`/contacts/${source.id}`)}
                >
                  {/* Checkbox */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelect(source.id)}
                      aria-label={`Select ${source.name}`}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {/* Contact Name with Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                        typeStyle.bg, typeStyle.text
                      )}>
                        {getInitials(source.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {source.name}
                        </p>
                        {source.company && (
                          <p className="text-xs text-slate-500 truncate">
                            {source.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {source.phone ? (
                      <a
                        href={`tel:${source.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {formatPhone(source.phone)}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>

                  {/* Email */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {source.email ? (
                      <a
                        href={`mailto:${source.email}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors truncate max-w-[200px]"
                      >
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        {source.email}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>

                  {/* City */}
                  <TableCell>
                    <span className="text-sm text-slate-600">—</span>
                  </TableCell>

                  {/* State */}
                  <TableCell>
                    <span className="text-sm text-slate-600">—</span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                      typeStyle.bg, typeStyle.text
                    )}>
                      {source.type}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                      statusStyle.bg, statusStyle.text
                    )}>
                      {status}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white shadow-lg border border-slate-200">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/contacts/${source.id}`)}
                          className="text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2 text-slate-500" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm">
                          <Pencil className="h-4 w-4 mr-2 text-slate-500" />
                          Edit
                        </DropdownMenuItem>
                        {source.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${source.email}`} className="text-sm">
                              <Mail className="h-4 w-4 mr-2 text-slate-500" />
                              Send Email
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onLogContact(source.id)}
                          className="text-sm"
                        >
                          <Phone className="h-4 w-4 mr-2 text-slate-500" />
                          Log Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(source.id)}
                          className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
