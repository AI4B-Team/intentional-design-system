import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PenTool,
  FileText,
  Calculator,
  Search,
  Building2,
  MapPin,
  Megaphone,
  Phone,
  Globe,
  Hammer,
  Users,
  BarChart3,
  Wallet,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href: string;
  category: "documents" | "analysis" | "marketing" | "operations" | "data";
  isNew?: boolean;
  isFeatured?: boolean;
  usageCount?: number;
}

const apps: AppItem[] = [
  // Documents & Signatures
  {
    id: "signatures",
    name: "Digital Signatures",
    description: "Send documents for e-signature and track signing status",
    icon: PenTool,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    href: "/apps/signatures",
    category: "documents",
    isFeatured: true,
  },
  {
    id: "documents",
    name: "Documents",
    description: "Manage contract templates, LOIs, and agreements",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    href: "/documents",
    category: "documents",
  },
  // Analysis Tools
  {
    id: "deal-analyzer",
    name: "Deal Analyzer",
    description: "Analyze potential deals with ARV, repairs, and profit estimates",
    icon: Calculator,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    href: "/tools/deal-analyzer",
    category: "analysis",
    isFeatured: true,
  },
  {
    id: "market-analyzer",
    name: "Market Analyzer",
    description: "Research market trends, comps, and neighborhood data",
    icon: BarChart3,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    href: "/intel",
    category: "analysis",
  },
  {
    id: "calculators",
    name: "Calculators",
    description: "MAO, rehab cost, ROI, and other investment calculators",
    icon: Calculator,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    href: "/calculators",
    category: "analysis",
  },
  // Marketing
  {
    id: "campaigns",
    name: "Campaigns",
    description: "Create and manage email campaigns to agents and property owners",
    icon: Megaphone,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    href: "/dispo/campaigns",
    category: "marketing",
  },
  {
    id: "offer-blaster",
    name: "Offer Blaster",
    description: "Send bulk offers to agents and property owners",
    icon: Megaphone,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    href: "/tools/offer-blaster",
    category: "marketing",
    isNew: true,
  },
  {
    id: "websites",
    name: "Websites",
    description: "Build landing pages for sellers, buyers, listings, and more",
    icon: Globe,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    href: "/websites",
    category: "marketing",
  },
  {
    id: "dialer",
    name: "Power Dialer",
    description: "Auto-dial leads with scripts and call tracking",
    icon: Phone,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    href: "/communications",
    category: "marketing",
  },
  // Operations
  {
    id: "financing",
    name: "Financing",
    description: "Find funding, manage lenders, and track capital sources",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    href: "/financing",
    category: "operations",
  },
  {
    id: "renovations",
    name: "Renovations",
    description: "Plan rehabs, track progress, and manage contractors",
    icon: Hammer,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    href: "/renovations",
    category: "operations",
  },
  {
    id: "contractors",
    name: "Contractors",
    description: "Manage your contractor network and get bids",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    href: "/contractors",
    category: "operations",
  },
  {
    id: "capital",
    name: "Capital",
    description: "Find funding, manage lenders, and track loan requests",
    icon: Wallet,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    href: "/capital",
    category: "operations",
  },
  // Data
  {
    id: "d4d",
    name: "Driving for Dollars",
    description: "Route planning and property scouting for D4D campaigns",
    icon: MapPin,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    href: "/d4d",
    category: "data",
  },
  {
    id: "lists",
    name: "Lists",
    description: "Import, manage, and dedupe property lists",
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: "/marketing/lists",
    category: "data",
  },
  {
    id: "property-scout",
    name: "Property Scout",
    description: "Find off-market deals with advanced property search",
    icon: Building2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    href: "/tools/property-scout",
    category: "data",
  },
  // Documents & Templates
  {
    id: "templates",
    name: "Templates",
    description: "Create and manage reusable message, email, and document templates",
    icon: FileText,
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    href: "/apps/templates",
    category: "documents",
    isNew: true,
  },
];

const categories = [
  { id: "all", label: "All Apps", count: apps.length },
  { id: "documents", label: "Documents", count: apps.filter((a) => a.category === "documents").length },
  { id: "analysis", label: "Analysis", count: apps.filter((a) => a.category === "analysis").length },
  { id: "marketing", label: "Marketing", count: apps.filter((a) => a.category === "marketing").length },
  { id: "operations", label: "Operations", count: apps.filter((a) => a.category === "operations").length },
  { id: "data", label: "Data", count: apps.filter((a) => a.category === "data").length },
];

export default function Apps() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = apps.filter((app) => app.isFeatured);

  return (
    <PageLayout>
        <PageHeader
          title="Apps"
          description="Tools and utilities to supercharge your real estate investing"
          className="mb-4"
        />

        {/* Search and Categories */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
                <span className="ml-1.5 text-xs opacity-70">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Apps */}
        {activeCategory === "all" && !searchQuery && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredApps.map((app) => (
                <Card
                  key={app.id}
                  padding="lg"
                  className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/30 bg-gradient-to-br from-background to-muted/30"
                  onClick={() => navigate(app.href)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", app.iconBg)}>
                      <app.icon className={cn("h-6 w-6", app.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        {app.isNew && (
                          <Badge variant="default" size="sm" className="bg-primary/10 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Apps Grid */}
        <div>
          {activeCategory === "all" && !searchQuery && (
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">All Apps</h2>
              <Badge variant="outline" className="text-muted-foreground">
                {apps.length}
              </Badge>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                padding="md"
                className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                onClick={() => navigate(app.href)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2.5 rounded-lg", app.iconBg)}>
                    <app.icon className={cn("h-5 w-5", app.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {app.name}
                      </h3>
                      {app.isNew && (
                        <Badge variant="default" size="sm" className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{app.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground mb-1">No Apps Found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>
    </PageLayout>
  );
}
