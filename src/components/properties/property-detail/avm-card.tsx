import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAttomAVM, useUpdatePropertyAVM } from "@/hooks/useAttom";
import { useUpdateProperty } from "@/hooks/useProperty";
import { formatAttomCurrency, getConfidenceBadgeVariant } from "@/lib/attom";
import { DollarSign, RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AVMCardProps {
  propertyId: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  currentAVM?: number | null;
  avmHigh?: number | null;
  avmLow?: number | null;
  avmConfidence?: string | null;
  lastDataPull?: string | null;
  onUseAsARV?: (value: number) => void;
}

export function AVMCard({
  propertyId,
  address,
  city,
  state,
  zip,
  currentAVM,
  avmHigh,
  avmLow,
  avmConfidence,
  lastDataPull,
  onUseAsARV,
}: AVMCardProps) {
  const attomAVM = useAttomAVM();
  const updateAVM = useUpdatePropertyAVM();
  const updateProperty = useUpdateProperty();

  const hasAVM = currentAVM != null;

  const handleGetEstimate = async () => {
    if (!address || !city || !state) return;

    const result = await attomAVM.mutateAsync({
      address,
      city: city || "",
      state: state || "",
      zip: zip || "",
    });

    if (result) {
      await updateAVM.mutateAsync({
        propertyId,
        avmData: result,
      });
    }
  };

  const handleUseAsARV = () => {
    if (currentAVM && onUseAsARV) {
      onUseAsARV(currentAVM);
    } else if (currentAVM) {
      updateProperty.mutate({
        id: propertyId,
        updates: { arv: currentAVM },
      });
    }
  };

  const isLoading = attomAVM.isPending || updateAVM.isPending;

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-medium bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <h3 className="text-body font-semibold text-content">Property Valuation</h3>
        </div>
        {hasAVM && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGetEstimate}
            disabled={isLoading}
            className="text-content-secondary"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {!hasAVM ? (
        <div className="text-center py-4">
          <DollarSign className="h-10 w-10 mx-auto mb-2 text-content-tertiary opacity-50" />
          <p className="text-small text-content-secondary mb-3">
            Get an automated valuation estimate
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGetEstimate}
            disabled={isLoading || !address || !city || !state}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Getting Estimate...
              </>
            ) : (
              "Get Estimate"
            )}
          </Button>
          {attomAVM.isError && (
            <p className="text-tiny text-destructive mt-2">
              {attomAVM.error?.message || "Failed to get estimate"}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Main Value */}
          <div className="text-center py-2">
            <p className="text-tiny uppercase tracking-wide text-content-tertiary mb-1">
              Estimated Value
            </p>
            <p className="text-h2 font-bold text-content tabular-nums">
              {formatAttomCurrency(currentAVM)}
            </p>
          </div>

          {/* Range */}
          {(avmLow || avmHigh) && (
            <div className="flex items-center justify-center gap-2 text-small text-content-secondary">
              <span>{formatAttomCurrency(avmLow)}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{formatAttomCurrency(avmHigh)}</span>
            </div>
          )}

          {/* Confidence */}
          {avmConfidence && (
            <div className="flex items-center justify-center">
              <Badge
                variant={getConfidenceBadgeVariant(avmConfidence)}
                size="sm"
              >
                {avmConfidence} Confidence
              </Badge>
            </div>
          )}

          {/* Use as ARV */}
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleUseAsARV}
            disabled={updateProperty.isPending}
          >
            Use as ARV
          </Button>

          {/* Last Updated */}
          {lastDataPull && (
            <p className="text-tiny text-content-tertiary text-center">
              Updated {new Date(lastDataPull).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
