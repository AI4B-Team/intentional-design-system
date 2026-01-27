import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DNCWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onProceed: () => void;
}

export function DNCWarningModal({
  open,
  onOpenChange,
  phoneNumber,
  onProceed,
}: DNCWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Do Not Call Warning
          </DialogTitle>
          <DialogDescription>
            This phone number is on the National Do Not Call Registry.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-medium p-4">
            <p className="text-small text-content">
              Cold calling numbers on the DNC list may violate federal law and result
              in fines up to <span className="font-semibold">$43,792 per call</span>.
            </p>
          </div>

          <p className="text-small text-content-secondary">
            Only call if you have a prior business relationship or written consent.
          </p>

          <div className="bg-surface-secondary rounded-medium p-3 text-center">
            <span className="font-mono text-body text-content">{phoneNumber}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="text-content-tertiary"
            onClick={() => {
              onProceed();
              onOpenChange(false);
            }}
          >
            I Have Permission, Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
