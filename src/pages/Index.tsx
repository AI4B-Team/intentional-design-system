import { DashboardLayout } from "@/components/layout";
import { PageLayout, PageHeader, PageSection, Grid } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge, HeatScoreBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { SkeletonCard, SkeletonStat } from "@/components/ui/skeleton";
import { Spinner, LoadingDots } from "@/components/ui/spinner";
import { EmptyState, NoDataState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, DollarSign, TrendingUp, Plus } from "lucide-react";

const mockUser = {
  name: "John Investor",
  email: "john@reinvest.com",
  avatar: "",
};

const mockProperties = [
  { id: 1, address: "123 Main St", city: "Austin", score: 850, status: "Hot Lead" },
  { id: 2, address: "456 Oak Ave", city: "Dallas", score: 620, status: "Warm" },
  { id: 3, address: "789 Pine Rd", city: "Houston", score: 450, status: "Moderate" },
  { id: 4, address: "321 Elm Dr", city: "San Antonio", score: 180, status: "Cold" },
];

const Index = () => {
  const { toast } = useToast();

  const showToast = (variant: "default" | "success" | "warning" | "destructive" | "info") => {
    const messages = {
      default: { title: "Notification", description: "This is a default notification." },
      success: { title: "Success!", description: "Property saved successfully." },
      warning: { title: "Warning", description: "This deal needs attention." },
      destructive: { title: "Error", description: "Something went wrong." },
      info: { title: "Info", description: "New market data available." },
    };
    toast({ ...messages[variant], variant });
  };

  return (
    <DashboardLayout user={mockUser}>
      <PageLayout>
        <PageHeader
          title="Design System"
          description="Premium component library for real estate investing"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          }
        />

        {/* Stats Section */}
        <PageSection title="Stat Cards">
          <Grid columns={4}>
            <StatCard
              label="Total Properties"
              value="247"
              trend={{ value: 12, label: "vs last month" }}
              icon={<Building2 className="h-5 w-5" />}
            />
            <StatCard
              label="Active Leads"
              value="1,842"
              trend={{ value: -3, label: "vs last week" }}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Portfolio Value"
              value="$4.2M"
              trend={{ value: 8, label: "this quarter" }}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              label="ROI"
              value="24.5%"
              trend={{ value: 2.1, label: "vs benchmark" }}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </Grid>
        </PageSection>

        {/* Buttons Section */}
        <PageSection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
        </PageSection>

        {/* Badges Section */}
        <PageSection title="Badges & Heat Scores">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <HeatScoreBadge score={850} />
            <HeatScoreBadge score={650} />
            <HeatScoreBadge score={450} />
            <HeatScoreBadge score={250} />
            <HeatScoreBadge score={100} />
          </div>
        </PageSection>

        {/* Form Elements */}
        <PageSection title="Form Elements">
          <div className="max-w-md space-y-4">
            <Input placeholder="Enter property address..." />
            <Input type="email" placeholder="Email address" />
            <Input type="number" placeholder="Listing price" />
            <Input disabled placeholder="Disabled input" />
          </div>
        </PageSection>

        {/* Avatars */}
        <PageSection title="Avatars">
          <div className="flex items-center gap-4 mb-4">
            <Avatar size="xs">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="md">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="xl">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
          <AvatarGroup>
            <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>AK</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>RS</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>TL</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>XY</AvatarFallback></Avatar>
          </AvatarGroup>
        </PageSection>

        {/* Table */}
        <PageSection title="Data Table">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.address}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>
                      <span className="font-mono">{property.score}</span>
                    </TableCell>
                    <TableCell>
                      <HeatScoreBadge score={property.score} showScore={false} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </PageSection>

        {/* Toasts */}
        <PageSection title="Toast Notifications">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => showToast("default")}>Default Toast</Button>
            <Button variant="outline" onClick={() => showToast("success")}>Success Toast</Button>
            <Button variant="outline" onClick={() => showToast("warning")}>Warning Toast</Button>
            <Button variant="outline" onClick={() => showToast("destructive")}>Error Toast</Button>
            <Button variant="outline" onClick={() => showToast("info")}>Info Toast</Button>
          </div>
        </PageSection>

        {/* Modal */}
        <PageSection title="Modal">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogDescription>
                  Enter the details for the new property listing.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="space-y-4">
                  <Input placeholder="Property address" />
                  <Input placeholder="City" />
                  <Input type="number" placeholder="Estimated value" />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Property</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageSection>

        {/* Loading States */}
        <PageSection title="Loading States">
          <div className="flex items-center gap-6 mb-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <LoadingDots />
          </div>
          <Grid columns={3}>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </Grid>
          <div className="mt-6">
            <SkeletonCard />
          </div>
        </PageSection>

        {/* Empty States */}
        <PageSection title="Empty States">
          <Grid columns={2}>
            <Card>
              <NoDataState entityName="properties" onAdd={() => {}} />
            </Card>
            <Card>
              <EmptyState
                variant="search"
                title="No results found"
                description="Try adjusting your search or filter criteria."
              />
            </Card>
          </Grid>
        </PageSection>

        {/* Cards */}
        <PageSection title="Cards">
          <Grid columns={3}>
            <Card className="card-hover cursor-pointer">
              <CardHeader>
                <CardTitle>Investment Opportunity</CardTitle>
                <CardDescription>High-potential property in growing market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-h2 font-semibold">$425,000</span>
                  <HeatScoreBadge score={780} />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover cursor-pointer">
              <CardHeader>
                <CardTitle>Flip Opportunity</CardTitle>
                <CardDescription>Quick turnaround potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-h2 font-semibold">$185,000</span>
                  <HeatScoreBadge score={550} />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover cursor-pointer">
              <CardHeader>
                <CardTitle>Rental Property</CardTitle>
                <CardDescription>Steady cash flow investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-h2 font-semibold">$320,000</span>
                  <HeatScoreBadge score={420} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </PageSection>
      </PageLayout>
    </DashboardLayout>
  );
};

export default Index;
