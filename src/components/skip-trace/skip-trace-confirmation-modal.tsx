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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SKIP_TRACE_PRICE = 0.35;

interface SkipTraceConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  ownerName?: string;
  balance: number;
  onConfirm: () => void;
  loading?: boolean;
}

export function SkipTraceConfirmationModal({
  open,
  onOpenChange,
  address,
  ownerName,
  balance,
  onConfirm,
  loading,
}: SkipTraceConfirmationModalProps) {
  const navigate = useNavigate();
  const hasEnoughCredits = balance >= SKIP_TRACE_PRICE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-accent" />
            Skip Trace Owner
          </DialogTitle>
          <DialogDescription>
            Search for contact information for this property owner?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-surface-secondary rounded-medium p-4 space-y-2">
            <div className="text-small text-content-secondary">Property</div>
            <div className="text-body font-medium text-content">{address}</div>
            {ownerName && (
              <>
                <div className="text-small text-content-secondary mt-3">Owner</div>
                <div className="text-body text-content">{ownerName}</div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border border-border-subtle rounded-medium">
            <div className="space-y-1">
              <div className="text-small text-content-secondary">Cost</div>
              <div className="text-h3 font-semibold text-content">
                ${SKIP_TRACE_PRICE.toFixed(2)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-small text-content-secondary">Your Balance</div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-content-tertiary" />
                <span className="text-h3 font-semibold text-content">
                  ${balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {!hasEnoughCredits && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-medium">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-content">Insufficient credits</div>
                <div className="text-small text-content-secondary mt-1">
                  You need ${SKIP_TRACE_PRICE.toFixed(2)} but only have $
                  {balance.toFixed(2)}.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!hasEnoughCredits ? (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/settings/billing");
                }}
              >
                Add Credits
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                loading={loading}
                icon={<Search />}
              >
                Run Skip Trace (${SKIP_TRACE_PRICE.toFixed(2)})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
