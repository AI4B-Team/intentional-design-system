import * as React from "react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Play,
  Trash2,
  Target,
  Zap,
  Settings,
  TrendingUp,
  DollarSign,
  Home,
  Clock,
} from "lucide-react";
import { useBuyBoxes, BuyBox, BuyBoxCriteria } from "@/hooks/useBuyBoxes";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WebScoutPanel } from "@/components/lead-scout";
import { useScrapeJobs } from "@/hooks/useScrapeJobs";

const PROPERTY_TYPES = [
  { value: "sfr", label: "Single Family" },
  { value: "multi", label: "Multi-Family" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "mobile_home", label: "Mobile Home" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

function CreateBuyBoxDialog({ onCreated }: { onCreated: () => void }) {
  const { createBuyBox } = useBuyBoxes();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [offerPct, setOfferPct] = React.useState([70]);
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");
  const [maxDaily, setMaxDaily] = React.useState("10");
  const [propertyTypes, setPropertyTypes] = React.useState<string[]>([]);

  const handleCreate = () => {
    const criteria: BuyBoxCriteria = {
      price_min: priceMin ? Number(priceMin) : undefined,
      price_max: priceMax ? Number(priceMax) : undefined,
      property_types: propertyTypes.length ? propertyTypes : undefined,
      offer_pct: offerPct[0] / 100,
    };

    createBuyBox.mutate(
      {
        name: name || "New Buy Box",
        criteria,
        offer_percentage: offerPct[0] / 100,
        max_daily_offers: Number(maxDaily) || 10,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          onCreated();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Buy Box
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Buy Box</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tampa SFR Under $200k" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min Price</Label>
              <Input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="$0" />
            </div>
            <div>
              <Label>Max Price</Label>
              <Input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="$500,000" />
            </div>
          </div>
          <div>
            <Label>Property Types</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() =>
                    setPropertyTypes((prev) =>
                      prev.includes(pt.value) ? prev.filter((v) => v !== pt.value) : [...prev, pt.value]
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    propertyTypes.includes(pt.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  )}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Offer % of ARV: {offerPct[0]}%</Label>
            <Slider value={offerPct} onValueChange={setOfferPct} min={40} max={90} step={1} className="mt-2" />
          </div>
          <div>
            <Label>Max Daily Offers</Label>
            <Input type="number" value={maxDaily} onChange={(e) => setMaxDaily(e.target.value)} />
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={createBuyBox.isPending}>
            {createBuyBox.isPending ? "Creating..." : "Create Buy Box"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BuyBoxCard({ buyBox }: { buyBox: BuyBox }) {
  const { updateBuyBox, deleteBuyBox, runEngine } = useBuyBoxes();
  const criteria = buyBox.criteria || {};

  return (
    <Card padding="md" className="relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{buyBox.name}</h3>
            <p className="text-xs text-muted-foreground">
              {(buyBox.offer_percentage * 100).toFixed(0)}% of ARV · Max {buyBox.max_daily_offers}/day
            </p>
          </div>
        </div>
        <Switch
          checked={buyBox.is_active}
          onCheckedChange={(checked) => updateBuyBox.mutate({ id: buyBox.id, is_active: checked })}
        />
      </div>

      {/* Criteria Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {criteria.price_min && (
          <Badge variant="outline" className="text-xs">Min ${(criteria.price_min / 1000).toFixed(0)}k</Badge>
        )}
        {criteria.price_max && (
          <Badge variant="outline" className="text-xs">Max ${(criteria.price_max / 1000).toFixed(0)}k</Badge>
        )}
        {criteria.property_types?.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded bg-muted/50">
          <p className="text-lg font-bold text-foreground">{buyBox.total_offers_sent}</p>
          <p className="text-[10px] text-muted-foreground">Offers Sent</p>
        </div>
        <div className="text-center p-2 rounded bg-muted/50">
          <p className="text-lg font-bold text-foreground">{buyBox.total_deals_closed}</p>
          <p className="text-[10px] text-muted-foreground">Deals Closed</p>
        </div>
        <div className="text-center p-2 rounded bg-muted/50">
          <p className="text-[10px] text-muted-foreground mt-1">
            {buyBox.last_run_at ? new Date(buyBox.last_run_at).toLocaleDateString() : "Never"}
          </p>
          <p className="text-[10px] text-muted-foreground">Last Run</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          onClick={() => runEngine.mutate(buyBox.id)}
          disabled={runEngine.isPending}
        >
          <Play className="h-3 w-3 mr-1" />
          {runEngine.isPending ? "Running..." : "Run Now"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteBuyBox.mutate(buyBox.id)}
          disabled={deleteBuyBox.isPending}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

export default function AutoOfferEngine() {
  const { data: buyBoxes, isLoading } = useBuyBoxes();
  const { organization } = useOrganization();
  const [automationMode, setAutomationMode] = React.useState(
    (organization as any)?.automation_mode || "hybrid"
  );

  const handleModeChange = async (mode: string) => {
    setAutomationMode(mode);
    if (organization?.id) {
      const { error } = await supabase
        .from("organizations")
        .update({ automation_mode: mode } as any)
        .eq("id", organization.id);
      if (error) toast.error("Failed to update mode");
      else toast.success(`Mode set to ${mode}`);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Auto-Offer Engine"
        description="Define buy boxes and let AI match properties, generate offers, and send them automatically"
        className="mb-6"
      />

      {/* Automation Mode */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Automation Mode</h3>
              <p className="text-sm text-muted-foreground">
                {automationMode === "full_auto"
                  ? "Offers are sent automatically without approval"
                  : automationMode === "hybrid"
                  ? "Offers require your approval before sending"
                  : "Engine is paused — no offers generated"}
              </p>
            </div>
          </div>
          <Select value={automationMode} onValueChange={handleModeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hybrid">Hybrid (Approve)</SelectItem>
              <SelectItem value="full_auto">Full Auto</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Buy Boxes */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Buy Boxes</h2>
          <Badge variant="outline">{buyBoxes?.length || 0}</Badge>
        </div>
        <CreateBuyBoxDialog onCreated={() => {}} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="animate-pulse h-48" />
          ))}
        </div>
      ) : buyBoxes?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyBoxes.map((bb) => (
            <BuyBoxCard key={bb.id} buyBox={bb} />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">No Buy Boxes Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a buy box to define your criteria and let the engine find matching deals
          </p>
          <CreateBuyBoxDialog onCreated={() => {}} />
        </Card>
      )}
    </PageLayout>
  );
}
