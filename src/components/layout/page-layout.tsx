import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  breadcrumbs?: BreadcrumbItem[];
  fullWidth?: boolean;
  headerActions?: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function PageLayout({ 
  children, 
  className,
  breadcrumbs,
  fullWidth,
}: PageLayoutProps) {
  const { user } = useAuth();

  // When the user is authenticated, always render inside the app shell
  // (left sidebar + top header). For unauthenticated pages, keep the
  // existing lightweight layout.
  if (user) {
    return (
      <AppLayout breadcrumbs={breadcrumbs} fullWidth={fullWidth}>
        <div className={cn("animate-fade-in", className)}>
          {children}
        </div>
      </AppLayout>
    );
  }

  return (
    <main className={cn("page-container animate-fade-in", className)}>
      {children}
    </main>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode; // Alias for backwards compatibility
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  actions,
  className,
}: PageHeaderProps) {
  const actionContent = action || actions;
  
  return (
    <div
      className={cn(
        "flex flex-col gap-1 pb-lg border-b border-border-subtle mb-lg",
        "sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-h1 text-foreground">{title}</h1>
        {description && (
          <p className="text-body text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionContent && <div className="mt-4 sm:mt-0">{actionContent}</div>}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("section-spacing", className)}>
      {(title || description) && (
        <div className="mb-md">
          {title && <h2 className="text-h2 text-foreground">{title}</h2>}
          {description && (
            <p className="text-body text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// Grid layout helpers
interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function Grid({ children, columns = 3, className }: GridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-md", gridCols[columns], className)}>
      {children}
    </div>
  );
}
