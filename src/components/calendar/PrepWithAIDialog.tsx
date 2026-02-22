import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, AlertTriangle, Target, Clock, Loader2, CheckCircle, Copy, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "./types";

interface PrepBrief {
  summary: string;
  talkingPoints: string[];
  questionsToAsk: string[];
  redFlags: string[];
  negotiationTips: string[];
  estimatedDuration: string;
  confidence: "high" | "medium" | "low";
}

interface PrepWithAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: CalendarEvent;
}

export function PrepWithAIDialog({ open, onOpenChange, appointment }: PrepWithAIDialogProps) {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<PrepBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePrep = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-appointment-prep", {
        body: {
          appointment: {
            type: appointment.title?.split(" - ")[0] || "Walkthrough",
            address: appointment.propertyAddress || "Unknown",
            contactName: appointment.contactName || "Unknown",
            notes: "",
            propertyType: "Residential",
            lastContactDays: appointment.lastContactDays,
          },
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limited — please try again in a moment");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits exhausted — add funds in Settings → Workspace → Usage");
        }
        throw new Error(data.error);
      }

      setBrief(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate prep");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when dialog opens
  React.useEffect(() => {
    if (open && !brief && !loading) {
      generatePrep();
    }
    if (!open) {
      setBrief(null);
      setError(null);
    }
  }, [open]);

  const copyToClipboard = () => {
    if (!brief) return;
    const text = [
      `📋 Appointment Prep: ${appointment.title}`,
      `\n${brief.summary}`,
      `\n🎯 Talking Points:`,
      ...brief.talkingPoints.map((p) => `• ${p}`),
      `\n❓ Questions to Ask:`,
      ...brief.questionsToAsk.map((q) => `• ${q}`),
      ...(brief.redFlags.length > 0 ? [`\n⚠️ Red Flags:`, ...brief.redFlags.map((f) => `• ${f}`)] : []),
      `\n💡 Negotiation Tips:`,
      ...brief.negotiationTips.map((t) => `• ${t}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Prep brief copied to clipboard");
  };

  const confidenceColor = brief?.confidence === "high" ? "text-emerald-600 bg-emerald-50" : brief?.confidence === "medium" ? "text-amber-600 bg-amber-50" : "text-destructive bg-destructive/10";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Appointment Prep
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {appointment.title} · {appointment.time} · {appointment.propertyAddress}
          </p>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating your prep brief...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" onClick={generatePrep}>Try Again</Button>
          </div>
        )}

        {brief && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">{brief.summary}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={cn("text-[10px]", confidenceColor)}>
                    {brief.confidence} confidence
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {brief.estimatedDuration}
                  </span>
                </div>
              </div>
            </div>

            {/* Talking Points */}
            <Section icon={Target} title="Talking Points" color="text-primary">
              {brief.talkingPoints.map((point, i) => (
                <li key={i} className="text-sm text-foreground">{point}</li>
              ))}
            </Section>

            {/* Questions to Ask */}
            <Section icon={HelpCircle} title="Questions to Ask" color="text-info">
              {brief.questionsToAsk.map((q, i) => (
                <li key={i} className="text-sm text-foreground">{q}</li>
              ))}
            </Section>

            {/* Red Flags */}
            {brief.redFlags.length > 0 && (
              <Section icon={AlertTriangle} title="Red Flags to Watch" color="text-destructive">
                {brief.redFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-foreground">{flag}</li>
                ))}
              </Section>
            )}

            {/* Negotiation Tips */}
            <Section icon={MessageSquare} title="Negotiation Tips" color="text-emerald-600">
              {brief.negotiationTips.map((tip, i) => (
                <li key={i} className="text-sm text-foreground">{tip}</li>
              ))}
            </Section>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={copyToClipboard}>
                <Copy className="h-3.5 w-3.5" />
                Copy Brief
              </Button>
              <Button size="sm" className="flex-1 gap-1.5" onClick={generatePrep}>
                <Sparkles className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <ul className="space-y-1 pl-5 list-disc marker:text-muted-foreground/40">
        {children}
      </ul>
    </div>
  );
}
