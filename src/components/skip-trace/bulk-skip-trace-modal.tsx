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
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Search, Check, X, AlertCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SKIP_TRACE_PRICE = 0.35;

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  owner_name: string | null;
  skip_traced?: boolean;
}

interface BulkSkipTraceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onComplete?: () => void;
}

type ProcessingState = "idle" | "processing" | "completed";

interface ProcessingResult {
  id: string;
  address: string;
  status: "success" | "no_results" | "error";
  message?: string;
}

export function BulkSkipTraceModal({
  open,
  onOpenChange,
  properties,
  onComplete,
}: BulkSkipTraceModalProps) {
  const navigate = useNavigate();
  const { balance, refreshBalance } = useCredits();
  const [state, setState] = React.useState<ProcessingState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [results, setResults] = React.useState<ProcessingResult[]>([]);
  const [shouldStop, setShouldStop] = React.useState(false);
  const stopRef = React.useRef(false);

  const propertiesWithoutOwner = properties.filter(p => !p.owner_name);
  const propertiesAlreadyTraced = properties.filter(p => p.skip_traced);
  const estimatedCost = properties.length * SKIP_TRACE_PRICE;
  const hasEnoughCredits = balance >= estimatedCost;
  const affordableCount = Math.floor(balance / SKIP_TRACE_PRICE);

  const reset = () => {
    setState("idle");
    setProgress(0);
    setCurrentIndex(0);
    setResults([]);
    setShouldStop(false);
    stopRef.current = false;
  };

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const handleProcess = async () => {
    setState("processing");
    stopRef.current = false;
    const propertiesToProcess = hasEnoughCredits 
      ? properties 
      : properties.slice(0, affordableCount);

    for (let i = 0; i < propertiesToProcess.length; i++) {
      if (stopRef.current) break;

      const property = propertiesToProcess[i];
      setCurrentIndex(i + 1);
      setProgress(((i + 1) / propertiesToProcess.length) * 100);

      try {
        // Parse owner name
        const nameParts = property.owner_name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data, error } = await supabase.functions.invoke("skip-trace", {
          body: {
            firstName,
            lastName,
            address: property.address,
            city: property.city || "",
            state: property.state || "",
            zip: property.zip || "",
            propertyId: property.id,
          },
        });

        if (error) throw error;

        if (data.error) {
          if (data.code === "INSUFFICIENT_CREDITS") {
            setResults(prev => [...prev, {
              id: property.id,
              address: property.address,
              status: "error",
              message: "Insufficient credits",
            }]);
            break;
          }
          throw new Error(data.error);
        }

        const hasResults = data.results.totalPhonesFound > 0 || data.results.totalEmailsFound > 0;
        setResults(prev => [...prev, {
          id: property.id,
          address: property.address,
          status: hasResults ? "success" : "no_results",
        }]);
      } catch (error: any) {
        setResults(prev => [...prev, {
          id: property.id,
          address: property.address,
          status: "error",
          message: error.message,
        }]);
      }
    }

    setState("completed");
    refreshBalance();
  };

  const handleStop = () => {
    stopRef.current = true;
    setShouldStop(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    if (state === "completed") {
      onComplete?.();
    }
  };

  const successCount = results.filter(r => r.status === "success").length;
  const noResultsCount = results.filter(r => r.status === "no_results").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-accent" />
            Bulk Skip Trace
          </DialogTitle>
          {state === "idle" && (
            <DialogDescription>
              Skip trace {properties.length} properties?
            </DialogDescription>
          )}
        </DialogHeader>

        {state === "idle" && (
          <div className="space-y-4 py-4">
            <div className="bg-surface-secondary rounded-medium p-4 space-y-3">
              <div className="flex items-center justify-between text-small">
                <span className="text-content-secondary">Properties without owner name</span>
                <span className="font-medium text-content">{propertiesWithoutOwner.length}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="text-content-secondary">Properties already skip traced</span>
                <span className="font-medium text-content">{propertiesAlreadyTraced.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border-subtle rounded-medium">
              <div className="space-y-1">
                <div className="text-small text-content-secondary">Estimated Cost</div>
                <div className="text-h3 font-semibold text-content">
                  ${estimatedCost.toFixed(2)}
                </div>
                <div className="text-tiny text-content-tertiary">
                  {properties.length} × ${SKIP_TRACE_PRICE.toFixed(2)}
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
                  <div className="font-medium text-content">Insufficient credits for all properties</div>
                  <div className="text-small text-content-secondary mt-1">
                    You can skip trace {affordableCount} properties with your current balance.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {state === "processing" && (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <div className="text-body font-medium text-content">
                Processing... {currentIndex} of {hasEnoughCredits ? properties.length : affordableCount}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-center">
              <Button variant="destructive" size="sm" onClick={handleStop}>
                Stop
              </Button>
            </div>
          </div>
        )}

        {state === "completed" && (
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-success/10 rounded-medium p-4 text-center">
                <Check className="h-6 w-6 text-success mx-auto mb-2" />
                <div className="text-h3 font-bold text-success">{successCount}</div>
                <div className="text-tiny text-content-secondary">Successful</div>
              </div>
              <div className="bg-warning/10 rounded-medium p-4 text-center">
                <AlertCircle className="h-6 w-6 text-warning mx-auto mb-2" />
                <div className="text-h3 font-bold text-warning">{noResultsCount}</div>
                <div className="text-tiny text-content-secondary">No Results</div>
              </div>
              <div className="bg-destructive/10 rounded-medium p-4 text-center">
                <X className="h-6 w-6 text-destructive mx-auto mb-2" />
                <div className="text-h3 font-bold text-destructive">{errorCount}</div>
                <div className="text-tiny text-content-secondary">Failed</div>
              </div>
            </div>

            {shouldStop && (
              <div className="bg-surface-secondary rounded-medium p-3 text-center text-small text-content-secondary">
                Processing was stopped by user
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {state === "idle" && (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {hasEnoughCredits ? (
                <Button variant="primary" onClick={handleProcess} icon={<Search />}>
                  Run Skip Trace (${estimatedCost.toFixed(2)})
                </Button>
              ) : affordableCount > 0 ? (
                <Button variant="primary" onClick={handleProcess} icon={<Search />}>
                  Skip Trace {affordableCount} Properties
                </Button>
              ) : (
                <Button variant="primary" onClick={() => {
                  onOpenChange(false);
                  navigate("/settings/billing");
                }}>
                  Add Credits
                </Button>
              )}
            </>
          )}
          {state === "completed" && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleClose}>
                View Results
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
