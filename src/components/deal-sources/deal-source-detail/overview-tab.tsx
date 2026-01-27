import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Phone,
  Mail,
  Building2,
  Copy,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  Calendar as CalendarIcon,
  AlertTriangle,
  Check,
  Loader2,
  Send,
  MessageSquare,
  Users,
} from "lucide-react";
import { format, parseISO, isPast, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { DealSource } from "@/hooks/useDealSourceDetail";
import { useUpdateDealSourceField, useLogDealSourceContact } from "@/hooks/useDealSourceDetail";

interface OverviewTabProps {
  source: DealSource;
}

const statusSteps = ["cold", "contacted", "responded", "active"];

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
}

function InfoRow({
  label,
  value,
  icon: Icon,
  copyable,
  href,
  external,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  copyable?: boolean;
  href?: string;
  external?: boolean;
}) {
  const handleClick = () => {
    if (copyable && typeof value === "string") {
      copyToClipboard(value, label);
    }
  };

  const content = (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon className="h-4 w-4 text-content-tertiary mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-small text-content-secondary">{label}</div>
        <div
          className={cn(
            "text-body text-content",
            (copyable || href) && "cursor-pointer hover:text-brand transition-colors"
          )}
          onClick={copyable ? handleClick : undefined}
        >
          {value}
          {copyable && <Copy className="inline h-3 w-3 ml-1.5 opacity-50" />}
          {external && <ExternalLink className="inline h-3 w-3 ml-1.5 opacity-50" />}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

export function DealSourceOverviewTab({ source }: OverviewTabProps) {
  const [notes, setNotes] = useState(source.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(
    source.next_followup_date ? parseISO(source.next_followup_date) : undefined
  );
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);

  const updateField = useUpdateDealSourceField();
  const logContact = useLogDealSourceContact();

  const currentStatusIndex = statusSteps.indexOf(source.status || "cold");
  const isOverdue = source.next_followup_date && isPast(parseISO(source.next_followup_date));

  const handleSaveNotes = async () => {
    await updateField.mutateAsync({ id: source.id, updates: { notes } });
    setIsEditingNotes(false);
    toast.success("Notes saved");
  };

  const handleFollowUpChange = async (date: Date | undefined) => {
    setFollowUpDate(date);
    setShowFollowUpPicker(false);
    if (date) {
      await updateField.mutateAsync({
        id: source.id,
        updates: { next_followup_date: format(date, "yyyy-MM-dd") },
      });
      toast.success("Follow-up scheduled");
    }
  };

  const handleQuickAction = async (channel: string) => {
    await logContact.mutateAsync({ sourceId: source.id, channel });
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateField.mutateAsync({ id: source.id, updates: { status: newStatus } });
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg p-lg">
      {/* Left Column - 2/3 */}
      <div className="lg:col-span-2 space-y-lg">
        {/* Contact Information */}
        <Card variant="default" padding="none">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
            <CardTitle className="text-h3 font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              {source.phone && (
                <InfoRow
                  label="Phone"
                  value={source.phone}
                  icon={Phone}
                  copyable
                  href={`tel:${source.phone}`}
                />
              )}
              {source.email && (
                <InfoRow
                  label="Email"
                  value={source.email}
                  icon={Mail}
                  copyable
                  href={`mailto:${source.email}`}
                />
              )}
              {source.company && (
                <InfoRow label="Company" value={source.company} icon={Building2} />
              )}
            </div>

            {/* Social Links */}
            {(source.instagram || source.facebook || source.linkedin) && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="text-small text-content-secondary mb-3">Social Media</div>
                <div className="flex flex-wrap gap-2">
                  {source.instagram && (
                    <a
                      href={`https://instagram.com/${source.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-medium hover:bg-surface-tertiary transition-colors"
                    >
                      <Instagram className="h-4 w-4 text-brand-accent" />
                      <span className="text-small">@{source.instagram}</span>
                    </a>
                  )}
                  {source.facebook && (
                    <a
                      href={source.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-medium hover:bg-surface-tertiary transition-colors"
                    >
                      <Facebook className="h-4 w-4 text-info" />
                      <span className="text-small">Facebook</span>
                    </a>
                  )}
                  {source.linkedin && (
                    <a
                      href={source.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-medium hover:bg-surface-tertiary transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-info" />
                      <span className="text-small">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Information */}
        <Card variant="default" padding="none">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-h3 font-medium">Source Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-small text-content-secondary">How you found them</div>
                <div className="text-body text-content capitalize">
                  {source.source || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-small text-content-secondary">Date Added</div>
                <div className="text-body text-content">
                  {source.created_at ? format(parseISO(source.created_at), "MMM d, yyyy") : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card variant="default" padding="none">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
            <CardTitle className="text-h3 font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setIsEditingNotes(true);
              }}
              placeholder="Add notes about this contact..."
              rows={4}
              className="mb-3"
            />
            {isEditingNotes && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateField.isPending}
              >
                {updateField.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Notes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - 1/3 */}
      <div className="space-y-lg">
        {/* Relationship Status */}
        <Card variant="default" padding="md">
          <div className="text-small text-content-secondary mb-4">Relationship Status</div>
          <div className="flex items-center gap-1 mb-4">
            {statusSteps.map((step, i) => {
              const isActive = i <= currentStatusIndex;
              const isCurrent = step === source.status;
              return (
                <button
                  key={step}
                  onClick={() => handleStatusChange(step)}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all",
                    isActive ? "bg-brand" : "bg-surface-tertiary",
                    isCurrent && "ring-2 ring-brand ring-offset-2"
                  )}
                  title={step}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-tiny text-content-tertiary capitalize">
            {statusSteps.map((step) => (
              <span
                key={step}
                className={cn(source.status === step && "text-brand font-medium")}
              >
                {step}
              </span>
            ))}
          </div>
        </Card>

        {/* Follow-up Card */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-small text-content-secondary">Follow-up</div>
            {isOverdue && (
              <Badge variant="error" size="sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-tiny text-content-tertiary">Last Contact</div>
              <div className="text-body font-medium">
                {source.last_contact_date
                  ? formatDistanceToNow(parseISO(source.last_contact_date), { addSuffix: true })
                  : "Never"}
              </div>
            </div>

            <div>
              <div className="text-tiny text-content-tertiary">Next Follow-up</div>
              <Popover open={showFollowUpPicker} onOpenChange={setShowFollowUpPicker}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="mt-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {followUpDate ? format(followUpDate, "MMM d, yyyy") : "Schedule"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={handleFollowUpChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md">
          <div className="text-small text-content-secondary mb-3">Quick Actions</div>
          <div className="space-y-2">
            {source.phone && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Phone />}
                onClick={() => {
                  window.open(`tel:${source.phone}`);
                  handleQuickAction("call");
                }}
                disabled={logContact.isPending}
              >
                Call Now
              </Button>
            )}
            {source.email && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Mail />}
                onClick={() => {
                  window.open(`mailto:${source.email}`);
                  handleQuickAction("email");
                }}
                disabled={logContact.isPending}
              >
                Send Email
              </Button>
            )}
            {source.instagram && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Send />}
                onClick={() => {
                  window.open(`https://instagram.com/${source.instagram}`, "_blank");
                  handleQuickAction("dm");
                }}
                disabled={logContact.isPending}
              >
                Send Instagram DM
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              icon={<Users />}
              disabled
            >
              Add to Campaign
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
