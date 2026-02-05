import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  Building2,
  FileWarning,
  Scale,
  Home,
  Receipt,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateTitleReport,
  useUpdateTitleReport,
  createDefaultSummary,
  type TitleReportSummary,
  type Mortgage,
  type Lien,
  type Judgment,
  type TitleReport,
} from "@/hooks/useTitleReports";

interface ManualTitleEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyAddress: string;
  propertyValue: number | null;
  existingReport?: TitleReport | null;
}

const titleStatusOptions = [
  { value: "clear", label: "Clear - No Issues" },
  { value: "issues_found", label: "Minor Issues Found" },
  { value: "major_issues", label: "Major Issues" },
];

const vestingTypeOptions = [
  { value: "individual", label: "Individual" },
  { value: "joint_tenants", label: "Joint Tenants" },
  { value: "tenants_in_common", label: "Tenants in Common" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "trust", label: "Trust" },
  { value: "estate", label: "Estate" },
];

const lienTypeOptions = [
  { value: "tax", label: "Property Tax Lien" },
  { value: "federal", label: "Federal Tax Lien" },
  { value: "state", label: "State Tax Lien" },
  { value: "mechanic", label: "Mechanic's Lien" },
  { value: "hoa", label: "HOA Lien" },
  { value: "judgment", label: "Judgment Lien" },
  { value: "other", label: "Other" },
];

