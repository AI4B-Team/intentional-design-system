import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  BadgeCheck,
  DollarSign,
  Clock,
  Eye,
  HandshakeIcon,
  TrendingUp,
  Pencil,
  Trash2,
  Send,
  MapPin,
  Home,
  Target,
  Percent,
  Calendar,
  Building2,
} from "lucide-react";
import { useBuyer, useDeleteBuyer, type Buyer } from "@/hooks/useBuyers";
import { EditBuyerModal } from "@/components/buyers/edit-buyer-modal";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getReliabilityBadge(score: number) {
  if (score >= 80) {
    return <Badge variant="success" size="md">{score}% Reliable</Badge>;
  } else if (score >= 50) {
    return <Badge variant="warning" size="md">{score}% Reliable</Badge>;
  } else {
    return <Badge variant="error" size="md">{score}% Reliable</Badge>;
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div>
          <div className="text-h3 font-bold">{value}</div>
          <div className="text-small text-muted-foreground">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function ProfileTab({ buyer }: { buyer: Buyer }) {
  return (
    <div className="space-y-6">
      <Card variant="default" padding="md">
        <h3 className="text-body font-semibold mb-4">Contact Information</h3>
        <div className="space-y-3">
          {buyer.phone && (
            <a
              href={`tel:${buyer.phone}`}
              className="flex items-center gap-3 text-small hover:text-brand transition-colors"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              {buyer.phone}
            </a>
          )}
          {buyer.email && (
            <a
              href={`mailto:${buyer.email}`}
              className="flex items-center gap-3 text-small hover:text-brand transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {buyer.email}
            </a>
          )}
          <div className="flex items-center gap-3 text-small">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Preferred: {buyer.preferred_contact || "Not specified"}
          </div>
        </div>
      </Card>

      {buyer.notes && (
        <Card variant="default" padding="md">
          <h3 className="text-body font-semibold mb-2">Notes</h3>
          <p className="text-small text-muted-foreground whitespace-pre-wrap">{buyer.notes}</p>
        </Card>
      )}
    </div>
  );
}

function BuyBoxTab({ buyer }: { buyer: Buyer }) {
  const buyBox = buyer.buy_box;

  return (
    <div className="space-y-4">
      {/* Property Types */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Home className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-small font-semibold">Property Types</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {buyBox.property_types?.length ? (
            buyBox.property_types.map((type) => (
              <Badge key={type} variant="secondary" size="md">
                {type}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-small">Any</span>
          )}
        </div>
      </Card>

      {/* Price Range */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-small font-semibold">Price Range</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-h3 font-bold">{formatCurrency(buyBox.price_min)}</span>
          <span className="text-muted-foreground">to</span>
          <span className="text-h3 font-bold">{formatCurrency(buyBox.price_max)}</span>
        </div>
      </Card>

      {/* Target Areas */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-small font-semibold">Target Areas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {buyBox.target_areas?.length ? (
            buyBox.target_areas.map((area) => (
              <Badge key={area} variant="secondary" size="md">
                {area}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-small">Not specified</span>
          )}
        </div>
      </Card>

      {/* Condition Preferences */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-small font-semibold">Condition Preferences</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {buyBox.condition_preferences?.length ? (
            buyBox.condition_preferences.map((cond) => (
              <Badge key={cond} variant="secondary" size="md">
                {cond}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-small">Any</span>
          )}
        </div>
      </Card>

      {/* ROI & Timeline */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-small font-semibold">Min ROI</h3>
          </div>
          <span className="text-h3 font-bold">
            {buyBox.min_roi ? `${buyBox.min_roi}%` : "Any"}
          </span>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-small font-semibold">Closing Timeline</h3>
          </div>
          <span className="text-h3 font-bold capitalize">
            {buyBox.closing_timeline?.replace("_", " ") || "Flexible"}
          </span>
        </Card>
      </div>
    </div>
  );
}

function DealHistoryTab({ buyer }: { buyer: Buyer }) {
  // Placeholder for deal history - would connect to actual deal data
  return (
    <Card variant="default" padding="lg" className="text-center">
      <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">No deals sent to this buyer yet</p>
    </Card>
  );
}

function ActivityTab({ buyer }: { buyer: Buyer }) {
  // Placeholder for activity timeline
  return (
    <Card variant="default" padding="lg" className="text-center">
      <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">No activity recorded yet</p>
    </Card>
  );
}

export default function BuyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: buyer, isLoading } = useBuyer(id);
  const deleteBuyer = useDeleteBuyer();
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!id) return;
    await deleteBuyer.mutateAsync(id);
    navigate("/buyers");
  };

  if (isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Buyers", href: "/buyers" }, { label: "Loading..." }]}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!buyer) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Buyers", href: "/buyers" }, { label: "Not Found" }]}
      >
        <Card variant="default" padding="lg" className="text-center">
          <p className="text-muted-foreground mb-4">Buyer not found</p>
          <Button variant="secondary" onClick={() => navigate("/buyers")}>
            Back to Buyers
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Buyers", href: "/buyers" }, { label: buyer.name }]}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate("/buyers")}
            icon={<ArrowLeft />}
          >
            Buyers
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-bold text-foreground">{buyer.name}</h1>
            {buyer.pof_verified && (
              <Badge variant="success" size="md">
                <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                POF Verified
              </Badge>
            )}
          </div>
          {buyer.company && (
            <p className="text-body text-muted-foreground">{buyer.company}</p>
          )}
          <div className="mt-2">{getReliabilityBadge(buyer.reliability_score)}</div>
        </div>
        <div className="flex items-center gap-2">
          {buyer.phone && (
            <Button variant="secondary" size="sm" icon={<Phone />} asChild>
              <a href={`tel:${buyer.phone}`}>Call</a>
            </Button>
          )}
          {buyer.email && (
            <Button variant="secondary" size="sm" icon={<Mail />} asChild>
              <a href={`mailto:${buyer.email}`}>Email</a>
            </Button>
          )}
          <Button variant="primary" size="sm" icon={<Send />}>
            Send Deal
          </Button>
          <Button variant="ghost" size="sm" icon={<Pencil />} onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" icon={<Trash2 />} className="text-destructive">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Buyer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {buyer.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Deals Viewed"
          value={buyer.deals_viewed}
          icon={<Eye className="h-5 w-5 text-muted-foreground" />}
        />
        <StatCard
          label="Deals Closed"
          value={buyer.deals_closed}
          icon={<HandshakeIcon className="h-5 w-5 text-muted-foreground" />}
        />
        <StatCard
          label="Total Volume"
          value={formatCurrency(buyer.total_volume)}
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatCard
          label="Avg Close Time"
          value={buyer.avg_close_days ? `${buyer.avg_close_days} days` : "—"}
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="buybox">Buy Box</TabsTrigger>
          <TabsTrigger value="deals">Deal History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab buyer={buyer} />
        </TabsContent>
        <TabsContent value="buybox">
          <BuyBoxTab buyer={buyer} />
        </TabsContent>
        <TabsContent value="deals">
          <DealHistoryTab buyer={buyer} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab buyer={buyer} />
        </TabsContent>
      </Tabs>

      <EditBuyerModal buyer={buyer} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </DashboardLayout>
  );
}
