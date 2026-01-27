import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  DollarSign,
  CreditCard,
  Percent,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Check,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { format, parseISO, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useLenderLoans,
  useLenderLoanStats,
  useCreateLenderLoan,
  useUpdateLenderLoan,
  useUserProperties,
  type LenderLoanInsert,
} from "@/hooks/useLenderLoans";

interface ActiveLoansTabProps {
  lenderId: string;
  lenderName: string;
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

export function ActiveLoansTab({ lenderId, lenderName }: ActiveLoansTabProps) {
  const navigate = useNavigate();
  const { data: loans, isLoading } = useLenderLoans(lenderId, "active");
  const { data: stats, isLoading: statsLoading } = useLenderLoanStats(lenderId);
  const { data: properties } = useUserProperties();
  const createLoan = useCreateLenderLoan();
  const updateLoan = useUpdateLenderLoan();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<LenderLoanInsert>>({});
  const [fundingDate, setFundingDate] = useState<Date | undefined>();
  const [showFundingPicker, setShowFundingPicker] = useState(false);

  const selectedProperty = properties?.find((p) => p.id === formData.property_id);

  const handlePropertyChange = (propertyId: string) => {
    const prop = properties?.find((p) => p.id === propertyId);
    setFormData({
      ...formData,
      property_id: propertyId,
      ltv_at_funding:
        prop?.arv && formData.loan_amount
          ? Math.round((Number(formData.loan_amount) / prop.arv) * 100)
          : undefined,
    });
  };

  const handleLoanAmountChange = (amount: number) => {
    setFormData({
      ...formData,
      loan_amount: amount,
      ltv_at_funding:
        selectedProperty?.arv
          ? Math.round((amount / selectedProperty.arv) * 100)
          : formData.ltv_at_funding,
    });
  };

  const handleFundingDateChange = (date: Date | undefined) => {
    setFundingDate(date);
    setShowFundingPicker(false);
    if (date && formData.term_months) {
      const maturity = addMonths(date, formData.term_months);
      setFormData({
        ...formData,
        funding_date: format(date, "yyyy-MM-dd"),
        maturity_date: format(maturity, "yyyy-MM-dd"),
      });
    } else if (date) {
      setFormData({ ...formData, funding_date: format(date, "yyyy-MM-dd") });
    }
  };

  const handleTermChange = (months: number) => {
    const maturity = fundingDate ? addMonths(fundingDate, months) : undefined;
    setFormData({
      ...formData,
      term_months: months,
      maturity_date: maturity ? format(maturity, "yyyy-MM-dd") : undefined,
    });
  };

  const handleSubmit = async () => {
    if (!formData.property_id || !formData.loan_amount || !formData.interest_rate || !formData.term_months || !formData.funding_date || !formData.maturity_date) {
      return;
    }

    await createLoan.mutateAsync({
      lender_id: lenderId,
      property_id: formData.property_id,
      loan_amount: formData.loan_amount,
      interest_rate: formData.interest_rate,
      term_months: formData.term_months,
      points: formData.points || 0,
      ltv_at_funding: formData.ltv_at_funding,
      funding_date: formData.funding_date,
      maturity_date: formData.maturity_date,
      notes: formData.notes,
    });

    setShowAddModal(false);
    setFormData({});
    setFundingDate(undefined);
  };

  const handleMarkPaidOff = async (loanId: string) => {
    await updateLoan.mutateAsync({
      id: loanId,
      updates: {
        status: "paid_off",
        payoff_date: new Date().toISOString().split("T")[0],
      },
    });
  };

  if (isLoading || statsLoading) {
    return (
      <div className="p-lg space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-lg">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Capital Deployed</p>
              <p className="text-h3 font-semibold tabular-nums text-success">
                {formatCurrency(stats?.totalCapitalDeployed || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Active Loans</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.activeLoansCount || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center flex-shrink-0">
              <Percent className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Avg Interest Rate</p>
              <p className="text-h3 font-semibold tabular-nums">
                {(stats?.avgInterestRate || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Weighted Avg LTV</p>
              <p className="text-h3 font-semibold tabular-nums">
                {(stats?.weightedAvgLtv || 0).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Active Loans</h3>
          <p className="text-small text-content-secondary">{loans?.length || 0} active loans from {lenderName}</p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => setShowAddModal(true)}>
          Record New Loan
        </Button>
      </div>

      {/* Loans Table */}
      {!loans || loans.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <CreditCard className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-content mb-2">No active loans</h4>
          <p className="text-small text-content-secondary mb-4">
            Record a loan from this lender to track your capital and payments.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={() => setShowAddModal(true)}>
            Record First Loan
          </Button>
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
                    Term
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    LTV
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Funded
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Maturity
                  </th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Status
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loans.map((loan) => (
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
                    <td className="px-4 py-3 text-right text-body tabular-nums">
                      {loan.term_months}mo
                    </td>
                    <td className="px-4 py-3 text-right text-body tabular-nums">
                      {loan.ltv_at_funding ? `${loan.ltv_at_funding}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-small text-content-secondary">
                      {format(parseISO(loan.funding_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right text-small text-content-secondary">
                      {format(parseISO(loan.maturity_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("capitalize", statusColors[loan.status])} size="sm">
                        {loan.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 hover:bg-surface-tertiary rounded-small transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white">
                          <DropdownMenuItem onClick={() => navigate(`/properties/${loan.property_id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Property
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkPaidOff(loan.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark Paid Off
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record New Loan</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label>Property *</Label>
              <Select value={formData.property_id} onValueChange={handlePropertyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.address} - {prop.city}, {prop.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loan Amount & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loan Amount *</Label>
                <Input
                  type="number"
                  value={formData.loan_amount || ""}
                  onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                  placeholder="150000"
                />
              </div>
              <div className="space-y-2">
                <Label>Interest Rate (%) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate || ""}
                  onChange={(e) => setFormData({ ...formData, interest_rate: Number(e.target.value) })}
                  placeholder="10.5"
                />
              </div>
            </div>

            {/* Term & Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term (months) *</Label>
                <Input
                  type="number"
                  value={formData.term_months || ""}
                  onChange={(e) => handleTermChange(Number(e.target.value))}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.points || ""}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  placeholder="2"
                />
              </div>
            </div>

            {/* LTV */}
            <div className="space-y-2">
              <Label>LTV at Funding (%)</Label>
              <Input
                type="number"
                value={formData.ltv_at_funding || ""}
                onChange={(e) => setFormData({ ...formData, ltv_at_funding: Number(e.target.value) })}
                placeholder="70"
              />
              {selectedProperty?.arv && (
                <p className="text-tiny text-content-tertiary">
                  Property ARV: {formatCurrency(selectedProperty.arv)}
                  {formData.loan_amount && ` • Calculated LTV: ${Math.round((formData.loan_amount / selectedProperty.arv) * 100)}%`}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funding Date *</Label>
                <Popover open={showFundingPicker} onOpenChange={setShowFundingPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {fundingDate ? format(fundingDate, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fundingDate}
                      onSelect={handleFundingDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Maturity Date</Label>
                <Input
                  type="text"
                  value={formData.maturity_date ? format(parseISO(formData.maturity_date), "MMM d, yyyy") : ""}
                  disabled
                  placeholder="Auto-calculated"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this loan..."
                rows={3}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createLoan.isPending || !formData.property_id || !formData.loan_amount || !formData.interest_rate || !formData.term_months || !formData.funding_date}
            >
              {createLoan.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Record Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
