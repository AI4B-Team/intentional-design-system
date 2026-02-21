import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LeadTypeCount {
  label: string;
  count: number;
}

interface LeadTypeBadgesProps {
  counts: LeadTypeCount[];
  className?: string;
}

const leadTypeColors: Record<string, string> = {
  "High Equity": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "Pre-Foreclosure": "bg-orange-500/10 text-orange-700 border-orange-200",
  "Bank Owned": "bg-red-500/10 text-red-700 border-red-200",
  "Tax Delinquent": "bg-amber-500/10 text-amber-700 border-amber-200",
  "Liens": "bg-rose-500/10 text-rose-700 border-rose-200",
  "Vacant": "bg-purple-500/10 text-purple-700 border-purple-200",
  "Expired Listings": "bg-slate-500/10 text-slate-700 border-slate-200",
  "Auctions": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  "Probate": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Divorce": "bg-pink-500/10 text-pink-700 border-pink-200",
  "Foreclosure": "bg-red-500/10 text-red-700 border-red-200",
  "Distressed": "bg-rose-500/10 text-rose-700 border-rose-200",
  "Fixer Upper": "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  "Cash Buyer": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
};

export function LeadTypeBadges({ counts, className }: LeadTypeBadgesProps) {
  if (counts.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto", className)}>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">Lead Types:</span>
      {counts.map((item) => (
        <Badge
          key={item.label}
          variant="outline"
          size="sm"
          className={cn(
            "whitespace-nowrap gap-1.5 border",
            leadTypeColors[item.label] || "bg-muted text-muted-foreground border-border"
          )}
        >
          {item.label}
          <span className="font-bold">{item.count.toLocaleString()}</span>
        </Badge>
      ))}
    </div>
  );
}
