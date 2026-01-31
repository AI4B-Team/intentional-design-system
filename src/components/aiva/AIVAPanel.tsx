import React from "react";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  // Get sidebar width from the DOM. IMPORTANT: many elements use `data-sidebar`,
  // so we specifically target the sidebar container.
  const [sidebarRight, setSidebarRight] = React.useState(0);

  React.useEffect(() => {
    const getSidebarEl = () => {
      // Choose the widest visible sidebar container (desktop vs mobile sheet).
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>('[data-sidebar="sidebar"]')
      );
      const visible = candidates.filter((el) => el.offsetParent !== null);
      const pool = visible.length ? visible : candidates;

      let best: HTMLElement | null = null;
      let bestWidth = -1;
      for (const el of pool) {
        const rect = el.getBoundingClientRect();
        if (rect.width > bestWidth) {
          bestWidth = rect.width;
          best = el;
        }
      }
      return best;
    };

    const updateSidebarRight = () => {
      const sidebar = getSidebarEl();
      if (!sidebar) {
        setSidebarRight(0);
        return;
      }
      const rect = sidebar.getBoundingClientRect();
      // Use `right` to handle any left offset/positioning.
      setSidebarRight(rect.right);
    };

    updateSidebarRight();

    const sidebar = getSidebarEl();
    const resizeObserver = new ResizeObserver(() => updateSidebarRight());
    if (sidebar) resizeObserver.observe(sidebar);

    window.addEventListener("resize", updateSidebarRight);
    const raf = requestAnimationFrame(updateSidebarRight);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateSidebarRight);
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
