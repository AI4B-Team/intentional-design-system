import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePWA, useIsIOS, useIsStandalone } from "@/hooks/usePWA";
import {
  Download,
  Smartphone,
  Share,
  Plus,
  Check,
  Wifi,
  Bell,
  Zap,
  Home,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Install() {
  const { isInstalled, isInstallable, promptInstall } = usePWA();
  const isIOS = useIsIOS();
  const isStandalone = useIsStandalone();

  const features = [
    { icon: Zap, label: "Lightning fast", description: "Instant loading with offline support" },
    { icon: Bell, label: "Notifications", description: "Get alerts for hot leads and responses" },
    { icon: Wifi, label: "Works offline", description: "Access recent properties without internet" },
    { icon: Home, label: "Home screen", description: "Launch like a native app" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-background to-brand/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-small text-content-secondary hover:text-content">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Main Card */}
        <Card className="border-brand/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-h2">Install RealElite</CardTitle>
            <CardDescription>
              Get the full app experience on your device
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Already installed */}
            {isInstalled || isStandalone ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <p className="text-body font-medium text-content">Already Installed!</p>
                <p className="text-small text-content-secondary mt-1">
                  You're using RealElite as an app
                </p>
                <Button variant="primary" className="mt-4" asChild>
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
              </div>
            ) : isIOS ? (
              /* iOS Instructions */
              <div className="space-y-4">
                <p className="text-small text-content-secondary text-center">
                  Follow these steps to install on your iPhone or iPad:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 font-medium text-brand">
                      1
                    </div>
                    <div>
                      <p className="text-small font-medium text-content">Tap the Share button</p>
                      <p className="text-tiny text-content-secondary">
                        Find <Share className="h-3 w-3 inline mx-0.5" /> at the bottom of Safari
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 font-medium text-brand">
                      2
                    </div>
                    <div>
                      <p className="text-small font-medium text-content">Add to Home Screen</p>
                      <p className="text-tiny text-content-secondary">
                        Scroll down and tap <Plus className="h-3 w-3 inline mx-0.5" /> "Add to Home Screen"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0 font-medium text-brand">
                      3
                    </div>
                    <div>
                      <p className="text-small font-medium text-content">Confirm</p>
                      <p className="text-tiny text-content-secondary">
                        Tap "Add" in the top right corner
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isInstallable ? (
              /* Android/Chrome install button */
              <div className="text-center space-y-4">
                <p className="text-small text-content-secondary">
                  Click the button below to add RealElite to your home screen
                </p>
                <Button variant="primary" size="lg" onClick={promptInstall} className="w-full">
                  <Download className="h-5 w-5 mr-2" />
                  Install RealElite
                </Button>
              </div>
            ) : (
              /* Not installable */
              <div className="text-center py-4">
                <p className="text-small text-content-secondary">
                  To install this app, open this page in Chrome, Safari, or Edge on your mobile device.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="pt-4 border-t border-border-subtle">
              <p className="text-tiny font-medium text-content-secondary mb-3">
                APP FEATURES
              </p>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-start gap-2 p-2">
                    <feature.icon className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <div>
                      <p className="text-tiny font-medium text-content">{feature.label}</p>
                      <p className="text-tiny text-content-tertiary">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skip link */}
        <div className="text-center">
          <Link to="/dashboard" className="text-small text-content-secondary hover:text-content">
            Continue in browser →
          </Link>
        </div>
      </div>
    </div>
  );
}
