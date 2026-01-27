import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateTitleReport,
  useUpdateTitleReport,
  createDefaultSummary,
  type TitleReportSummary,
} from "@/hooks/useTitleReports";

interface OrderTitleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyAddress: string;
  legalDescription?: string;
}

type ReportType = "preliminary" | "full";

interface ReportOption {
  type: ReportType;
  name: string;
  price: string;
  priceRange: string;
  description: string;
  deliveryTime: string;
  features: string[];
}

const reportOptions: ReportOption[] = [
  {
    type: "preliminary",
    name: "Preliminary Title Search",
    price: "$35",
    priceRange: "$25-50",
    description: "Quick look at ownership, liens, and mortgages",
    deliveryTime: "1-2 business days",
    features: [
      "Current owner verification",
      "Active mortgages",
      "Tax lien search",
      "Judgment search",
    ],
  },
  {
    type: "full",
    name: "Full Title Report",
    price: "$100",
    priceRange: "$75-150",
    description: "Complete chain of title with full encumbrance search",
    deliveryTime: "3-5 business days",
    features: [
      "Everything in Preliminary",
      "Full chain of title",
      "Easement review",
      "Covenant restrictions",
      "Survey exceptions",
    ],
  },
];

// Mock data generator for demo
function generateMockTitleData(hasIssues: boolean): TitleReportSummary {
  const summary = createDefaultSummary();
  
  // Random owner names
  const owners = ["John & Mary Smith", "Robert Johnson", "The Williams Family Trust", "ABC Properties LLC"];
  const vestingTypes = ["joint_tenants", "individual", "trust", "llc"];
  
  summary.owner_of_record = owners[Math.floor(Math.random() * owners.length)];
  summary.vesting_type = vestingTypes[Math.floor(Math.random() * vestingTypes.length)];
  summary.legal_description = "Lot 15, Block 3, SUNRISE ESTATES SUBDIVISION, according to the plat thereof recorded in Plat Book 42, Page 78, of the Public Records.";
  
  // Add a mortgage
  summary.mortgages.push({
    lender: "Wells Fargo Bank",
    original_amount: 250000,
    estimated_balance: 180000 + Math.floor(Math.random() * 40000),
    recording_date: "2019-06-15",
    position: "first",
  });
  
  if (hasIssues) {
    // Add some liens
    summary.liens.push({
      type: "tax",
      creditor: "County Tax Collector",
      amount: 3500 + Math.floor(Math.random() * 2000),
      recording_date: "2024-01-15",
      status: "active",
    });
    
    if (Math.random() > 0.5) {
      summary.liens.push({
        type: "mechanic",
        creditor: "ABC Roofing Co.",
        amount: 8500,
        recording_date: "2024-03-01",
        status: "active",
      });
    }
    
    summary.tax_status.current_year_paid = false;
    summary.tax_status.delinquent_amount = 3500;
    summary.tax_status.delinquent_years = [2024];
    
    summary.flags.push("Property taxes delinquent");
    summary.title_status = "issues_found";
  } else {
    summary.tax_status.current_year_paid = true;
    summary.title_status = "clear";
  }
  
  // Calculate totals
  summary.total_liens_amount = summary.liens
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + l.amount, 0) + summary.tax_status.delinquent_amount;
  
  const totalMortgageDebt = summary.mortgages.reduce((sum, m) => sum + m.estimated_balance, 0);
  summary.estimated_equity = 350000 - totalMortgageDebt - summary.total_liens_amount;
  
  return summary;
}

