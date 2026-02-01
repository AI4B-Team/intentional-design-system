import * as React from "react";
import { Kanban } from "lucide-react";

interface EmptyStageGuideProps {
  stageId: string;
}

const STAGE_GUIDANCE: Record<string, string> = {
  lead: "New leads appear here from your marketing campaigns and inbound sources.",
  contacted: "Deals move here after you've made initial contact with the seller.",
  analyzing: "Run comps and deal analysis before making an offer.",
  offer_made: "Offers submitted and waiting for seller response.",
  negotiating: "Active negotiations happen here until terms are agreed.",
  under_contract: "Signed contracts heading toward closing.",
  closed: "Completed deals where you've acquired the property.",
  sold: "Properties you've successfully sold or assigned.",
};

export function EmptyStageGuide({ stageId }: EmptyStageGuideProps) {
  const guidance = STAGE_GUIDANCE[stageId];

  return (
    <div className="text-center py-8 text-content-tertiary">
      <Kanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-tiny">No deals in this stage</p>
      {guidance && (
        <p className="text-tiny text-muted-foreground/70 mt-1 max-w-[180px] mx-auto">
          {guidance}
        </p>
      )}
    </div>
  );
}
