import React from "react";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  return (
    <>
      {/* Backdrop - dims the entire page */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel - slides in from left, positioned in front of everything */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r shadow-2xl z-[70] transition-transform duration-300 ease-in-out flex flex-col",
          "w-[90vw] sm:w-[420px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Chat Area - takes full height */}
        <AIVAChat className="flex-1 border-0 rounded-none shadow-none" onClose={onClose} />
      </div>
    </>
  );
}
