import React from "react";
import { X, Sparkles, Brain, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIVAChat } from "./AIVAChat";

interface AIVAPanelProps {
  open: boolean;
  onClose: () => void;
}

// Sidebar width constants (must match AppSidebar)
const SIDEBAR_WIDTH_EXPANDED = 240; // w-60 = 15rem = 240px
const SIDEBAR_WIDTH_COLLAPSED = 64; // w-16 = 4rem = 64px

export function AIVAPanel({ open, onClose }: AIVAPanelProps) {
  // Get sidebar collapsed state from CSS variable or default to expanded
  const [sidebarWidth, setSidebarWidth] = React.useState(SIDEBAR_WIDTH_EXPANDED);

  React.useEffect(() => {
    // Check if sidebar is collapsed by looking at the sidebar element
    const checkSidebarWidth = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(width > 100 ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED);
      }
    };

    checkSidebarWidth();
    // Re-check on window resize
    window.addEventListener('resize', checkSidebarWidth);
    // Also observe DOM changes for sidebar toggle
    const observer = new MutationObserver(checkSidebarWidth);
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      window.removeEventListener('resize', checkSidebarWidth);
      observer.disconnect();
    };
  }, [open]);

  return (
    <>
      {/* Backdrop - dims the entire page */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel - slides out from the right edge of the sidebar */}
      <div
        className={cn(
          "fixed top-0 h-full bg-background border-r shadow-2xl z-50 transition-all duration-300 ease-in-out flex flex-col",
          "w-full sm:w-[420px] lg:w-[440px]"
        )}
        style={{
          left: open ? `${sidebarWidth}px` : `${sidebarWidth - 440}px`,
          opacity: open ? 1 : 0,
        }}
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
