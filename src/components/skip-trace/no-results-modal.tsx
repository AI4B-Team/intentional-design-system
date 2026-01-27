import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchX, Lightbulb } from "lucide-react";

interface NoResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoResultsModal({ open, onOpenChange }: NoResultsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SearchX className="h-5 w-5 text-content-tertiary" />
            No Results Found
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="h-16 w-16 mx-auto bg-surface-secondary rounded-full flex items-center justify-center mb-4">
            <SearchX className="h-8 w-8 text-content-tertiary" />
          </div>
          <p className="text-body text-content-secondary">
            We couldn't find contact information for this owner.
          </p>
        </div>

        <div className="bg-surface-secondary rounded-medium p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-small text-content-secondary">
              <p className="font-medium text-content">Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try with full owner name if not provided</li>
                <li>Property may have incorrect address</li>
                <li>Owner info may not be in database</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
