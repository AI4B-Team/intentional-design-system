import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMailCampaigns, useMailTemplates, useLobConnection } from "@/hooks/useMailCampaigns";
import {
  Mail,
  Plus,
  FileText,
  Users,
  AlertCircle,
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { NoDataState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function MailDashboard() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading: campaignsLoading } = useMailCampaigns();
  const { data: templates, isLoading: templatesLoading } = useMailTemplates();
  const { data: lobConnection } = useLobConnection();

  const isConnected = lobConnection?.is_active;

  // Calculate stats
  const activeCampaigns = campaigns?.filter(c => ["sending", "scheduled"].includes(c.status)).length || 0;
  const totalSent = campaigns?.reduce((sum, c) => sum + c.total_sent, 0) || 0;
  const totalDelivered = campaigns?.reduce((sum, c) => sum + c.total_delivered, 0) || 0;
  const totalReturned = campaigns?.reduce((sum, c) => sum + c.total_returned, 0) || 0;
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0";

  const recentCampaigns = campaigns?.slice(0, 5) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "success" | "outline" | "destructive"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "outline", label: "Scheduled" },
      sending: { variant: "default", label: "Sending" },
      paused: { variant: "outline", label: "Paused" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <PageLayout>
      <PageHeader
        title="Direct Mail"
        description="Create and manage direct mail campaigns"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link to="/mail/templates">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Link>
            </Button>
            <Button variant="primary" asChild>
              <Link to="/mail/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        }
      />

      {/* Connection Warning */}
      {!isConnected && (
        <Card className="border-amber-500/50 bg-amber-500/5 mb-6">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-small font-medium">Lob API not connected</p>
              <p className="text-tiny text-content-secondary">
                Connect your Lob account to start sending direct mail campaigns.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings/integrations">Connect Lob</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold">{activeCampaigns}</div>
            <p className="text-tiny text-content-secondary">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-tiny text-content-secondary">Mail pieces sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold">{deliveryRate}%</div>
            <p className="text-tiny text-content-secondary">{totalDelivered.toLocaleString()} delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Returned</CardTitle>
            <RotateCcw className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold">{totalReturned.toLocaleString()}</div>
            <p className="text-tiny text-content-secondary">Undeliverable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest direct mail campaigns</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mail/campaigns">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/mail/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-small font-medium">{campaign.name}</p>
                        <p className="text-tiny text-content-secondary">
                          {campaign.total_sent} sent · {campaign.total_delivered} delivered
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <NoDataState
                entityName="campaigns"
                onAdd={() => navigate("/mail/campaigns/new")}
                addLabel="Create Campaign"
              />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link to="/mail/campaigns/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link to="/mail/templates/new">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link to="/mail/lists">
                  <Users className="h-4 w-4 mr-2" />
                  Upload List
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link to="/mail/suppression">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Suppression List
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>{templates?.length || 0} templates available</CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <Skeleton className="h-24" />
              ) : templates && templates.length > 0 ? (
                <div className="space-y-2">
                  {templates.slice(0, 3).map((template) => (
                    <Link
                      key={template.id}
                      to={`/mail/templates/${template.id}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-content-tertiary" />
                      <span className="text-small">{template.name}</span>
                      <Badge variant="secondary" size="sm" className="ml-auto">
                        {template.type.replace("_", " ")}
                      </Badge>
                    </Link>
                  ))}
                  {templates.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/mail/templates">View all templates</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-tiny text-content-secondary mb-2">No templates yet</p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/mail/templates/new">Create Template</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
