import * as React from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

export function DashboardLayout({
  children,
  user,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className={cn("flex h-screen w-full bg-background", className)}>
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
