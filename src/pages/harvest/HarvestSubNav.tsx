import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sprout } from "lucide-react";

export function HarvestSubNav() {
  const { pathname } = useLocation();
  // Detect whether we're under /leads/* (new) or /harvest/* (legacy alias)
  const base = pathname.startsWith("/leads") ? "/leads" : "/harvest";
  const isLeads = base === "/leads";

  const TABS = [
    { label: "Today", href: base },
    { label: "Prospects", href: `${base}/${isLeads ? "prospects" : "leads"}` },
    { label: "Outreach", href: `${base}/outreach` },
  ];

  return (
    <div className="border-b border-border-subtle mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{isLeads ? "Leads" : "HARVEST"}</h1>
          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
            The system does the looking
          </span>
        </div>
      </div>

      <nav className="flex gap-1 mt-3 -mb-px">
        {TABS.map((t) => {
          const active = t.href === base ? pathname === base : pathname.startsWith(t.href);
          return (
            <NavLink
              key={t.href}
              to={t.href}
              end={t.href === base}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
