import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Phone, Mail, User, Users, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsTopPlan } from "@/hooks/useIsTopPlan";

interface D4DUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyAddress?: string;
  ownerName?: string;
  buyerCount?: number;
  cityZip?: string;
}

export function D4DUpgradeModal({ open, onOpenChange, propertyAddress, ownerName, buyerCount, cityZip }: D4DUpgradeModalProps) {
  const navigate = useNavigate();
  const { planName } = useIsTopPlan();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Unlock Full Access
          </DialogTitle>
          <DialogDescription>
            Upgrade to access contact info, buyer matches, and direct outreach tools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 overflow-y-auto max-h-[60vh]">
          {/* What's locked preview */}
          {propertyAddress && (
            <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Locked For This Property</p>
              <p className="text-sm font-medium">{propertyAddress}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> <User className="h-3 w-3" /> {ownerName ? "Owner Name" : "Owner Info"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> <Phone className="h-3 w-3" /> Phone
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> <Mail className="h-3 w-3" /> Email
                </span>
              </div>
            </div>
          )}

          {/* Buyer interest highlight */}
          {buyerCount && buyerCount > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <Zap className="h-4 w-4 inline text-amber-600 mr-1" />
                <span className="font-bold text-amber-700">{buyerCount} buyers</span> flagged this property based on their verified activity in {cityZip || "this area"}.
              </p>
            </div>
          )}

          {/* Plan comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current plan */}
            <div className="p-3 rounded-lg border bg-muted/30 opacity-60">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{planName} Plan</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Property Data</li>
                <li className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> AI Distress Scores</li>
                <li className="flex items-center gap-1"><Lock className="h-3 w-3" /> Contact Info Locked</li>
                <li className="flex items-center gap-1"><Lock className="h-3 w-3" /> Buyer Matches Locked</li>
              </ul>
            </div>

            {/* Top plan */}
            <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-xs font-semibold text-primary">Pro Plan</p>
                <Badge className="text-[9px] px-1 py-0 bg-primary">Recommended</Badge>
              </div>
              <ul className="space-y-1 text-xs text-foreground">
                <li className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-primary" /> Full Property Data</li>
                <li className="flex items-center gap-1"><User className="h-3 w-3 text-primary" /> Owner Contact Info</li>
                <li className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" /> Buyer Match Access</li>
                <li className="flex items-center gap-1"><Phone className="h-3 w-3 text-primary" /> Dial Queue Access</li>
              </ul>
            </div>
          </div>

          <Button className="w-full" onClick={() => { onOpenChange(false); navigate("/settings/billing"); }}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
          <p className="text-xs text-center text-muted-foreground">No Commitment · Cancel Anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
