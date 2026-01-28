import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DrivingForDollarsMap } from "@/components/property-scout";
import { PropertyLead } from "@/types/property-scout";
import { 
  Car, 
  Map, 
  ListChecks, 
  History, 
  Sparkles,
  MapPin,
  Camera,
  Route,
  Target
} from "lucide-react";
import { toast } from "sonner";

export default function PropertyScout() {
  const [enableAI, setEnableAI] = useState(true);
  const [savedLeads, setSavedLeads] = useState<Partial<PropertyLead>[]>([]);

  const handleSaveProperty = (lead: Partial<PropertyLead>) => {
    setSavedLeads(prev => [...prev, { ...lead, id: `lead_${Date.now()}` }]);
    toast.success("Property saved as lead!");
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Tools", href: "/tools" },
        { label: "Property Scout" }
      ]}
    >
      <PageHeader 
        title="Property Scout"
        description="Drive for dollars and capture motivated seller leads on the go"
      />
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{savedLeads.length}</p>
                  <p className="text-sm text-muted-foreground">Leads Captured</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Camera className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {savedLeads.reduce((acc, l) => acc + (l.photos?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Photos Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Route className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0.0</p>
                  <p className="text-sm text-muted-foreground">Miles Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Target className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="drive" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="drive" className="gap-2">
                <Car className="h-4 w-4" />
                Drive Mode
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <ListChecks className="h-4 w-4" />
                Saved Leads
                {savedLeads.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {savedLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="routes" className="gap-2">
                <Map className="h-4 w-4" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="ai-assist"
                  checked={enableAI}
                  onCheckedChange={setEnableAI}
                />
                <label htmlFor="ai-assist" className="text-sm flex items-center gap-1.5 cursor-pointer">
                  <Sparkles className="h-4 w-4 text-accent" />
                  AI Assistant
                </label>
              </div>
            </div>
          </div>

          <TabsContent value="drive" className="mt-0">
            <Card className="overflow-hidden">
              <div className="h-[calc(100vh-380px)] min-h-[500px]">
                <DrivingForDollarsMap
                  scoutId="current-user"
                  onSaveProperty={handleSaveProperty}
                  enableAI={enableAI}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Saved Leads</CardTitle>
                <CardDescription>
                  Properties you've captured while driving for dollars
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground">No leads yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start driving and capture properties to see them here
                    </p>
                    <Button className="mt-4" variant="outline">
                      Start Driving
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedLeads.map((lead) => (
                      <Card key={lead.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-medium">{lead.address?.street || 'Unknown address'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(lead.drivingForDollars?.capturedAt || '').toLocaleString()}
                            </p>
                            {lead.estimatedValue && (
                              <p className="text-sm">
                                Est. Value: <span className="font-medium">${lead.estimatedValue.toLocaleString()}</span>
                              </p>
                            )}
                            {lead.photos && lead.photos.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {lead.photos.slice(0, 3).map((photo, i) => (
                                  <img
                                    key={i}
                                    src={photo.url}
                                    alt=""
                                    className="h-12 w-12 rounded object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Saved Routes</CardTitle>
                <CardDescription>
                  Your driving routes and their statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Route className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground">No routes saved</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete a driving session to save your route
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  Your past driving sessions and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground">No history yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your driving sessions will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
