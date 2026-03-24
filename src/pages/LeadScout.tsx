import * as React from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Globe,
  Sparkles,
  Play,
  Save,
  Share2,
  Trash2,
  ExternalLink,
  Import,
  Clock,
  MapPin,
  DollarSign,
  Home,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useScrapeJobs, ScrapeJob, ScrapedLead } from "@/hooks/useScrapeJobs";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "all_web", label: "All Web (Any Site)", icon: "🌐" },
  { value: "craigslist", label: "Craigslist", icon: "🏠" },
  { value: "facebook", label: "Facebook Marketplace", icon: "📘" },
  { value: "zillow", label: "Zillow FSBO", icon: "🏡" },
  { value: "realtor", label: "Realtor.com", icon: "🔑" },
  { value: "offerup", label: "OfferUp", icon: "🛒" },
  { value: "forsalebyowner", label: "ForSaleByOwner.com", icon: "🏘️" },
];

function LeadCard({ lead, onImport }: { lead: ScrapedLead; onImport: () => void }) {
  return (
    <Card padding="md" className={cn("transition-all", lead.is_imported && "opacity-60")}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm line-clamp-1">{lead.title || "Untitled Listing"}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">{lead.source_name}</Badge>
            {lead.status === "imported" && (
              <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Imported
              </Badge>
            )}
          </div>
        </div>
        {lead.price && (
          <span className="text-sm font-bold text-foreground">${lead.price.toLocaleString()}</span>
        )}
      </div>

      {lead.address && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3" />
          {lead.address}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {lead.bedrooms && <span>{lead.bedrooms} bd</span>}
        {lead.bathrooms && <span>{lead.bathrooms} ba</span>}
        {lead.sqft && <span>{lead.sqft.toLocaleString()} sqft</span>}
      </div>

      {lead.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{lead.description}</p>
      )}

      <div className="flex gap-2">
        {!lead.is_imported && (
          <Button size="sm" variant="default" className="flex-1" onClick={onImport}>
            <Import className="h-3 w-3 mr-1" />
            Import to Pipeline
          </Button>
        )}
        {lead.source_url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

function SavedSearchCard({ job, onRun }: { job: ScrapeJob; onRun: () => void }) {
  const { deleteJob } = useScrapeJobs();

  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{job.name}</h4>
            {job.is_shared && (
              <Badge variant="secondary" className="text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Shared
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{job.query}</p>
        </div>
        <Switch checked={job.is_active} />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span>{job.total_leads_found} leads found</span>
        {job.last_run_at && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(job.last_run_at).toLocaleDateString()}
          </span>
        )}
        <span className="capitalize">{job.schedule_interval}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="default" className="flex-1" onClick={onRun}>
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
        <Button size="sm" variant="ghost" onClick={() => deleteJob.mutate(job.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

export default function LeadScout() {
  const { jobs, leads, isLoadingJobs, isLoadingLeads, createJob, runScrape, importLead } = useScrapeJobs();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSources, setSelectedSources] = React.useState<string[]>(["craigslist", "facebook"]);
  const [isShared, setIsShared] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("search");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    runScrape.mutate(
      {
        query: searchQuery,
        sources: selectedSources,
      },
      {
        onSuccess: () => setActiveTab("leads"),
      }
    );
  };

  const handleSaveAndRun = () => {
    if (!searchQuery.trim()) return;
    createJob.mutate(
      {
        name: searchQuery.substring(0, 60),
        query: searchQuery,
        sources: selectedSources,
        is_shared: isShared,
      },
      {
        onSuccess: (job) => {
          runScrape.mutate(
            {
              query: searchQuery,
              sources: selectedSources,
              jobId: job.id,
            },
            {
              onSuccess: () => setActiveTab("leads"),
            }
          );
        },
      }
    );
  };

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Home className="h-4 w-4 mr-2" />
            Leads
            {leads.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{leads.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Save className="h-4 w-4 mr-2" />
            Saved Searches
            {jobs.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{jobs.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Input */}
          <Card padding="lg" className="bg-gradient-to-br from-background to-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">What leads are you looking for?</h3>
            </div>
            <Textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. All mobile home listings on market and off market on sites like Facebook and Craigslist that are for sale in Tampa, FL under $150,000"
              rows={3}
              className="mb-4 text-sm"
            />

            {/* Source Selection */}
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Search Sources</Label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((source) => (
                  <button
                    key={source.value}
                    onClick={() =>
                      setSelectedSources((prev) =>
                        prev.includes(source.value)
                          ? prev.filter((s) => s !== source.value)
                          : [...prev, source.value]
                      )
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5",
                      selectedSources.includes(source.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    )}
                  >
                    <span>{source.icon}</span>
                    {source.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Share toggle */}
            <div className="flex items-center gap-2 mb-4">
              <Switch checked={isShared} onCheckedChange={setIsShared} />
              <Label className="text-sm text-muted-foreground">Share with team</Label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || runScrape.isPending}
                className="flex-1"
              >
                {runScrape.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndRun}
                disabled={!searchQuery.trim() || createJob.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Run
              </Button>
            </div>
          </Card>

          {/* Quick Search Suggestions */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Searches</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "FSBO homes under $200k in Tampa, FL",
                "Mobile homes for sale by owner in Florida",
                "Distressed properties Craigslist Orlando",
                "Vacant lots for sale under $50k",
                "Wholesale deals off market properties",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted/50 hover:bg-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          {isLoadingLeads ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} padding="md" className="animate-pulse h-40" />
              ))}
            </div>
          ) : leads.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onImport={() => importLead.mutate(lead.id)}
                />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No Leads Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Search for leads using the search tab to get started
              </p>
              <Button onClick={() => setActiveTab("search")}>
                <Search className="h-4 w-4 mr-2" />
                Start Searching
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {isLoadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} padding="md" className="animate-pulse h-32" />
              ))}
            </div>
          ) : jobs.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <SavedSearchCard
                  key={job.id}
                  job={job}
                  onRun={() => runScrape.mutate({ query: job.query || "", sources: job.sources, jobId: job.id })}
                />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <Save className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No Saved Searches</h3>
              <p className="text-sm text-muted-foreground">
                Save a search to reuse it or share with your team
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
