import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Bed, Bath, Maximize, MapPin, Flame } from "lucide-react";
import { TitleStatusBadge, type TitleStatus } from "./title-status-badge";

interface PropertyCardProps {
  id: string | number;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  beds: number;
  baths: number;
  sqft: number;
  arv?: number;
  spread?: number;
  score: number;
  status: "Hot Lead" | "Warm" | "New" | "In Review" | "On Hold" | "Closed";
  source?: string;
  imageUrl?: string;
  titleStatus?: TitleStatus;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 800) return { bg: "bg-score-hot/15", text: "text-score-hot" };
  if (score >= 600) return { bg: "bg-score-warm/15", text: "text-score-warm" };
  if (score >= 400) return { bg: "bg-score-moderate/15", text: "text-score-moderate" };
  if (score >= 200) return { bg: "bg-score-cool/15", text: "text-score-cool" };
  return { bg: "bg-score-cold/15", text: "text-score-cold" };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "Hot Lead":
      return "success";
    case "Warm":
      return "warning";
    case "In Review":
      return "info";
    case "On Hold":
      return "error";
    case "Closed":
      return "default";
    default:
      return "secondary";
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function PropertyCard({
  address,
  city,
  state,
  beds,
  baths,
  sqft,
  arv,
  spread,
  score,
  status,
  source,
  imageUrl,
  titleStatus,
  onClick,
  className,
  style,
}: PropertyCardProps) {
  const scoreColors = getScoreColor(score);
  const isHot = score >= 800;

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-md",
        "group",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className="relative h-[112px] bg-gradient-to-br from-surface-secondary to-surface-tertiary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={address}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Home className="h-10 w-10 text-content-tertiary/50" />
          </div>
        )}

        {/* Source Badge - Top Left */}
        {source && (
          <div className="absolute left-2 top-2">
            <Badge variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm">
              {source}
            </Badge>
          </div>
        )}

        {/* Status Badge - Top Right */}
        <div className="absolute right-2 top-2">
          <Badge variant={getStatusVariant(status) as any} size="sm">
            {status}
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Address */}
        <h3 className="text-body font-semibold text-content truncate group-hover:text-brand-accent transition-colors">
          {address}
        </h3>
        <div className="flex items-center gap-1 text-small text-content-secondary mt-0.5">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {city}, {state}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle my-3" />

        {/* Specs Row */}
        <div className="flex items-center gap-4 text-small text-content-secondary">
          <div className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            <span>{beds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            <span>{baths}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" />
            <span>{sqft.toLocaleString()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle my-3" />

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Motivation Score & Title Status */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium",
                scoreColors.bg,
                scoreColors.text
              )}
            >
              {isHot && <Flame className="h-3 w-3" />}
              <span>{score}</span>
            </div>
            {titleStatus && <TitleStatusBadge status={titleStatus} />}
          </div>

          {/* ARV/Spread */}
          {(arv || spread) && (
            <div className="text-right text-small">
              {arv && (
                <div className="text-content-secondary">
                  ARV: <span className="font-medium text-content">{formatCurrency(arv)}</span>
                </div>
              )}
              {spread && (
                <div className="text-success font-medium">
                  +{formatCurrency(spread)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
