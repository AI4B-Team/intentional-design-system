import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Mail, MessageSquare, FileText, Send, Clock, AlertTriangle, Settings2 } from "lucide-react";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { AIFollowUpRecommendation } from "@/components/ai/AIFollowUpRecommendation";
import { SubjectPropertySummaryCard } from "@/components/offer-wizard/SubjectPropertySummaryCard";
import { cn } from "@/lib/utils";
import type { OfferWizardStepProps } from "@/components/offer-wizard/offer-campaign-constants";

export function DeliveryStep(props: OfferWizardStepProps) {
  const { deal, arv, offerAmount, effectivePercentage, offerPercentage, emailEnabled, setEmailEnabled, smsEnabled, setSmsEnabled, twilioNumber, setTwilioNumber, scheduleType, setScheduleType, dripBatchSize, setDripBatchSize, dripInterval, setDripInterval, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime, autoFollowUp, setAutoFollowUp, followUpDays, setFollowUpDays, propertyImages, pricingInsight, deliveryInsight, navigate } = props;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Delivery Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Choose how and when your offers will be sent
        </p>
      </div>

      <OfferInsightCard
        insight={deliveryInsight.insight}
        isLoading={deliveryInsight.isLoading}
        error={deliveryInsight.error}
        onRefresh={deliveryInsight.refetch}
      />

      <SubjectPropertySummaryCard
        imageUrl={propertyImages[0]}
        address={deal.address}
        locationLine={`${deal.city}, ${deal.state} ${deal.zip}`}
        askingPrice={deal.price}
        arv={arv}
        offerAmount={offerAmount}
      />

      {/* Delivery Methods */}
      <div className="space-y-4">
        <h4 className="font-medium">Delivery Methods</h4>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  Send professional offer letter via email
                </p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <MessageSquare className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Text (SMS)</p>
                <p className="text-sm text-muted-foreground">
                  Send concise offer via SMS
                </p>
              </div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>

          {smsEnabled && (
            <div className="mt-4 pt-4 border-t">
              <Label htmlFor="twilioNumber">Twilio Number</Label>
              <Select value={twilioNumber} onValueChange={setTwilioNumber}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a Twilio number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+15125551234">+1 (512) 555-1234</SelectItem>
                  <SelectItem value="+15125555678">+1 (512) 555-5678</SelectItem>
                </SelectContent>
              </Select>
              {smsEnabled && !twilioNumber && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Twilio number required for SMS delivery
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={() => navigate("/settings/dialer?tab=caller-id")}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Set Up Twilio Number
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Auto Follow-up */}
      <AIFollowUpRecommendation
        autoFollowUp={autoFollowUp}
        onAutoFollowUpChange={setAutoFollowUp}
        followUpDays={followUpDays}
        onFollowUpDaysChange={setFollowUpDays}
        buyerIntelligence={pricingInsight.buyerIntelligence}
        offerPercentage={effectivePercentage}
      />

      {/* Scheduling Options */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Scheduling</h4>

        <div className="grid grid-cols-2 gap-3">
          <Card
            className={cn(
              "p-4 cursor-pointer transition-all",
              scheduleType === "immediate"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => setScheduleType("immediate")}
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="font-medium">Send Immediately</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All offers sent at once
            </p>
          </Card>

          <Card
            className={cn(
              "p-4 cursor-pointer transition-all",
              scheduleType === "drip"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => setScheduleType("drip")}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Drip Campaign</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stagger delivery over time
            </p>
          </Card>

          <Card
            className={cn(
              "p-4 cursor-pointer transition-all",
              scheduleType === "scheduled"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => setScheduleType("scheduled")}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Schedule For Later</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Set a specific date & time
            </p>
          </Card>

          <Card
            className={cn(
              "p-4 cursor-pointer transition-all",
              scheduleType === "draft"
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => setScheduleType("draft")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Save As Draft</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Save without sending
            </p>
          </Card>
        </div>

        {scheduleType === "drip" && (
          <Card className="p-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Batch Size</Label>
                <Input
                  type="number"
                  value={dripBatchSize}
                  onChange={(e) => setDripBatchSize(parseInt(e.target.value) || 1)}
                  min={1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Interval (minutes)</Label>
                <Input
                  type="number"
                  value={dripInterval}
                  onChange={(e) => setDripInterval(parseInt(e.target.value) || 30)}
                  min={5}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>
        )}

        {scheduleType === "scheduled" && (
          <Card className="p-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Campaign will start on {scheduledDate} at {scheduledTime}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
