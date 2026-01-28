import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  Phone,
  MapPin,
  Home,
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Smartphone,
  PhoneCall,
} from "lucide-react";

interface Contact {
  id: string;
  contact_name?: string;
  phone_number: string;
  phone_type?: string;
  alternate_phones?: string[];
  property_address?: string;
  property_city?: string;
  property_state?: string;
  property_id?: string;
  attempt_count?: number;
  last_disposition?: string;
  last_attempt_at?: string;
}

interface PropertyDetails {
  beds?: number;
  baths?: number;
  sqft?: number;
  estimated_value?: number;
  equity_percent?: number;
  motivation_score?: number;
  distress_indicators?: string[];
}

interface CurrentContactCardProps {
  contact: Contact | null;
  propertyDetails?: PropertyDetails;
  isLoading?: boolean;
  onStartCalling: () => void;
  previousNotes?: string[];
}

export function CurrentContactCard({
  contact,
  propertyDetails,
  isLoading,
  onStartCalling,
  previousNotes = [],
}: CurrentContactCardProps) {
  const [showAltPhones, setShowAltPhones] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(false);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getPhoneTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-3 w-3" />;
      case "landline":
        return <Phone className="h-3 w-3" />;
      default:
        return <PhoneCall className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (!contact) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <div className="py-8 space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Phone className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-h3 font-medium text-foreground">
              Ready to Start Calling
            </h4>
            <p className="text-small text-muted-foreground mt-1">
              Select a queue and click Start Calling
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={onStartCalling}>
            <Phone className="h-5 w-5 mr-2" />
            Start Calling
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className="space-y-4">
      {/* Contact Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-h3 font-semibold text-foreground">
              {contact.contact_name || "Unknown"}
            </h3>
            <div className="flex items-center gap-2 text-small text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{formatPhone(contact.phone_number)}</span>
              {contact.phone_type && (
                <Badge variant="secondary" size="sm" className="gap-1">
                  {getPhoneTypeIcon(contact.phone_type)}
                  {contact.phone_type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Address */}
      {contact.property_address && (
        <div className="flex items-start gap-2 text-small">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-foreground">
            {contact.property_address}
            {contact.property_city && `, ${contact.property_city}`}
            {contact.property_state && ` ${contact.property_state}`}
          </span>
        </div>
      )}

      {/* Property Details */}
      {propertyDetails && (
        <div className="bg-muted/50 rounded-small p-3 space-y-2">
          <div className="flex items-center gap-2 text-small font-medium text-foreground">
            <Home className="h-4 w-4" />
            Property Details
          </div>
          <div className="grid grid-cols-3 gap-2 text-small">
            {propertyDetails.beds && (
              <div>
                <span className="text-muted-foreground">Beds:</span>{" "}
                <span className="font-medium">{propertyDetails.beds}</span>
              </div>
            )}
            {propertyDetails.baths && (
              <div>
                <span className="text-muted-foreground">Baths:</span>{" "}
                <span className="font-medium">{propertyDetails.baths}</span>
              </div>
            )}
            {propertyDetails.sqft && (
              <div>
                <span className="text-muted-foreground">Sqft:</span>{" "}
                <span className="font-medium">
                  {propertyDetails.sqft.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          {propertyDetails.estimated_value && (
            <div className="text-small">
              <span className="text-muted-foreground">Est. Value:</span>{" "}
              <span className="font-medium">
                ${propertyDetails.estimated_value.toLocaleString()}
              </span>
              {propertyDetails.equity_percent && (
                <span className="text-muted-foreground ml-2">
                  ({propertyDetails.equity_percent}% equity)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Motivation Score */}
      {propertyDetails?.motivation_score && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-small text-muted-foreground">Motivation:</span>
            <span className="text-body font-semibold text-foreground">
              {propertyDetails.motivation_score}/1000
            </span>
            {propertyDetails.motivation_score >= 700 && (
              <Flame className="h-4 w-4 text-warning" />
            )}
          </div>
        </div>
      )}

      {/* Distress Indicators */}
      {propertyDetails?.distress_indicators &&
        propertyDetails.distress_indicators.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {propertyDetails.distress_indicators.map((indicator) => (
              <Badge key={indicator} variant="warning" size="sm">
                {indicator}
              </Badge>
            ))}
          </div>
        )}

      {/* Previous Attempts */}
      {contact.attempt_count && contact.attempt_count > 0 && (
        <div className="text-small text-muted-foreground">
          <span>Previous Attempts: </span>
          <span className="font-medium text-foreground">
            {contact.attempt_count}
          </span>
          {contact.last_disposition && (
            <>
              <br />
              <span>Last: </span>
              <span className="text-foreground">{contact.last_disposition}</span>
            </>
          )}
        </div>
      )}

      {/* Alternate Phones Collapsible */}
      {contact.alternate_phones && contact.alternate_phones.length > 0 && (
        <Collapsible open={showAltPhones} onOpenChange={setShowAltPhones}>
          <CollapsibleTrigger className="flex items-center gap-2 text-small text-accent hover:underline">
            {showAltPhones ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Alt Numbers ({contact.alternate_phones.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {contact.alternate_phones.map((phone, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-small text-foreground"
              >
                <Phone className="h-3 w-3 text-muted-foreground" />
                {formatPhone(phone)}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Previous Notes Collapsible */}
      {previousNotes.length > 0 && (
        <Collapsible open={showNotes} onOpenChange={setShowNotes}>
          <CollapsibleTrigger className="flex items-center gap-2 text-small text-accent hover:underline">
            {showNotes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Notes from previous calls
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {previousNotes.map((note, idx) => (
              <div
                key={idx}
                className="text-small text-muted-foreground bg-muted/50 p-2 rounded-small"
              >
                {note}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* View Property Link */}
      {contact.property_id && (
        <Link
          to={`/properties/${contact.property_id}`}
          className="flex items-center gap-1 text-small text-accent hover:underline"
        >
          View Full Property
          <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </Card>
  );
}
