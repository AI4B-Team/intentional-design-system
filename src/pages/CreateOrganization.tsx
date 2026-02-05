import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useCreateOrganization } from "@/hooks/useOrganizationManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Spinner, LoadingPage } from "@/components/ui/spinner";
import { Building2, Globe, Phone } from "lucide-react";

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const createOrganization = useCreateOrganization();
  
  const [name, setName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // If user already has an organization, redirect to dashboard
  React.useEffect(() => {
    if (!orgLoading && organization) {
      navigate("/dashboard", { replace: true });
    }
  }, [organization, orgLoading, navigate]);

  if (orgLoading) {
    return <LoadingPage message="Loading..." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    await createOrganization.mutateAsync({
      name: name.trim(),
      website: website.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-brand-accent flex items-center justify-center">
              <Building2 className="h-6 w-6 text-content-inverse" />
            </div>
            <span className="text-2xl font-bold text-content">RealElite</span>
          </div>
          <p className="text-content-secondary">Create Your Organization</p>
        </div>

        <Card variant="default" padding="lg" className="shadow-2xl">
          <h1 className="text-h2 font-semibold text-content text-center mb-2">
            Welcome, {user?.user_metadata?.full_name || "there"}!
          </h1>
          <p className="text-content-secondary text-center mb-6">
            Set up your organization to get started with RealElite.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={createOrganization.isPending || !name.trim()}
              className="mt-6"
            >
              {createOrganization.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              {createOrganization.isPending ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
