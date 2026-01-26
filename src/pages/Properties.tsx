import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PropertyCard,
  PropertyFilters,
  PropertiesTable,
  AddPropertyModal,
} from "@/components/properties";
import { Plus, Upload, Home } from "lucide-react";

// Sample properties data
const sampleProperties = [
  {
    id: "1",
    address: "1423 Elm Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    beds: 3,
    baths: 2,
    sqft: 1850,
    arv: 425000,
    spread: 75000,
    score: 892,
    status: "Hot Lead" as const,
    source: "Direct Mail",
    addedDate: "Today",
  },
  {
    id: "2",
    address: "567 Oak Avenue",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    beds: 4,
    baths: 3,
    sqft: 2400,
    arv: 520000,
    spread: 85000,
    score: 756,
    status: "Warm" as const,
    source: "Cold Call",
    addedDate: "Yesterday",
  },
  {
    id: "3",
    address: "890 Pine Road",
    city: "Houston",
    state: "TX",
    zipCode: "77002",
    beds: 3,
    baths: 2,
    sqft: 1650,
    arv: 310000,
    spread: 45000,
    score: 634,
    status: "In Review" as const,
    source: "Driving for Dollars",
    addedDate: "2 days ago",
  },
  {
    id: "4",
    address: "234 Maple Drive",
    city: "San Antonio",
    state: "TX",
    zipCode: "78201",
    beds: 2,
    baths: 1,
    sqft: 1200,
    arv: 195000,
    spread: 30000,
    score: 512,
    status: "New" as const,
    source: "Referral",
    addedDate: "3 days ago",
  },
  {
    id: "5",
    address: "456 Cedar Lane",
    city: "Fort Worth",
    state: "TX",
    zipCode: "76102",
    beds: 4,
    baths: 2.5,
    sqft: 2100,
    arv: 380000,
    spread: 55000,
    score: 423,
    status: "Warm" as const,
    source: "MLS",
    addedDate: "4 days ago",
  },
  {
    id: "6",
    address: "789 Birch Court",
    city: "Plano",
    state: "TX",
    zipCode: "75024",
    beds: 5,
    baths: 3,
    sqft: 2800,
    arv: 485000,
    spread: 65000,
    score: 345,
    status: "On Hold" as const,
    source: "Wholesaler",
    addedDate: "5 days ago",
  },
  {
    id: "7",
    address: "321 Willow Way",
    city: "Irving",
    state: "TX",
    zipCode: "75038",
    beds: 3,
    baths: 2,
    sqft: 1750,
    arv: 295000,
    spread: 40000,
    score: 287,
    status: "New" as const,
    source: "Direct Mail",
    addedDate: "1 week ago",
  },
  {
    id: "8",
    address: "654 Spruce Street",
    city: "Arlington",
    state: "TX",
    zipCode: "76010",
    beds: 3,
    baths: 2,
    sqft: 1550,
    arv: 265000,
    spread: 35000,
    score: 198,
    status: "Closed" as const,
    source: "Referral",
    addedDate: "2 weeks ago",
  },
  {
    id: "9",
    address: "987 Ash Avenue",
    city: "Frisco",
    state: "TX",
    zipCode: "75034",
    beds: 4,
    baths: 3,
    sqft: 2350,
    arv: 510000,
    spread: 80000,
    score: 824,
    status: "Hot Lead" as const,
    source: "Cold Call",
    addedDate: "Today",
  },
];

export default function Properties() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = React.useState("newest");
  const [activeFilters, setActiveFilters] = React.useState<{ id: string; label: string; value: string }[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [properties] = React.useState(sampleProperties);

  // Filter and sort properties
  const filteredProperties = React.useMemo(() => {
    let result = [...properties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "score-high":
        result.sort((a, b) => b.score - a.score);
        break;
      case "score-low":
        result.sort((a, b) => a.score - b.score);
        break;
      case "price-high":
        result.sort((a, b) => (b.arv || 0) - (a.arv || 0));
        break;
      case "price-low":
        result.sort((a, b) => (a.arv || 0) - (b.arv || 0));
        break;
      default:
        // newest first (default order)
        break;
    }

    return result;
  }, [properties, searchQuery, sortBy]);

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  const isEmpty = properties.length === 0;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Properties" }]}>
      {/* Page Header */}
      <PageHeader
        title="Properties"
        description={`${filteredProperties.length} properties`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload />}
            >
              Import CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus />}
              onClick={() => setShowAddModal(true)}
            >
              Add Property
            </Button>
          </div>
        }
      />

      {isEmpty ? (
        /* Empty State */
        <div className="flex items-center justify-center min-h-[400px]">
          <EmptyState
            icon={<Home className="h-12 w-12" />}
            title="No properties yet"
            description="Add your first property to get started tracking leads and deals."
            action={{
              label: "Add Property",
              onClick: () => setShowAddModal(true),
            }}
          />
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <PropertyFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={handleClearFilters}
            className="mb-lg"
          />

          {/* Card View */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  onClick={() => console.log("View property:", property.id)}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <PropertiesTable
              properties={filteredProperties}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onRowClick={(property) => console.log("View property:", property.id)}
              onCall={(id) => console.log("Call:", id)}
              onView={(id) => console.log("View:", id)}
              className="animate-fade-in"
            />
          )}
        </>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={(data) => {
          console.log("Save property:", data);
        }}
      />
    </DashboardLayout>
  );
}
