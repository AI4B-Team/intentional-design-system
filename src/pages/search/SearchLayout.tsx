import * as React from "react";
import { Outlet } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";

export default function SearchLayout() {
  return (
    <PageLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">AI Scan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run an on-demand scan for distress signals in a ZIP or city.
        </p>
      </div>
      <Outlet />
    </PageLayout>
  );
}
