import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DollarSign, Calculator, TrendingUp, Users, X, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OfferCalculation {
  arv: number;
  rehabEstimate: number;
  targetMarginPct: number;
}

interface OfferCalculatorProps {
  arv?: number;
  rehabEstimate?: number;
  targetMarginPct?: number;
  onInsertScript?: (text: string) => void;
  onLogOffer?: (offer: { type: string; amount: number }) => void;
  onClose?: () => void;
  className?: string;
}

function calculateOffers(calc: OfferCalculation) {
  const { arv, rehabEstimate, targetMarginPct } = calc;
  const mao = arv * ((100 - targetMarginPct) / 100) - rehabEstimate;
  const cashOffer = Math.round(mao * 0.95);
  const creativeOffer = Math.round(mao * 1.05);
  const anchorOffer = Math.round(mao * 1.15);
  const spread = anchorOffer - cashOffer;
  const buyerDemand = arv < 250000 ? "Very High" : arv < 400000 ? "High" : "Moderate";

  return { mao: Math.round(mao), cashOffer, creativeOffer, anchorOffer, spread, buyerDemand };
}

export function OfferCalculator({
  arv = 285000,
  rehabEstimate = 45000,
  targetMarginPct = 30,
  onInsertScript,
  onLogOffer,
  onClose,
  className,
}: OfferCalculatorProps) {
  const [localArv, setLocalArv] = useState(arv);
  const [localRehab, setLocalRehab] = useState(rehabEstimate);
  const [localMargin, setLocalMargin] = useState(targetMarginPct);

  const offers = calculateOffers({ arv: localArv, rehabEstimate: localRehab, targetMarginPct: localMargin });

  const handleInsertAnchor = () => {
    const script = `Based on my analysis, I'd like to start at $${offers.anchorOffer.toLocaleString()}. That's based on an ARV of $${localArv.toLocaleString()} with about $${localRehab.toLocaleString()} in repairs. I can close in 14 days, no contingencies.`;
    onInsertScript?.(script);
    toast.success("Anchor offer script inserted");
  };

  const handleInsertCash = () => {
    const script = `I can do a straight cash offer at $${offers.cashOffer.toLocaleString()}, close in 14 days, no inspections, no repairs on your end. Clean and simple.`;
    onInsertScript?.(script);
    toast.success("Cash offer script inserted");
  };

  const handleLogOffer = (type: string, amount: number) => {
    onLogOffer?.({ type, amount });
    toast.success(`${type} offer logged — $${amount.toLocaleString()}. Pipeline, campaign, and timeline updated.`);
  };

  return (
    <div className={cn("p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5 text-amber-500" /> Offer Engine
        </span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-background rounded-md border border-border">
          <div className="text-[10px] text-muted-foreground mb-1">ARV</div>
          <input
            type="number"
            value={localArv}
            onChange={e => setLocalArv(Number(e.target.value))}
            className="w-full text-sm font-bold text-foreground bg-transparent border-none outline-none tabular-nums"
          />
        </div>
        <div className="p-2 bg-background rounded-md border border-border">
          <div className="text-[10px] text-muted-foreground mb-1">Repairs</div>
          <input
            type="number"
            value={localRehab}
            onChange={e => setLocalRehab(Number(e.target.value))}
            className="w-full text-sm font-bold text-foreground bg-transparent border-none outline-none tabular-nums"
          />
        </div>
        <div className="p-2 bg-background rounded-md border border-border">
          <div className="text-[10px] text-muted-foreground mb-1">Margin %</div>
          <input
            type="number"
            value={localMargin}
            onChange={e => setLocalMargin(Number(e.target.value))}
            className="w-full text-sm font-bold text-foreground bg-transparent border-none outline-none tabular-nums"
          />
        </div>
      </div>

      {/* Calculated Offers */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-background rounded-md border border-border">
          <div className="text-[10px] text-muted-foreground">Suggested Anchor</div>
          <div className="text-lg font-bold text-primary tabular-nums">${offers.anchorOffer.toLocaleString()}</div>
          <button
            onClick={handleInsertAnchor}
            className="mt-1.5 w-full py-1.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Use Anchor Script
          </button>
        </div>
        <div className="p-2.5 bg-background rounded-md border border-border">
          <div className="text-[10px] text-muted-foreground">Suggested Cash</div>
          <div className="text-lg font-bold text-emerald-600 tabular-nums">${offers.cashOffer.toLocaleString()}</div>
          <button
            onClick={handleInsertCash}
            className="mt-1.5 w-full py-1.5 rounded text-[10px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Use Cash Script
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Creative: <span className="font-bold text-foreground">${offers.creativeOffer.toLocaleString()}</span>
          </span>
          <span className="text-muted-foreground">
            Spread: <span className="font-bold text-emerald-600">${offers.spread.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-blue-500" />
          <span className="text-muted-foreground">Buyer Demand:</span>
          <span className={cn(
            "font-bold",
            offers.buyerDemand === "Very High" ? "text-emerald-600" :
            offers.buyerDemand === "High" ? "text-blue-600" : "text-amber-500"
          )}>{offers.buyerDemand}</span>
        </div>
      </div>

      {/* Log Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handleLogOffer("Anchor", offers.anchorOffer)}
          className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          <FileText className="h-3 w-3" /> Log Anchor
        </button>
        <button
          onClick={() => handleLogOffer("Cash", offers.cashOffer)}
          className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          <FileText className="h-3 w-3" /> Log Cash
        </button>
        <button
          onClick={() => handleLogOffer("Creative", offers.creativeOffer)}
          className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          <FileText className="h-3 w-3" /> Log Creative
        </button>
      </div>
    </div>
  );
}
