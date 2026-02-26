import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/contexts/SidebarContext";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  fullWidth?: boolean;
}

// Routes where sidebar should be collapsed by default
const collapsedByDefaultRoutes = ["/marketplace", "/marketplace/deals", "/marketplace/lenders", "/dispo/campaigns", "/dialer/session", "/communications", "/intel", "/pipeline", "/websites/new"];
const collapsedByDefaultPrefixes = ["/properties/", "/d4d/properties/", "/marketplace/deal/", "/websites/"];

export function AppLayout({ children, breadcrumbs, fullWidth }: AppLayoutProps) {
  const location = useLocation();
  const lockViewportHeight = fullWidth && (location.pathname.startsWith("/marketplace/deal/") || location.pathname.startsWith("/communications"));
  const shouldCollapseByDefault = collapsedByDefaultRoutes.includes(location.pathname) ||
    collapsedByDefaultPrefixes.some(prefix => location.pathname.startsWith(prefix));
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(shouldCollapseByDefault);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const userToggledRef = React.useRef(false);

  // Sync sidebar collapse state to the current route preference
  React.useEffect(() => {
    setSidebarCollapsed(shouldCollapseByDefault);
    setMobileMenuOpen(false);
    userToggledRef.current = false; // Reset user toggle on route change
  }, [location.pathname, shouldCollapseByDefault]);

  // Auto-expand sidebar when scrolling down (only if collapsed and user hasn't manually toggled)
  React.useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // If scrolling down past 100px threshold and sidebar is collapsed, expand it
          if (currentScrollY > 100 && sidebarCollapsed && !userToggledRef.current) {
            setSidebarCollapsed(false);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [sidebarCollapsed]);

  const handleSidebarToggle = () => {
    userToggledRef.current = true; // Mark that user manually toggled
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarProvider isCollapsed={sidebarCollapsed}>
      <div className={cn(
        "min-h-screen flex bg-surface-secondary relative",
        // For split-view deal detail, we want the layout locked to the viewport height so
        // the left map stays above-the-fold and only the right panel scrolls.
        lockViewportHeight ? "h-screen overflow-hidden" : ""
      )}>
        {/*
          Left-rail background layer (desktop): ensures the sidebar background color
          always reaches the bottom of the viewport/page visually, even if any
          scroll/height context changes.
        */}
        <div
          aria-hidden
          className={cn(
            "hidden lg:block fixed inset-y-0 left-0 bg-slate-900 z-0",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        />

        {/* Sidebar - sticky for desktop */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content - offset for fixed sidebar on desktop */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 relative z-10",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}>
          {/* Header - sticky at top */}
          <AppHeader
            onMenuClick={() => setMobileMenuOpen(true)}
            breadcrumbs={breadcrumbs}
          />

          {/* Page Content - normal flow, browser handles scrolling */}
          <main
            ref={mainRef}
            className={cn(
              cn(
                "flex-1 flex flex-col min-h-0",
                lockViewportHeight ? "overflow-hidden" : "overflow-visible"
              ),
              fullWidth ? "" : "p-4 lg:p-6 max-w-[90rem] mx-auto w-full"
            )}
            style={{ backgroundImage: 'var(--bg-gradient)' }}
          >
            <div key={location.pathname} className="page-transition flex-1 flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
