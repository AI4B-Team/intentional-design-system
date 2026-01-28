import React from 'react';
import { Phone, Mail, Globe } from 'lucide-react';
import type { DispoSettings } from '@/hooks/usePublicDeal';

interface DealFooterProps {
  settings: DispoSettings | null;
}

export function DealFooter({ settings }: DealFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-secondary border-t border-border mt-12 pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.company_logo_url ? (
                <img 
                  src={settings.company_logo_url} 
                  alt={settings.company_name || 'Company'} 
                  className="h-10 w-auto"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {settings?.company_name?.[0] || 'D'}
                  </span>
                </div>
              )}
              {settings?.company_name && (
                <span className="font-semibold text-lg text-foreground">
                  {settings.company_name}
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {settings?.company_phone && (
                <a 
                  href={`tel:${settings.company_phone}`}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {settings.company_phone}
                </a>
              )}
              {settings?.company_email && (
                <a 
                  href={`mailto:${settings.company_email}`}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {settings.company_email}
                </a>
              )}
              {settings?.company_website && (
                <a 
                  href={settings.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {settings.company_website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-sm text-muted-foreground">
            {settings?.disclaimer_text ? (
              <p>{settings.disclaimer_text}</p>
            ) : (
              <p>
                All information is believed to be accurate but not guaranteed. 
                Buyer to verify all information. Properties are subject to prior sale.
                {settings?.company_name && (
                  <> {settings.company_name} is a real estate investment company.</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} {settings?.company_name || 'Deal Showcase'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
