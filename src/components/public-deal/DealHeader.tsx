import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DispoSettings } from '@/hooks/usePublicDeal';

interface DealHeaderProps {
  settings: DispoSettings | null;
  status: string | null;
}

export function DealHeader({ settings, status }: DealHeaderProps) {
  const scrollToInterest = () => {
    document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            {settings?.company_logo_url ? (
              <img 
                src={settings.company_logo_url} 
                alt={settings.company_name || 'Company'} 
                className="h-8 w-auto"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {settings?.company_name?.[0] || 'D'}
                </span>
              </div>
            )}
            {settings?.company_name && (
              <span className="font-semibold text-foreground hidden sm:block">
                {settings.company_name}
              </span>
            )}
          </div>

          {/* Contact Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {settings?.company_phone && (
              <a 
                href={`tel:${settings.company_phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">{settings.company_phone}</span>
              </a>
            )}
            
            {settings?.company_email && (
              <a 
                href={`mailto:${settings.company_email}`}
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{settings.company_email}</span>
              </a>
            )}

            <Button 
              onClick={scrollToInterest}
              disabled={status === 'sold'}
              size="sm"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
