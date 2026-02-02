import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bed,
  Bath,
  Ruler,
  Clock,
  Phone,
  Mail,
  Image as ImageIcon,
} from "lucide-react";

export interface PropertyCardData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  price?: number;
  homeType?: string;
  leadType?: string;
  daysInStage?: number;
  sellerPhone?: string;
  sellerEmail?: string;
  images?: string[];
}

function formatMoney(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPhoneForTel(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+1${digits}`;
}

interface PropertyCardProps {
  property: PropertyCardData;
  onOpenDetails?: (id: string) => void;
}

export function PropertyCard({
  property,
  onOpenDetails,
}: PropertyCardProps) {
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const imgs = property.images ?? [];
  const thumb = imgs[0];

  const locationLine = `${property.city}, ${property.state} ${property.zip}`;

  const canCall = !!property.sellerPhone;
  const canEmail = !!property.sellerEmail;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "bg-card rounded-2xl border border-border-subtle shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
        )}
        onClick={() => onOpenDetails?.(property.id)}
      >
        {/* Top badges */}
        <div className="p-3 pb-0">
          <div className="flex items-center gap-2 flex-wrap">
            {property.homeType && (
              <Badge variant="secondary" size="sm">
                {property.homeType}
              </Badge>
            )}
            {property.leadType && (
              <Badge variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">
                {property.leadType}
              </Badge>
            )}
          </div>
        </div>

        {/* Middle content */}
        <div className="p-3">
          <p className="text-sm font-semibold text-foreground leading-snug break-words">
            {property.address}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locationLine}
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {property.beds != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                {property.beds}
              </span>
            )}
            {property.baths != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.baths}
              </span>
            )}
            {property.sqft != null && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {property.sqft.toLocaleString()} SF
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-base font-bold text-success mt-2">
            {formatMoney(property.price)}
          </div>
        </div>

        <Separator />

        {/* Bottom utility row */}
        <div className="p-3 pt-2.5">
          <div className="flex items-center gap-3">
            {/* Thumbnail + gallery */}
            <button
              type="button"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryOpen(true);
              }}
              aria-label="Open photos"
            >
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {thumb ? (
                  <img
                    src={thumb}
                    alt="Property thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="text-xs font-medium">
                Photos{imgs.length > 0 ? ` (${imgs.length})` : ""}
              </span>
            </button>

            {/* Time + divider + contact */}
            <div className="flex items-center gap-2 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium tabular-nums">
                      {property.daysInStage != null ? `${property.daysInStage}d` : "—"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{property.daysInStage ?? 0} days in current stage</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-5" />

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7",
                        canCall ? "text-muted-foreground hover:text-success" : "text-muted-foreground/40 cursor-not-allowed"
                      )}
                      disabled={!canCall}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (property.sellerPhone) {
                          window.open(`tel:${formatPhoneForTel(property.sellerPhone)}`);
                        }
                      }}
                      aria-label="Call seller"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{canCall ? "Call seller" : "No phone on file"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7",
                        canEmail ? "text-muted-foreground hover:text-primary" : "text-muted-foreground/40 cursor-not-allowed"
                      )}
                      disabled={!canEmail}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (property.sellerEmail) {
                          window.open(`mailto:${property.sellerEmail}`);
                        }
                      }}
                      aria-label="Email seller"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{canEmail ? "Email seller" : "No email on file"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery modal */}
        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent size="lg" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {property.address}, {property.city}, {property.state} {property.zip}
              </DialogTitle>
            </DialogHeader>

            {imgs.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No photos available.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {imgs.map((src, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-md">
                    <img
                      src={src}
                      alt={`Photo ${idx + 1}`}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
