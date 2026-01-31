import React from "react";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  // Get sidebar width from the DOM - check if sidebar is collapsed
  const [sidebarWidth, setSidebarWidth] = React.useState(64); // Default to collapsed (16 * 4 = 64px)

  React.useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(width);
      }
    };

    // Initial check
    updateSidebarWidth();

    // Set up observer for sidebar changes
    const observer = new MutationObserver(updateSidebarWidth);
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    // Also listen for window resize
    window.addEventListener('resize', updateSidebarWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, []);

  // Add a small gap to prevent overlap with sidebar
  const panelLeft = sidebarWidth + 4;

  return (
    <>
      {/* Backdrop - dims the page but not the sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ left: sidebarWidth }}
        onClick={onClose}
      />

      {/* Panel - slides in from left, positioned next to sidebar */}
      <div
        className={cn(
          "fixed top-0 h-full bg-background border-r shadow-2xl z-[70] transition-all duration-300 ease-in-out flex flex-col",
          "w-[90vw] sm:w-[420px]",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ 
          left: open ? panelLeft : panelLeft - 420,
          transition: 'left 0.3s ease-in-out, opacity 0.3s ease-in-out'
        }}
      >
        {/* Chat Area - takes full height */}
        <AIVAChat className="flex-1 border-0 rounded-none shadow-none" onClose={onClose} />
      </div>
    </>
  );
}
