import React from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircle2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Contact, ContactType, ContactStatus } from "@/hooks/useContacts";
import { contactTypeConfig, contactStatusConfig } from "@/hooks/useContacts";

interface ContactsTableProps {
  data: Contact[];
  isLoading: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onLogContact: (id: string) => void;
  onDelete: (id: string) => void;
  onAddContact?: () => void;
}

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

function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
      className
    )}>
      {children}
    </th>
  );
}

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

export function ContactsTable({
  data,
  isLoading,
  selectedIds,
  onSelect,
  onSelectAll,
  onLogContact,
  onDelete,
  onAddContact,
}: ContactsTableProps) {
  const navigate = useNavigate();
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
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
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Contacts Found</h3>
          <p className="text-sm text-muted-foreground mb-6">
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
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
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
              <TableHeader>Location</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Deals</TableHeader>
              <TableHeader>Rating</TableHeader>
              <TableHeader>Last Contact</TableHeader>
              <TableHeader className="text-center">Type</TableHeader>
              <TableHeader className="text-center">Status</TableHeader>
              <TableHeader className="text-center">Verified</TableHeader>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              const status = (contact.status || "cold") as ContactStatus;
              const type = contact.type as ContactType;
              const statusStyle = contactStatusConfig[status] || contactStatusConfig.cold;
              const typeStyle = contactTypeConfig[type] || contactTypeConfig.agent;
              const isVerified = contact.pof_verified || contact.license_verified;

              return (
                <tr
                  key={contact.id}
                  className={cn(
                    "group transition-colors cursor-pointer",
                    isSelected 
                      ? "bg-primary/5" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  {/* Checkbox */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelect(contact.id)}
                      aria-label={`Select ${contact.name}`}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>

                  {/* Contact Name with Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                        typeStyle.bgColor, typeStyle.color
                      )}>
                        {getInitials(contact.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {contact.name}
                        </p>
                        {contact.company && (
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {[contact.city, contact.state].filter(Boolean).join(", ") || "—"}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {formatPhone(contact.phone)}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Deals */}
                  <TableCell>
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {contact.deals_closed || 0}
                    </span>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    {contact.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium">{contact.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Last Contact */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatDate(contact.last_contact_date)}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                      typeStyle.bgColor, typeStyle.color
                    )}>
                      {typeStyle.label}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                      statusStyle.bgColor, statusStyle.color
                    )}>
                      {statusStyle.label}
                    </span>
                  </TableCell>

                  {/* Verified */}
                  <TableCell className="text-center">
                    {isVerified ? (
                      <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-card shadow-lg border border-border">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/deal-sources/${contact.id}`)}
                          className="text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm">
                          <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                          Edit
                        </DropdownMenuItem>
                        {contact.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${contact.email}`} className="text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              Send Email
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onLogContact(contact.id)}
                          className="text-sm"
                        >
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          Log Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(contact.id)}
                          className="text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
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
