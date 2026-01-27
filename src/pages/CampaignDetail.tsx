import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  ArrowLeft,
  Play,
  Pause,
  Pencil,
  Trash2,
  MoreHorizontal,
  Building2,
  Mail,
  MailOpen,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  Percent,
  User,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useCampaignProperties,
  useUpdateCampaign,
  useDeleteCampaign,
  useUpdateCampaignProperty,
} from "@/hooks/useCampaigns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-info/10 text-info",
  pending: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  opened: "bg-warning/10 text-warning",
  responded: "bg-success/10 text-success",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: properties, isLoading: propsLoading } = useCampaignProperties(id);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const updateProperty = useUpdateCampaignProperty();

  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");

  const handleToggleStatus = async () => {
    if (!campaign) return;
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await updateCampaign.mutateAsync({
      id: campaign.id,
      updates: {
        status: newStatus,
        started_at: newStatus === "active" ? new Date().toISOString() : campaign.started_at,
      },
    });
  };

  const handleDelete = async () => {
    if (!campaign) return;
    await deleteCampaign.mutateAsync(campaign.id);
    navigate("/campaigns");
  };

  const handleMarkSent = async (propId: string) => {
    await updateProperty.mutateAsync({
      id: propId,
      updates: { status: "sent", sent_at: new Date().toISOString() },
    });
  };

  const handleMarkResponded = async (propId: string, responseType: string) => {
    await updateProperty.mutateAsync({
      id: propId,
      updates: {
        status: "responded",
        responded_at: new Date().toISOString(),
        response_type: responseType,
      },
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-96" />
      </PageLayout>
    );
  }

  if (!campaign) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-medium text-content">Campaign not found</h2>
          <Button variant="secondary" className="mt-4" onClick={() => navigate("/campaigns")}>
            Back to Campaigns
          </Button>
        </div>
      </PageLayout>
    );
  }

  const responseRate =
    campaign.sent_count > 0
      ? ((campaign.responded_count / campaign.sent_count) * 100).toFixed(1)
      : "0.0";

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-lg">
        <button
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-content-secondary hover:text-content mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h1 font-bold text-content">{campaign.name}</h1>
              <Badge className={cn("capitalize", statusColors[campaign.status])}>
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-body text-content-secondary">{campaign.description}</p>
            )}
            <p className="text-small text-content-tertiary mt-2">
              Created {format(parseISO(campaign.created_at), "MMM d, yyyy")}
              {campaign.started_at &&
                ` • Started ${format(parseISO(campaign.started_at), "MMM d, yyyy")}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status !== "completed" && (
              <Button
                variant={campaign.status === "active" ? "secondary" : "primary"}
                icon={campaign.status === "active" ? <Pause /> : <Play />}
                onClick={handleToggleStatus}
              >
                {campaign.status === "active" ? "Pause" : "Start"}
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<Pencil />}
              onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
            >
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Properties</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.properties_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Sent</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.sent_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <MailOpen className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Opened</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.opened_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Responded</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.responded_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand-accent/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Response Rate</p>
              <p className="text-h3 font-semibold tabular-nums">{responseRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="properties">Properties ({properties?.length || 0})</TabsTrigger>
          <TabsTrigger value="settings">Campaign Settings</TabsTrigger>
          <TabsTrigger value="template">Email Template</TabsTrigger>
        </TabsList>

        <Card variant="default" padding="none" className="mt-lg">
          {/* Properties Tab */}
          <TabsContent value="properties" className="mt-0">
            {propsLoading ? (
              <div className="p-lg">
                <Skeleton className="h-64" />
              </div>
            ) : !properties || properties.length === 0 ? (
              <div className="p-lg text-center">
                <Building2 className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
                <h3 className="text-h3 font-medium text-content mb-2">No properties yet</h3>
                <p className="text-small text-content-secondary">
                  Add properties to this campaign to start sending offers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Property
                      </th>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        List Price
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Offer
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        DOM
                      </th>
                      <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Status
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-body font-medium text-content">{prop.address}</p>
                          <p className="text-small text-content-secondary">
                            {prop.city}, {prop.state} {prop.zip}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-surface-secondary flex items-center justify-center">
                              <User className="h-4 w-4 text-content-tertiary" />
                            </div>
                            <div>
                              <p className="text-small font-medium text-content">
                                {prop.agent_name || "Unknown"}
                              </p>
                              <p className="text-tiny text-content-tertiary">{prop.agent_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-body tabular-nums">
                          {formatCurrency(prop.list_price)}
                        </td>
                        <td className="px-4 py-3 text-right text-body tabular-nums font-medium text-brand">
                          {formatCurrency(prop.offer_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-body tabular-nums">
                          {prop.days_on_market || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={cn("capitalize", statusColors[prop.status])} size="sm">
                            {prop.status}
                          </Badge>
                        </td>
                        <td className="px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 hover:bg-surface-tertiary rounded-small transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white">
                              {prop.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleMarkSent(prop.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Mark as Sent
                                </DropdownMenuItem>
                              )}
                              {prop.status === "sent" && (
                                <DropdownMenuItem onClick={() => handleMarkResponded(prop.id, "interested")}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark Responded (Interested)
                                </DropdownMenuItem>
                              )}
                              {prop.agent_email && (
                                <DropdownMenuItem
                                  onClick={() => window.location.href = `mailto:${prop.agent_email}`}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0 p-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-h3 font-medium text-content">Offer Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Offer Formula</span>
                    <span className="text-small font-medium text-content capitalize">
                      {campaign.offer_formula_type === "percentage"
                        ? `${campaign.offer_percentage}% of list price`
                        : campaign.offer_formula_type === "fixed"
                        ? `$${campaign.offer_fixed_discount?.toLocaleString()} discount`
                        : "Custom per property"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Earnest Money</span>
                    <span className="text-small font-medium text-content">
                      {campaign.include_earnest_money
                        ? formatCurrency(campaign.earnest_money)
                        : "Not included"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Closing Timeline</span>
                    <span className="text-small font-medium text-content">
                      {campaign.closing_timeline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-h3 font-medium text-content">Campaign Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Type</span>
                    <span className="text-small font-medium text-content capitalize">
                      {campaign.campaign_type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Created</span>
                    <span className="text-small font-medium text-content">
                      {format(parseISO(campaign.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {campaign.started_at && (
                    <div className="flex justify-between py-2 border-b border-border-subtle">
                      <span className="text-small text-content-secondary">Started</span>
                      <span className="text-small font-medium text-content">
                        {format(parseISO(campaign.started_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="mt-0 p-lg">
            <div className="space-y-4">
              <div>
                <h3 className="text-small font-medium text-content-secondary mb-2">Subject Line</h3>
                <p className="text-body text-content">{campaign.email_subject || "—"}</p>
              </div>
              <div>
                <h3 className="text-small font-medium text-content-secondary mb-2">Email Body</h3>
                <pre className="text-small text-content whitespace-pre-wrap font-sans p-4 bg-surface-secondary rounded-medium">
                  {campaign.email_body || "No template set"}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Card>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This will also remove all associated
              property data. This action cannot be undone.
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
