import * as React from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import {
  PropertyHero,
  PropertyTabs,
  OverviewTab,
  UnderwritingTab,
  OffersTab,
  OutreachTab,
  AppointmentsTab,
} from "@/components/properties/property-detail";

// Sample property data - in real app, fetch by ID
const sampleProperty = {
  id: "1",
  address: "1423 Elm Street",
  city: "Austin",
  state: "TX",
  zipCode: "78701",
  beds: 3,
  baths: 2,
  sqft: 1850,
  yearBuilt: 1985,
  lotSize: "0.25 acres",
  propertyType: "Single Family",
  arv: 425000,
  repairs: 30000,
  score: 892,
  velocityScore: 720,
  urgencyLevel: "high",
  status: "Hot Lead",
  source: "Direct Mail",
  addedDate: "3 days ago",
  ownerName: "John Smith",
  ownerPhone: "(512) 555-0123",
  ownerEmail: "john.smith@email.com",
  ownerAddress: "456 Oak Avenue, Austin, TX 78702",
  mortgageBalance: 185000,
  mortgageRate: 3.5,
  mortgagePayment: 1250,
  lender: "Wells Fargo",
  scoreBreakdown: [
    { signal: "Equity > 40%", points: 150 },
    { signal: "Vacant Property", points: 200 },
    { signal: "Tax Delinquent", points: 175 },
    { signal: "Probate", points: 250 },
    { signal: "Long Ownership (15+ yrs)", points: 117 },
  ],
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "underwriting", label: "Underwriting" },
  { id: "offers", label: "Offers", count: 3 },
  { id: "outreach", label: "Outreach", count: 5 },
  { id: "appointments", label: "Appointments", count: 2 },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [status, setStatus] = React.useState(sampleProperty.status);

  // In real app, fetch property by ID
  const property = { ...sampleProperty, status };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Properties", href: "/properties" },
        { label: property.address },
      ]}
      fullWidth
    >
      {/* Hero Section */}
      <PropertyHero
        address={property.address}
        city={property.city}
        state={property.state}
        zipCode={property.zipCode}
        status={property.status}
        beds={property.beds}
        baths={property.baths}
        sqft={property.sqft}
        yearBuilt={property.yearBuilt}
        arv={property.arv}
        score={property.score}
        onStatusChange={setStatus}
        onMakeOffer={() => console.log("Make offer")}
        onLogContact={() => console.log("Log contact")}
        onSchedule={() => console.log("Schedule")}
        onEdit={() => console.log("Edit")}
      />

      {/* Tab Navigation */}
      <PropertyTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === "overview" && <OverviewTab property={property} />}
        {activeTab === "underwriting" && <UnderwritingTab property={property} />}
        {activeTab === "offers" && <OffersTab />}
        {activeTab === "outreach" && <OutreachTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
      </div>
    </DashboardLayout>
  );
}
