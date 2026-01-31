import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  const location = useLocation();

  // Get the left menu width from the DOM.
  // NOTE: This app uses `AppSidebar` which renders as `<aside data-sidebar>...`.
  const [sidebarRight, setSidebarRight] = React.useState(0);

  React.useLayoutEffect(() => {
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

    const resizeObserver = new ResizeObserver(updateSidebarRight);
    const mutationObserver = new MutationObserver(updateSidebarRight);

    let attachedSidebar: HTMLElement | null = null;
    const attachToSidebar = (el: HTMLElement | null) => {
      if (!el || el === attachedSidebar) return;

      try {
        if (attachedSidebar) resizeObserver.unobserve(attachedSidebar);
      } catch {
        // no-op
      }

      attachedSidebar = el;
      resizeObserver.observe(el);
      mutationObserver.disconnect();
      mutationObserver.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    };

    // Initial attach + measure
    attachToSidebar(getSidebarEl());
    updateSidebarRight();

    // If the sidebar isn't in the DOM yet (auth/app-shell loading), watch until it appears.
    const domObserver = new MutationObserver(() => {
      attachToSidebar(getSidebarEl());
      updateSidebarRight();
    });
    if (document.body) {
      domObserver.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener("resize", updateSidebarRight);
    // Extra ticks to catch initial layout + transition frames.
    const raf1 = requestAnimationFrame(updateSidebarRight);
    const raf2 = requestAnimationFrame(updateSidebarRight);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("resize", updateSidebarRight);
      domObserver.disconnect();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [location.pathname]);

  // Round to avoid sub-pixel overlap.
  // Add a small gap so the panel never visually covers the sidebar (even by 1–2px due to rounding/layout).
  const sidebarRightPx = Math.ceil(sidebarRight);
  const EDGE_GAP_PX = 8;
  const panelLeft = sidebarRightPx + EDGE_GAP_PX;

  return (
    <>
      {/* Backdrop - dims the page but not the sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        // Backdrop should start at the sidebar edge (not after the gap)
        style={{ left: sidebarRightPx }}
        onClick={onClose}
      />

      {/* Panel - slides in from left, positioned next to sidebar */}
      <div
        className={cn(
          "fixed top-0 h-full bg-background border-l z-[70] transition-all duration-300 ease-in-out flex flex-col",
          // No shadow (prevents any visual spill onto the sidebar). Divider is handled by border-l.
          "shadow-none",
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