const delinquentYearOptions = [2020, 2021, 2022, 2023, 2024, 2025];

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ManualTitleEntryModal({
  open,
  onOpenChange,
  propertyId,
  propertyAddress,
  propertyValue,
  existingReport,
}: ManualTitleEntryModalProps) {
  const createReport = useCreateTitleReport();
  const updateReport = useUpdateTitleReport();

  const [summary, setSummary] = useState<TitleReportSummary>(createDefaultSummary());
  
  // Initialize from existing report
  useEffect(() => {
    if (open) {
      if (existingReport?.summary) {
        setSummary(existingReport.summary as TitleReportSummary);
      } else {
        setSummary(createDefaultSummary());
      }
    }
  }, [open, existingReport]);

  const handleSave = async () => {
    // Recalculate totals
    const totalLiens = summary.liens
      .filter((l) => l.status === "active")
      .reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalJudgments = summary.judgments.reduce((sum, j) => sum + (j.amount || 0), 0);
    const taxDelinquent = summary.tax_status?.delinquent_amount || 0;
    const hoaDelinquent = summary.hoa_status?.delinquent_amount || 0;
    const totalMortgageDebt = summary.mortgages.reduce((sum, m) => sum + (m.estimated_balance || 0), 0);

    summary.total_liens_amount = totalLiens + totalJudgments + taxDelinquent + hoaDelinquent;
    summary.estimated_equity = (propertyValue || 0) - totalMortgageDebt - summary.total_liens_amount;

    // Generate flags
    summary.flags = [];
    if (summary.liens.some((l) => l.type === "federal" && l.status === "active")) {
      summary.flags.push("Federal tax lien detected");
    }
    if (summary.liens.filter((l) => l.type === "mechanic" && l.status === "active").length > 1) {
      summary.flags.push("Multiple mechanic's liens");
    }
    if (summary.judgments.some((j) => j.amount > 50000)) {
      summary.flags.push("Judgment over $50K");
    }
    if (!summary.tax_status.current_year_paid) {
      summary.flags.push("Property taxes delinquent");
    }
    if (summary.hoa_status.has_hoa && !summary.hoa_status.current) {
      summary.flags.push("HOA dues delinquent");
    }

    if (existingReport) {
      await updateReport.mutateAsync({
        id: existingReport.id,
        updates: { summary, received_at: new Date().toISOString() },
      });
    } else {
      await createReport.mutateAsync({
        property_id: propertyId,
        report_type: "preliminary",
        provider: "manual",
        summary,
      });
    }

    onOpenChange(false);
  };

  // Mortgage handlers
  const addMortgage = () => {
    setSummary({
      ...summary,
      mortgages: [
        ...summary.mortgages,
        { position: "first", lender: "", original_amount: 0, estimated_balance: 0, recording_date: "" },
      ],
    });
  };

  const updateMortgage = (index: number, updates: Partial<Mortgage>) => {
    const newMortgages = [...summary.mortgages];
    newMortgages[index] = { ...newMortgages[index], ...updates };
    setSummary({ ...summary, mortgages: newMortgages });
  };

  const removeMortgage = (index: number) => {
    setSummary({ ...summary, mortgages: summary.mortgages.filter((_, i) => i !== index) });
  };

  // Lien handlers
  const addLien = () => {
    setSummary({
      ...summary,
      liens: [
        ...summary.liens,
        { type: "tax", creditor: "", amount: 0, recording_date: "", status: "active" },
      ],
    });
  };

  const updateLien = (index: number, updates: Partial<Lien>) => {
    const newLiens = [...summary.liens];
    newLiens[index] = { ...newLiens[index], ...updates };
    setSummary({ ...summary, liens: newLiens });
  };

  const removeLien = (index: number) => {
    setSummary({ ...summary, liens: summary.liens.filter((_, i) => i !== index) });
  };

  // Judgment handlers
  const addJudgment = () => {
    setSummary({
      ...summary,
      judgments: [
        ...summary.judgments,
        { plaintiff: "", amount: 0, case_number: "", date: "" },
      ],
    });
  };

  const updateJudgment = (index: number, updates: Partial<Judgment>) => {
    const newJudgments = [...summary.judgments];
    newJudgments[index] = { ...newJudgments[index], ...updates };
    setSummary({ ...summary, judgments: newJudgments });
  };

  const removeJudgment = (index: number) => {
    setSummary({ ...summary, judgments: summary.judgments.filter((_, i) => i !== index) });
  };

  // Toggle delinquent year
  const toggleDelinquentYear = (year: number) => {
    const years = summary.tax_status.delinquent_years || [];
    if (years.includes(year)) {
      setSummary({
        ...summary,
        tax_status: { ...summary.tax_status, delinquent_years: years.filter(y => y !== year) },
      });
    } else {
      setSummary({
        ...summary,
        tax_status: { ...summary.tax_status, delinquent_years: [...years, year].sort() },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Title Information</DialogTitle>
          <DialogDescription>{propertyAddress}</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
        <Accordion type="multiple" defaultValue={["basic", "mortgages", "liens", "tax", "hoa"]} className="space-y-2">
          {/* Section 1: Basic Info */}
          <AccordionItem value="basic" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">Basic Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div>
                <Label>Title Status</Label>
                <Select
                  value={summary.title_status}
                  onValueChange={(v) => setSummary({ ...summary, title_status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {titleStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner of Record</Label>
                  <Input
                    value={summary.owner_of_record}
                    onChange={(v) => setSummary({ ...summary, owner_of_record: v })}
                    placeholder="John & Jane Doe"
                  />
                </div>
                <div>
                  <Label>Vesting Type</Label>
                  <Select
                    value={summary.vesting_type}
                    onValueChange={(v) => setSummary({ ...summary, vesting_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vestingTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Legal Description</Label>
                <Textarea
                  value={summary.legal_description}
                  onChange={(e) => setSummary({ ...summary, legal_description: e.target.value })}
                  placeholder="Lot 5, Block 2, Sunrise Estates..."
                  rows={2}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Mortgages */}
          <AccordionItem value="mortgages" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">Mortgages</span>
                {summary.mortgages.length > 0 && (
                  <Badge variant="secondary" size="sm">{summary.mortgages.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {summary.mortgages.map((m, i) => (
                <Card key={i} variant="default" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" size="sm" className="capitalize">{m.position} Mortgage</Badge>
                    <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => removeMortgage(i)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-tiny">Position</Label>
                      <Select value={m.position} onValueChange={(v) => updateMortgage(i, { position: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="second">Second</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-tiny">Lender Name</Label>
                      <Input value={m.lender} onChange={(v) => updateMortgage(i, { lender: v })} placeholder="Bank name" />
                    </div>
                    <div>
                      <Label className="text-tiny">Original Amount</Label>
                      <Input type="number" value={m.original_amount || ""} onChange={(v) => updateMortgage(i, { original_amount: parseFloat(v) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-tiny">Est. Current Balance</Label>
                      <Input type="number" value={m.estimated_balance || ""} onChange={(v) => updateMortgage(i, { estimated_balance: parseFloat(v) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-tiny">Recording Date</Label>
                      <Input type="date" value={m.recording_date} onChange={(v) => updateMortgage(i, { recording_date: v })} />
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="secondary" size="sm" icon={<Plus />} onClick={addMortgage} className="w-full">
                Add Mortgage
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Liens */}
          <AccordionItem value="liens" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">Liens</span>
                {summary.liens.length > 0 && (
                  <Badge variant="warning" size="sm">{summary.liens.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {summary.liens.map((l, i) => (
                <Card key={i} variant="default" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={l.status === "active" ? "error" : "secondary"} size="sm">{l.status}</Badge>
                    <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => removeLien(i)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-tiny">Lien Type</Label>
                      <Select value={l.type} onValueChange={(v) => updateLien(i, { type: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lienTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-tiny">Creditor Name</Label>
                      <Input value={l.creditor} onChange={(v) => updateLien(i, { creditor: v })} placeholder="IRS, County, etc." />
                    </div>
                    <div>
                      <Label className="text-tiny">Amount</Label>
                      <Input type="number" value={l.amount || ""} onChange={(v) => updateLien(i, { amount: parseFloat(v) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-tiny">Status</Label>
                      <Select value={l.status} onValueChange={(v) => updateLien(i, { status: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="released">Released</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-tiny">Recording Date</Label>
                      <Input type="date" value={l.recording_date} onChange={(v) => updateLien(i, { recording_date: v })} />
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="secondary" size="sm" icon={<Plus />} onClick={addLien} className="w-full">
                Add Lien
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: Judgments */}
          <AccordionItem value="judgments" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">Judgments</span>
                {summary.judgments.length > 0 && (
                  <Badge variant="error" size="sm">{summary.judgments.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {summary.judgments.map((j, i) => (
                <Card key={i} variant="default" padding="sm" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-small font-medium">Judgment #{i + 1}</span>
                    <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => removeJudgment(i)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-tiny">Plaintiff</Label>
                      <Input value={j.plaintiff} onChange={(v) => updateJudgment(i, { plaintiff: v })} placeholder="Creditor name" />
                    </div>
                    <div>
                      <Label className="text-tiny">Amount</Label>
                      <Input type="number" value={j.amount || ""} onChange={(v) => updateJudgment(i, { amount: parseFloat(v) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-tiny">Case Number</Label>
                      <Input value={j.case_number} onChange={(v) => updateJudgment(i, { case_number: v })} placeholder="2024-CV-12345" />
                    </div>
                    <div>
                      <Label className="text-tiny">Date</Label>
                      <Input type="date" value={j.date} onChange={(v) => updateJudgment(i, { date: v })} />
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="secondary" size="sm" icon={<Plus />} onClick={addJudgment} className="w-full">
                Add Judgment
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Section 5: Tax Status */}
          <AccordionItem value="tax" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">Tax Status</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Current Year Taxes Paid?</Label>
                <Switch
                  checked={summary.tax_status.current_year_paid}
                  onCheckedChange={(v) =>
                    setSummary({
                      ...summary,
                      tax_status: { ...summary.tax_status, current_year_paid: v },
                    })
                  }
                />
              </div>
              {!summary.tax_status.current_year_paid && (
                <>
                  <div>
                    <Label>Delinquent Amount</Label>
                    <Input
                      type="number"
                      value={summary.tax_status.delinquent_amount || ""}
                      onChange={(v) =>
                        setSummary({
                          ...summary,
                          tax_status: { ...summary.tax_status, delinquent_amount: parseFloat(v) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Delinquent Years</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {delinquentYearOptions.map((year) => (
                        <Badge
                          key={year}
                          variant={summary.tax_status.delinquent_years?.includes(year) ? "error" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleDelinquentYear(year)}
                        >
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Section 6: HOA Status */}
          <AccordionItem value="hoa" className="border rounded-medium px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-content-tertiary" />
                <span className="font-medium">HOA Status</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Property has HOA?</Label>
                <Switch
                  checked={summary.hoa_status.has_hoa}
                  onCheckedChange={(v) =>
                    setSummary({
                      ...summary,
                      hoa_status: { ...summary.hoa_status, has_hoa: v },
                    })
                  }
                />
              </div>
              {summary.hoa_status.has_hoa && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Current on Dues?</Label>
                    <Switch
                      checked={summary.hoa_status.current}
                      onCheckedChange={(v) =>
                        setSummary({
                          ...summary,
                          hoa_status: { ...summary.hoa_status, current: v },
                        })
                      }
                    />
                  </div>
                  {!summary.hoa_status.current && (
                    <div>
                      <Label>Delinquent Amount</Label>
                      <Input
                        type="number"
                        value={summary.hoa_status.delinquent_amount || ""}
                        onChange={(v) =>
                          setSummary({
                            ...summary,
                            hoa_status: { ...summary.hoa_status, delinquent_amount: parseFloat(v) || 0 },
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={createReport.isPending || updateReport.isPending}
          >
            Save Title Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
