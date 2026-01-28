import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Mail,
  Send,
  Phone,
  MessageSquare,
  Copy,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { CashBuyer } from '@/hooks/useCashBuyers';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface BuyerDetailPanelProps {
  buyer: CashBuyer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500' },
  inactive: { label: 'Inactive', color: 'bg-muted' },
  blocked: { label: 'Blocked', color: 'bg-red-500' },
  unsubscribed: { label: 'Unsubscribed', color: 'bg-amber-500' },
};

const propertyTypeLabels: Record<string, string> = {
  sfh: 'SFH',
  multi: 'Multi-Family',
  condo: 'Condo',
  land: 'Land',
};

const strategyLabels: Record<string, string> = {
  flip: 'Flip',
  rental: 'Rental',
  brrrr: 'BRRRR',
  wholesale: 'Wholesale',
};

export function BuyerDetailPanel({ buyer, open, onOpenChange, onEdit }: BuyerDetailPanelProps) {
  if (!buyer) return null;

  const status = statusConfig[buyer.status || 'active'];
  const displayName = buyer.full_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || buyer.email;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">Not rated</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">({rating}/5)</span>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{displayName}</SheetTitle>
              {buyer.company_name && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="h-4 w-4" />
                  {buyer.company_name}
                </p>
              )}
            </div>
            <Badge className={`${status.color} text-white border-0`}>
              {status.label}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-1" />
              Send Deal
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{buyer.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(buyer.email)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {buyer.phone && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{buyer.phone}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => (window.location.href = `tel:${buyer.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => (window.location.href = `sms:${buyer.phone}`)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Buying Criteria */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Buying Criteria
            </h3>
            <div className="space-y-3 text-sm">
              {buyer.markets?.length ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Markets:</span>{' '}
                    {buyer.markets.join(', ')}
                  </div>
                </div>
              ) : null}

              {buyer.property_types?.length ? (
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Types:</span>{' '}
                    {buyer.property_types.map((t) => propertyTypeLabels[t] || t).join(', ')}
                  </div>
                </div>
              ) : null}

              {(buyer.min_price || buyer.max_price) && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Price:</span>{' '}
                    {buyer.min_price ? `$${buyer.min_price.toLocaleString()}` : '$0'} -{' '}
                    {buyer.max_price ? `$${buyer.max_price.toLocaleString()}` : 'No max'}
                  </div>
                </div>
              )}

              {buyer.buying_strategy?.length ? (
                <div>
                  <span className="font-medium">Strategy:</span>{' '}
                  {buyer.buying_strategy.map((s) => strategyLabels[s] || s).join(', ')}
                </div>
              ) : null}

              {buyer.can_close_days && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Can close: {buyer.can_close_days} days</span>
                </div>
              )}

              {buyer.funding_type && (
                <div>
                  <span className="font-medium">Funding:</span>{' '}
                  <span className="capitalize">{buyer.funding_type.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Verification */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Verification
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {buyer.is_verified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Not Verified</span>
                </>
              )}
            </div>
            {buyer.proof_of_funds_amount && (
              <p className="text-sm">
                POF: ${buyer.proof_of_funds_amount.toLocaleString()}
                {buyer.verified_at && (
                  <span className="text-muted-foreground">
                    {' '}
                    | Verified {formatDistanceToNow(new Date(buyer.verified_at), { addSuffix: true })}
                  </span>
                )}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              {buyer.proof_of_funds_url && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View POF
                </Button>
              )}
              <Button variant="outline" size="sm">
                Re-verify
              </Button>
            </div>
          </div>

          <Separator />

          {/* Activity */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">Deals Viewed</span>
                </div>
                <p className="text-2xl font-bold">{buyer.deals_viewed || 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">Interested</span>
                </div>
                <p className="text-2xl font-bold">{buyer.deals_interested || 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-xs">Purchased</span>
                </div>
                <p className="text-2xl font-bold">{buyer.deals_purchased || 0}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Total Volume</span>
                </div>
                <p className="text-lg font-bold">
                  ${(buyer.total_purchase_volume || 0).toLocaleString()}
                </p>
              </div>
            </div>
            {buyer.last_active_at && (
              <p className="text-sm text-muted-foreground mt-3">
                Last active:{' '}
                {formatDistanceToNow(new Date(buyer.last_active_at), { addSuffix: true })}
              </p>
            )}
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Rating
            </h3>
            {renderStars(buyer.buyer_rating)}
            {buyer.rating_notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{buyer.rating_notes}"
              </p>
            )}
          </div>

          {/* Tags */}
          {buyer.tags?.length ? (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {buyer.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* Notes */}
          {buyer.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Notes
                </h3>
                <p className="text-sm whitespace-pre-wrap">{buyer.notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
