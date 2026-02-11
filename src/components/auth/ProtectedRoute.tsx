import * as React from "react";
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
  const hadUserRef = React.useRef(false);
  const [graceExpired, setGraceExpired] = React.useState(false);

  // Track if we ever had a user (to distinguish fresh visit vs refresh)
  React.useEffect(() => {
    if (user) hadUserRef.current = true;
  }, [user]);

  // Grace period: if user was logged in but session momentarily drops (token refresh race),
  // wait briefly before redirecting to login
  React.useEffect(() => {
    if (!authLoading && !user && hadUserRef.current && !graceExpired) {
      const timer = setTimeout(() => setGraceExpired(true), 1500);
      return () => clearTimeout(timer);
    }
    if (user) setGraceExpired(false);
  }, [authLoading, user, graceExpired]);

  // During auth loading on refresh, render children (layout + sidebar stay visible)
  if (authLoading || (!user && hadUserRef.current && !graceExpired)) {
    return <div className="opacity-50 pointer-events-none transition-opacity duration-200">{children}</div>;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If organization check is required, wait for org loading
  if (requireOrganization) {
    if (orgLoading) {
      // Render children (layout + sidebar) at reduced opacity while org loads,
      // instead of replacing the entire layout with a loading spinner
      return <div className="opacity-50 pointer-events-none transition-opacity duration-200">{children}</div>;
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
