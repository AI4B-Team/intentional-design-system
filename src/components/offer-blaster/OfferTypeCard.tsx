import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Key,
  Wallet,
  Layers,
  Handshake,
  Building,
  UserPlus,
  ChevronRight,
  AlertTriangle,
  Check,
} from "lucide-react";
import { OfferTypeConfig } from "./types";

const ICON_MAP: Record<string, React.ElementType> = {
  DollarSign,
  Key,
  Wallet,
  Layers,
  Handshake,
  Building,
  UserPlus,
};

interface OfferTypeCardProps {
  config: OfferTypeConfig;
  isSelected?: boolean;
  onSelect: () => void;
  showDetails?: boolean;
}

export function OfferTypeCard({
  config,
  isSelected,
  onSelect,
  showDetails = true,
}: OfferTypeCardProps) {
  const Icon = ICON_MAP[config.icon] || DollarSign;

  return (
    <Card
      variant="default"
      padding="lg"
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:border-accent/50 group relative",
        isSelected && "ring-2 ring-accent border-accent"
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-accent rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg shrink-0", config.bgColor)}>
          <Icon className={cn("h-6 w-6", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-h4 font-semibold text-foreground">
              {config.label}
            </h3>
            {config.isLicenseRequired && (
              <Badge variant="warning" size="sm">
                License Required
              </Badge>
            )}
            {config.requiresPOF && (
              <Badge variant="secondary" size="sm">
                POF Required
              </Badge>
            )}
          </div>

          <p className="text-small text-muted-foreground mb-3">
            {config.description}
          </p>

          {showDetails && (
            <div className="flex flex-wrap gap-2 mb-3">
              {config.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-tiny px-2 py-1 bg-background-secondary rounded-full text-muted-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {config.disclosures && config.disclosures.length > 0 && (
            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-md">
              <div className="flex items-center gap-2 text-warning mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-small font-medium">Required Disclosures</span>
              </div>
              <ul className="text-tiny text-muted-foreground space-y-1">
                {config.disclosures.slice(0, 2).map((disclosure, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-warning">•</span>
                    {disclosure}
                  </li>
                ))}
                {config.disclosures.length > 2 && (
                  <li className="text-warning">
                    +{config.disclosures.length - 2} more disclosures
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
      </div>
    </Card>
  );
}

interface OfferTypeGridProps {
  selectedType: string | null;
  onSelectType: (type: string) => void;
  configs: OfferTypeConfig[];
}

export function OfferTypeGrid({
  selectedType,
  onSelectType,
  configs,
}: OfferTypeGridProps) {
  // Split into investor offers and licensed offers
  const investorOffers = configs.filter((c) => !c.isLicenseRequired);
  const licensedOffers = configs.filter((c) => c.isLicenseRequired);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-h4 font-semibold text-foreground mb-4">
          Investor Offers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investorOffers.map((config) => (
            <OfferTypeCard
              key={config.id}
              config={config}
              isSelected={selectedType === config.id}
              onSelect={() => onSelectType(config.id)}
            />
          ))}
        </div>
      </div>

      {licensedOffers.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-h4 font-semibold text-foreground">
              Agent Options
            </h3>
            <Badge variant="warning" size="sm">
              License Required
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licensedOffers.map((config) => (
              <OfferTypeCard
                key={config.id}
                config={config}
                isSelected={selectedType === config.id}
                onSelect={() => onSelectType(config.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
