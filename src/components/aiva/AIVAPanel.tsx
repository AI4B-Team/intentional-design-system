import React from "react";
import { X, Sparkles, Bot, Brain, MessageSquare, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
          "w-full sm:w-[440px] lg:w-[480px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">AIVA</h2>
              <p className="text-xs text-muted-foreground">AI Virtual Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <AIVAChat className="flex-1 border-0 rounded-none shadow-none" />
        </div>

        {/* Quick Capabilities Footer */}
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              <span>Lead Scoring</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>Outreach</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Market Intel</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
