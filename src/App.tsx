import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { AIVAProvider } from "@/contexts/AIVAContext";
import { CallProvider } from "@/contexts/CallContext";
import { D4DScanProvider } from "@/contexts/D4DScanContext";
import { LiveCallOverlay } from "@/components/calling/LiveCallOverlay";
import { FloatingCallBanner } from "@/components/calling/FloatingCallBanner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PWAProvider } from "@/components/pwa";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIVAPanelWrapper } from "@/components/aiva/AIVAPanelWrapper";
import { LoadingPage } from "@/components/ui/spinner";
import { BuyerAuthProvider } from "./contexts/BuyerAuthContext";

// ---------------------------------------------------------------------------
// Lazy-loaded page imports — each page is code-split into its own chunk.
// ---------------------------------------------------------------------------
const Landing = React.lazy(() => import("./pages/Landing"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const SignupFlow = React.lazy(() => import("./pages/SignupFlow"));
const OnboardingOrganization = React.lazy(() => import("./pages/OnboardingOrganization"));
const OnboardingCreate = React.lazy(() => import("./pages/OnboardingCreate"));
const OnboardingJoin = React.lazy(() => import("./pages/OnboardingJoin"));
const CreateOrganization = React.lazy(() => import("./pages/CreateOrganization"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Properties = React.lazy(() => import("./pages/Properties"));
const PropertyDetail = React.lazy(() => import("./pages/PropertyDetail"));
const Calculators = React.lazy(() => import("./pages/Calculators"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const BuyBox = React.lazy(() => import("./pages/BuyBox"));
const LenderBrowser = React.lazy(() => import("./pages/LenderBrowser"));
const FundingRequest = React.lazy(() => import("./pages/FundingRequest"));
const Capital = React.lazy(() => import("./pages/Capital"));
const CapitalLenders = React.lazy(() => import("./pages/CapitalLenders"));
const CapitalRequestNew = React.lazy(() => import("./pages/CapitalRequestNew"));
const CapitalRequestDetail = React.lazy(() => import("./pages/CapitalRequestDetail"));
const Settings = React.lazy(() => import("./pages/Settings"));
const SettingsIntegrations = React.lazy(() => import("./pages/SettingsIntegrations"));
const TeamManagement = React.lazy(() => import("./pages/TeamManagement"));
const OrganizationSettings = React.lazy(() => import("./pages/OrganizationSettings"));
const BillingSettings = React.lazy(() => import("./pages/BillingSettings"));
const CreditsHistory = React.lazy(() => import("./pages/CreditsHistory"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
const DealSourceDetail = React.lazy(() => import("./pages/DealSourceDetail"));
const SubmitDeal = React.lazy(() => import("./pages/SubmitDeal"));
const Submissions = React.lazy(() => import("./pages/Submissions"));
const Campaigns = React.lazy(() => import("./pages/Campaigns"));
const CampaignWizard = React.lazy(() => import("./pages/CampaignWizard"));
const CampaignDetail = React.lazy(() => import("./pages/CampaignDetail"));
const Offers = React.lazy(() => import("./pages/Offers"));
const Contractors = React.lazy(() => import("./pages/Contractors"));
const ContractorDetail = React.lazy(() => import("./pages/ContractorDetail"));
const Buyers = React.lazy(() => import("./pages/Buyers"));
const BuyerDetail = React.lazy(() => import("./pages/BuyerDetail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const JVPartners = React.lazy(() => import("./pages/JVPartners"));
const DailyReport = React.lazy(() => import("./pages/DailyReport"));
const Achievements = React.lazy(() => import("./pages/Achievements"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const ClosebotTemplates = React.lazy(() => import("./pages/ClosebotTemplates"));
const GHLSnapshot = React.lazy(() => import("./pages/GHLSnapshot"));
const Install = React.lazy(() => import("./pages/Install"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const SetupHub = React.lazy(() => import("./pages/SetupHub"));
const MailDashboard = React.lazy(() => import("./pages/MailDashboard"));
const MailCampaigns = React.lazy(() => import("./pages/MailCampaigns"));
const MailCampaignWizard = React.lazy(() => import("./pages/MailCampaignWizard"));
const MailCampaignDetail = React.lazy(() => import("./pages/MailCampaignDetail"));
const MailTemplates = React.lazy(() => import("./pages/MailTemplates"));
const MailTemplateEditor = React.lazy(() => import("./pages/MailTemplateEditor"));
const MailSuppression = React.lazy(() => import("./pages/MailSuppression"));
const AIVA = React.lazy(() => import("./pages/AIVA"));
const UnifiedInbox = React.lazy(() => import("./pages/UnifiedInbox"));
const Communications = React.lazy(() => import("./pages/Communications"));
const Pipeline = React.lazy(() => import("./pages/Pipeline"));
const MarketplaceDeals = React.lazy(() => import("./pages/MarketplaceDeals"));
const MarketplaceDealDetail = React.lazy(() => import("./pages/MarketplaceDealDetail"));
const OfferCampaignWizard = React.lazy(() => import("./pages/OfferCampaignWizard"));
const TransactionsDashboard = React.lazy(() => import("./pages/TransactionsDashboard"));
const TransactionRoadmapPage = React.lazy(() => import("./pages/TransactionRoadmapPage"));
const DealAnalyzer = React.lazy(() => import("./pages/DealAnalyzer"));
const MarketAnalyzer = React.lazy(() => import("./pages/MarketAnalyzer"));
const Intel = React.lazy(() => import("./pages/Intel"));
const DealAnalysisDetail = React.lazy(() => import("./pages/DealAnalysisDetail"));
const OfferBlaster = React.lazy(() => import("./pages/OfferBlaster"));
const OfferTemplates = React.lazy(() => import("./pages/OfferTemplates"));
const CampaignsHub = React.lazy(() => import("./pages/CampaignsHub"));
const Activity = React.lazy(() => import("./pages/Activity"));
const Feedback = React.lazy(() => import("./pages/Feedback"));
const Renovations = React.lazy(() => import("./pages/Renovations"));
const RenovationDetail = React.lazy(() => import("./pages/RenovationDetail"));
const ImageEditor = React.lazy(() => import("./pages/ImageEditor"));
const MaterialLibrary = React.lazy(() => import("./pages/MaterialLibrary"));
const PropertyScout = React.lazy(() => import("./pages/PropertyScout"));
const Lists = React.lazy(() => import("./pages/Lists"));
const ListDetail = React.lazy(() => import("./pages/ListDetail"));
const ListDedupe = React.lazy(() => import("./pages/ListDedupe"));
const D4D = React.lazy(() => import("./pages/D4D"));
const D4DProperties = React.lazy(() => import("./pages/D4DProperties"));
const D4DPropertyDetail = React.lazy(() => import("./pages/D4DPropertyDetail"));
const D4DHistory = React.lazy(() => import("./pages/D4DHistory"));
const D4DSessionDetail = React.lazy(() => import("./pages/D4DSessionDetail"));
const D4DHeatMap = React.lazy(() => import("./pages/D4DHeatMap"));
const D4DAreas = React.lazy(() => import("./pages/D4DAreas"));
const D4DAreaDetail = React.lazy(() => import("./pages/D4DAreaDetail"));
const D4DAreaEdit = React.lazy(() => import("./pages/D4DAreaEdit"));
const D4DMileage = React.lazy(() => import("./pages/D4DMileage"));
const Dialer = React.lazy(() => import("./pages/Dialer"));
const DialerSession = React.lazy(() => import("./pages/DialerSession"));
const DialerQueues = React.lazy(() => import("./pages/DialerQueues"));
const DialerQueueDetail = React.lazy(() => import("./pages/DialerQueueDetail"));
const DialerScripts = React.lazy(() => import("./pages/DialerScripts"));
const DialerScriptDetail = React.lazy(() => import("./pages/DialerScriptDetail"));
const DialerHistory = React.lazy(() => import("./pages/DialerHistory"));
const DialerSettings = React.lazy(() => import("./pages/DialerSettings"));
const AIAgentSettings = React.lazy(() => import("./pages/AIAgentSettings"));
const SellerWebsitePage = React.lazy(() => import("./pages/SellerWebsitePage"));
const SellerWebsites = React.lazy(() => import("./pages/SellerWebsites"));
const SellerWebsiteWizard = React.lazy(() => import("./pages/SellerWebsiteWizard"));
const SellerWebsiteEditor = React.lazy(() => import("./pages/SellerWebsiteEditor"));
const SellerLeads = React.lazy(() => import("./pages/SellerLeads"));
const WebsiteAnalytics = React.lazy(() => import("./pages/WebsiteAnalytics"));
const PublicDealPage = React.lazy(() => import("./pages/PublicDealPage"));
const DispoDeals = React.lazy(() => import("./pages/DispoDeals"));
const DispoDealForm = React.lazy(() => import("./pages/DispoDealForm"));
const DispoDealDetail = React.lazy(() => import("./pages/DispoDealDetail"));
const CashBuyers = React.lazy(() => import("./pages/CashBuyers"));
const DispoCampaigns = React.lazy(() => import("./pages/DispoCampaigns"));
const DispoCampaignForm = React.lazy(() => import("./pages/DispoCampaignForm"));
const DispoCampaignDetail = React.lazy(() => import("./pages/DispoCampaignDetail"));
const DispoSettings = React.lazy(() => import("./pages/DispoSettings"));
const Appointments = React.lazy(() => import("./pages/Appointments"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const PowerHour = React.lazy(() => import("./pages/PowerHour"));
const LeadSources = React.lazy(() => import("./pages/LeadSources"));
const Documents = React.lazy(() => import("./pages/Documents"));
const Apps = React.lazy(() => import("./pages/Apps"));
const Signatures = React.lazy(() => import("./pages/apps/Signatures"));
const AppTemplates = React.lazy(() => import("./pages/AppTemplates"));
const AutoOfferEngine = React.lazy(() => import("./pages/AutoOfferEngine"));
const LeadScout = React.lazy(() => import("./pages/LeadScout"));
const BuyerRegisterLazy = React.lazy(() => import("./pages/buyer").then(m => ({ default: m.BuyerRegister })));
const BuyerLoginLazy = React.lazy(() => import("./pages/buyer").then(m => ({ default: m.BuyerLogin })));
const BuyerAuthCallbackLazy = React.lazy(() => import("./pages/buyer").then(m => ({ default: m.BuyerAuthCallback })));
const BuyerDashboardLazy = React.lazy(() => import("./pages/buyer").then(m => ({ default: m.BuyerDashboard })));
const BuyerProfileLazy = React.lazy(() => import("./pages/buyer").then(m => ({ default: m.BuyerProfile })));

// ---------------------------------------------------------------------------
// QueryClient with sensible defaults
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — avoid refetching on every mount
      retry: 1, // Retry once on failure, then surface the error
      refetchOnWindowFocus: false, // Prevent jarring refetches when tabbing back
    },
  },
});

// Suspense fallback — minimal loading indicator
function SuspenseFallback() {
  return <LoadingPage />;
}

// Root redirect — landing if not logged in, dashboard if logged in
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return <Navigate to={user ? "/dashboard" : "/landing"} replace />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <AIVAProvider>
            <CallProvider>
            <D4DScanProvider>
            <TooltipProvider>
              <PWAProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <LiveCallOverlay />
                  <FloatingCallBanner />
                  <AIVAPanelWrapper />
                  <div className="flex flex-col min-h-screen overflow-visible">
                  <React.Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/submit-deal" element={<SubmitDeal />} />
                  <Route path="/s/:slug" element={<SellerWebsitePage />} />
                  <Route path="/deals/:slug" element={<PublicDealPage />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/onboarding-old" element={<Onboarding />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Buyer Portal Routes */}
                  <Route path="/register/buyer" element={<BuyerAuthProvider><BuyerRegisterLazy /></BuyerAuthProvider>} />
                  <Route path="/buyer/login" element={<BuyerAuthProvider><BuyerLoginLazy /></BuyerAuthProvider>} />
                  <Route path="/buyer/auth" element={<BuyerAuthProvider><BuyerAuthCallbackLazy /></BuyerAuthProvider>} />
                  <Route path="/buyer/dashboard" element={<BuyerAuthProvider><BuyerDashboardLazy /></BuyerAuthProvider>} />
                  <Route path="/buyer/profile" element={<BuyerAuthProvider><BuyerProfileLazy /></BuyerAuthProvider>} />

                  {/* Organization onboarding - requires auth but not organization */}
                  <Route path="/onboarding" element={<ProtectedRoute requireOrganization={false}><OnboardingOrganization /></ProtectedRoute>} />
                  <Route path="/signup/flow" element={<ProtectedRoute requireOrganization={false}><SignupFlow /></ProtectedRoute>} />
                  <Route path="/onboarding/create" element={<ProtectedRoute requireOrganization={false}><OnboardingCreate /></ProtectedRoute>} />
                  <Route path="/onboarding/join" element={<ProtectedRoute requireOrganization={false}><OnboardingJoin /></ProtectedRoute>} />
                  <Route path="/create-organization" element={<ProtectedRoute requireOrganization={false}><CreateOrganization /></ProtectedRoute>} />
            
            {/* Protected routes */}
            <Route path="/aiva" element={<ProtectedRoute><AIVA /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/inbox" element={<Navigate to="/communications" replace />} />
            <Route path="/communication" element={<Navigate to="/communications" replace />} />
            <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
            <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
            <Route path="/contractors/:id" element={<ProtectedRoute><ContractorDetail /></ProtectedRoute>} />
            <Route path="/buyers" element={<ProtectedRoute><Buyers /></ProtectedRoute>} />
            <Route path="/buyers/:id" element={<ProtectedRoute><BuyerDetail /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
            <Route path="/contacts/:id" element={<ProtectedRoute><DealSourceDetail /></ProtectedRoute>} />
            <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/financing" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/intel" element={<ProtectedRoute><Intel /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplaceDeals /></ProtectedRoute>} />
            <Route path="/marketplace/deal/:id" element={<ProtectedRoute><MarketplaceDealDetail /></ProtectedRoute>} />
            <Route path="/marketplace/deal/:id/make-offer" element={<ProtectedRoute><OfferCampaignWizard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsDashboard /></ProtectedRoute>} />
            <Route path="/transactions/:id" element={<ProtectedRoute><TransactionRoadmapPage /></ProtectedRoute>} />
            <Route path="/marketplace/deal/:id/roadmap" element={<Navigate to="../make-offer" replace />} />
            <Route path="/marketplace/buy-box" element={<ProtectedRoute><BuyBox /></ProtectedRoute>} />
            <Route path="/marketplace/lenders" element={<ProtectedRoute><LenderBrowser /></ProtectedRoute>} />
            <Route path="/marketplace/request" element={<ProtectedRoute><FundingRequest /></ProtectedRoute>} />
            <Route path="/capital" element={<ProtectedRoute><Capital /></ProtectedRoute>} />
            <Route path="/capital/lenders" element={<ProtectedRoute><CapitalLenders /></ProtectedRoute>} />
            <Route path="/capital/request/new" element={<ProtectedRoute><CapitalRequestNew /></ProtectedRoute>} />
            <Route path="/capital/request/:id" element={<ProtectedRoute><CapitalRequestDetail /></ProtectedRoute>} />
            <Route path="/setup" element={<ProtectedRoute><SetupHub /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><SettingsIntegrations /></ProtectedRoute>} />
            <Route path="/settings/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="/settings/organization" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
            <Route path="/settings/billing" element={<ProtectedRoute><BillingSettings /></ProtectedRoute>} />
            <Route path="/settings/credits" element={<ProtectedRoute><CreditsHistory /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/lead-sources" element={<ProtectedRoute><LeadSources /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/campaigns/new" element={<ProtectedRoute><CampaignWizard /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
            <Route path="/jv" element={<ProtectedRoute><JVPartners /></ProtectedRoute>} />
            <Route path="/reports/daily" element={<ProtectedRoute><DailyReport /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/templates/closebot" element={<ProtectedRoute><ClosebotTemplates /></ProtectedRoute>} />
            <Route path="/settings/ghl-snapshot" element={<ProtectedRoute><GHLSnapshot /></ProtectedRoute>} />
            
            {/* Direct Mail Routes */}
            <Route path="/mail" element={<ProtectedRoute><MailDashboard /></ProtectedRoute>} />
            <Route path="/mail/campaigns" element={<ProtectedRoute><MailCampaigns /></ProtectedRoute>} />
            <Route path="/mail/campaigns/new" element={<ProtectedRoute><MailCampaignWizard /></ProtectedRoute>} />
            <Route path="/mail/campaigns/:id" element={<ProtectedRoute><MailCampaignDetail /></ProtectedRoute>} />
            <Route path="/mail/suppression" element={<ProtectedRoute><MailSuppression /></ProtectedRoute>} />
            <Route path="/mail/templates" element={<ProtectedRoute><MailTemplates /></ProtectedRoute>} />
            <Route path="/mail/templates/new" element={<ProtectedRoute><MailTemplateEditor /></ProtectedRoute>} />
            <Route path="/mail/templates/:id" element={<ProtectedRoute><MailTemplates /></ProtectedRoute>} />
            
            {/* Lists Routes */}
            <Route path="/marketing/lists" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
            <Route path="/marketing/lists/:id" element={<ProtectedRoute><ListDetail /></ProtectedRoute>} />
            <Route path="/marketing/lists/dedupe" element={<ProtectedRoute><ListDedupe /></ProtectedRoute>} />
            
            {/* Websites Routes */}
            <Route path="/websites" element={<ProtectedRoute><SellerWebsites /></ProtectedRoute>} />
            <Route path="/websites/new" element={<ProtectedRoute><AppLayout fullWidth><SellerWebsiteWizard /></AppLayout></ProtectedRoute>} />
            <Route path="/websites/:id/edit" element={<ProtectedRoute><SellerWebsiteEditor /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><SellerLeads /></ProtectedRoute>} />
            <Route path="/websites/:websiteId/leads" element={<ProtectedRoute><SellerLeads /></ProtectedRoute>} />
            <Route path="/websites/:id/analytics" element={<ProtectedRoute><WebsiteAnalytics /></ProtectedRoute>} />
            
            {/* AI Tools Routes */}
            <Route path="/tools/deal-analyzer" element={<ProtectedRoute><DealAnalyzer /></ProtectedRoute>} />
            <Route path="/tools/market-analyzer" element={<ProtectedRoute><MarketAnalyzer /></ProtectedRoute>} />
            <Route path="/tools/market-analyzer/:id" element={<ProtectedRoute><DealAnalysisDetail /></ProtectedRoute>} />
            <Route path="/tools/offer-blaster" element={<ProtectedRoute><OfferBlaster /></ProtectedRoute>} />
            <Route path="/tools/offer-templates" element={<ProtectedRoute><OfferTemplates /></ProtectedRoute>} />
            <Route path="/tools/property-scout" element={<ProtectedRoute><PropertyScout /></ProtectedRoute>} />
            <Route path="/tools/auto-offer" element={<ProtectedRoute><AutoOfferEngine /></ProtectedRoute>} />
            <Route path="/tools/lead-scout" element={<ProtectedRoute><LeadScout /></ProtectedRoute>} />
            <Route path="/d4d" element={<ProtectedRoute><D4D /></ProtectedRoute>} />
            <Route path="/d4d/properties" element={<ProtectedRoute><D4DProperties /></ProtectedRoute>} />
            <Route path="/d4d/properties/:id" element={<ProtectedRoute><D4DPropertyDetail /></ProtectedRoute>} />
            <Route path="/d4d/history" element={<ProtectedRoute><D4DHistory /></ProtectedRoute>} />
            <Route path="/d4d/history/:sessionId" element={<ProtectedRoute><D4DSessionDetail /></ProtectedRoute>} />
            <Route path="/d4d/heatmap" element={<ProtectedRoute><D4DHeatMap /></ProtectedRoute>} />
            <Route path="/d4d/areas" element={<ProtectedRoute><D4DAreas /></ProtectedRoute>} />
            <Route path="/d4d/areas/:id" element={<ProtectedRoute><D4DAreaDetail /></ProtectedRoute>} />
            <Route path="/d4d/areas/:id/edit" element={<ProtectedRoute><D4DAreaEdit /></ProtectedRoute>} />
            <Route path="/d4d/mileage" element={<ProtectedRoute><D4DMileage /></ProtectedRoute>} />
            
            {/* Dispo Deals Routes */}
            <Route path="/dispo/deals" element={<ProtectedRoute><DispoDeals /></ProtectedRoute>} />
            <Route path="/dispo/deals/new" element={<ProtectedRoute><DispoDealForm /></ProtectedRoute>} />
            <Route path="/dispo/deals/:id" element={<ProtectedRoute><DispoDealDetail /></ProtectedRoute>} />
            <Route path="/dispo/deals/:id/edit" element={<ProtectedRoute><DispoDealForm /></ProtectedRoute>} />
            <Route path="/dispo/buyers" element={<ProtectedRoute><CashBuyers /></ProtectedRoute>} />
            <Route path="/dispo/campaigns" element={<ProtectedRoute><CampaignsHub /></ProtectedRoute>} />
            <Route path="/dispo/campaigns/new" element={<ProtectedRoute><DispoCampaignForm /></ProtectedRoute>} />
            <Route path="/dispo/campaigns/:id" element={<ProtectedRoute><DispoCampaignDetail /></ProtectedRoute>} />
            <Route path="/dispo/campaigns/:id/edit" element={<ProtectedRoute><DispoCampaignForm /></ProtectedRoute>} />
            <Route path="/dispo/settings" element={<ProtectedRoute><DispoSettings /></ProtectedRoute>} />
            
            <Route path="/renovations" element={<ProtectedRoute><Renovations /></ProtectedRoute>} />
            <Route path="/renovations/:id" element={<ProtectedRoute><RenovationDetail /></ProtectedRoute>} />
            <Route path="/renovations/:projectId/images/:imageId" element={<ProtectedRoute><ImageEditor /></ProtectedRoute>} />
            <Route path="/renovations/materials" element={<ProtectedRoute><MaterialLibrary /></ProtectedRoute>} />

            {/* Documents */}
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

            {/* Apps */}
            <Route path="/apps" element={<ProtectedRoute><Apps /></ProtectedRoute>} />
            <Route path="/apps/signatures" element={<ProtectedRoute><Signatures /></ProtectedRoute>} />
            <Route path="/apps/templates" element={<ProtectedRoute><AppTemplates /></ProtectedRoute>} />

            <Route path="/dialer" element={<Navigate to="/communications?view=dialer" replace />} />
            <Route path="/dialer/session" element={<ProtectedRoute><DialerSession /></ProtectedRoute>} />
            <Route path="/dialer/queues" element={<ProtectedRoute><DialerQueues /></ProtectedRoute>} />
            <Route path="/dialer/queues/:id" element={<ProtectedRoute><DialerQueueDetail /></ProtectedRoute>} />
            <Route path="/dialer/scripts" element={<ProtectedRoute><DialerScripts /></ProtectedRoute>} />
            <Route path="/dialer/scripts/:id" element={<ProtectedRoute><DialerScriptDetail /></ProtectedRoute>} />
            <Route path="/dialer/history" element={<ProtectedRoute><DialerHistory /></ProtectedRoute>} />
            <Route path="/settings/dialer" element={<ProtectedRoute><DialerSettings /></ProtectedRoute>} />
            <Route path="/settings/ai-agent" element={<ProtectedRoute><AIAgentSettings /></ProtectedRoute>} />
            
            {/* Pipeline */}
            <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
            
            {/* Feedback */}
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            
            {/* Power Hour */}
            <Route path="/power-hour" element={<ProtectedRoute><PowerHour /></ProtectedRoute>} />

            {/* Redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/markets" element={<Navigate to="/settings" replace />} />
            <Route path="/deal-sources" element={<Navigate to="/contacts" replace />} />
            <Route path="/apps/documents" element={<Navigate to="/documents" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
                </Routes>
                </React.Suspense>
                </div>
              </BrowserRouter>
              </PWAProvider>
            </TooltipProvider>
            </D4DScanProvider>
            </CallProvider>
          </AIVAProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
