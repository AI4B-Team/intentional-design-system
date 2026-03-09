import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { FundingWizard } from "@/components/marketplace";

export default function FundingRequest() {
  const handleComplete = (_request: any) => {
    // Request handled by FundingWizard
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Marketplace", href: "/marketplace" },
        { label: "Request Funding" },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <FundingWizard onComplete={handleComplete} />
      </div>
    </DashboardLayout>
  );
}
