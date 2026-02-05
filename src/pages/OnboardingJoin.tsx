import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAcceptInvite } from "@/hooks/useOrganizationManagement";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPage, Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ArrowLeft,
  Check,
  Building2,
  AlertCircle,
  PartyPopper
} from "lucide-react";

interface InviteDetails {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  expires_at: string;
  organization?: {
    name: string;
    logo_url: string | null;
  };
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  acquisitions: "Acquisitions",
  dispositions: "Dispositions",
  caller: "Caller",
  member: "Member",
};

export default function OnboardingJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { organization, loading: orgLoading, refreshOrganization } = useOrganization();
  const acceptInvite = useAcceptInvite();
  
  const [token, setToken] = React.useState(searchParams.get("token") || "");
  const [invite, setInvite] = React.useState<InviteDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [joined, setJoined] = React.useState(false);

  // Redirect if user already has an organization
  React.useEffect(() => {
    if (!orgLoading && organization) {
      navigate("/dashboard", { replace: true });
    }
  }, [organization, orgLoading, navigate]);

  // Auto-lookup invite if token is in URL
  React.useEffect(() => {
    if (token && !invite && !loading) {
      handleLookupInvite();
    }
  }, [token]);

  const handleLookupInvite = async () => {
    if (!token.trim()) return;
    
    setLoading(true);
    setError("");
    setInvite(null);

    try {
      const { data, error: lookupError } = await supabase
        .from("organization_invites")
        .select(`
          id,
          organization_id,
          email,
          role,
          expires_at,
          organizations (name, logo_url)
        `)
        .eq("token", token.trim())
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (lookupError || !data) {
        setError("Invalid or expired invitation. Please check your invite code.");
        return;
      }

      setInvite({
        ...data,
        organization: (data as any).organizations,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!token.trim()) return;

    try {
      await acceptInvite.mutateAsync(token.trim());
      setJoined(true);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    }
  };

  const handleComplete = () => {
    refreshOrganization();
    navigate("/dashboard");
  };

  if (orgLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Success state
  if (joined && invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
        <Card variant="default" padding="lg" className="w-full max-w-md">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-status-success/10 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-8 w-8 text-status-success" />
            </div>
            <h1 className="text-h2 font-semibold text-content mb-2">Welcome to the Team!</h1>
            <p className="text-body text-content-secondary mb-6">
              You've successfully joined <strong>{invite.organization?.name}</strong>
            </p>
            <Button variant="primary" fullWidth onClick={handleComplete}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Card variant="default" padding="lg">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h1 className="text-h2 font-semibold text-content">Join An Organization</h1>
            <p className="text-small text-content-secondary mt-1">
              Enter your invite code to join a team
            </p>
          </div>

          {/* Invite lookup form */}
          {!invite && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-token">Invite Code</Label>
                <Input
                  id="invite-token"
                  placeholder="Paste your invite code..."
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-medium bg-destructive/10 text-destructive text-small">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/onboarding")}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  fullWidth
                  disabled={!token.trim() || loading}
                  onClick={handleLookupInvite}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Looking up...
                    </>
                  ) : (
                    "Find Invitation"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Invite confirmation */}
          {invite && (
            <div className="space-y-6">
              <div className="p-4 rounded-medium bg-surface-secondary border border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    {invite.organization?.logo_url ? (
                      <img 
                        src={invite.organization.logo_url} 
                        alt="" 
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-brand-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-body font-semibold text-content">
                      {invite.organization?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-small text-content-secondary">Role:</span>
                      <Badge variant="secondary">{ROLE_LABELS[invite.role] || invite.role}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-medium bg-destructive/10 text-destructive text-small">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setInvite(null);
                    setToken("");
                    setError("");
                  }}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  fullWidth
                  disabled={acceptInvite.isPending}
                  onClick={handleAcceptInvite}
                  icon={acceptInvite.isPending ? undefined : <Check className="h-4 w-4" />}
                >
                  {acceptInvite.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Joining...
                    </>
                  ) : (
                    "Accept & Join"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
