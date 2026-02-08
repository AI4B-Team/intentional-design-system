import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { AIVAProvider } from "@/contexts/AIVAContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PWAProvider } from "@/components/pwa";
import { ErrorBoundary } from "@/components/error-boundary";
import { AIVAPanel } from "@/components/aiva/AIVAPanel";
import { AIVAPanelWrapper } from "@/components/aiva/AIVAPanelWrapper";
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
import BuyBox from "./pages/BuyBox";
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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
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
import UnifiedInbox from "./pages/UnifiedInbox";
import Pipeline from "./pages/Pipeline";
import MarketplaceDeals from "./pages/MarketplaceDeals";
import MarketplaceDealDetail from "./pages/MarketplaceDealDetail";
// TransactionRoadmapPage removed - now integrated into MakeOfferPage
import MakeOfferPage from "./pages/MakeOfferPage";
import DealAnalyzer from "./pages/DealAnalyzer";
import MarketAnalyzer from "./pages/MarketAnalyzer";
import DealAnalysisDetail from "./pages/DealAnalysisDetail";
import OfferBlaster from "./pages/OfferBlaster";
import OfferTemplates from "./pages/OfferTemplates";
import CampaignsHub from "./pages/CampaignsHub";
import Activity from "./pages/Activity";
import Feedback from "./pages/Feedback";
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
import DialerSession from "./pages/DialerSession";
import DialerQueues from "./pages/DialerQueues";
import DialerQueueDetail from "./pages/DialerQueueDetail";
import DialerScripts from "./pages/DialerScripts";
import DialerScriptDetail from "./pages/DialerScriptDetail";
import DialerHistory from "./pages/DialerHistory";
import DialerSettings from "./pages/DialerSettings";
import SellerWebsitePage from "./pages/SellerWebsitePage";
import SellerWebsites from "./pages/SellerWebsites";
import SellerWebsiteWizard from "./pages/SellerWebsiteWizard";
import SellerWebsiteEditor from "./pages/SellerWebsiteEditor";
import SellerLeads from "./pages/SellerLeads";
import WebsiteAnalytics from "./pages/WebsiteAnalytics";
import PublicDealPage from "./pages/PublicDealPage";
import DispoDeals from "./pages/DispoDeals";
import DispoDealForm from "./pages/DispoDealForm";
import DispoDealDetail from "./pages/DispoDealDetail";
import CashBuyers from "./pages/CashBuyers";
import DispoCampaigns from "./pages/DispoCampaigns";
import DispoCampaignForm from "./pages/DispoCampaignForm";
import DispoCampaignDetail from "./pages/DispoCampaignDetail";
import DispoSettings from "./pages/DispoSettings";
import Appointments from "./pages/Appointments";
import LeadSources from "./pages/LeadSources";
import Documents from "./pages/Documents";
import Apps from "./pages/Apps";
import Signatures from "./pages/apps/Signatures";
import { BuyerRegister, BuyerLogin, BuyerAuthCallback, BuyerDashboard, BuyerProfile } from "./pages/buyer";
import { BuyerAuthProvider } from "./contexts/BuyerAuthContext";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <AIVAProvider>
            <TooltipProvider>
              <PWAProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AIVAPanelWrapper />
                  <div className="flex flex-col min-h-screen overflow-visible">
                  <Routes>
                {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/submit-deal" element={<SubmitDeal />} />
                  <Route path="/s/:slug" element={<SellerWebsitePage />} />
                  <Route path="/deals/:slug" element={<PublicDealPage />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/onboarding-old" element={<Onboarding />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Buyer Portal Routes */}
                  <Route path="/register/buyer" element={<BuyerAuthProvider><BuyerRegister /></BuyerAuthProvider>} />
                  <Route path="/buyer/login" element={<BuyerAuthProvider><BuyerLogin /></BuyerAuthProvider>} />
                  <Route path="/buyer/auth" element={<BuyerAuthProvider><BuyerAuthCallback /></BuyerAuthProvider>} />
                  <Route path="/buyer/dashboard" element={<BuyerAuthProvider><BuyerDashboard /></BuyerAuthProvider>} />
                  <Route path="/buyer/profile" element={<BuyerAuthProvider><BuyerProfile /></BuyerAuthProvider>} />
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
              path="/inbox"
              element={
                <ProtectedRoute>
                  <UnifiedInbox />
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
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/:id"
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
              path="/marketplace/deal/:id/make-offer"
              element={
                <ProtectedRoute>
                  <MakeOfferPage />
                </ProtectedRoute>
              }
            />
            {/* Redirect old roadmap URL to make-offer page */}
            <Route
              path="/marketplace/deal/:id/roadmap"
              element={<Navigate to="../make-offer" replace />}
            />
            <Route
              path="/marketplace/buy-box"
              element={
                <ProtectedRoute>
                  <BuyBox />
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
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead-sources"
              element={
                <ProtectedRoute>
                  <LeadSources />
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
            
            {/* Seller Websites Routes */}
            <Route
              path="/websites"
              element={
                <ProtectedRoute>
                  <SellerWebsites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/new"
              element={
                <ProtectedRoute>
                  <SellerWebsiteWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/:id/edit"
              element={
                <ProtectedRoute>
                  <SellerWebsiteEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <SellerLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/:websiteId/leads"
              element={
                <ProtectedRoute>
                  <SellerLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites/:id/analytics"
              element={
                <ProtectedRoute>
                  <WebsiteAnalytics />
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
              path="/tools/market-analyzer/:id"
              element={
                <ProtectedRoute>
                  <DealAnalysisDetail />
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
              path="/tools/offer-templates"
              element={
                <ProtectedRoute>
                  <OfferTemplates />
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
            
            {/* Dispo Deals Routes */}
            <Route
              path="/dispo/deals"
              element={
                <ProtectedRoute>
                  <DispoDeals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/deals/new"
              element={
                <ProtectedRoute>
                  <DispoDealForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/deals/:id"
              element={
                <ProtectedRoute>
                  <DispoDealDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/deals/:id/edit"
              element={
                <ProtectedRoute>
                  <DispoDealForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/buyers"
              element={
                <ProtectedRoute>
                  <CashBuyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/campaigns"
              element={
                <ProtectedRoute>
                  <CampaignsHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/campaigns/new"
              element={
                <ProtectedRoute>
                  <DispoCampaignForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/campaigns/:id"
              element={
                <ProtectedRoute>
                  <DispoCampaignDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/campaigns/:id/edit"
              element={
                <ProtectedRoute>
                  <DispoCampaignForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispo/settings"
              element={
                <ProtectedRoute>
                  <DispoSettings />
                </ProtectedRoute>
              }
            />
            
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

            {/* Documents */}
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              }
            />

            {/* Apps */}
            <Route
              path="/apps"
              element={
                <ProtectedRoute>
                  <Apps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps/signatures"
              element={
                <ProtectedRoute>
                  <Signatures />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dialer"
              element={
                <ProtectedRoute>
                  <Dialer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dialer/session"
              element={
                <ProtectedRoute>
                  <DialerSession />
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
            
            {/* Pipeline */}
            <Route
              path="/pipeline"
              element={
                <ProtectedRoute>
                  <Pipeline />
                </ProtectedRoute>
              }
            />
            
            {/* Feedback */}
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/markets" element={<Navigate to="/settings" replace />} />
            <Route path="/deal-sources" element={<Navigate to="/contacts" replace />} />
            <Route path="/apps/documents" element={<Navigate to="/documents" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
                </Routes>
                </div>
              </BrowserRouter>
              </PWAProvider>
            </TooltipProvider>
          </AIVAProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
