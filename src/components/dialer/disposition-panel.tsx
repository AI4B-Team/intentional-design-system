import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";

interface Disposition {
  id: string;
  name: string;
  category: string;
  color: string;
  icon?: string;
  keyboard_shortcut?: string;
  schedules_followup: boolean;
  default_followup_days?: number;
}

interface DispositionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    dispositionId: string,
    notes: string,
    followUpDate?: string,
    continueDialing?: boolean
  ) => void;
  isLoading?: boolean;
}

export function DispositionPanel({
  open,
  onOpenChange,
  onSave,
  isLoading,
}: DispositionPanelProps) {
  const [selectedDisposition, setSelectedDisposition] =
    React.useState<Disposition | null>(null);
  const [notes, setNotes] = React.useState("");
  const [followUpDate, setFollowUpDate] = React.useState("");
  const [followUpTime, setFollowUpTime] = React.useState("");
  const [setReminder, setSetReminder] = React.useState(true);

  const { data: dispositions = [] } = useQuery({
    queryKey: ["call-dispositions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_dispositions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Disposition[];
    },
  });

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if a disposition matches the key
      const disposition = dispositions.find(
        (d) => d.keyboard_shortcut === e.key
      );
      if (disposition) {
        setSelectedDisposition(disposition);

        // Auto-set follow-up date if disposition requires it
        if (disposition.schedules_followup && disposition.default_followup_days) {
          const date = new Date();
          date.setDate(date.getDate() + disposition.default_followup_days);
          setFollowUpDate(date.toISOString().split("T")[0]);
        }
      }

      // Enter to save (if disposition selected)
      if (e.key === "Enter" && selectedDisposition && !e.shiftKey) {
        e.preventDefault();
        handleSave(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, dispositions, selectedDisposition]);

  const handleDispositionSelect = (disposition: Disposition) => {
    setSelectedDisposition(disposition);

    // Auto-set follow-up date if disposition requires it
    if (disposition.schedules_followup && disposition.default_followup_days) {
      const date = new Date();
      date.setDate(date.getDate() + disposition.default_followup_days);
      setFollowUpDate(date.toISOString().split("T")[0]);
    } else {
      setFollowUpDate("");
    }
  };

  const handleSave = (continueDialing: boolean) => {
    if (!selectedDisposition) return;

    const fullFollowUp =
      followUpDate && followUpTime
        ? `${followUpDate}T${followUpTime}`
        : followUpDate;

    onSave(selectedDisposition.id, notes, fullFollowUp, continueDialing);

    // Reset state
    setSelectedDisposition(null);
    setNotes("");
    setFollowUpDate("");
    setFollowUpTime("");
  };

  const getEmojiFromIcon = (icon?: string) => {
    return icon || "📞";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "positive":
        return "bg-success/10 border-success text-success hover:bg-success/20";
      case "negative":
        return "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20";
      case "no_contact":
        return "bg-warning/10 border-warning text-warning hover:bg-warning/20";
      case "bad_number":
        return "bg-muted border-muted-foreground text-muted-foreground hover:bg-muted/80";
      default:
        return "bg-muted/50 border-border text-foreground hover:bg-muted";
    }
  };

  // Group dispositions by category
  const groupedDispositions = React.useMemo(() => {
    const groups: Record<string, Disposition[]> = {
      positive: [],
      no_contact: [],
      negative: [],
      bad_number: [],
      neutral: [],
    };

    dispositions.forEach((d) => {
      if (groups[d.category]) {
        groups[d.category].push(d);
      } else {
        groups.neutral.push(d);
      }
    });

    return groups;
  }, [dispositions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>How did the call go?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Disposition Grid */}
          <div className="grid grid-cols-2 gap-2">
            {dispositions.map((disposition) => (
              <button
                key={disposition.id}
                onClick={() => handleDispositionSelect(disposition)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-medium border-2 transition-all text-left",
                  getCategoryColor(disposition.category),
                  selectedDisposition?.id === disposition.id &&
                    "ring-2 ring-primary ring-offset-2"
                )}
              >
                <span className="text-lg">
                  {getEmojiFromIcon(disposition.icon)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-small truncate">
                    {disposition.name}
                  </p>
                  {disposition.keyboard_shortcut && (
                    <span className="text-tiny opacity-60">
                      [{disposition.keyboard_shortcut}]
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="disposition-notes">Notes</Label>
            <Textarea
              id="disposition-notes"
              placeholder="Add notes about this call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Follow-up Section */}
          {selectedDisposition?.schedules_followup && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-medium">
              <div className="flex items-center gap-2 text-small font-medium">
                <Calendar className="h-4 w-4" />
                Schedule follow-up
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="followup-date" className="text-tiny">
                    Date
                  </Label>
                  <Input
                    id="followup-date"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="followup-time" className="text-tiny">
                    Time (optional)
                  </Label>
                  <Input
                    id="followup-time"
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="set-reminder"
                  checked={setReminder}
                  onCheckedChange={(checked) => setSetReminder(checked === true)}
                />
                <Label htmlFor="set-reminder" className="text-small cursor-pointer">
                  Set reminder
                </Label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={!selectedDisposition || isLoading}
              className="flex-1"
            >
              Save & Next Call
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={!selectedDisposition || isLoading}
            >
              Save & Stop
            </Button>
          </div>

          <p className="text-tiny text-muted-foreground text-center">
            Tip: Press number key + Enter to quick-save
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
