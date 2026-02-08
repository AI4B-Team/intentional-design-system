import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  DollarSign,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  Phone,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Lender {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  fundingSpeed: string;
  minAmount: number;
  maxAmount: number;
  pofTurnaround: string;
  specialties: string[];
}

const MOCK_LENDERS: Lender[] = [
  {
    id: "1",
    name: "Lima One Capital",
    rating: 4.8,
    fundingSpeed: "Same Day",
    minAmount: 100000,
    maxAmount: 5000000,
    pofTurnaround: "2-4 hours",
    specialties: ["Fix & Flip", "BRRRR", "Ground-Up"],
  },
  {
    id: "2",
    name: "Kiavi",
    rating: 4.7,
    fundingSpeed: "24 Hours",
    minAmount: 75000,
    maxAmount: 3000000,
    pofTurnaround: "Same Day",
    specialties: ["Fix & Flip", "Rental"],
  },
  {
    id: "3",
    name: "RCN Capital",
    rating: 4.6,
    fundingSpeed: "1-2 Days",
    minAmount: 50000,
    maxAmount: 10000000,
    pofTurnaround: "4-8 hours",
    specialties: ["Bridge", "Commercial", "Multi-Family"],
  },
];

interface InlineLenderRequestProps {
  offerAmount: number;
  propertyAddress: string;
  propertyState: string;
  onClose: () => void;
  onSuccess: (pofId: string) => void;
}

export function InlineLenderRequest({
  offerAmount,
  propertyAddress,
  propertyState,
  onClose,
  onSuccess,
}: InlineLenderRequestProps) {
  const [step, setStep] = useState<"select" | "request" | "submitting" | "success">("select");
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [progress, setProgress] = useState(0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  const handleSelectLender = (lender: Lender) => {
    setSelectedLender(lender);
    setStep("request");
  };

  const handleSubmit = async () => {
    if (!selectedLender) return;
    
    setStep("submitting");
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 15, 90));
    }, 300);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setProgress(100);
      setStep("success");
      
      toast.success("POF Request Submitted!", {
        description: `${selectedLender.name} will send your POF within ${selectedLender.pofTurnaround}`,
      });

      // Simulate receiving POF (in real app, this would be a webhook or polling)
      setTimeout(() => {
        onSuccess("new-pof-id-from-lender");
      }, 1500);
    } catch (error) {
      clearInterval(interval);
      setStep("request");
      toast.error("Failed to submit request");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Get Proof Of Funds From Lender
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium">Request Details</p>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span>Amount: <span className="text-foreground font-medium">{formatCurrency(offerAmount)}</span></span>
                <span>Property: <span className="text-foreground font-medium">{propertyState}</span></span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select A Lender</Label>
              {MOCK_LENDERS.filter((l) => l.maxAmount >= offerAmount && l.minAmount <= offerAmount).map((lender) => (
                <Card
                  key={lender.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    selectedLender?.id === lender.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedLender(lender)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-lg">
                        {lender.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lender.name}</p>
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <Star className="h-3 w-3 fill-current" />
                            {lender.rating}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" size="sm" className="gap-1">
                            <Zap className="h-3 w-3" />
                            {lender.fundingSpeed}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            POF in {lender.pofTurnaround}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {lender.specialties.map((s) => (
                            <Badge key={s} variant="outline" size="sm" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{formatCurrency(lender.minAmount)} - {formatCurrency(lender.maxAmount)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={() => selectedLender && handleSelectLender(selectedLender)}
                disabled={!selectedLender}
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "request" && selectedLender && (
          <div className="space-y-4">
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold">
                  {selectedLender.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{selectedLender.name}</p>
                  <p className="text-sm text-muted-foreground">
                    POF typically delivered within {selectedLender.pofTurnaround}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Your Name</Label>
                <Input
                  value={requestForm.name}
                  onChange={(e) => setRequestForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="John Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={requestForm.phone}
                  onChange={(e) => setRequestForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={requestForm.email}
                onChange={(e) => setRequestForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => setRequestForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any specific requirements or timeline needs..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Card className="p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Request Summary</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">POF Amount:</div>
                <div className="font-medium">{formatCurrency(offerAmount)}</div>
                <div className="text-muted-foreground">Property:</div>
                <div className="font-medium truncate">{propertyAddress}</div>
                <div className="text-muted-foreground">Est. Delivery:</div>
                <div className="font-medium">{selectedLender.pofTurnaround}</div>
              </div>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!requestForm.name || !requestForm.email || !requestForm.phone}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Request
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "submitting" && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <div>
              <p className="font-medium">Submitting Request...</p>
              <p className="text-sm text-muted-foreground">
                Connecting with {selectedLender?.name}
              </p>
            </div>
            <Progress value={progress} className="max-w-xs mx-auto" />
          </div>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="font-semibold text-lg">Request Submitted!</p>
              <p className="text-sm text-muted-foreground">
                {selectedLender?.name} will send your POF within {selectedLender?.pofTurnaround}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive an email notification when it's ready.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
