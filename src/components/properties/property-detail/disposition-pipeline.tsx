import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Users,
  Send,
  ThumbsUp,
  Eye,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuyerMatch } from "@/hooks/useBuyerMatching";

interface DispositionPipelineProps {
  propertyId: string;
  matches: BuyerMatch[];
  responses: Record<string, { response: string; reason?: string; date: string }>;
}

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const stages: PipelineStage[] = [
  { id: "listed", label: "Deal Listed", icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted" },
  { id: "contacted", label: "Buyers Contacted", icon: Send, color: "text-info", bgColor: "bg-info/10" },
  { id: "interested", label: "Interest Received", icon: ThumbsUp, color: "text-success", bgColor: "bg-success/10" },
  { id: "showing", label: "Showing", icon: Eye, color: "text-warning", bgColor: "bg-warning/10" },
  { id: "offer", label: "Offer", icon: FileText, color: "text-brand", bgColor: "bg-brand/10" },
  { id: "signed", label: "Assignment Signed", icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10" },
];

function BuyerCard({ match, stage }: { match: BuyerMatch; stage: string }) {
  return (
    <div className="p-2 bg-white border border-border-subtle rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="font-medium text-small truncate">{match.buyer.name}</div>
      {match.buyer.company && (
        <div className="text-tiny text-muted-foreground truncate">{match.buyer.company}</div>
      )}
      <div className="flex items-center gap-1 mt-1">
        <Badge variant="secondary" size="sm" className="text-tiny">
          Score: {match.matchScore}
        </Badge>
      </div>
    </div>
  );
}

export function DispositionPipeline({
  propertyId,
  matches,
  responses,
}: DispositionPipelineProps) {
  // Categorize buyers by their stage
  const buyersByStage = React.useMemo(() => {
    const result: Record<string, BuyerMatch[]> = {
      listed: [],
      contacted: [],
      interested: [],
      showing: [],
      offer: [],
      signed: [],
    };

    matches.forEach((match) => {
      const response = responses[match.buyer.id];
      
      if (response?.response === "interested") {
        result.interested.push(match);
      } else if (response) {
        result.contacted.push(match);
      } else {
        result.listed.push(match);
      }
    });

    return result;
  }, [matches, responses]);

  const stagesWithCounts = stages.map((stage) => ({
    ...stage,
    count: buyersByStage[stage.id]?.length || 0,
    buyers: buyersByStage[stage.id] || [],
  }));

  return (
    <Card variant="default" padding="md">
      <h3 className="text-body font-semibold mb-4">Disposition Pipeline</h3>
      
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {stagesWithCounts.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="w-48 flex-shrink-0">
                {/* Stage Header */}
                <div className={cn("p-3 rounded-t-lg", stage.bgColor)}>
                  <div className="flex items-center gap-2">
                    <stage.icon className={cn("h-4 w-4", stage.color)} />
                    <span className={cn("text-small font-medium", stage.color)}>
                      {stage.label}
                    </span>
                  </div>
                  <div className="text-h3 font-bold mt-1">{stage.count}</div>
                </div>

                {/* Stage Content */}
                <div className="border border-t-0 border-border-subtle rounded-b-lg p-2 min-h-[120px] bg-muted/30">
                  {stage.buyers.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-tiny text-muted-foreground">
                      No buyers
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {stage.buyers.slice(0, 5).map((match) => (
                        <BuyerCard key={match.buyer.id} match={match} stage={stage.id} />
                      ))}
                      {stage.buyers.length > 5 && (
                        <div className="text-center text-tiny text-muted-foreground py-1">
                          +{stage.buyers.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow between stages */}
              {index < stages.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
