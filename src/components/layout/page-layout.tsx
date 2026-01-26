import * as React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
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
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
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
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
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
