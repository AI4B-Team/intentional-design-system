import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PWAProvider } from "@/components/pwa";
import { ErrorBoundary } from "@/components/error-boundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OnboardingOrganization from "./pages/OnboardingOrganization";
import OnboardingCreate from "./pages/OnboardingCreate";
import OnboardingJoin from "./pages/OnboardingJoin";
import CreateOrganization from "./pages/CreateOrganization";
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
import TeamManagement from "./pages/TeamManagement";
import OrganizationSettings from "./pages/OrganizationSettings";
import BillingSettings from "./pages/BillingSettings";
import CreditsHistory from "./pages/CreditsHistory";
import Contacts from "./pages/Contacts";
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
import AIVA from "./pages/AIVA";
import MarketplaceDeals from "./pages/MarketplaceDeals";
import MarketplaceDealDetail from "./pages/MarketplaceDealDetail";
import DealAnalyzer from "./pages/DealAnalyzer";
import MarketAnalyzer from "./pages/MarketAnalyzer";
import OfferBlaster from "./pages/OfferBlaster";
import Activity from "./pages/Activity";
import Renovations from "./pages/Renovations";
import RenovationDetail from "./pages/RenovationDetail";
import ImageEditor from "./pages/ImageEditor";
import MaterialLibrary from "./pages/MaterialLibrary";
import PropertyScout from "./pages/PropertyScout";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import ListDedupe from "./pages/ListDedupe";
import D4D from "./pages/D4D";
import D4DProperties from "./pages/D4DProperties";
import D4DPropertyDetail from "./pages/D4DPropertyDetail";
import D4DHistory from "./pages/D4DHistory";
import D4DSessionDetail from "./pages/D4DSessionDetail";
import D4DHeatMap from "./pages/D4DHeatMap";
import D4DAreas from "./pages/D4DAreas";
import D4DAreaDetail from "./pages/D4DAreaDetail";
import D4DAreaEdit from "./pages/D4DAreaEdit";
import D4DMileage from "./pages/D4DMileage";
import Dialer from "./pages/Dialer";
import DialerQueues from "./pages/DialerQueues";
import DialerQueueDetail from "./pages/DialerQueueDetail";
import DialerScripts from "./pages/DialerScripts";
import DialerScriptDetail from "./pages/DialerScriptDetail";
import DialerHistory from "./pages/DialerHistory";
import DialerSettings from "./pages/DialerSettings";
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
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
                  <Route path="/onboarding-old" element={<Onboarding />} />
                  
                  {/* Organization onboarding - requires auth but not organization */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute requireOrganization={false}>
                        <OnboardingOrganization />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/create"
                    element={
                      <ProtectedRoute requireOrganization={false}>
                        <OnboardingCreate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/join"
                    element={
                      <ProtectedRoute requireOrganization={false}>
                        <OnboardingJoin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-organization"
                    element={
                      <ProtectedRoute requireOrganization={false}>
                        <CreateOrganization />
                      </ProtectedRoute>
                    }
                  />
            
            {/* Protected routes */}
            <Route
              path="/aiva"
              element={
                <ProtectedRoute>
                  <AIVA />
                </ProtectedRoute>
              }
            />
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
                  <Contacts />
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
              path="/financing"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <MarketplaceDeals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/deal/:id"
              element={
                <ProtectedRoute>
                  <MarketplaceDealDetail />
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
              path="/settings/team"
              element={
                <ProtectedRoute>
                  <TeamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/organization"
              element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/billing"
              element={
                <ProtectedRoute>
                  <BillingSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/credits"
              element={
                <ProtectedRoute>
                  <CreditsHistory />
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
            
            {/* Lists Routes */}
            <Route
              path="/marketing/lists"
              element={
                <ProtectedRoute>
                  <Lists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing/lists/:id"
              element={
                <ProtectedRoute>
                  <ListDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing/lists/dedupe"
              element={
                <ProtectedRoute>
                  <ListDedupe />
                </ProtectedRoute>
              }
            />
            
            {/* AI Tools Routes */}
            <Route
              path="/tools/deal-analyzer"
              element={
                <ProtectedRoute>
                  <DealAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/market-analyzer"
              element={
                <ProtectedRoute>
                  <MarketAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/offer-blaster"
              element={
                <ProtectedRoute>
                  <OfferBlaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/property-scout"
              element={
                <ProtectedRoute>
                  <PropertyScout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d"
              element={
                <ProtectedRoute>
                  <D4D />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/properties"
              element={
                <ProtectedRoute>
                  <D4DProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/properties/:id"
              element={
                <ProtectedRoute>
                  <D4DPropertyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/history"
              element={
                <ProtectedRoute>
                  <D4DHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/history/:sessionId"
              element={
                <ProtectedRoute>
                  <D4DSessionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/heatmap"
              element={
                <ProtectedRoute>
                  <D4DHeatMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/areas"
              element={
                <ProtectedRoute>
                  <D4DAreas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/areas/:id"
              element={
                <ProtectedRoute>
                  <D4DAreaDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/areas/:id/edit"
              element={
                <ProtectedRoute>
                  <D4DAreaEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/d4d/mileage"
              element={
                <ProtectedRoute>
                  <D4DMileage />
                </ProtectedRoute>
              }
            />
            
            {/* Renovation Routes */}
            <Route
              path="/renovations"
              element={
                <ProtectedRoute>
                  <Renovations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/renovations/:id"
              element={
                <ProtectedRoute>
                  <RenovationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/renovations/:projectId/images/:imageId"
              element={
                <ProtectedRoute>
                  <ImageEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/renovations/materials"
              element={
                <ProtectedRoute>
                  <MaterialLibrary />
                </ProtectedRoute>
              }
            />

            {/* Dialer */}
            <Route
              path="/dialer"
              element={
                <ProtectedRoute>
                  <Dialer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/queues"
              element={
                <ProtectedRoute>
                  <DialerQueues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/queues/:id"
              element={
                <ProtectedRoute>
                  <DialerQueueDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/scripts"
              element={
                <ProtectedRoute>
                  <DialerScripts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/scripts/:id"
              element={
                <ProtectedRoute>
                  <DialerScriptDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/history"
              element={
                <ProtectedRoute>
                  <DialerHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/dialer"
              element={
                <ProtectedRoute>
                  <DialerSettings />
                </ProtectedRoute>
              }
            />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/markets" element={<Navigate to="/settings" replace />} />
            <Route path="/contacts" element={<Navigate to="/deal-sources" replace />} />
            <Route path="/pipeline" element={<Navigate to="/properties" replace />} />
            <Route path="/documents" element={<Navigate to="/properties" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </PWAProvider>
          </TooltipProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
