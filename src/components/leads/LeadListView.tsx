import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  UserPlus,
  Trash2,
  Flame,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SellerLead } from "@/hooks/useSellerLeads";

interface LeadListViewProps {
  leads: SellerLead[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectLead: (id: string, checked: boolean) => void;
  onViewDetail: (lead: SellerLead) => void;
  onCall: (phone: string) => void;
  onSms: (lead: SellerLead) => void;
  onEmail: (lead: SellerLead) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-success" },
  { value: "contacted", label: "Contacted", color: "bg-info" },
  { value: "qualified", label: "Qualified", color: "bg-warning" },
  { value: "appointment", label: "Appointment", color: "bg-purple-500" },
  { value: "offer_made", label: "Offer Made", color: "bg-orange-500" },
  { value: "closed", label: "Closed", color: "bg-success" },
  { value: "lost", label: "Lost", color: "bg-destructive" },
];

export function LeadListView({
  leads,
  selectedIds,
  onSelectAll,
  onSelectLead,
  onViewDetail,
  onCall,
  onSms,
  onEmail,
  onAddToProperties,
  onDelete,
}: LeadListViewProps) {
  const getScoreBadge = (score: number | null) => {
    if (score === null) return <span className="text-content-tertiary">—</span>;
    if (score >= 800) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Flame className="h-3 w-3" /> {score}
        </Badge>
      );
    }
    if (score >= 600) {
      return <Badge variant="warning">{score}</Badge>;
    }
    if (score >= 400) {
      return <Badge variant="secondary">{score}</Badge>;
    }
    return <Badge variant="secondary">{score}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    if (!opt) return <Badge variant="secondary">Unknown</Badge>;
    return (
      <Badge variant="secondary" className="gap-1">
        <span className={cn("w-2 h-2 rounded-full", opt.color)} />
        {opt.label}
      </Badge>
    );
  };

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === leads.length && leads.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-surface-secondary"
              onClick={() => onViewDetail(lead)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {lead.full_name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "—"}
                  </p>
                  {lead.phone && (
                    <p className="text-small text-content-secondary">{lead.phone}</p>
                  )}
                  {lead.email && (
                    <p className="text-tiny text-content-tertiary truncate max-w-[200px]">
                      {lead.email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium truncate max-w-[200px]">{lead.property_address}</p>
                  <p className="text-small text-content-secondary">
                    {[lead.property_city, lead.property_state].filter(Boolean).join(", ")}
                  </p>
                  {lead.property_condition && (
                    <Badge variant="secondary" className="mt-1 text-tiny">
                      {lead.property_condition.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{getScoreBadge(lead.auto_score)}</TableCell>
              <TableCell>
                <span className="text-small capitalize">
                  {lead.sell_timeline?.replace(/_/g, " ") || "—"}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell>
                <span className="text-small text-content-secondary">
                  {lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy") : "—"}
                </span>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white">
                    <DropdownMenuItem onClick={() => onViewDetail(lead)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {lead.phone && (
                      <DropdownMenuItem onClick={() => onCall(lead.phone!)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                    )}
                    {lead.email && (
                      <DropdownMenuItem onClick={() => onEmail(lead)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                    )}
                    {lead.phone && (
                      <DropdownMenuItem onClick={() => onSms(lead)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send SMS
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onAddToProperties(lead)}
                      disabled={!!lead.property_id}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to Properties
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(lead.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
