import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Eye, Users, ArrowRight, Plus } from "lucide-react";
import { useSellerWebsites } from "@/hooks/useSellerWebsites";

export function WebsitesDashboardWidget() {
  const { data: websites, isLoading } = useSellerWebsites();

  const publishedSites = websites?.filter((w) => w.status === "published") || [];

  if (isLoading) {
    return (
      <Card variant="default" padding="md">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-accent" />
          <h3 className="text-h4 font-medium">Websites</h3>
        </div>
        <Link to="/websites">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {publishedSites.length === 0 ? (
        <div className="text-center py-6">
          <Globe className="h-10 w-10 text-content-tertiary/50 mx-auto mb-3" />
          <p className="text-small text-content-secondary mb-3">
            No websites yet
          </p>
          <Link to="/websites/new">
            <Button variant="secondary" size="sm" icon={<Plus />}>
              Create Website
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {publishedSites.slice(0, 3).map((site) => (
            <Link
              key={site.id}
              to={`/websites/${site.id}/analytics`}
              className="flex items-center justify-between p-3 rounded-medium hover:bg-surface-secondary transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-small font-medium truncate">{site.name}</p>
                <p className="text-tiny text-content-tertiary truncate">
                  /{site.slug}
                </p>
              </div>
              <div className="flex items-center gap-4 text-small text-content-secondary">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{site.total_views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{site.total_submissions || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {publishedSites.length > 3 && (
        <div className="mt-3 pt-3 border-t border-border-subtle text-center">
          <Link to="/websites" className="text-small text-brand-accent hover:underline">
            +{publishedSites.length - 3} more sites
          </Link>
        </div>
      )}
    </Card>
  );
}
