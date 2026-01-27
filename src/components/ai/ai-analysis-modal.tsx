import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Download, Share, X, CheckCircle2, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DistressAnalysis,
  ARVAnalysis,
  RepairEstimate,
  OfferRecommendation,
  ExitStrategyAnalysis,
} from "@/lib/ai-analysis";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============ DISTRESS ANALYSIS MODAL ============

interface DistressModalProps extends BaseModalProps {
  data: DistressAnalysis | null;
}

export function DistressAnalysisModal({ isOpen, onClose, data }: DistressModalProps) {
  if (!data) return null;

  const priorityColors = {
    IMMEDIATE: "bg-destructive/10 text-destructive border-destructive/30",
    THIS_WEEK: "bg-warning/10 text-warning border-warning/30",
    NURTURE: "bg-info/10 text-info border-info/30",
    SKIP: "bg-surface-secondary text-content-tertiary border-border-subtle",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Distress Analysis</DialogTitle>
            <Badge variant="info" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <DialogDescription>
            AI-generated motivation scoring and contact strategy
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Score & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md" className="text-center">
              <p className="text-tiny uppercase text-content-tertiary mb-2">Motivation Score</p>
              <p className="text-4xl font-bold text-brand">{data.motivation_score}</p>
              <p className="text-tiny text-content-secondary">out of 1000</p>
            </Card>
            <Card padding="md" className={cn("text-center border", priorityColors[data.priority])}>
              <p className="text-tiny uppercase mb-2">Priority</p>
              <p className="text-2xl font-bold">{data.priority.replace('_', ' ')}</p>
            </Card>
          </div>

          {/* Distress Signals */}
          <div>
            <h4 className="text-small font-medium text-content mb-3">Distress Signals Detected</h4>
            <div className="space-y-2">
              {data.distress_signals.map((signal, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-surface-secondary rounded-medium"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <span className="text-small font-bold text-warning">+{signal.points}</span>
                  </div>
                  <div>
                    <p className="text-small font-medium text-content">{signal.signal}</p>
                    <p className="text-tiny text-content-secondary">{signal.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <Card padding="md" className="bg-surface-secondary/50">
            <h4 className="text-small font-medium text-content mb-2">AI Analysis</h4>
            <p className="text-small text-content-secondary">{data.reasoning}</p>
          </Card>

          {/* Contact Strategy */}
          <Card padding="md" className="border-brand/20 bg-brand/5">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-small font-medium text-brand mb-1">Recommended Contact Strategy</h4>
                <p className="text-small text-content">{data.recommended_contact_strategy}</p>
              </div>
            </div>
          </Card>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" icon={<Download />}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ARV ANALYSIS MODAL ============

interface ARVModalProps extends BaseModalProps {
  data: ARVAnalysis | null;
}

export function ARVAnalysisModal({ isOpen, onClose, data }: ARVModalProps) {
  if (!data) return null;

  const confidenceColors = {
    HIGH: "text-success bg-success/10",
    MEDIUM: "text-warning bg-warning/10",
    LOW: "text-destructive bg-destructive/10",
  };

  const ratingColors = {
    STRONG: "text-success",
    MODERATE: "text-warning",
    WEAK: "text-destructive",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>ARV Analysis</DialogTitle>
            <Badge variant="info" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <DialogDescription>
            Comparative market analysis and value estimation
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* ARV Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card padding="md" className="text-center col-span-2">
              <p className="text-tiny uppercase text-content-tertiary mb-2">Estimated ARV</p>
              <p className="text-4xl font-bold text-success">${data.arv.toLocaleString()}</p>
              <p className="text-small text-content-secondary mt-1">
                Range: ${data.value_range.low.toLocaleString()} - ${data.value_range.high.toLocaleString()}
              </p>
            </Card>
            <Card padding="md" className={cn("text-center", confidenceColors[data.confidence])}>
              <p className="text-tiny uppercase mb-2">Confidence</p>
              <p className="text-2xl font-bold">{data.confidence}</p>
            </Card>
          </div>

          {/* Comps Analysis */}
          <div>
            <h4 className="text-small font-medium text-content mb-3">Comparable Sales Analysis</h4>
            <div className="space-y-4">
              {data.comps_analysis.map((comp, i) => (
                <Card key={i} padding="md" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-small font-medium text-content">{comp.address}</p>
                      <p className="text-tiny text-content-secondary">
                        Sold: ${comp.sale_price.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={ratingColors[comp.rating]}>
                      {comp.rating}
                    </Badge>
                  </div>
                  
                  {/* Adjustments */}
                  <div className="pl-4 border-l-2 border-border-subtle space-y-1">
                    {comp.adjustments.map((adj, j) => (
                      <div key={j} className="flex justify-between text-tiny">
                        <span className="text-content-secondary">{adj.type}: {adj.reason}</span>
                        <span className={cn("font-medium", adj.amount >= 0 ? "text-success" : "text-destructive")}>
                          {adj.amount >= 0 ? '+' : ''}{adj.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t border-border-subtle">
                    <span className="text-small text-content-secondary">Adjusted Value</span>
                    <span className="text-small font-semibold text-content">${comp.adjusted_value.toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <Card padding="md" className="bg-surface-secondary/50">
            <h4 className="text-small font-medium text-content mb-2">AI Analysis</h4>
            <p className="text-small text-content-secondary">{data.reasoning}</p>
          </Card>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" icon={<Download />}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ REPAIR ESTIMATE MODAL ============

interface RepairModalProps extends BaseModalProps {
  data: RepairEstimate | null;
}

export function RepairEstimateModal({ isOpen, onClose, data }: RepairModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Repair Estimate</DialogTitle>
            <Badge variant="info" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <DialogDescription>
            Itemized repair cost analysis
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card padding="md" className="text-center col-span-2">
              <p className="text-tiny uppercase text-content-tertiary mb-2">Total Estimate</p>
              <p className="text-4xl font-bold text-warning">${data.total_estimate.toLocaleString()}</p>
              <p className="text-tiny text-content-secondary mt-1">Includes {((data.contingency / (data.total_estimate - data.contingency)) * 100).toFixed(0)}% contingency</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-tiny uppercase text-content-tertiary mb-2">Condition</p>
              <p className="text-3xl font-bold text-content">{data.condition_score}/10</p>
              <p className="text-tiny text-content-secondary mt-1">{data.confidence} confidence</p>
            </Card>
          </div>

          {/* Itemized Repairs */}
          <div>
            <h4 className="text-small font-medium text-content mb-3">Itemized Breakdown</h4>
            <div className="space-y-2">
              {data.itemized_repairs.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-surface-secondary rounded-medium"
                >
                  <div>
                    <p className="text-small font-medium text-content">{item.category}</p>
                    <p className="text-tiny text-content-secondary">{item.description}</p>
                  </div>
                  <span className="text-small font-semibold text-content tabular-nums">
                    ${item.cost.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-medium border border-warning/20">
                <div>
                  <p className="text-small font-medium text-warning">Contingency</p>
                  <p className="text-tiny text-warning/80">For unforeseen issues</p>
                </div>
                <span className="text-small font-semibold text-warning tabular-nums">
                  ${data.contingency.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <Card padding="md" className="bg-surface-secondary/50">
            <h4 className="text-small font-medium text-content mb-2">Notes</h4>
            <p className="text-small text-content-secondary">{data.notes}</p>
          </Card>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" icon={<Download />}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ OFFER RECOMMENDATION MODAL ============

interface OfferModalProps extends BaseModalProps {
  data: OfferRecommendation | null;
}

export function OfferRecommendationModal({ isOpen, onClose, data }: OfferModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Offer Recommendation</DialogTitle>
            <Badge variant="info" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <DialogDescription>
            Strategic offer analysis and negotiation tips
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Key Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md" className="text-center border-success/30 bg-success/5">
              <p className="text-tiny uppercase text-success mb-2">Recommended Opening</p>
              <p className="text-3xl font-bold text-success">${data.recommended_opening.toLocaleString()}</p>
            </Card>
            <Card padding="md" className="text-center border-destructive/30 bg-destructive/5">
              <p className="text-tiny uppercase text-destructive mb-2">Maximum Offer</p>
              <p className="text-3xl font-bold text-destructive">${data.maximum_offer.toLocaleString()}</p>
            </Card>
          </div>

          {/* Offer Tiers */}
          <div>
            <h4 className="text-small font-medium text-content mb-3">Offer Scenarios</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['conservative', 'standard', 'aggressive'] as const).map((tier) => {
                const offer = data.offers[tier];
                const colors = {
                  conservative: "border-success/30",
                  standard: "border-warning/30",
                  aggressive: "border-destructive/30",
                };
                return (
                  <Card key={tier} padding="md" className={cn("text-center border", colors[tier])}>
                    <p className="text-tiny uppercase text-content-tertiary mb-2 capitalize">{tier}</p>
                    <p className="text-xl font-bold text-content">${offer.amount.toLocaleString()}</p>
                    <p className="text-tiny text-content-secondary">{offer.arv_percentage}% ARV</p>
                    <p className="text-tiny text-success mt-1">${offer.spread.toLocaleString()} spread</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Reasoning */}
          <Card padding="md" className="bg-surface-secondary/50">
            <h4 className="text-small font-medium text-content mb-2">AI Analysis</h4>
            <p className="text-small text-content-secondary">{data.reasoning}</p>
          </Card>

          {/* Negotiation Tips */}
          <div>
            <h4 className="text-small font-medium text-content mb-3">Negotiation Tips</h4>
            <div className="space-y-2">
              {data.negotiation_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-surface-secondary rounded-small">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-small text-content">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" icon={<Download />}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ EXIT STRATEGY MODAL ============

interface ExitModalProps extends BaseModalProps {
  data: ExitStrategyAnalysis | null;
}

export function ExitStrategyModal({ isOpen, onClose, data }: ExitModalProps) {
  if (!data) return null;

  const riskColors = {
    LOW: "text-success bg-success/10",
    MEDIUM: "text-warning bg-warning/10",
    HIGH: "text-destructive bg-destructive/10",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Exit Strategy Analysis</DialogTitle>
            <Badge variant="info" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <DialogDescription>
            Comprehensive exit strategy comparison
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Recommendation */}
          <Card padding="md" className="border-brand/30 bg-brand/5">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-small font-medium text-brand mb-1">
                  Recommended: {data.recommended_exit}
                </h4>
                <p className="text-small text-content">{data.reasoning}</p>
              </div>
            </div>
          </Card>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.strategies.map((strategy, i) => (
              <Card 
                key={i} 
                padding="md" 
                className={cn(
                  "space-y-4",
                  strategy.strategy === data.recommended_exit && "border-brand/30 ring-1 ring-brand/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-body font-semibold text-content">{strategy.strategy}</h4>
                  <Badge className={riskColors[strategy.risk_level]} size="sm">
                    {strategy.risk_level} Risk
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-tiny text-content-tertiary">Profit Potential</p>
                    <p className="text-small font-semibold text-success">${strategy.profit_potential.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-tiny text-content-tertiary">Timeline</p>
                    <p className="text-small font-semibold text-content">{strategy.timeline}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-tiny text-content-tertiary">Capital Required</p>
                    <p className="text-small font-semibold text-content">${strategy.capital_required.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-tiny font-medium text-success mb-1">Pros</p>
                    <ul className="space-y-1">
                      {strategy.pros.slice(0, 2).map((pro, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-tiny text-content-secondary">
                          <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-tiny font-medium text-destructive mb-1">Cons</p>
                    <ul className="space-y-1">
                      {strategy.cons.slice(0, 2).map((con, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-tiny text-content-secondary">
                          <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" icon={<Download />}>
            Export Report
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
