import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  Home,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Flame,
  Plus,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SellerLead } from "@/hooks/useSellerLeads";
import { useUpdateLead } from "@/hooks/useSellerLeads";

interface LeadDetailSheetProps {
  lead: SellerLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onCall?: (phone: string) => void;
  onSms?: (lead: SellerLead) => void;
  onEmail?: (lead: SellerLead) => void;
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

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "30_days": "30 Days",
  "60_days": "60 Days",
  "90_days": "90 Days",
  "6_months": "6 Months",
  "1_year": "1 Year",
  flexible: "Flexible",
};

const CONDITION_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  needs_work: "Needs Work",
  poor: "Poor",
  needs_major_repairs: "Needs Major Repairs",
};

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  onAddToProperties,
  onCall,
  onSms,
  onEmail,
}: LeadDetailSheetProps) {
  const updateLead = useUpdateLead();
  const [newNote, setNewNote] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");

  if (!lead) return null;

  const handleStatusChange = (status: string) => {
    updateLead.mutate({ id: lead.id, data: { status } });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const existingNotes = lead.notes || "";
    const timestamp = format(new Date(), "MMM d, yyyy h:mm a");
    const updatedNotes = `${existingNotes}\n\n[${timestamp}] ${newNote}`.trim();
    updateLead.mutate({ id: lead.id, data: { notes: updatedNotes } });
    setNewNote("");
  };

  const handleScheduleFollowup = () => {
    if (!followupDate) return;
    updateLead.mutate({
      id: lead.id,
      data: {
        next_followup_at: new Date(followupDate).toISOString(),
        followup_notes: followupNotes,
      },
    });
    setFollowupDate("");
    setFollowupNotes("");
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return { label: "—", icon: null, color: "text-content-tertiary" };
    if (score >= 800) return { label: score.toString(), icon: <Flame className="h-4 w-4" />, color: "text-destructive" };
    if (score >= 600) return { label: score.toString(), icon: null, color: "text-orange-500" };
    if (score >= 400) return { label: score.toString(), icon: null, color: "text-warning" };
    return { label: score.toString(), icon: null, color: "text-content-tertiary" };
  };

  const scoreDisplay = getScoreDisplay(lead.auto_score);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-h3">
                {lead.full_name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Unknown"}
              </SheetTitle>
              <p className="text-small text-content-secondary mt-1">
                {lead.property_address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Select value={lead.status || "new"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", opt.color)} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAddToProperties(lead)}
              disabled={!!lead.property_id}
            >
              <Plus className="h-4 w-4 mr-1" />
              {lead.property_id ? "Added" : "Add to Properties"}
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Contact Info
            </h4>
            <div className="space-y-2">
              {lead.phone && (
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-content-tertiary" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCall?.(lead.phone!)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSms?.(lead)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-medium">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-content-tertiary" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEmail?.(lead)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Property Info */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Property Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-content-tertiary mt-0.5" />
                <div>
                  <p className="font-medium">{lead.property_address}</p>
                  <p className="text-small text-content-secondary">
                    {[lead.property_city, lead.property_state, lead.property_zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {lead.property_condition && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small">
                      {CONDITION_LABELS[lead.property_condition] || lead.property_condition}
                    </span>
                  </div>
                )}
                {lead.sell_timeline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small">
                      {TIMELINE_LABELS[lead.sell_timeline] || lead.sell_timeline}
                    </span>
                  </div>
                )}
                {lead.asking_price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small">
                      ${lead.asking_price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {lead.reason_selling && (
                <div className="p-3 bg-surface-secondary rounded-medium">
                  <p className="text-small font-medium text-content-secondary mb-1">
                    Reason for Selling
                  </p>
                  <p className="text-small">{lead.reason_selling}</p>
                </div>
              )}

              {lead.notes && (
                <div className="p-3 bg-surface-secondary rounded-medium">
                  <p className="text-small font-medium text-content-secondary mb-1">
                    Notes from Lead
                  </p>
                  <p className="text-small whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Motivation */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Motivation
            </h4>
            <div className="flex items-center gap-4 mb-3">
              <div className={cn("text-h2 font-bold", scoreDisplay.color)}>
                {scoreDisplay.label}
              </div>
              {scoreDisplay.icon && (
                <span className={scoreDisplay.color}>{scoreDisplay.icon}</span>
              )}
              <span className="text-small text-content-tertiary">/ 1000</span>
            </div>

            {lead.motivation_indicators && lead.motivation_indicators.length > 0 && (
              <div className="space-y-2">
                {lead.motivation_indicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-small">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="capitalize">{indicator.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Source */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Source
            </h4>
            <div className="space-y-2 text-small">
              {lead.website && (
                <div className="flex justify-between">
                  <span className="text-content-secondary">Website</span>
                  <span className="font-medium">{lead.website.name}</span>
                </div>
              )}
              {lead.created_at && (
                <div className="flex justify-between">
                  <span className="text-content-secondary">Submitted</span>
                  <span>{format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              )}
              {lead.utm_source && (
                <div className="flex justify-between">
                  <span className="text-content-secondary">Source</span>
                  <span>{lead.utm_source}</span>
                </div>
              )}
              {lead.utm_campaign && (
                <div className="flex justify-between">
                  <span className="text-content-secondary">Campaign</span>
                  <span>{lead.utm_campaign}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Add Note */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Add Note
            </h4>
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={handleAddNote}>
                Add
              </Button>
            </div>
          </div>

          <Separator />

          {/* Follow-up */}
          <div>
            <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
              Follow-up
            </h4>
            {lead.next_followup_at && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-medium mb-3">
                <div className="flex items-center gap-2 text-small">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span className="font-medium">
                    Next: {format(new Date(lead.next_followup_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {lead.followup_notes && (
                  <p className="text-small text-content-secondary mt-1 ml-6">
                    {lead.followup_notes}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="Follow-up notes..."
                  rows={2}
                />
              </div>
              <Button variant="secondary" onClick={handleScheduleFollowup}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>

          {/* Converted Property Link */}
          {lead.property_id && (
            <>
              <Separator />
              <div>
                <h4 className="text-small font-medium text-content-tertiary uppercase mb-3">
                  Linked Property
                </h4>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.open(`/properties/${lead.property_id}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Property
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
