import React from "react";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  // Get the left menu width from the DOM.
  // NOTE: This app uses `AppSidebar` which renders as `<aside data-sidebar>...`.
  const [sidebarRight, setSidebarRight] = React.useState(0);

  React.useEffect(() => {
    const getSidebarEl = (): HTMLElement | null => {
      // Prefer the actual layout sidebar.
      const candidates = Array.from(document.querySelectorAll<HTMLElement>("aside[data-sidebar]"));
      const visible = candidates.filter((el) => el.offsetParent !== null);
      const pool = visible.length ? visible : candidates;

      let best: HTMLElement | null = null;
      let bestRight = -Infinity;
      for (const el of pool) {
        const rect = el.getBoundingClientRect();
        // Ignore offscreen (mobile closed) sidebars
        if (rect.right <= 0 || rect.width <= 0) continue;
        if (rect.right > bestRight) {
          bestRight = rect.right;
          best = el;
        }
      }

      return best;
    };

    const computeSidebarRight = () => {
      const sidebar = getSidebarEl();
      if (!sidebar) return 0;
      const rect = sidebar.getBoundingClientRect();
      return rect.right;
    };

    const updateSidebarRight = () => {
      setSidebarRight(computeSidebarRight());
    };

    updateSidebarRight();

    // Watch both size changes and class/transform changes.
    const sidebar = getSidebarEl();
    const resizeObserver = new ResizeObserver(updateSidebarRight);
    const mutationObserver = new MutationObserver(updateSidebarRight);
    if (sidebar) {
      resizeObserver.observe(sidebar);
      mutationObserver.observe(sidebar, { attributes: true, attributeFilter: ["class", "style"] });
    }

    window.addEventListener("resize", updateSidebarRight);
    // Extra ticks to catch initial layout + transition frames.
    const raf1 = requestAnimationFrame(updateSidebarRight);
    const raf2 = requestAnimationFrame(updateSidebarRight);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("resize", updateSidebarRight);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  // Add a small gap to prevent overlap with sidebar
  const panelLeft = sidebarRight + 6;

  return (
    <>
      {/* Backdrop - dims the page but not the sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ left: sidebarRight }}
        onClick={onClose}
      />

      {/* Panel - slides in from left, positioned next to sidebar */}
      <div
        className={cn(
          "fixed top-0 h-full bg-background border-l z-[70] transition-all duration-300 ease-in-out flex flex-col",
          // Right-only shadow to avoid visually darkening/covering the sidebar edge
          "shadow-[12px_0_40px_-12px_hsl(var(--foreground)_/_0.14)]",
          "w-[90vw] sm:w-[420px]",
          open ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none -translate-x-full",
          "transition-[transform,opacity]"
        )}
        style={{ left: panelLeft }}
      >
        {/* Chat Area - takes full height */}
        <AIVAChat className="flex-1 border-0 rounded-none shadow-none" onClose={onClose} />
      </div>
    </>
  );
}
