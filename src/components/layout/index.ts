// Active layout components
export { AppLayout } from "./AppLayout";
export { AppSidebar } from "./AppSidebar";
export { AppHeader } from "./AppHeader";
export { PageLayout, PageHeader, PageSection, Grid } from "./page-layout";

// Alias for backwards compatibility - DashboardLayout uses the same layout as AppLayout
// but wraps PageLayout for consistent rendering
export { PageLayout as DashboardLayout } from "./page-layout";

// Re-export ContentSection and StatsGrid from dashboard-layout for backwards compatibility
export { ContentSection, StatsGrid } from "./dashboard-layout";
