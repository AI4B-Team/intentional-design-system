import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredits } from "@/hooks/useCredits";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Gift, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function getTransactionIcon(type: string) {
  switch (type) {
    case "purchase":
      return <ArrowUpRight className="h-4 w-4 text-success" />;
    case "usage":
      return <ArrowDownLeft className="h-4 w-4 text-destructive" />;
    case "bonus":
      return <Gift className="h-4 w-4 text-brand-accent" />;
    case "refund":
      return <RotateCcw className="h-4 w-4 text-warning" />;
    default:
      return <Wallet className="h-4 w-4 text-content-tertiary" />;
  }
}

function getTransactionLabel(type: string) {
  switch (type) {
    case "purchase":
      return "Credit Purchase";
    case "usage":
      return "Service Usage";
    case "bonus":
      return "Bonus Credits";
    case "refund":
      return "Refund";
    default:
      return type;
  }
}

export default function CreditsHistory() {
  const navigate = useNavigate();
  const { balance, lifetimePurchased, lifetimeUsed, loading, transactions, transactionsLoading } = useCredits();

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Credit History" },
      ]}
    >
      <div className="space-y-lg max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-semibold text-content">Credit History</h1>
          <p className="text-body text-content-secondary mt-1">
            View your credit balance and transaction history
          </p>
        </div>

        {/* Balance Card */}
        <Card variant="default" padding="lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-brand-accent" />
              </div>
              <div>
                <p className="text-small text-content-secondary">Current Balance</p>
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <p className="text-display font-bold text-content tabular-nums">
                    ${balance.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              icon={<Plus />}
              onClick={() => navigate("/settings/billing")}
            >
              Add Credits
            </Button>
          </div>

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-subtle">
            <div>
              <p className="text-small text-content-secondary">Lifetime Purchased</p>
              {loading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <p className="text-h3 font-semibold text-success tabular-nums">
                  +${lifetimePurchased.toFixed(2)}
                </p>
              )}
            </div>
            <div>
              <p className="text-small text-content-secondary">Lifetime Used</p>
              {loading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <p className="text-h3 font-semibold text-content tabular-nums">
                  ${lifetimeUsed.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card variant="default" padding="none">
          <CardHeader className="p-4 pb-0">
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {transactionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-content-tertiary mx-auto mb-4" />
                <p className="text-body text-content-secondary">No transactions yet</p>
                <p className="text-small text-content-tertiary mt-1">
                  Your credit activity will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-small font-medium text-content">
                            {transaction.description || getTransactionLabel(transaction.type)}
                          </span>
                          {transaction.service && (
                            <Badge variant="secondary" size="sm">
                              {transaction.service}
                            </Badge>
                          )}
                        </div>
                        <p className="text-tiny text-content-tertiary">
                          {format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-body font-semibold tabular-nums",
                          transaction.amount > 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-tiny text-content-tertiary tabular-nums">
                        Balance: ${transaction.balance_after.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
