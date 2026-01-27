import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Check,
  X,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useJVProfiles,
  useMyJVProfile,
  useCreateJVProfile,
  useUpdateJVProfile,
  useJVOpportunities,
  useCreateJVOpportunity,
  useUpdateJVOpportunity,
  useDeleteJVOpportunity,
  useJVInquiries,
  useCreateJVInquiry,
  useUpdateJVInquiry,
} from "@/hooks/useJVPartners";
import {
  JVPartnerCard,
  JVOpportunityCard,
  JVProfileForm,
  JVOpportunityForm,
  JVInquiryModal,
  JVAgreementGenerator,
} from "@/components/jv";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const DEAL_TYPES = [
  "Wholesale",
  "Fix & Flip",
  "BRRRR",
  "Buy & Hold",
  "New Construction",
  "Commercial",
];

export default function JVPartners() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("find");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [profileTypeFilter, setProfileTypeFilter] = React.useState("all");
  const [dealTypeFilter, setDealTypeFilter] = React.useState("all");
  const [capitalFilter, setCapitalFilter] = React.useState("");

  // Modals
  const [showOpportunityForm, setShowOpportunityForm] = React.useState(false);
  const [editingOpportunity, setEditingOpportunity] = React.useState<any>(null);
  const [inquiryOpportunity, setInquiryOpportunity] = React.useState<any>(null);
  const [showAgreementGenerator, setShowAgreementGenerator] = React.useState(false);

  // Queries
  const { data: profiles = [], isLoading: loadingProfiles } = useJVProfiles({
    profileType: profileTypeFilter !== "all" ? profileTypeFilter : undefined,
  });
  const { data: myProfile, isLoading: loadingMyProfile } = useMyJVProfile();
  const { data: publicOpportunities = [], isLoading: loadingPublicOpps } = useJVOpportunities();
  const { data: myOpportunities = [], isLoading: loadingMyOpps } = useJVOpportunities(
    undefined,
    true
  );
  const { data: inquiries = [] } = useJVInquiries();

  // Mutations
  const createProfile = useCreateJVProfile();
  const updateProfile = useUpdateJVProfile();
  const createOpportunity = useCreateJVOpportunity();
  const updateOpportunity = useUpdateJVOpportunity();
  const deleteOpportunity = useDeleteJVOpportunity();
  const createInquiry = useCreateJVInquiry();
  const updateInquiry = useUpdateJVInquiry();

  // Filter opportunities
  const filteredOpportunities = React.useMemo(() => {
    return publicOpportunities.filter((opp) => {
      if (dealTypeFilter !== "all" && opp.deal_type !== dealTypeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          opp.title.toLowerCase().includes(q) ||
          opp.location?.toLowerCase().includes(q) ||
          opp.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [publicOpportunities, dealTypeFilter, searchQuery]);

  // Get inquiries for my opportunities
  const myOpportunityIds = myOpportunities.map((o) => o.id);
  const receivedInquiries = inquiries.filter(
    (inq) => inq.opportunity && myOpportunityIds.includes(inq.opportunity_id)
  );

  const handleSaveProfile = (data: any) => {
    if (myProfile) {
      updateProfile.mutate(data);
    } else {
      createProfile.mutate(data);
    }
  };

  const handleSaveOpportunity = (data: any) => {
    if (editingOpportunity) {
      updateOpportunity.mutate(data, {
        onSuccess: () => {
          setShowOpportunityForm(false);
          setEditingOpportunity(null);
        },
      });
    } else {
      createOpportunity.mutate(data, {
        onSuccess: () => setShowOpportunityForm(false),
      });
    }
  };

  const handleExpressInterest = (opportunityId: string) => {
    const opp = publicOpportunities.find((o) => o.id === opportunityId);
    if (opp) {
      setInquiryOpportunity(opp);
    }
  };

  const handleSubmitInquiry = (opportunityId: string, message: string) => {
    createInquiry.mutate(
      { opportunity_id: opportunityId, message },
      { onSuccess: () => setInquiryOpportunity(null) }
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "JV Partners" }]}
      headerActions={
        <Button
          variant="primary"
          icon={<Plus />}
          onClick={() => {
            setEditingOpportunity(null);
            setShowOpportunityForm(true);
          }}
        >
          Post Opportunity
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="find" className="gap-2">
            <Users className="h-4 w-4" />
            Find Partners
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="gap-2">
            <Briefcase className="h-4 w-4" />
            My Opportunities
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <DollarSign className="h-4 w-4" />
            My Profile
          </TabsTrigger>
        </TabsList>

        {/* FIND PARTNERS TAB */}
        <TabsContent value="find">
          <div className="space-y-6">
            {/* Partners Section */}
            <Card variant="default" padding="md">
              <h2 className="text-h3 font-semibold mb-4">JV Partners</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Select value={profileTypeFilter} onValueChange={setProfileTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Partner Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="capital_partner">Capital Partner</SelectItem>
                    <SelectItem value="operating_partner">Operating Partner</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Min Capital (e.g., 100000)"
                  value={capitalFilter}
                  onChange={setCapitalFilter}
                  className="w-[180px]"
                />
              </div>

              {/* Partner Cards */}
              {loadingProfiles ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : profiles.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title="No partners found"
                  description="No public JV profiles match your criteria"
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profiles.map((profile) => (
                    <JVPartnerCard
                      key={profile.id}
                      profile={profile}
                      onViewProfile={() => {}}
                      onConnect={() => {}}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Opportunities Feed */}
            <Card variant="default" padding="md">
              <h2 className="text-h3 font-semibold mb-4">JV Opportunities</h2>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="pl-10"
                  />
                </div>
                <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Deal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Opportunity Cards */}
              {loadingPublicOpps ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredOpportunities.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="h-8 w-8" />}
                  title="No opportunities found"
                  description="No JV opportunities match your search"
                />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOpportunities.map((opp) => (
                    <JVOpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onExpressInterest={handleExpressInterest}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* MY OPPORTUNITIES TAB */}
        <TabsContent value="opportunities">
          <div className="space-y-6">
            {/* My Posted Opportunities */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-semibold">My Opportunities</h2>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus />}
                  onClick={() => {
                    setEditingOpportunity(null);
                    setShowOpportunityForm(true);
                  }}
                >
                  Post New
                </Button>
              </div>

              {loadingMyOpps ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : myOpportunities.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="h-8 w-8" />}
                  title="No opportunities yet"
                  description="Post your first JV opportunity to find partners"
                  action={{
                    label: "Post Opportunity",
                    onClick: () => setShowOpportunityForm(true),
                    icon: Plus,
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inquiries</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOpportunities.map((opp) => {
                      const oppInquiries = inquiries.filter(
                        (i) => i.opportunity_id === opp.id
                      );
                      return (
                        <TableRow key={opp.id}>
                          <TableCell className="font-medium">{opp.title}</TableCell>
                          <TableCell>
                            {opp.capital_needed
                              ? `$${opp.capital_needed.toLocaleString()}`
                              : "TBD"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                opp.status === "open"
                                  ? "success"
                                  : opp.status === "in_discussion"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {opp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{oppInquiries.length}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(opp.created_at), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingOpportunity(opp);
                                  setShowOpportunityForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteOpportunity.mutate(opp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>

            {/* Received Inquiries */}
            <Card variant="default" padding="md">
              <h2 className="text-h3 font-semibold mb-4">Received Inquiries</h2>

              {receivedInquiries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No inquiries received yet
                </p>
              ) : (
                <div className="space-y-3">
                  {receivedInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="p-4 border border-border rounded-lg flex items-start justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          Inquiry for: {inquiry.opportunity?.title}
                        </div>
                        <p className="text-small text-muted-foreground mt-1">
                          {inquiry.message}
                        </p>
                        <div className="text-tiny text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(inquiry.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            inquiry.status === "accepted"
                              ? "success"
                              : inquiry.status === "declined"
                              ? "error"
                              : "secondary"
                          }
                        >
                          {inquiry.status}
                        </Badge>
                        {inquiry.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateInquiry.mutate({
                                  id: inquiry.id,
                                  status: "accepted",
                                })
                              }
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateInquiry.mutate({
                                  id: inquiry.id,
                                  status: "declined",
                                })
                              }
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {inquiry.status === "accepted" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<FileText />}
                            onClick={() => setShowAgreementGenerator(true)}
                          >
                            Generate Agreement
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* MY PROFILE TAB */}
        <TabsContent value="profile">
          {loadingMyProfile ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <JVProfileForm
              profile={myProfile}
              onSave={handleSaveProfile}
              isLoading={createProfile.isPending || updateProfile.isPending}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <JVOpportunityForm
        open={showOpportunityForm}
        onOpenChange={setShowOpportunityForm}
        opportunity={editingOpportunity}
        onSave={handleSaveOpportunity}
        isLoading={createOpportunity.isPending || updateOpportunity.isPending}
      />

      <JVInquiryModal
        open={!!inquiryOpportunity}
        onOpenChange={(open) => !open && setInquiryOpportunity(null)}
        opportunity={inquiryOpportunity}
        onSubmit={handleSubmitInquiry}
        isLoading={createInquiry.isPending}
      />

      <JVAgreementGenerator
        open={showAgreementGenerator}
        onOpenChange={setShowAgreementGenerator}
      />
    </DashboardLayout>
  );
}