export function OrderTitleModal({
  open,
  onOpenChange,
  propertyId,
  propertyAddress,
  legalDescription,
}: OrderTitleModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ReportType>("preliminary");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const createReport = useCreateTitleReport();
  const updateReport = useUpdateTitleReport();

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedType("preliminary");
      setIsOrdering(false);
      setIsComplete(false);
      setProgress(0);
    }
  }, [open]);

  const selectedOption = reportOptions.find(o => o.type === selectedType)!;

  const handleOrder = async () => {
    setIsOrdering(true);
    setProgress(10);

    // Create pending report
    const result = await createReport.mutateAsync({
      property_id: propertyId,
      report_type: selectedType,
      provider: "demo_provider",
    });

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 800);

    // After 5 seconds, populate with mock data
    setTimeout(async () => {
      clearInterval(progressInterval);
      setProgress(100);
      
      const mockData = generateMockTitleData(Math.random() > 0.6);
      await updateReport.mutateAsync({
        id: result.id,
        updates: {
          status: "completed",
          summary: mockData,
          received_at: new Date().toISOString(),
        },
      });
      
      setIsComplete(true);
    }, 5000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isComplete ? "Report Complete!" : isOrdering ? "Processing Order..." : "Order Title Report"}
          </DialogTitle>
          {!isOrdering && !isComplete && (
            <DialogDescription>
              Step {step} of 3
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Ordering in progress */}
        {isOrdering && !isComplete && (
          <div className="py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-brand animate-spin" />
            </div>
            <h3 className="text-h3 font-semibold text-content mb-2">Processing Your Order</h3>
            <p className="text-body text-content-secondary mb-6">
              This is a demo. In production, you would receive results in {selectedOption.deliveryTime}.
            </p>
            <Progress value={progress} className="w-full max-w-xs mx-auto" />
            <p className="text-small text-content-tertiary mt-2">
              Simulating title search...
            </p>
          </div>
        )}

        {/* Order complete */}
        {isComplete && (
          <div className="py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-h3 font-semibold text-content mb-2">Title Report Ready!</h3>
            <p className="text-body text-content-secondary mb-6">
              Your {selectedOption.name.toLowerCase()} has been completed and is ready to view.
            </p>
            <Button variant="primary" onClick={() => onOpenChange(false)}>
              View Report
            </Button>
          </div>
        )}

        {/* Step 1: Select Report Type */}
        {!isOrdering && !isComplete && step === 1 && (
          <div className="space-y-4">
            {reportOptions.map((option) => (
              <Card
                key={option.type}
                variant="default"
                padding="md"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedType === option.type
                    ? "border-2 border-brand bg-brand/5"
                    : "hover:border-border"
                )}
                onClick={() => setSelectedType(option.type)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-medium flex items-center justify-center",
                      option.type === "preliminary" ? "bg-info/10" : "bg-brand/10"
                    )}>
                      {option.type === "preliminary" ? (
                        <Search className="h-5 w-5 text-info" />
                      ) : (
                        <FileText className="h-5 w-5 text-brand" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-body font-semibold text-content">{option.name}</h4>
                      <p className="text-small text-content-secondary">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-h3 font-bold text-content">{option.price}</span>
                    <p className="text-tiny text-content-tertiary">{option.priceRange}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-content-tertiary" />
                  <span className="text-small text-content-secondary">{option.deliveryTime}</span>
                </div>
                
                <div className="space-y-1">
                  {option.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-small text-content-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Confirm Property */}
        {!isOrdering && !isComplete && step === 2 && (
          <div className="space-y-4">
            <Card variant="default" padding="md">
              <Label className="text-tiny text-content-tertiary uppercase tracking-wide">Property Address</Label>
              <p className="text-body font-medium text-content mt-1">{propertyAddress}</p>
            </Card>
            
            {legalDescription && (
              <Card variant="default" padding="md">
                <Label className="text-tiny text-content-tertiary uppercase tracking-wide">Legal Description</Label>
                <p className="text-small text-content mt-1">{legalDescription}</p>
              </Card>
            )}
            
            <div className="flex items-start gap-2 p-3 bg-info/5 rounded-medium">
              <Checkbox id="confirm" className="mt-0.5" defaultChecked />
              <label htmlFor="confirm" className="text-small text-content-secondary">
                I confirm this is the correct property for the title search
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Payment (Demo) */}
        {!isOrdering && !isComplete && step === 3 && (
          <div className="space-y-4">
            <Card variant="default" padding="md" className="bg-warning/5 border-warning/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-content">Demo Mode</h4>
                  <p className="text-small text-content-secondary mt-1">
                    This is a demo. In production, you would pay <strong>{selectedOption.price}</strong> for a {selectedOption.name.toLowerCase()}.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card variant="default" padding="md">
              <h4 className="text-small font-medium text-content mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Report Type</span>
                  <span className="text-small font-medium text-content">{selectedOption.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-content-secondary">Delivery</span>
                  <span className="text-small text-content">{selectedOption.deliveryTime}</span>
                </div>
                <div className="h-px bg-border-subtle my-2" />
                <div className="flex justify-between">
                  <span className="text-body font-medium text-content">Total</span>
                  <span className="text-body font-bold text-content">{selectedOption.price}</span>
                </div>
              </div>
            </Card>
            
            <p className="text-tiny text-content-tertiary text-center">
              For demo purposes, mock data will be generated in 5 seconds after ordering.
            </p>
          </div>
        )}

        {/* Footer */}
        {!isOrdering && !isComplete && (
          <DialogFooter className="flex justify-between">
            {step > 1 ? (
              <Button variant="ghost" icon={<ArrowLeft />} onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleOrder}
                disabled={createReport.isPending}
              >
                Simulate Order
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
