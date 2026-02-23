import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Globe,
  Eye,
  MoreHorizontal,
  Pencil,
  Copy,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  BarChart3,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  useSellerWebsites,
  useWebsiteStats,
  useDuplicateWebsite,
  useUnpublishWebsite,
  usePublishWebsite,
  useDeleteWebsite,
} from "@/hooks/useSellerWebsites";

export default function SellerWebsites() {
  const navigate = useNavigate();
  const { data: websites, isLoading } = useSellerWebsites();
  const { data: stats } = useWebsiteStats();
  const duplicateWebsite = useDuplicateWebsite();
  const unpublishWebsite = useUnpublishWebsite();
  const publishWebsite = usePublishWebsite();
  const deleteWebsite = useDeleteWebsite();
  
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "published":
        return <Badge variant="success">🟢 Published</Badge>;
      case "paused":
        return <Badge variant="warning">⏸️ Paused</Badge>;
      default:
        return <Badge variant="secondary">🟡 Draft</Badge>;
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteWebsite.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Websites"
        description="Build and manage landing pages for sellers, buyers, listings, and more"
        action={
          <Button variant="primary" icon={<Plus />} onClick={() => navigate("/websites/new")}>
            Create Website
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Sites</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalSites || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <Play className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Published</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.published || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Views</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalViews?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Leads</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalLeads || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Avg Conversion</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.avgConversion || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Websites Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : !websites || websites.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Globe className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h3 className="text-h3 font-medium text-content mb-2">No Websites Yet</h3>
          <p className="text-small text-content-secondary mb-6">
            Create your first website to start capturing leads.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={() => navigate("/websites/new")}>
            Create Your First Website
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((website) => (
            <Card key={website.id} variant="default" padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview Thumbnail */}
              <div 
                className="h-32 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`/websites/${website.id}/edit`)}
                style={{ 
                  backgroundColor: website.primary_color ? `${website.primary_color}20` : undefined 
                }}
              >
                <Globe className="h-10 w-10 text-content-tertiary/30" />
              </div>

              <CardContent className="p-4">
                {/* Title & URL */}
                <div className="mb-3">
                  <h3 
                    className="text-body font-semibold text-content truncate cursor-pointer hover:text-brand transition-colors"
                    onClick={() => navigate(`/websites/${website.id}/edit`)}
                  >
                    {website.name}
                  </h3>
                  <p className="text-small text-content-secondary truncate">
                    /s/{website.slug}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-small text-content-secondary mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {website.total_views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {website.total_submissions || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {website.total_views && website.total_views > 0
                      ? ((website.total_submissions || 0) / website.total_views * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(website.status)}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/websites/${website.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/s/${website.slug}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white">
                        <DropdownMenuItem onClick={() => navigate(`/websites/${website.id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Website
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/s/${website.slug}`, "_blank")}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/websites/${website.id}/leads`)}>
                          <Users className="h-4 w-4 mr-2" />
                          View Leads
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/websites/${website.id}/analytics`)}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => duplicateWebsite.mutate(website.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {website.status === "published" ? (
                          <DropdownMenuItem onClick={() => unpublishWebsite.mutate(website.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => publishWebsite.mutate(website.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(website.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Website</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this website? This action cannot be undone.
              All leads associated with this website will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
