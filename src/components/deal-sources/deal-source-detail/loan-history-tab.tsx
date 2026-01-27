import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useLenderLoans, useLenderLoanStats } from "@/hooks/useLenderLoans";

interface LoanHistoryTabProps {
  lenderId: string;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  paid_off: "bg-info/10 text-info",
  extended: "bg-warning/10 text-warning",
  defaulted: "bg-destructive/10 text-destructive",
};

function formatCurrency(value: number | null): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function LoanHistoryTab({ lenderId }: LoanHistoryTabProps) {
  const navigate = useNavigate();
  const { data: allLoans, isLoading } = useLenderLoans(lenderId);
  const { data: stats } = useLenderLoanStats(lenderId);

  const completedLoans = allLoans?.filter((l) => l.status === "paid_off") || [];
  const avgDuration =
    completedLoans.length > 0
      ? completedLoans.reduce((sum, l) => {
          const days = l.payoff_date
            ? differenceInDays(parseISO(l.payoff_date), parseISO(l.funding_date))
            : differenceInDays(parseISO(l.maturity_date), parseISO(l.funding_date));
          return sum + days;
        }, 0) / completedLoans.length
      : 0;

  if (isLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-lg">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Loans</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalLoans || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Interest Paid</p>
              <p className="text-h3 font-semibold tabular-nums text-success">
                {formatCurrency(stats?.totalInterestEarned || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Avg Loan Duration</p>
              <p className="text-h3 font-semibold tabular-nums">{Math.round(avgDuration)} days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="mb-lg">
        <h3 className="text-h3 font-medium text-content">All Loans</h3>
        <p className="text-small text-content-secondary">Complete history of loans from this lender</p>
      </div>

      {/* All Loans Table */}
      {!allLoans || allLoans.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <CreditCard className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-content mb-2">No loan history</h4>
          <p className="text-small text-content-secondary">
            Loans from this lender will appear here once recorded.
          </p>
        </Card>
      ) : (
        <div className="rounded-medium border border-border-subtle overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Property
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Funded
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Payoff Date
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Interest Paid
                  </th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {allLoans.map((loan) => {
                  const duration = loan.payoff_date
                    ? differenceInDays(parseISO(loan.payoff_date), parseISO(loan.funding_date))
                    : null;

                  return (
                    <tr key={loan.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/properties/${loan.property_id}`)}
                          className="text-body font-medium text-brand hover:underline text-left"
                        >
                          {loan.property?.address || "Unknown Property"}
                        </button>
                        {loan.property?.city && (
                          <p className="text-small text-content-secondary">
                            {loan.property.city}, {loan.property.state}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums font-medium">
                        {formatCurrency(loan.loan_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums">
                        {loan.interest_rate}%
                      </td>
                      <td className="px-4 py-3 text-right text-small text-content-secondary">
                        {format(parseISO(loan.funding_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right text-small">
                        {loan.payoff_date ? (
                          <div>
                            <div className="text-content-secondary">
                              {format(parseISO(loan.payoff_date), "MMM d, yyyy")}
                            </div>
                            {duration && (
                              <div className="text-tiny text-content-tertiary">{duration} days</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-content-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums text-success font-medium">
                        {formatCurrency(loan.total_interest_paid)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn("capitalize", statusColors[loan.status])} size="sm">
                          {loan.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
