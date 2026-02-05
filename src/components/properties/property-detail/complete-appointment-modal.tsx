import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateAppointment } from "@/hooks/usePropertyMutations";

interface CompleteAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  propertyId: string;
  onScheduleFollowUp?: () => void;
}

export function CompleteAppointmentModal({
  open,
  onOpenChange,
  appointmentId,
  propertyId,
  onScheduleFollowUp,
}: CompleteAppointmentModalProps) {
  const updateAppointment = useUpdateAppointment();

  const [outcome, setOutcome] = React.useState("");
  const [scheduleFollowUp, setScheduleFollowUp] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!outcome.trim()) return;

    await updateAppointment.mutateAsync({
      id: appointmentId,
      updates: {
        status: "completed",
        outcome: outcome.trim(),
      },
    });

    setOutcome("");
    setScheduleFollowUp(false);
    onOpenChange(false);

    if (scheduleFollowUp && onScheduleFollowUp) {
      onScheduleFollowUp();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle>Mark Appointment Complete</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Outcome */}
          <div>
            <Label htmlFor="outcome">Outcome *</Label>
            <Textarea
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="What was the result? What was discussed?"
              rows={4}
              required
            />
          </div>

          {/* Schedule Follow-up */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="scheduleFollowUp"
              checked={scheduleFollowUp}
              onCheckedChange={(checked) => setScheduleFollowUp(checked === true)}
            />
            <Label htmlFor="scheduleFollowUp" className="text-small font-normal cursor-pointer">
              Schedule follow-up appointment
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={updateAppointment.isPending || !outcome.trim()}
            >
              {updateAppointment.isPending ? "Saving..." : "Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
