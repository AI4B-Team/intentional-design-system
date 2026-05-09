import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { LeadForgeHeader } from "@/components/leadforge/LeadForgeHeader";
import { LeadForgeTabs, MainTab } from "@/components/leadforge/LeadForgeTabs";
import { TodayView } from "@/components/leadforge/views/TodayView";
import { ProspectsView } from "@/components/leadforge/views/ProspectsView";
import { PipelineView } from "@/components/leadforge/views/PipelineView";
import { ActionsView } from "@/components/leadforge/views/ActionsView";
import { SystemView } from "@/components/leadforge/views/SystemView";

export default function LeadForge() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as MainTab) || "today";
  const setTab = (t: MainTab) => {
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p, { replace: true });
  };

  return (
    <PageLayout fullWidth>
      <div className="min-h-full bg-background">
        <LeadForgeHeader />
        <LeadForgeTabs value={tab} onChange={setTab} />
        <div className="px-6 pb-12">
          {tab === "today" && <TodayView />}
          {tab === "prospects" && <ProspectsView />}
          {tab === "pipeline" && <PipelineView />}
          {tab === "actions" && <ActionsView />}
          {tab === "system" && <SystemView />}
        </div>
      </div>
    </PageLayout>
  );
}
