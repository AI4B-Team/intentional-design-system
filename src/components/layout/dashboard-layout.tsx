import * as React from "react";
import { cn } from "@/lib/utils";
import { AppSidebar, MobileSidebar, MobileTabBar } from "./app-sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  user = { name: "John Doe", email: "john@example.com" },
  title,
  breadcrumbs,
  showSearch = true,
  headerActions,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Close mobile menu when switching to desktop
  React.useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div className={cn("min-h-screen w-full bg-white", className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          user={user}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        user={user}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "min-h-screen transition-all duration-200 ease-out",
          "lg:ml-[260px]",
          sidebarCollapsed && "lg:ml-[72px]"
        )}
      >
        {/* Header */}
        <Header
          user={user}
          title={title}
          breadcrumbs={breadcrumbs}
          showSearch={showSearch}
          showMenuButton={true}
          onMenuClick={() => setMobileMenuOpen(true)}
          actions={headerActions}
        />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px)] p-md pb-24 lg:p-lg lg:pb-lg">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  );
}

// Page Header Component
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-lg",
        className
      )}
    >
      <div>
        <h1 className="text-h1 font-semibold text-content">{title}</h1>
        {description && (
          <p className="text-body text-content-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

// Content Section Component
interface ContentSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({
  title,
  description,
  actions,
  children,
  className,
}: ContentSectionProps) {
  return (
    <section className={cn("mb-md", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-h3 font-semibold text-content">{title}</h2>
            )}
            {description && (
              <p className="text-small text-content-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  children,
  columns = 4,
  className,
}: StatsGridProps) {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-md", colClasses[columns], className)}>
      {children}
    </div>
  );
}
