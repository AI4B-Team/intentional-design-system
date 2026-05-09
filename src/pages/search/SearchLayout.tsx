import * as React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Search as SearchIcon, Map as MapIcon, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/search", label: "Lookup", icon: SearchIcon, end: true },
  { to: "/search/map", label: "Map", icon: MapIcon },
  { to: "/search/ai-scan", label: "AI Scan", icon: ScanLine },
];

export default function SearchLayout() {
  const { pathname } = useLocation();
  const active = tabs.find((t) => (t.end ? pathname === t.to : pathname.startsWith(t.to)));

  return (
    <PageLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You do the looking — search an address, explore the map, or run a scan.
        </p>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active?.to === t.to;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </PageLayout>
  );
}
