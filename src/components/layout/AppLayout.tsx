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

export function AppLayout({ children, breadcrumbs, fullWidth }: AppLayoutProps) {
  const location = useLocation();
  const shouldCollapseByDefault = collapsedByDefaultRoutes.includes(location.pathname);
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(shouldCollapseByDefault);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Update sidebar state when navigating to/from collapsed routes
  React.useEffect(() => {
    if (shouldCollapseByDefault) {
      setSidebarCollapsed(true);
    }
    setMobileMenuOpen(false);
  }, [location.pathname, shouldCollapseByDefault]);

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
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

        {/* Page Content */}
        <main
          className={cn(
            "flex-1 p-4 lg:p-6",
            !fullWidth && "max-w-7xl mx-auto w-full"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
