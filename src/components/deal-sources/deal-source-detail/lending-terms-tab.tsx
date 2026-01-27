import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Percent,
  Calendar,
  MapPin,
  Home,
  CreditCard,
  Pencil,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LendingCriteria } from "@/hooks/useLenderLoans";
import { useUpdateLendingCriteria } from "@/hooks/useLenderLoans";

interface LendingTermsTabProps {
  sourceId: string;
  criteria: LendingCriteria | null;
}

const propertyTypeOptions = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Commercial",
  "Land",
  "Mixed Use",
];

const loanTypeOptions = [
  "Bridge",
  "Fix & Flip",
  "DSCR",
  "Construction",
  "Ground Up",
  "Refinance",
  "Purchase",
];

function formatCurrency(value: number | undefined): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function LendingTermsTab({ sourceId, criteria }: LendingTermsTabProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<LendingCriteria>(criteria || {});
  const [newArea, setNewArea] = useState("");

  const updateCriteria = useUpdateLendingCriteria();

  const handleOpenEdit = () => {
    setFormData(criteria || {});
    setShowEditModal(true);
  };

  const handleSave = async () => {
    await updateCriteria.mutateAsync({ id: sourceId, criteria: formData });
    setShowEditModal(false);
  };

  const toggleArrayItem = (field: keyof LendingCriteria, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const addArea = () => {
    if (newArea.trim()) {
      const current = formData.geographic_areas || [];
      if (!current.includes(newArea.trim())) {
        setFormData({ ...formData, geographic_areas: [...current, newArea.trim()] });
      }
      setNewArea("");
    }
  };

  const removeArea = (area: string) => {
    const current = formData.geographic_areas || [];
    setFormData({ ...formData, geographic_areas: current.filter((a) => a !== area) });
  };

  const toggleTerm = (months: number) => {
    const current = formData.preferred_term_months || [];
    const updated = current.includes(months)
      ? current.filter((t) => t !== months)
      : [...current, months].sort((a, b) => a - b);
    setFormData({ ...formData, preferred_term_months: updated });
  };

  const hasCriteria = criteria && Object.keys(criteria).length > 0;

  return (
    <div className="p-lg">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-content">Lending Criteria</h3>
          <p className="text-small text-content-secondary">
            {hasCriteria ? "This lender's preferred loan terms" : "No criteria set yet"}
          </p>
        </div>
        <Button variant="secondary" icon={<Pencil />} onClick={handleOpenEdit}>
          {hasCriteria ? "Edit Criteria" : "Set Criteria"}
        </Button>
      </div>

      {!hasCriteria ? (
        <Card variant="default" padding="lg" className="text-center">
          <CreditCard className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-content mb-2">No lending criteria set</h4>
          <p className="text-small text-content-secondary mb-4">
            Add this lender's preferred loan terms to help match them with the right deals.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={handleOpenEdit}>
            Add Lending Criteria
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Loan Amount Range */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-small text-content-secondary">Loan Amount Range</div>
                <div className="text-body font-medium text-content">
                  {formatCurrency(criteria.min_loan_amount)} - {formatCurrency(criteria.max_loan_amount)}
                </div>
              </div>
            </div>
          </Card>

          {/* Interest Rate Range */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Percent className="h-5 w-5 text-brand" />
              </div>
              <div>
                <div className="text-small text-content-secondary">Interest Rate Range</div>
                <div className="text-body font-medium text-content">
                  {criteria.interest_rate_range?.min || 0}% - {criteria.interest_rate_range?.max || 0}%
                </div>
              </div>
            </div>
          </Card>

          {/* Preferred Terms */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-small text-content-secondary">Preferred Terms</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {criteria.preferred_term_months?.map((term) => (
                    <Badge key={term} variant="secondary" size="sm">
                      {term} months
                    </Badge>
                  )) || <span className="text-content-tertiary">—</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Max LTV */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Percent className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-small text-content-secondary">Maximum LTV</div>
                <div className="text-body font-medium text-content">
                  {criteria.max_ltv ? `${criteria.max_ltv}%` : "—"}
                </div>
              </div>
            </div>
          </Card>

          {/* Property Types */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-brand-accent" />
              </div>
              <div className="flex-1">
                <div className="text-small text-content-secondary mb-2">Property Types</div>
                <div className="flex flex-wrap gap-1">
                  {criteria.property_types?.map((type) => (
                    <Badge key={type} variant="info" size="sm">
                      {type}
                    </Badge>
                  )) || <span className="text-content-tertiary">—</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Geographic Areas */}
          <Card variant="default" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-small text-content-secondary mb-2">Geographic Areas</div>
                <div className="flex flex-wrap gap-1">
                  {criteria.geographic_areas?.map((area) => (
                    <Badge key={area} variant="success" size="sm">
                      {area}
                    </Badge>
                  )) || <span className="text-content-tertiary">—</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Loan Types */}
          <Card variant="default" padding="md" className="md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1">
                <div className="text-small text-content-secondary mb-2">Loan Types</div>
                <div className="flex flex-wrap gap-1">
                  {criteria.loan_types?.map((type) => (
                    <Badge key={type} variant="secondary" size="sm">
                      {type}
                    </Badge>
                  )) || <span className="text-content-tertiary">—</span>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lending Criteria</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6">
            {/* Loan Amount Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Loan Amount</Label>
                <Input
                  type="number"
                  value={formData.min_loan_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_loan_amount: Number(e.target.value) })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Loan Amount</Label>
                <Input
                  type="number"
                  value={formData.max_loan_amount || ""}
                  onChange={(e) => setFormData({ ...formData, max_loan_amount: Number(e.target.value) })}
                  placeholder="500000"
                />
              </div>
            </div>

            {/* Interest Rate Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate_range?.min || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interest_rate_range: {
                        ...formData.interest_rate_range,
                        min: Number(e.target.value),
                        max: formData.interest_rate_range?.max || 0,
                      },
                    })
                  }
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate_range?.max || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interest_rate_range: {
                        min: formData.interest_rate_range?.min || 0,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  placeholder="14"
                />
              </div>
            </div>

            {/* Max LTV */}
            <div className="space-y-2">
              <Label>Max LTV (%)</Label>
              <Input
                type="number"
                value={formData.max_ltv || ""}
                onChange={(e) => setFormData({ ...formData, max_ltv: Number(e.target.value) })}
                placeholder="75"
              />
            </div>

            {/* Preferred Terms */}
            <div className="space-y-2">
              <Label>Preferred Terms (months)</Label>
              <div className="flex flex-wrap gap-2">
                {[6, 9, 12, 18, 24, 36].map((months) => (
                  <button
                    key={months}
                    onClick={() => toggleTerm(months)}
                    className={cn(
                      "px-3 py-1.5 rounded-medium text-small font-medium transition-colors",
                      formData.preferred_term_months?.includes(months)
                        ? "bg-brand text-white"
                        : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                    )}
                  >
                    {months} mo
                  </button>
                ))}
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <Label>Property Types</Label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem("property_types", type)}
                    className={cn(
                      "px-3 py-1.5 rounded-medium text-small font-medium transition-colors",
                      formData.property_types?.includes(type)
                        ? "bg-info text-white"
                        : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Types */}
            <div className="space-y-2">
              <Label>Loan Types</Label>
              <div className="flex flex-wrap gap-2">
                {loanTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem("loan_types", type)}
                    className={cn(
                      "px-3 py-1.5 rounded-medium text-small font-medium transition-colors",
                      formData.loan_types?.includes(type)
                        ? "bg-brand text-white"
                        : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Geographic Areas */}
            <div className="space-y-2">
              <Label>Geographic Areas</Label>
              <div className="flex gap-2">
                <Input
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g., Austin TX, Harris County"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
                />
                <Button variant="secondary" onClick={addArea}>
                  Add
                </Button>
              </div>
              {formData.geographic_areas && formData.geographic_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.geographic_areas.map((area) => (
                    <Badge key={area} variant="success" size="sm" className="pr-1">
                      {area}
                      <button
                        onClick={() => removeArea(area)}
                        className="ml-1 p-0.5 hover:bg-white/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={updateCriteria.isPending}>
              {updateCriteria.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Criteria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
