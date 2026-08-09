import { DashboardLayout, PageHeader } from "@/components/layout";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { FamilyEventsFeed } from "@/components/settings/FamilyEventsFeed";
import { HubIntegrationGuide } from "@/components/settings/HubIntegrationGuide";
import { ConnectedAppsCard } from "@/components/settings/ConnectedAppsCard";
import { AppRegistryCard } from "@/components/settings/AppRegistryCard";
import { OutboundWebhooksCard } from "@/components/settings/OutboundWebhooksCard";
import { SatelliteActionsCard } from "@/components/settings/SatelliteActionsCard";

export default function AppFamilySettings() {
  const { hasRole } = useOrganizationContext();
  const isAdmin = hasRole("admin");

  return (
    <DashboardLayout>
      <PageHeader
        title="App Family"
        description="Real Elite is the hub. Launch satellite apps with single sign-on, watch their events, and forward them anywhere."
      />

      <div className="space-y-6">
        <ConnectedAppsCard />

        {isAdmin && <AppRegistryCard />}

        <FamilyEventsFeed />

        <OutboundWebhooksCard />

        <SatelliteActionsCard />

        <HubIntegrationGuide />
      </div>
    </DashboardLayout>
  );
}
