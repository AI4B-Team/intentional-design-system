import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Smartphone,
  Link2,
  Copy,
  QrCode,
  MessageSquare,
  CheckCircle,
  Send,
  Eye,
  ZoomIn,
  Fingerprint,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface MobileSigningLink {
  id: string;
  url: string;
  shortUrl: string;
  documentName: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
  accessCount: number;
}

// ─── Mobile Link Manager ────────────────────────────────────

interface MobileSigningManagerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  onSendSms?: (phone: string, link: string) => void;
}

export function MobileSigningManager({
  isOpen,
  onClose,
  documentName,
  recipientName,
  recipientEmail,
  recipientPhone,
  onSendSms,
}: MobileSigningManagerProps) {
  const [activeTab, setActiveTab] = React.useState<"link" | "sms" | "preview">("link");
  const [phoneNumber, setPhoneNumber] = React.useState(recipientPhone || "");
  const [linkSent, setLinkSent] = React.useState(false);

  const signingLink: MobileSigningLink = {
    id: "ml-1",
    url: `https://sign.realelite.app/s/${Math.random().toString(36).slice(2, 10)}`,
    shortUrl: `sign.re/${Math.random().toString(36).slice(2, 6)}`,
    documentName,
    recipientName,
    recipientEmail,
    recipientPhone,
    expiresAt: new Date(Date.now() + 7 * 86400000),
    createdAt: new Date(),
    isActive: true,
    accessCount: 0,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(signingLink.url);
    toast.success("Signing link copied!");
  };

  const handleSendSms = () => {
    onSendSms?.(phoneNumber, signingLink.url);
    setLinkSent(true);
    toast.success(`SMS sent to ${phoneNumber}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle>Mobile Signing</DialogTitle>
              <DialogDescription>Send a mobile-optimized signing link for {documentName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-subtle -mx-6 px-6">
          {[
            { key: "link" as const, label: "Share Link", icon: Link2 },
            { key: "sms" as const, label: "SMS Deep Link", icon: MessageSquare },
            { key: "preview" as const, label: "Mobile Preview", icon: Eye },
          ].map((tab) => (
            <button
              key={tab.key}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.key ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-3">
          {/* Share Link */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <Card padding="md" className="bg-surface-secondary">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{signingLink.url}</p>
                    <p className="text-xs text-muted-foreground">Expires in 7 days</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={copyLink}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </Card>

              {/* QR Code placeholder */}
              <Card padding="md" className="flex flex-col items-center">
                <div className="h-40 w-40 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <QrCode className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-foreground">Scan to Sign</p>
                <p className="text-xs text-muted-foreground">Recipient can scan this QR code on their phone</p>
              </Card>

              {/* Mobile features */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile-Optimized Features</p>
                {[
                  { icon: ZoomIn, label: "Pinch to Zoom", desc: "Navigate documents naturally" },
                  { icon: Fingerprint, label: "Touch Signature", desc: "Draw signature with finger or stylus" },
                  { icon: Smartphone, label: "Responsive Layout", desc: "Auto-adapts to screen size" },
                  { icon: Share2, label: "Native Share", desc: "Share via native OS share sheet" },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-secondary">
                    <feature.icon className="h-4 w-4 text-brand flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SMS Deep Link */}
          {activeTab === "sms" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-brand/5 border border-brand/20">
                <p className="text-sm text-foreground">
                  Send a text message with a deep link that opens the signing flow directly in the recipient's mobile browser.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recipient Phone</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="flex-1 rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* SMS Preview */}
              <Card padding="md" className="bg-surface-secondary">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">SMS Preview</p>
                <div className="bg-background rounded-xl p-3 border border-border-subtle max-w-[280px]">
                  <div className="bg-brand/10 rounded-2xl rounded-bl-sm px-3 py-2">
                    <p className="text-sm text-foreground">
                      Hi {recipientName}, please sign "{documentName}" at your convenience:
                    </p>
                    <p className="text-sm text-brand underline mt-1">{signingLink.shortUrl}</p>
                    <p className="text-xs text-muted-foreground mt-1">— RealElite Signatures</p>
                  </div>
                </div>
              </Card>

              {linkSent ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">SMS sent successfully!</span>
                </div>
              ) : (
                <Button className="w-full gap-2" onClick={handleSendSms} disabled={!phoneNumber.trim()}>
                  <Send className="h-4 w-4" />
                  Send SMS Signing Link
                </Button>
              )}
            </div>
          )}

          {/* Mobile Preview */}
          {activeTab === "preview" && (
            <div className="flex flex-col items-center">
              <div className="w-[280px] rounded-[2rem] border-4 border-foreground/20 overflow-hidden bg-background shadow-xl">
                {/* Status bar */}
                <div className="h-6 bg-foreground/5 flex items-center justify-between px-4">
                  <span className="text-[9px] font-semibold text-muted-foreground">9:41</span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-3 bg-muted-foreground/40 rounded-sm" />
                    <div className="h-1.5 w-3 bg-muted-foreground/40 rounded-sm" />
                  </div>
                </div>

                {/* Header */}
                <div className="p-3 bg-brand/5 border-b border-border-subtle">
                  <p className="text-xs font-bold text-foreground truncate">{documentName}</p>
                  <p className="text-[10px] text-muted-foreground">Tap to review and sign</p>
                </div>

                {/* Doc preview */}
                <div className="p-3 space-y-2 min-h-[200px]">
                  <div className="h-2 bg-muted/40 rounded w-full" />
                  <div className="h-2 bg-muted/40 rounded w-5/6" />
                  <div className="h-2 bg-muted/40 rounded w-4/6" />
                  <div className="h-4" />
                  <div className="h-2 bg-muted/40 rounded w-full" />
                  <div className="h-2 bg-muted/40 rounded w-3/4" />
                  <div className="h-8" />
                  {/* Signature area */}
                  <div className="border-2 border-dashed border-brand/40 rounded-lg p-3 text-center">
                    <Fingerprint className="h-6 w-6 text-brand/40 mx-auto mb-1" />
                    <p className="text-[10px] text-brand/60">Tap to sign</p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-3 border-t border-border-subtle">
                  <div className="bg-brand text-white text-center py-2 rounded-lg text-xs font-semibold">
                    Sign Document
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center py-2">
                  <div className="h-1 w-24 bg-foreground/20 rounded-full" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Touch-optimized mobile signing experience</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
