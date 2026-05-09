import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { toast } from "@/hooks/use-toast";

export default function SearchLookup() {
  const navigate = useNavigate();
  const { organizationId } = useOrganizationContext();
  const [query, setQuery] = React.useState("");
  const [recent, setRecent] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!organizationId) return;
    supabase
      .from("leads_properties")
      .select("id, address, city, state, source, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setRecent(data || []));
  }, [organizationId]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // Look up properties first to deep-link if found
    const { data: existing } = await supabase
      .from("properties")
      .select("id, address")
      .ilike("address", `%${query.trim()}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      navigate(`/properties/${existing[0].id}`);
      return;
    }

    // Otherwise route to marketplace search with the address
    toast({ title: "No exact match", description: "Showing marketplace results for that area." });
    navigate(`/marketplace?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Address, city, ZIP, or APN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg">
            Search
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Tip: paste a full street address for instant property analysis.
        </p>
      </Card>

      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Recent Properties
          </h3>
          <div className="grid gap-2">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/properties/${r.id}`)}
                className="text-left p-3 rounded-md border border-border hover:bg-accent transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium">{r.address}</div>
                  <div className="text-xs text-muted-foreground">
                    {[r.city, r.state].filter(Boolean).join(", ")} · source: {r.source}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
