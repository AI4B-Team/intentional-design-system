import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA, useIsIOS } from "@/hooks/usePWA";
import { Download, X, Share, Plus, Smartphone, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Floating install banner that appears at bottom of screen
export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const isIOS = useIsIOS();

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || (!isInstallable && !isIOS) || dismissed) {
    return null;
  }

  // Show iOS-specific instructions
  if (isIOS && !isInstalled) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4">
        <Card className="border-brand/20 bg-gradient-to-r from-brand/5 to-brand/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-small font-medium text-content">Install DealFlow</p>
                <p className="text-tiny text-content-secondary mt-0.5">
                  Tap <Share className="h-3 w-3 inline mx-0.5" /> then "Add to Home Screen" <Plus className="h-3 w-3 inline mx-0.5" />
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 p-1 text-content-tertiary hover:text-content"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show install prompt for Android/Desktop
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4">
      <Card className="border-brand/20 bg-gradient-to-r from-brand/5 to-brand/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-small font-medium text-content">Install DealFlow</p>
              <p className="text-tiny text-content-secondary">Add to home screen for the best experience</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 p-2 text-content-tertiary hover:text-content"
              >
                <X className="h-4 w-4" />
              </button>
              <Button size="sm" variant="primary" onClick={promptInstall}>
                Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Offline indicator
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-warning text-warning-foreground py-2 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-small font-medium">
        <WifiOff className="h-4 w-4" />
        You're offline. Some features may be limited.
      </div>
    </div>
  );
}

// Update available banner
export function UpdateBanner() {
  const { needsRefresh, refreshApp } = usePWA();

  if (!needsRefresh) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-info text-info-foreground py-2 px-4">
      <div className="flex items-center justify-center gap-3 text-small font-medium">
        <RefreshCw className="h-4 w-4" />
        <span>A new version is available!</span>
        <Button size="sm" variant="secondary" onClick={refreshApp} className="h-7">
          Refresh
        </Button>
      </div>
    </div>
  );
}

// Combined PWA wrapper component
export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      <UpdateBanner />
      {children}
      <InstallBanner />
    </>
  );
}
