import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface PipelineCandidate {
  id: string;
  address: string;
  city?: string;
  county?: string;
  score?: number;
  signals?: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: PipelineCandidate | null;
  bulkCount?: number;
  onConfirm?: (note: string) => void;
}

export function MoveToPipelineModal({
  open,
  onOpenChange,
  candidate,
  bulkCount,
  onConfirm,
}: Props) {
  const [note, setNote] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.(note);
    toast({
      title: bulkCount
        ? `${bulkCount} Leads Moved To Pipeline`
        : "Moved To Pipeline",
      description: candidate
        ? `${candidate.address} Is Now An Active Deal.`
        : "Active Deals Created. Outreach History Preserved.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            Move To Pipeline?
          </DialogTitle>
          <DialogDescription>
            This Lead Will Appear In Your Pipeline As An Active Deal. It Stays
            Visible In Leads &gt; Prospects With An "In Pipeline" Tag. Outreach
            History Is Preserved.
          </DialogDescription>
        </DialogHeader>

        {bulkCount && bulkCount > 1 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <span className="font-semibold tabular-nums">{bulkCount}</span>{" "}
            Leads Selected
          </div>
        ) : (
          candidate && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div>
                <p className="font-semibold text-foreground">
                  {candidate.address}
                </p>
                {(candidate.city || candidate.county) && (
                  <p className="text-xs text-muted-foreground">
                    {[candidate.city, candidate.county]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {candidate.score != null && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 tabular-nums">
                    Opportunity Score: {candidate.score}
                  </Badge>
                )}
                {candidate.signals?.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Add A Note (Optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Owner Called Back, Motivated To Sell Fast"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-1.5">
            Move To Pipeline <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
