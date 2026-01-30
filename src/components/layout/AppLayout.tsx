import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

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
const collapsedByDefaultRoutes = ["/marketplace", "/marketplace/deals", "/marketplace/lenders"];
const collapsedByDefaultPrefixes = ["/properties/", "/d4d/properties/"];

export function AppLayout({ children, breadcrumbs, fullWidth }: AppLayoutProps) {
  const location = useLocation();
  const shouldCollapseByDefault = collapsedByDefaultRoutes.includes(location.pathname) ||
    collapsedByDefaultPrefixes.some(prefix => location.pathname.startsWith(prefix));
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(shouldCollapseByDefault);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);
  const userToggledRef = React.useRef(false);

  // Update sidebar state when navigating to/from collapsed routes
  React.useEffect(() => {
    if (shouldCollapseByDefault) {
      setSidebarCollapsed(true);
    }
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
    <div className="h-full min-h-screen flex bg-surface-secondary">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <AppHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          breadcrumbs={breadcrumbs}
        />

        {/* Page Content - fills remaining space, never blank */}
        <main
          ref={mainRef}
          className={cn(
            "flex-1 flex flex-col overflow-y-auto",
            fullWidth ? "" : "p-4 lg:p-6 max-w-7xl mx-auto w-full"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
