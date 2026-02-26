import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Building2,
  Hammer,
  RefreshCw,
  Users,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  Eye,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useFundingRequests, useMarketplaceLenders, useUpdateFundingRequest } from "@/hooks/useCapital";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info/10 text-info",
  reviewing: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  funded: "bg-brand/10 text-brand",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const requestTypeLabels: Record<string, string> = {
  purchase: "Purchase",
  refinance: "Refinance",
  bridge: "Bridge Loan",
  emd: "EMD",
  transactional: "Transactional",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const fundingOptions = [
  {
    id: "fix_flip",
    type: "purchase",
    icon: Hammer,
    title: "Fix & Flip Loans",
    description: "Hard money for acquisitions and rehab",
    terms: "Up to 90% LTC, 70% ARV",
    gradient: "from-warning to-warning/70",
  },
  {
    id: "dscr",
    type: "refinance",
    icon: Building2,
    title: "DSCR Loans",
    description: "Rental property financing",
    terms: "No income verification",
    gradient: "from-brand to-brand-accent",
  },
  {
    id: "emd",
    type: "emd",
    icon: DollarSign,
    title: "EMD Funding",
    description: "Earnest money in 24-48hrs",
    terms: "Protect your deals",
    gradient: "from-success to-success/70",
  },
  {
    id: "transactional",
    type: "transactional",
    icon: RefreshCw,
    title: "Transactional Funding",
    description: "Same-day double close funding",
    terms: "Wholesale assignments",
    gradient: "from-info to-info/70",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: FileText,
    title: "Submit Your Deal",
    description: "Enter your property and funding needs",
    detail: "Takes less than 5 minutes",
  },
  {
    step: 2,
    icon: Users,
    title: "Lenders Compete",
    description: "Your request goes to matched lenders",
    detail: "Receive term sheets within 24 hours",
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: "Choose & Close",
    description: "Compare offers side-by-side",
    detail: "Select the best terms for your deal",
  },
];

export default function Capital() {
  const navigate = useNavigate();
  const { data: requests, isLoading: requestsLoading } = useFundingRequests();
  const { data: lenders } = useMarketplaceLenders();
  const updateRequest = useUpdateFundingRequest();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = requests?.filter((r) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return ["submitted", "reviewing"].includes(r.status);
    return r.status === statusFilter;
  });

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateRequest.mutateAsync({ id, updates: { status: "cancelled" } });
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 -mt-lg -mx-lg px-lg bg-gradient-to-br from-surface-secondary via-background to-background">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-brand-accent/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl" />
        
        <div className="relative container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
            <Shield className="h-4 w-4 text-brand-accent" />
            Trusted by 500+ investors nationwide
          </Badge>

          <h1 className="text-display font-bold text-content mb-6 leading-tight">
            Instant Capital{" "}
            <span className="text-brand-accent">Marketplace</span>
          </h1>

          <p className="text-h3 text-content-secondary font-normal mb-8 max-w-xl mx-auto">
            Get funding for your deals in hours, not weeks. Access our network of {lenders?.length || 50}+ private lenders
            competing for your deal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight />}
              iconPosition="right"
              onClick={() => navigate("/capital/request/new")}
              className="min-w-[200px]"
            >
              Get Funded Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/capital/lenders")}
              className="min-w-[200px]"
            >
              Browse Lenders
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-brand-accent" />
              </div>
              <div className="text-left">
                <div className="text-h3 font-semibold text-content">{lenders?.length || 50}+ Lenders</div>
                <div className="text-small text-content-secondary">In our network</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-brand-accent" />
              </div>
              <div className="text-left">
                <div className="text-h3 font-semibold text-content">24hr Response</div>
                <div className="text-small text-content-secondary">Average time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-brand-accent" />
              </div>
              <div className="text-left">
                <div className="text-h3 font-semibold text-content">$10K - $10M+</div>
                <div className="text-small text-content-secondary">Funding range</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Funding Options */}
      <section className="py-12 container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-h1 font-bold text-content mb-2">Quick Funding Options</h2>
          <p className="text-body text-content-secondary">Choose the financing that fits your deal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fundingOptions.map((option) => (
            <Card
              key={option.id}
              variant="interactive"
              padding="md"
              className="cursor-pointer group text-center"
              onClick={() => navigate(`/capital/request/new?type=${option.type}`)}
            >
              <div className={cn(
                "h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                option.gradient
              )}>
                <option.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-body font-semibold text-content mb-2 group-hover:text-brand transition-colors">
                {option.title}
              </h3>
              <p className="text-small text-content-secondary mb-2">{option.description}</p>
              <p className="text-tiny text-content-tertiary mb-4">{option.terms}</p>
              <Button variant="secondary" size="sm" className="w-full">
                Get Quote
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* My Funding Requests */}
      <section className="py-12 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-h2 font-bold text-content">My Funding Requests</h2>
            <p className="text-small text-content-secondary">Track your active and past funding requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="primary" icon={<Plus />} onClick={() => navigate("/capital/request/new")} className="shrink-0">
              New Request
            </Button>
          </div>
        </div>

        <Card variant="default" padding="none">
          {requestsLoading ? (
            <div className="p-lg">
              <Skeleton className="h-64" />
            </div>
          ) : !filteredRequests || filteredRequests.length === 0 ? (
            <div className="p-lg">
              <EmptyState
                icon={<Banknote className="h-10 w-10 text-content-tertiary" />}
                title="No funding requests yet"
                description="Create your first funding request to start receiving offers from our lender network."
                action={{
                  label: "Create Request",
                  onClick: () => navigate("/capital/request/new"),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Responses
                    </th>
                    <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/capital/request/${request.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
                            <Banknote className="h-4 w-4 text-brand" />
                          </div>
                          <div>
                            <p className="text-body font-medium text-content">
                              {requestTypeLabels[request.request_type] || request.request_type}
                            </p>
                            {request.purpose && (
                              <p className="text-small text-content-secondary line-clamp-1">{request.purpose}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-body font-medium tabular-nums">
                          {formatCurrency(request.loan_amount_requested)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn("capitalize", statusColors[request.status])} size="sm">
                          {request.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-body tabular-nums">—</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-small text-content-secondary">
                          {format(parseISO(request.created_at), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/capital/request/${request.id}`);
                            }}
                          />
                          {request.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<XCircle />}
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => handleCancel(request.id, e)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-surface-secondary -mx-lg px-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-bold text-content mb-2">How It Works</h2>
            <p className="text-body text-content-secondary">Get funded in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border-subtle" />
                )}
                
                <div className="relative z-10">
                  <div className="h-20 w-20 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-4 relative">
                    <item.icon className="h-10 w-10 text-brand-accent" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-small font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-h3 font-semibold text-content mb-2">{item.title}</h3>
                  <p className="text-body text-content-secondary mb-1">{item.description}</p>
                  <p className="text-small text-content-tertiary">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              icon={<Zap />}
              onClick={() => navigate("/capital/request/new")}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-accent to-brand -mx-lg px-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-h1 font-bold text-white mb-4">Ready to Get Funded?</h2>
          <p className="text-body text-white/80 mb-8 max-w-xl mx-auto">
            Submit your request in under 5 minutes and start receiving offers from our network of trusted lenders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              icon={<ArrowRight />}
              iconPosition="right"
              onClick={() => navigate("/capital/request/new")}
              className="bg-white text-brand-accent hover:bg-white/90"
            >
              Get Started Now
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/capital/lenders")}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Browse All Lenders
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
