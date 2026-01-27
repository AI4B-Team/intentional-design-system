import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PWAProvider } from "@/components/pwa";
import { ErrorBoundary } from "@/components/error-boundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Calculators from "./pages/Calculators";
import Analytics from "./pages/Analytics";
import Marketplace from "./pages/Marketplace";
import LenderBrowser from "./pages/LenderBrowser";
import FundingRequest from "./pages/FundingRequest";
import Capital from "./pages/Capital";
import CapitalLenders from "./pages/CapitalLenders";
import CapitalRequestNew from "./pages/CapitalRequestNew";
import CapitalRequestDetail from "./pages/CapitalRequestDetail";
import Settings from "./pages/Settings";
import SettingsIntegrations from "./pages/SettingsIntegrations";
import DealSources from "./pages/DealSources";
import DealSourceDetail from "./pages/DealSourceDetail";
import SubmitDeal from "./pages/SubmitDeal";
import Submissions from "./pages/Submissions";
import Campaigns from "./pages/Campaigns";
import CampaignWizard from "./pages/CampaignWizard";
import CampaignDetail from "./pages/CampaignDetail";
import Offers from "./pages/Offers";
import Contractors from "./pages/Contractors";
import ContractorDetail from "./pages/ContractorDetail";
import Buyers from "./pages/Buyers";
import BuyerDetail from "./pages/BuyerDetail";
import NotFound from "./pages/NotFound";
import JVPartners from "./pages/JVPartners";
import DailyReport from "./pages/DailyReport";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import ClosebotTemplates from "./pages/ClosebotTemplates";
import GHLSnapshot from "./pages/GHLSnapshot";
import Install from "./pages/Install";
import Onboarding from "./pages/Onboarding";
import MailDashboard from "./pages/MailDashboard";
import MailCampaigns from "./pages/MailCampaigns";
import MailCampaignWizard from "./pages/MailCampaignWizard";
import MailCampaignDetail from "./pages/MailCampaignDetail";
import MailTemplates from "./pages/MailTemplates";
import MailTemplateEditor from "./pages/MailTemplateEditor";
import MailSuppression from "./pages/MailSuppression";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <PWAProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/submit-deal" element={<SubmitDeal />} />
                <Route path="/install" element={<Install />} />
                <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties"
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <ProtectedRoute>
                  <Offers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <ProtectedRoute>
                  <PropertyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contractors"
              element={
                <ProtectedRoute>
                  <Contractors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contractors/:id"
              element={
                <ProtectedRoute>
                  <ContractorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers"
              element={
                <ProtectedRoute>
                  <Buyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers/:id"
              element={
                <ProtectedRoute>
                  <BuyerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deal-sources"
              element={
                <ProtectedRoute>
                  <DealSources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deal-sources/:id"
              element={
                <ProtectedRoute>
                  <DealSourceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculators"
              element={
                <ProtectedRoute>
                  <Calculators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/lenders"
              element={
                <ProtectedRoute>
                  <LenderBrowser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/request"
              element={
                <ProtectedRoute>
                  <FundingRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capital"
              element={
                <ProtectedRoute>
                  <Capital />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capital/lenders"
              element={
                <ProtectedRoute>
                  <CapitalLenders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capital/request/new"
              element={
                <ProtectedRoute>
                  <CapitalRequestNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capital/request/:id"
              element={
                <ProtectedRoute>
                  <CapitalRequestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/integrations"
              element={
                <ProtectedRoute>
                  <SettingsIntegrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <ProtectedRoute>
                  <Submissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <Campaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/new"
              element={
                <ProtectedRoute>
                  <CampaignWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:id"
              element={
                <ProtectedRoute>
                  <CampaignDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jv"
              element={
                <ProtectedRoute>
                  <JVPartners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/daily"
              element={
                <ProtectedRoute>
                  <DailyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/closebot"
              element={
                <ProtectedRoute>
                  <ClosebotTemplates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/ghl-snapshot"
              element={
                <ProtectedRoute>
                  <GHLSnapshot />
                </ProtectedRoute>
              }
            />
            
            {/* Direct Mail Routes */}
            <Route
              path="/mail"
              element={
                <ProtectedRoute>
                  <MailDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/campaigns"
              element={
                <ProtectedRoute>
                  <MailCampaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/campaigns/new"
              element={
                <ProtectedRoute>
                  <MailCampaignWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/campaigns/:id"
              element={
                <ProtectedRoute>
                  <MailCampaignDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/suppression"
              element={
                <ProtectedRoute>
                  <MailSuppression />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/templates"
              element={
                <ProtectedRoute>
                  <MailTemplates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/templates/new"
              element={
                <ProtectedRoute>
                  <MailTemplateEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mail/templates/:id"
              element={
                <ProtectedRoute>
                  <MailTemplates />
                </ProtectedRoute>
              }
            />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PWAProvider>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
