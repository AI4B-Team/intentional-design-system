import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { LoadingPage } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrganization?: boolean;
}

export function ProtectedRoute({ children, requireOrganization = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const location = useLocation();

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If organization check is required, wait for org loading
  if (requireOrganization) {
    if (orgLoading) {
      return <LoadingPage message="Loading organization..." />;
    }

    // User is authenticated but has no organization - redirect to signup flow
    // Exception: onboarding pages themselves
    const isOnboardingPage = location.pathname.startsWith("/onboarding") || 
                              location.pathname.startsWith("/signup/flow") ||
                              location.pathname === "/create-organization";
    
    if (!organization && !isOnboardingPage) {
      return <Navigate to="/signup/flow" replace />;
    }
  }

  return <>{children}</>;
}
