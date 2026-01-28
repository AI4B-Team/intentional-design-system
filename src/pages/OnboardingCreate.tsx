import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useCreateOrganization } from "@/hooks/useOrganizationManagement";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPage, Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Globe, 
  Phone, 
  Users, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Rocket,
  UserPlus,
  Home
} from "lucide-react";

type Step = "company" | "profile" | "complete";

export default function OnboardingCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, loading: orgLoading, refreshOrganization } = useOrganization();
  const createOrganization = useCreateOrganization();
  
  const [step, setStep] = React.useState<Step>("company");
  const [companyData, setCompanyData] = React.useState({
    name: "",
    website: "",
    phone: "",
    teamSize: "",
  });
  const [profileData, setProfileData] = React.useState(() => ({
    fullName: user?.user_metadata?.full_name ?? "",
    title: "",
    phone: "",
  }));

  // Our Input component may call onChange with either a string value OR a change event.
  // Avoid referencing the argument inside a functional state updater (it may be evaluated later).
  const coerceInputValue = React.useCallback(
    (eOrValue: string | React.ChangeEvent<HTMLInputElement>) => {
      return typeof eOrValue === "string" ? eOrValue : eOrValue.target.value;
    },
    []
  );

  const updateCompanyField = React.useCallback(
    (field: keyof typeof companyData) =>
      (eOrValue: string | React.ChangeEvent<HTMLInputElement>) => {
        const value = coerceInputValue(eOrValue);
        setCompanyData((prev) => ({ ...prev, [field]: value }));
      },
    [coerceInputValue]
  );

  const updateProfileField = React.useCallback(
    (field: keyof typeof profileData) =>
      (eOrValue: string | React.ChangeEvent<HTMLInputElement>) => {
        const value = coerceInputValue(eOrValue);
        setProfileData((prev) => ({ ...prev, [field]: value }));
      },
    [coerceInputValue]
  );
  
  // Update profileData when user loads
  React.useEffect(() => {
    if (user?.user_metadata?.full_name && !profileData.fullName) {
      setProfileData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
    }
  }, [user]);

  // Redirect if user already has an organization
  React.useEffect(() => {
    if (!orgLoading && organization) {
      navigate("/dashboard", { replace: true });
    }
  }, [organization, orgLoading, navigate]);

  if (orgLoading) {
    return <LoadingPage message="Loading..." />;
  }

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.name.trim()) return;
    setStep("profile");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOrganization.mutateAsync({
        name: companyData.name.trim(),
        website: companyData.website.trim() || undefined,
        phone: companyData.phone.trim() || undefined,
      });
      
      setStep("complete");
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  const handleComplete = () => {
    refreshOrganization();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["company", "profile", "complete"].map((s, idx) => (
            <React.Fragment key={s}>
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center text-small font-medium transition-colors ${
                  step === s 
                    ? "bg-brand-accent text-content-inverse" 
                    : idx < ["company", "profile", "complete"].indexOf(step)
                    ? "bg-status-success text-content-inverse"
                    : "bg-surface-tertiary text-content-tertiary"
                }`}
              >
                {idx < ["company", "profile", "complete"].indexOf(step) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 2 && (
                <div className={`h-0.5 w-12 transition-colors ${
                  idx < ["company", "profile", "complete"].indexOf(step)
                    ? "bg-status-success"
                    : "bg-surface-tertiary"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Company Info */}
        {step === "company" && (
          <Card variant="default" padding="lg">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-brand-accent" />
              </div>
              <h1 className="text-h2 font-semibold text-content">Company Information</h1>
              <p className="text-small text-content-secondary mt-1">
                Tell us about your business
              </p>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    id="company-name"
                    placeholder="ABC Investments LLC"
                    value={companyData.name}
                    onChange={updateCompanyField("name")}
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
                    value={companyData.website}
                    onChange={updateCompanyField("website")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    id="company-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={companyData.phone}
                    onChange={updateCompanyField("phone")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>How many team members?</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary z-10 pointer-events-none" />
                  <Select
                    value={companyData.teamSize}
                    onValueChange={(value) => setCompanyData((prev) => ({ ...prev, teamSize: value }))}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Just me">Just me</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="6-10">6-10</SelectItem>
                      <SelectItem value="11-25">11-25</SelectItem>
                      <SelectItem value="26-50">26-50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/onboarding")}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth
                  disabled={!companyData.name.trim()}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 2: Profile */}
        {step === "profile" && (
          <Card variant="default" padding="lg">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-brand-accent" />
              </div>
              <h1 className="text-h2 font-semibold text-content">Your Profile</h1>
              <p className="text-small text-content-secondary mt-1">
                A few details about you
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    value={profileData.fullName}
                    onChange={updateProfileField("fullName")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Your Role/Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Owner, Acquisitions Manager"
                  value={profileData.title}
                  onChange={updateProfileField("title")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Your Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    id="profile-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={profileData.phone}
                    onChange={updateProfileField("phone")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep("company")}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth
                  disabled={createOrganization.isPending}
                  icon={createOrganization.isPending ? undefined : <Check className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {createOrganization.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === "complete" && (
          <Card variant="default" padding="lg">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-status-success/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-status-success" />
              </div>
              <h1 className="text-h2 font-semibold text-content">You're All Set!</h1>
              <p className="text-small text-content-secondary mt-1">
                Your organization is ready to go
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button 
                onClick={() => {
                  handleComplete();
                  navigate("/settings?tab=team");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-medium bg-surface-secondary hover:bg-surface-tertiary transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-small font-medium text-content">Invite Your Team</p>
                  <p className="text-tiny text-content-secondary">Add team members to collaborate</p>
                </div>
                <ArrowRight className="h-4 w-4 text-content-tertiary ml-auto" />
              </button>

              <button 
                onClick={() => {
                  handleComplete();
                  navigate("/properties");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-medium bg-surface-secondary hover:bg-surface-tertiary transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-small font-medium text-content">Add Properties</p>
                  <p className="text-tiny text-content-secondary">Start building your pipeline</p>
                </div>
                <ArrowRight className="h-4 w-4 text-content-tertiary ml-auto" />
              </button>
            </div>

            <Button 
              variant="primary" 
              fullWidth
              onClick={handleComplete}
            >
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
