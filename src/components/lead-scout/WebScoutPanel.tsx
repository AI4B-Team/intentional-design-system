import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search, Globe, Loader2, Sparkles, Import, ExternalLink,
  MapPin, CheckCircle, ChevronDown, ChevronUp, Zap, Save,
} from "lucide-react";
import { useScrapeJobs, ScrapedLead } from "@/hooks/useScrapeJobs";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "all_web", label: "All Web", icon: "🌐" },
  { value: "craigslist", label: "Craigslist", icon: "🏠" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "zillow", label: "Zillow", icon: "🏡" },
  { value: "realtor", label: "Realtor", icon: "🔑" },
  { value: "offerup", label: "OfferUp", icon: "🛒" },
  { value: "forsalebyowner", label: "FSBO", icon: "🏘️" },
];

interface WebScoutPanelProps {
  /** Pre-fill the search query */
  defaultQuery?: string;
  /** Pre-select sources */
  defaultSources?: string[];
  /** Auto-run on mount */
  autoRun?: boolean;
  /** Compact mode - inline bar instead of full panel */
  compact?: boolean;
  /** Triggered from a buy box or campaign - shows context */
  context?: { type: "buybox" | "campaign" | "general"; name?: string };
  /** Callback when leads are found */
  onLeadsFound?: (count: number) => void;
  /** Whether to show the results inline */
  showResults?: boolean;
  /** Additional class */
  className?: string;
}

function CompactLeadCard({ lead, onImport }: { lead: ScrapedLead; onImport: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">{lead.title || "Untitled"}</h4>
          <Badge variant="outline" className="text-[10px] capitalize shrink-0">{lead.source_name}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          {lead.address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {lead.address}
            </span>
          )}
          {lead.price && <span className="font-medium text-foreground">${lead.price.toLocaleString()}</span>}
          {lead.bedrooms && <span>{lead.bedrooms}bd</span>}
          {lead.bathrooms && <span>{lead.bathrooms}ba</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {lead.is_imported ? (
          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="h-3 w-3 mr-0.5" />
            Imported
          </Badge>
        ) : (
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={onImport}>
            <Import className="h-3 w-3 mr-1" />
            Import
          </Button>
        )}
        {lead.source_url && (
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
            <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function WebScoutPanel({
  defaultQuery = "",
  defaultSources = ["craigslist", "facebook", "all_web"],
  autoRun = false,
  compact = false,
  context,
  onLeadsFound,
  showResults = true,
  className,
}: WebScoutPanelProps) {
  const { leads, runScrape, importLead, createJob } = useScrapeJobs();
  const [query, setQuery] = useState(defaultQuery);
  const [sources, setSources] = useState<string[]>(defaultSources);
  const [expanded, setExpanded] = useState(!compact);
  const [showLeads, setShowLeads] = useState(false);
  const [lastSearchCount, setLastSearchCount] = useState<number | null>(null);

  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (autoRun && defaultQuery && !hasRun.current) {
      hasRun.current = true;
      handleSearch();
    }
  }, [autoRun, defaultQuery]);

  const handleSearch = () => {
    if (!query.trim()) return;
    runScrape.mutate(
      { query, sources },
      {
        onSuccess: (data) => {
          const count = data?.leads_found || 0;
          setLastSearchCount(count);
          setShowLeads(true);
          onLeadsFound?.(count);
        },
      }
    );
  };

  const handleSaveAndRun = () => {
    if (!query.trim()) return;
    createJob.mutate(
      {
        name: context?.name ? `${context.name} - Web Scout` : query.substring(0, 60),
        query,
        sources,
        is_shared: true,
      },
      {
        onSuccess: (job) => {
          runScrape.mutate(
            { query, sources, jobId: job.id },
            {
              onSuccess: (data) => {
                const count = data?.leads_found || 0;
                setLastSearchCount(count);
                setShowLeads(true);
                onLeadsFound?.(count);
              },
            }
          );
        },
      }
    );
  };

  const toggleSource = (value: string) => {
    setSources((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  // Compact inline bar
  if (compact && !expanded) {
    return (
      <Card
        padding="sm"
        className={cn(
          "flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors border-dashed",
          className
        )}
        onClick={() => setExpanded(true)}
      >
        <div className="p-2 rounded-lg bg-primary/10">
          <Globe className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Web Scout</span>
            <Badge variant="outline" className="text-[10px]">AI</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Scrape Facebook, Craigslist & the entire web for leads
          </p>
        </div>
        {lastSearchCount !== null && (
          <Badge variant="secondary" className="text-xs">{lastSearchCount} found</Badge>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card padding="md" className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Web Scout
              <Badge variant="outline" className="text-[10px]">AI Powered</Badge>
            </h3>
            {context && (
              <p className="text-xs text-muted-foreground">
                {context.type === "buybox" && `Auto-scouting for: ${context.name}`}
                {context.type === "campaign" && `Campaign lead scout: ${context.name}`}
                {context.type === "general" && "Search the web for off-market leads"}
              </p>
            )}
          </div>
        </div>
        {compact && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(false)}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. mobile homes for sale in Tampa under $100k"
          className="text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={!query.trim() || runScrape.isPending} className="shrink-0">
          {runScrape.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" onClick={handleSaveAndRun} disabled={!query.trim()} className="shrink-0" title="Save & Run">
          <Save className="h-4 w-4" />
        </Button>
      </div>

      {/* Source chips */}
      <div className="flex flex-wrap gap-1.5">
        {SOURCE_OPTIONS.map((source) => (
          <button
            key={source.value}
            onClick={() => toggleSource(source.value)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1",
              sources.includes(source.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <span>{source.icon}</span>
            {source.label}
          </button>
        ))}
      </div>

      {/* Results status */}
      {lastSearchCount !== null && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground">
            Found <strong className="text-foreground">{lastSearchCount}</strong> leads from web sources
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowLeads(!showLeads)}
          >
            {showLeads ? "Hide" : "Show"} Results
          </Button>
        </div>
      )}

      {/* Inline results */}
      {showResults && showLeads && leads.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {leads.slice(0, 20).map((lead) => (
            <CompactLeadCard
              key={lead.id}
              lead={lead}
              onImport={() => importLead.mutate(lead.id)}
            />
          ))}
          {leads.length > 20 && (
            <p className="text-xs text-center text-muted-foreground py-2">
              +{leads.length - 20} more leads — view all in{" "}
              <a href="/tools/lead-scout" className="text-primary hover:underline">Lead Scout</a>
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
