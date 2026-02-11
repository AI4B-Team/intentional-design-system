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
  
  // Check localStorage for previous session — survives page refreshes unlike refs
  const hadPreviousSession = React.useRef(
    typeof window !== "undefined" && localStorage.getItem("df_had_session") === "true"
  );
  const [graceExpired, setGraceExpired] = React.useState(false);

  // Persist session indicator to localStorage so it survives full page refreshes
  React.useEffect(() => {
    if (user) {
      localStorage.setItem("df_had_session", "true");
      hadPreviousSession.current = true;
    }
  }, [user]);

  // Clear session indicator on explicit sign-out (user becomes null after having been set)
  React.useEffect(() => {
    if (!authLoading && !user && !hadPreviousSession.current) {
      localStorage.removeItem("df_had_session");
    }
  }, [authLoading, user]);

  // Grace period: if we had a session (this page load or previous), wait for token refresh
  // before redirecting to login. 3s is enough for even slow token refreshes.
  React.useEffect(() => {
    if (!authLoading && !user && hadPreviousSession.current && !graceExpired) {
      const timer = setTimeout(() => {
        setGraceExpired(true);
        // If still no user after grace, clear the indicator so next visit goes straight to login
        localStorage.removeItem("df_had_session");
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (user) setGraceExpired(false);
  }, [authLoading, user, graceExpired]);

  // During auth loading or grace period, render children at reduced opacity (sidebar stays visible)
  if (authLoading || (!user && hadPreviousSession.current && !graceExpired)) {
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
