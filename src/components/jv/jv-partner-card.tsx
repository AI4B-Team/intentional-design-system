import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Briefcase,
  MapPin,
  User,
  Eye,
  MessageSquare,
} from "lucide-react";
import type { JVProfile } from "@/hooks/useJVPartners";
import { cn } from "@/lib/utils";

interface JVPartnerCardProps {
  profile: JVProfile;
  onViewProfile?: (id: string) => void;
  onConnect?: (id: string) => void;
}

function formatCapital(amount: number | null): string {
  if (!amount) return "Not specified";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function getProfileTypeLabel(type: string): string {
  switch (type) {
    case "capital_partner":
      return "Capital Partner";
    case "operating_partner":
      return "Operating Partner";
    case "both":
      return "Capital & Operating";
    default:
      return type;
  }
}

function getExperienceColor(level: string): string {
  switch (level) {
    case "expert":
      return "bg-brand-accent text-white";
    case "experienced":
      return "bg-success/10 text-success";
    case "intermediate":
      return "bg-info/10 text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function JVPartnerCard({
  profile,
  onViewProfile,
  onConnect,
}: JVPartnerCardProps) {
  return (
    <Card variant="default" padding="md" className="hover:border-brand-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <Badge variant="secondary" size="sm">
              {getProfileTypeLabel(profile.profile_type)}
            </Badge>
            <Badge
              className={cn("ml-2", getExperienceColor(profile.experience_level))}
              size="sm"
            >
              {profile.experience_level}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Capital */}
        <div className="flex items-center gap-2 text-small">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="text-muted-foreground">Available Capital:</span>
          <span className="font-semibold">{formatCapital(profile.available_capital)}</span>
        </div>

        {/* Deal Types */}
        {profile.target_deal_types.length > 0 && (
          <div className="flex items-start gap-2 text-small">
            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {profile.target_deal_types.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" size="sm">
                  {type}
                </Badge>
              ))}
              {profile.target_deal_types.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{profile.target_deal_types.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Areas */}
        {profile.target_areas.length > 0 && (
          <div className="flex items-start gap-2 text-small">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground truncate">
              {profile.target_areas.slice(0, 2).join(", ")}
              {profile.target_areas.length > 2 && ` +${profile.target_areas.length - 2}`}
            </span>
          </div>
        )}

        {/* Deals Completed */}
        <div className="text-small text-muted-foreground">
          {profile.deals_completed} deals completed
        </div>
      </div>

      {/* Bio Preview */}
      {profile.bio && (
        <p className="mt-3 text-small text-muted-foreground line-clamp-2">
          {profile.bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Eye />}
          onClick={() => onViewProfile?.(profile.id)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<MessageSquare />}
          onClick={() => onConnect?.(profile.id)}
          className="flex-1"
        >
          Connect
        </Button>
      </div>
    </Card>
  );
}
