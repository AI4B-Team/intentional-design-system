import { LeadsTable } from "@/components/harvest/LeadsTable";

export default function HarvestFocusList() {
  return (
    <div>
      <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
        <span className="font-medium text-primary">Focus List</span>
        <span className="text-muted-foreground"> — top-ranked leads, resorted daily by Opportunity Score.</span>
      </div>
      <LeadsTable variant="focus" />
    </div>
  );
}
