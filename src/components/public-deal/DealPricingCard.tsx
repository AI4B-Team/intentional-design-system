import React from 'react';
import { Phone, Clock, DollarSign, FileText, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DispoDeal, DispoSettings } from '@/hooks/usePublicDeal';

interface DealPricingCardProps {
  deal: DispoDeal;
  settings: DispoSettings | null;
  disabled?: boolean;
}

export function DealPricingCard({ deal, settings, disabled }: DealPricingCardProps) {
  const scrollToInterest = () => {
    document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const financingOptions = deal.financing_allowed || settings?.default_financing_allowed || ['cash'];
  const closingTimeline = deal.closing_timeline || settings?.default_closing_timeline || '7-14 days';
  const earnestMoney = deal.earnest_money_required || settings?.default_earnest_money || 5000;

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Investment Opportunity
          </p>
        </div>

        {/* Asking Price */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Asking Price</p>
          <p className="text-4xl font-bold text-foreground">
            ${deal.asking_price.toLocaleString()}
          </p>
          {deal.price_per_sqft && (
            <p className="text-sm text-muted-foreground mt-1">
              ${deal.price_per_sqft.toFixed(0)}/sqft
            </p>
          )}
        </div>

        <Separator className="my-6" />

        {/* Price Breakdown */}
        <div className="space-y-3 text-sm">
          {deal.arv && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ARV:</span>
              <span className="font-medium text-foreground">
                ${deal.arv.toLocaleString()}
              </span>
            </div>
          )}
          {deal.repair_estimate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repair Estimate:</span>
              <span className="font-medium text-red-500">
                -${deal.repair_estimate.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Cost:</span>
            <span className="font-medium text-foreground">
              -${deal.asking_price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Equity */}
        {deal.equity_amount && (
          <>
            <Separator className="my-6" />
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-muted-foreground">Potential Equity</p>
              <p className="text-2xl font-bold text-green-600">
                ${deal.equity_amount.toLocaleString()}
              </p>
              {deal.equity_percentage && (
                <p className="text-sm text-green-600">
                  ({deal.equity_percentage.toFixed(1)}% of ARV)
                </p>
              )}
            </div>
          </>
        )}

        <Separator className="my-6" />

        {/* CTA Button */}
        <Button 
          onClick={scrollToInterest}
          disabled={disabled}
          className="w-full h-12 text-lg"
          size="lg"
        >
          I'm Interested - Contact Me
        </Button>

        {/* Call Button */}
        {settings?.company_phone && (
          <a 
            href={`tel:${settings.company_phone}`}
            className="flex items-center justify-center gap-2 mt-4 py-3 text-primary hover:text-primary/80 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">Call Now: {settings.company_phone}</span>
          </a>
        )}

        <Separator className="my-6" />

        {/* Deal Terms */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">Available for: {closingTimeline} close</span>
          </div>
          <div className="flex items-center gap-3">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              Financing: {financingOptions.map(f => 
                f === 'cash' ? 'Cash' : f === 'hard_money' ? 'Hard Money' : f
              ).join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              EMD Required: ${earnestMoney.toLocaleString()}
            </span>
          </div>
          {deal.assignment_or_double && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Assignment or double close</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
