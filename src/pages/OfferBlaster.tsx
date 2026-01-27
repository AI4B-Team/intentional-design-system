import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Zap,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
  Mail,
  Phone,
  Target,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlastResult {
  totalSent: number;
  successful: number;
  failed: number;
  pending: number;
}

export default function OfferBlaster() {
  const [step, setStep] = useState(1);
  const [isBlasting, setIsBlasting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BlastResult | null>(null);

  const [formData, setFormData] = useState({
    offerType: "wholesale",
    discountPercent: "30",
    earnestMoney: "1000",
    closingDays: "14",
    offerTemplate: "standard",
    customMessage: "",
    includeProofOfFunds: true,
    followUpEnabled: true,
    followUpDays: "3",
  });

  // Mock selected properties
  const [selectedProperties] = useState([
    { id: "1", address: "123 Oak St, Dallas, TX", arv: 280000, askingPrice: 180000 },
    { id: "2", address: "456 Elm Ave, Fort Worth, TX", arv: 195000, askingPrice: 130000 },
    { id: "3", address: "789 Pine Rd, Arlington, TX", arv: 320000, askingPrice: 215000 },
  ]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateOffer = (arv: number, discount: number) => {
    return Math.round(arv * (1 - discount / 100));
  };

  const handleBlast = async () => {
    setIsBlasting(true);
    setProgress(0);

    // Simulate sending offers with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(i);
    }

    setResult({
      totalSent: selectedProperties.length,
      successful: selectedProperties.length - 1,
      failed: 0,
      pending: 1,
    });

    setIsBlasting(false);
    toast.success(`${selectedProperties.length} offers sent successfully!`);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">OfferBlaster</h1>
            <p className="text-slate-500">Send bulk offers to multiple properties instantly</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 rounded ${step > s ? "bg-orange-500" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Configure Offer */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Configure Your Offer
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Offer Type</Label>
                  <Select
                    value={formData.offerType}
                    onValueChange={(v) => handleInputChange("offerType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Wholesale Assignment</SelectItem>
                      <SelectItem value="cash">Cash Offer</SelectItem>
                      <SelectItem value="subject_to">Subject-To</SelectItem>
                      <SelectItem value="seller_finance">Seller Financing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Discount from ARV (%)</Label>
                  <Input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => handleInputChange("discountPercent", e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Offers will be calculated at ARV × {100 - parseInt(formData.discountPercent)}%
                  </p>
                </div>

                <div>
                  <Label>Earnest Money Deposit</Label>
                  <Input
                    type="number"
                    value={formData.earnestMoney}
                    onChange={(e) => handleInputChange("earnestMoney", e.target.value)}
                    placeholder="1000"
                  />
                </div>

                <div>
                  <Label>Days to Close</Label>
                  <Input
                    type="number"
                    value={formData.closingDays}
                    onChange={(e) => handleInputChange("closingDays", e.target.value)}
                    placeholder="14"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Offer Template</Label>
                  <Select
                    value={formData.offerTemplate}
                    onValueChange={(v) => handleInputChange("offerTemplate", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Offer</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Lower Price)</SelectItem>
                      <SelectItem value="friendly">Friendly & Flexible</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.offerTemplate === "custom" && (
                  <div>
                    <Label>Custom Message</Label>
                    <Textarea
                      value={formData.customMessage}
                      onChange={(e) => handleInputChange("customMessage", e.target.value)}
                      placeholder="Enter your custom offer message..."
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pof"
                      checked={formData.includeProofOfFunds}
                      onCheckedChange={(c) => handleInputChange("includeProofOfFunds", !!c)}
                    />
                    <Label htmlFor="pof" className="cursor-pointer">
                      Include Proof of Funds
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="followup"
                      checked={formData.followUpEnabled}
                      onCheckedChange={(c) => handleInputChange("followUpEnabled", !!c)}
                    />
                    <Label htmlFor="followup" className="cursor-pointer">
                      Auto Follow-Up
                    </Label>
                  </div>

                  {formData.followUpEnabled && (
                    <div className="ml-6">
                      <Label className="text-sm">Follow-up after (days)</Label>
                      <Input
                        type="number"
                        className="w-24 mt-1"
                        value={formData.followUpDays}
                        onChange={(e) => handleInputChange("followUpDays", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} className="bg-orange-500 hover:bg-orange-600">
                Next: Review Properties
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Review Properties */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Review Properties & Offers
            </h2>

            <div className="space-y-3">
              {selectedProperties.map((prop) => {
                const offerAmount = calculateOffer(prop.arv, parseInt(formData.discountPercent));
                const savings = prop.askingPrice - offerAmount;

                return (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{prop.address}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>ARV: ${prop.arv.toLocaleString()}</span>
                        <span>Asking: ${prop.askingPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        ${offerAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-emerald-600">
                        Save ${savings.toLocaleString()} vs asking
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Total Offers</p>
                <p className="text-sm text-slate-600">
                  {selectedProperties.length} properties selected
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  ${selectedProperties
                    .reduce((sum, p) => sum + calculateOffer(p.arv, parseInt(formData.discountPercent)), 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Total offer value</p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600">
                Next: Confirm & Send
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Send */}
        {step === 3 && !result && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-500" />
              Ready to Blast!
            </h2>

            {!isBlasting ? (
              <>
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{selectedProperties.length}</p>
                      <p className="text-sm text-slate-500">Properties</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-orange-600">
                        ${(parseInt(formData.earnestMoney) * selectedProperties.length).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">Total EMD</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{formData.closingDays}</p>
                      <p className="text-sm text-slate-500">Days to Close</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Once sent, offers cannot be recalled. Make sure all details are correct.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleBlast}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Blast {selectedProperties.length} Offers
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Sending Offers...</h3>
                <Progress value={progress} className="max-w-md mx-auto mb-2" />
                <p className="text-sm text-slate-500">{progress}% complete</p>
              </div>
            )}
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Offers Sent!</h2>
              <p className="text-slate-500">Your offers have been blasted successfully</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{result.totalSent}</p>
                <p className="text-sm text-slate-500">Total Sent</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{result.successful}</p>
                <p className="text-sm text-slate-500">Delivered</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{result.pending}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                <p className="text-sm text-slate-500">Failed</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => { setResult(null); setStep(1); }}>
                Send More Offers
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Track Responses
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
