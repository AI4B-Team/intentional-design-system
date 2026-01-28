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
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  UserPlus,
  Trash2,
  Flame,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SellerLead } from "@/hooks/useSellerLeads";

interface LeadGridViewProps {
  leads: SellerLead[];
  selectedIds: Set<string>;
  onSelectLead: (id: string, checked: boolean) => void;
  onViewDetail: (lead: SellerLead) => void;
  onCall: (phone: string) => void;
  onSms: (lead: SellerLead) => void;
  onEmail: (lead: SellerLead) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-success",
  contacted: "bg-info",
  qualified: "bg-warning",
  appointment: "bg-purple-500",
  offer_made: "bg-orange-500",
  closed: "bg-success",
  lost: "bg-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  appointment: "Appointment",
  offer_made: "Offer Made",
  closed: "Closed",
  lost: "Lost",
};

export function LeadGridView({
  leads,
  selectedIds,
  onSelectLead,
  onViewDetail,
  onCall,
  onSms,
  onEmail,
  onAddToProperties,
  onDelete,
}: LeadGridViewProps) {
  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 800) return "text-destructive";
    if (score >= 600) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreIcon = (score: number | null) => {
    if (score && score >= 800) {
      return <Flame className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map((lead) => (
        <Card
          key={lead.id}
          variant="interactive"
          padding="none"
          className={cn(
            "overflow-hidden transition-all",
            selectedIds.has(lead.id) && "ring-2 ring-brand"
          )}
        >
          {/* Header with status */}
          <div className="p-4 border-b border-border-subtle">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={(checked) => onSelectLead(lead.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onViewDetail(lead)}
                >
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {lead.full_name ||
                      `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
                      "Unknown"}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{lead.property_address}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            </div>
          </div>

          {/* Body */}
          <div
            className="p-4 space-y-3 cursor-pointer"
            onClick={() => onViewDetail(lead)}
          >
            {/* Contact info */}
            <div className="space-y-1 text-sm">
              {lead.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
            </div>

            {/* Property details */}
            <div className="flex flex-wrap gap-1.5">
              {lead.property_condition && (
                <Badge variant="secondary" className="text-xs">
                  {lead.property_condition.replace(/_/g, " ")}
                </Badge>
              )}
              {lead.sell_timeline && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {lead.sell_timeline.replace(/_/g, " ")}
                </Badge>
              )}
            </div>

            {/* Score */}
            {lead.auto_score && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      lead.auto_score >= 800
                        ? "bg-destructive"
                        : lead.auto_score >= 600
                        ? "bg-warning"
                        : lead.auto_score >= 400
                        ? "bg-info"
                        : "bg-muted-foreground"
                    )}
                    style={{ width: `${Math.min(100, lead.auto_score / 10)}%` }}
                  />
                </div>
                <span className={cn("text-sm font-semibold", getScoreColor(lead.auto_score))}>
                  {lead.auto_score}
                </span>
                {getScoreIcon(lead.auto_score)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-muted/30 border-t border-border-subtle flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <span className={cn("w-2 h-2 rounded-full", STATUS_COLORS[lead.status || "new"])} />
              {STATUS_LABELS[lead.status || "new"]}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lead.created_at ? format(new Date(lead.created_at), "MMM d") : "—"}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
