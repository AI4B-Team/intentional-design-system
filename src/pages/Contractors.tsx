import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Clock,
  Hammer,
  Users,
  Award,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useContractors, useContractorStats, type Contractor } from "@/hooks/useContractors";
import { AddContractorModal } from "@/components/contractors/add-contractor-modal";
import { cn } from "@/lib/utils";

const specialtyOptions = [
  { value: "all", label: "All Specialties" },
  { value: "general", label: "General" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bath", label: "Bathroom" },
  { value: "roofing", label: "Roofing" },
  { value: "hvac", label: "HVAC" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "flooring", label: "Flooring" },
  { value: "paint", label: "Paint" },
];

function StatCard({
  label,
  value,
  icon,
  iconBgClass,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass: string;
}) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconBgClass)}>
          {icon}
        </div>
      </div>
      <div className="text-display font-semibold text-foreground tabular-nums mt-3">{value}</div>
      <div className="text-small text-muted-foreground">{label}</div>
    </Card>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  const stars = rating || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= stars ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="text-small font-medium ml-1">{stars.toFixed(1)}</span>
    </div>
  );
}

function ContractorCard({ contractor, onClick }: { contractor: Contractor; onClick: () => void }) {
  return (
    <Card
      variant="default"
      padding="md"
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-body font-semibold text-foreground">{contractor.name}</h3>
          {contractor.company && (
            <p className="text-small text-muted-foreground">{contractor.company}</p>
          )}
        </div>
        <Badge
          variant={
            contractor.status === "active"
              ? "success"
              : contractor.status === "blacklisted"
              ? "error"
              : "secondary"
          }
          size="sm"
        >
          {contractor.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {contractor.specialties?.slice(0, 4).map((spec) => (
          <Badge key={spec} variant="secondary" size="sm" className="capitalize">
            {spec}
          </Badge>
        ))}
        {(contractor.specialties?.length || 0) > 4 && (
          <Badge variant="secondary" size="sm">
            +{contractor.specialties.length - 4}
          </Badge>
        )}
      </div>

      <StarRating rating={contractor.overall_rating} />

      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border-subtle">
        <div>
          <p className="text-tiny text-muted-foreground">Jobs</p>
          <p className="text-small font-semibold">{contractor.jobs_completed}</p>
        </div>
        <div>
          <p className="text-tiny text-muted-foreground">On-Time</p>
          <p className="text-small font-semibold">
            {contractor.on_time_percentage ? `${contractor.on_time_percentage}%` : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
        {contractor.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${contractor.phone}`);
            }}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        {contractor.email && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`mailto:${contractor.email}`);
            }}
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View
        </Button>
      </div>
    </Card>
  );
}

export default function Contractors() {
  const navigate = useNavigate();
  const { data: contractors, isLoading } = useContractors();
  const { data: stats } = useContractorStats();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [specialtyFilter, setSpecialtyFilter] = React.useState("all");

  const filteredContractors = React.useMemo(() => {
    if (!contractors) return [];
    return contractors.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty =
        specialtyFilter === "all" || c.specialties?.includes(specialtyFilter);
      return matchesSearch && matchesSpecialty;
    });
  }, [contractors, search, specialtyFilter]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1 font-bold text-foreground">My Contractors</h1>
          <p className="text-body text-muted-foreground">
            Manage your contractor network and track bids
          </p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => setIsAddModalOpen(true)}>
          Add Contractor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Contractors"
          value={stats?.total || 0}
          icon={<Users className="h-5 w-5 text-brand" />}
          iconBgClass="bg-brand/10"
        />
        <StatCard
          label="Top Rated (4.5+)"
          value={stats?.topRated || 0}
          icon={<Award className="h-5 w-5 text-warning" />}
          iconBgClass="bg-warning/10"
        />
        <StatCard
          label="Active Jobs"
          value={stats?.activeJobs || 0}
          icon={<Briefcase className="h-5 w-5 text-success" />}
          iconBgClass="bg-success/10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contractors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {specialtyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contractors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="default" padding="md">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex gap-1.5 mb-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : filteredContractors.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Hammer className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-h3 font-semibold mb-2">No contractors yet</h3>
          <p className="text-muted-foreground mb-4">
            Add contractors to your network to request bids on properties.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={() => setIsAddModalOpen(true)}>
            Add Your First Contractor
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContractors.map((contractor) => (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              onClick={() => navigate(`/contractors/${contractor.id}`)}
            />
          ))}
        </div>
      )}

      <AddContractorModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </DashboardLayout>
  );
}
