import * as React from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { HarvestSubNav } from "./HarvestSubNav";
import { cn } from "@/lib/utils";

const SUB_TABS = [
  { label: "All Leads", href: "/harvest/leads" },
  { label: "Focus List", href: "/harvest/leads/focus" },
  { label: "Active Buyers", href: "/harvest/leads/buyers" },
];

export default function HarvestLeadsLayout() {
  const { pathname } = useLocation();
  return (
    <PageLayout>
      <HarvestSubNav />
      <div className="flex gap-1 mb-4">
        {SUB_TABS.map((t) => {
          const active =
            t.href === "/harvest/leads"
              ? pathname === "/harvest/leads"
              : pathname === t.href;
          return (
            <NavLink
              key={t.href}
              to={t.href}
              end={t.href === "/harvest/leads"}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </NavLink>
          );
        })}
      </div>
      <Outlet />
    </PageLayout>
  );
}
