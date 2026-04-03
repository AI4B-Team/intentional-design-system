import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { AISettingsSection } from "@/components/ai";
import { PortfolioPropertiesSection } from "@/components/settings/portfolio-properties-section";
import { TeamManagementSection } from "@/components/settings/team-management-section";
import { OrganizationSettingsSection } from "@/components/settings/organization-settings-section";
import { BuyerProfilesSection } from "@/components/settings/buyer-profiles-section";
import { AccountDefaultsSection } from "@/components/settings/account-defaults-section";
import { DocumentDefaultsSection } from "@/components/settings/document-defaults-section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  CreditCard,
  Settings as SettingsIcon,
  Mail,
  Phone,
  Building2,
  Save,
  Home,
  Zap,
  ChevronRight,
  Users,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useGHLConnection } from "@/hooks/useGHLIntegration";

export default function Settings() {
  const { user } = useAuth();
  const { data: ghlConnection } = useGHLConnection();

  const handleSaveProfile = () => {
    toast({
      title: "Profile Saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-lg">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-semibold text-content">Settings</h1>
          <p className="text-body text-content-secondary mt-1">
            Manage your account preferences and configuration
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="organization" className="space-y-lg">
          <TabsList className="flex-wrap">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              AI Analysis
              <Badge variant="info" size="sm">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <Home className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="buyer-profiles" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Buyer Profiles
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Zap className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <OrganizationSettingsSection />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamManagementSection />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-lg">
            <Card variant="default" padding="none">
              <CardHeader className="border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal and business details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-surface-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input id="phone" placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </Label>
                    <Input id="company" placeholder="ABC Investments LLC" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border-subtle">
                  <Button variant="primary" icon={<Save />} onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai">
            <AISettingsSection />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-lg">
            <Card variant="default" padding="none">
              <CardHeader className="border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {[
                  { id: "hot-leads", label: "Hot Lead Alerts", description: "Get notified when new high-motivation properties are found" },
                  { id: "offer-responses", label: "Offer Responses", description: "Notifications for offer acceptances, counters, and rejections" },
                  { id: "appointment-reminders", label: "Appointment Reminders", description: "Reminders before scheduled property appointments" },
                  { id: "task-due", label: "Task Due Dates", description: "Alerts when tasks are approaching their due date" },
                  { id: "weekly-summary", label: "Weekly Summary", description: "Weekly digest of your pipeline and performance" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-medium">
                    <div>
                      <p className="text-small font-medium text-content">{item.label}</p>
                      <p className="text-tiny text-content-secondary">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-lg">
            <Card variant="default" padding="none">
              <CardHeader className="border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how DealFlow looks for you
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-medium">
                  <div>
                    <p className="text-small font-medium text-content">Dark Mode</p>
                    <p className="text-tiny text-content-secondary">Use dark theme for reduced eye strain</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-medium">
                  <div>
                    <p className="text-small font-medium text-content">Compact View</p>
                    <p className="text-tiny text-content-secondary">Show more items in lists and tables</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-medium">
                  <div>
                    <p className="text-small font-medium text-content">Show Property Images</p>
                    <p className="text-tiny text-content-secondary">Display property thumbnails in lists</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <PortfolioPropertiesSection />
          </TabsContent>

          {/* Buyer Profiles Tab */}
          <TabsContent value="buyer-profiles">
            <BuyerProfilesSection />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-lg">
            <Card variant="default" padding="md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        GoHighLevel
                        {ghlConnection?.is_active ? (
                          <Badge variant="success" size="sm">Connected</Badge>
                        ) : (
                          <Badge variant="destructive" size="sm">Not Connected</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Sync contacts, pipelines, and appointments with GHL
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/settings/integrations">
                      Configure
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card variant="default" padding="md" className="opacity-60">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6 text-content-tertiary" />
                  </div>
                  <div>
                    <CardTitle className="text-content-secondary">More Integrations Coming Soon</CardTitle>
                    <CardDescription>
                      Zapier, Make, Google Sheets, and more
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
