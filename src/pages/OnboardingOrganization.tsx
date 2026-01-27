import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPage, Spinner } from "@/components/ui/spinner";
import { Building2, Users, ArrowRight, Mail } from "lucide-react";

export default function OnboardingOrganization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, loading: orgLoading, refreshOrganization } = useOrganization();
  
  const [inviteCode, setInviteCode] = React.useState("");
  const [joinError, setJoinError] = React.useState("");

  // Redirect if user already has an organization
  React.useEffect(() => {
    if (!orgLoading && organization) {
      navigate("/dashboard", { replace: true });
    }
  }, [organization, orgLoading, navigate]);

  if (orgLoading) {
    return <LoadingPage message="Loading..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-brand-accent flex items-center justify-center">
              <Building2 className="h-7 w-7 text-content-inverse" />
            </div>
          </div>
          <h1 className="text-h1 font-bold text-content mb-2">Welcome to DealFlow!</h1>
          <p className="text-body text-content-secondary">
            Let's get you set up. Choose how you'd like to get started.
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: Create Organization */}
          <Card 
            variant="default" 
            padding="lg" 
            className="hover:border-brand-accent transition-colors cursor-pointer group"
            onClick={() => navigate("/onboarding/create")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-brand-accent/20 transition-colors">
                <Building2 className="h-8 w-8 text-brand-accent" />
              </div>
              <h2 className="text-h3 font-semibold text-content mb-2">Create Your Organization</h2>
              <p className="text-small text-content-secondary mb-6">
                Set up your company and invite your team. Perfect for business owners starting fresh.
              </p>
              <Button 
                variant="primary" 
                fullWidth 
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Create Organization
              </Button>
            </div>
          </Card>

          {/* Option 2: Join Organization */}
          <Card variant="default" padding="lg">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-h3 font-semibold text-content mb-2">Join an Organization</h2>
              <p className="text-small text-content-secondary mb-4">
                Enter your invite code or check your email for an invitation link.
              </p>
              
              <div className="w-full space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="invite-code" className="sr-only">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter invite code..."
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setJoinError("");
                    }}
                  />
                </div>
                
                {joinError && (
                  <p className="text-tiny text-destructive">{joinError}</p>
                )}
                
                <Button 
                  variant="outline" 
                  fullWidth 
                  disabled={!inviteCode.trim()}
                  onClick={() => navigate(`/onboarding/join?token=${encodeURIComponent(inviteCode.trim())}`)}
                >
                  Join Organization
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 text-tiny text-content-tertiary">
                <Mail className="h-3 w-3" />
                <span>Check your email for invite links</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-tiny text-content-tertiary mt-8">
          Already have an account with an organization?{" "}
          <button 
            onClick={() => refreshOrganization()} 
            className="text-brand-accent hover:underline"
          >
            Refresh
          </button>
        </p>
      </div>
    </div>
  );
}
