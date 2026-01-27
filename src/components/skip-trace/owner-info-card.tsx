import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, User, Phone, Mail, MapPin, Search, Pencil, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCredits } from "@/hooks/useCredits";
import { useSkipTrace, type PhoneResult, type EmailResult } from "@/hooks/useSkipTrace";
import { SkipTraceConfirmationModal } from "./skip-trace-confirmation-modal";
import { SkipTraceResultsModal } from "./skip-trace-results-modal";
import { NoResultsModal } from "./no-results-modal";
import { DNCWarningModal } from "./dnc-warning-modal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SKIP_TRACE_PRICE = 0.35;

interface OwnerInfoCardProps {
  propertyId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAddress?: string;
  phoneDnc?: boolean;
  skipTraced?: boolean;
  skipTracedAt?: string;
  onEdit?: () => void;
  onUpdate?: (data: { owner_phone?: string; owner_email?: string }) => void;
}

function InfoRow({
  label,
  value,
  icon: Icon,
  copyable,
  onClick,
  badge,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  copyable?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
}) {
  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-content-tertiary mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-small text-content-secondary">{label}</div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-body text-content",
              (copyable || onClick) && "cursor-pointer hover:text-brand-accent transition-colors"
            )}
            onClick={copyable ? handleCopy : onClick}
          >
            {value}
            {copyable && <Copy className="inline h-3 w-3 ml-1.5 opacity-50" />}
          </span>
          {badge}
        </div>
      </div>
    </div>
  );
}

export function OwnerInfoCard({
  propertyId,
  address,
  city,
  state,
  zip,
  ownerName,
  ownerPhone,
  ownerEmail,
  ownerAddress,
  phoneDnc,
  skipTraced,
  skipTracedAt,
  onEdit,
  onUpdate,
}: OwnerInfoCardProps) {
  const { balance, refreshBalance } = useCredits();
  const { runSkipTrace, loading, results } = useSkipTrace();
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showResultsModal, setShowResultsModal] = React.useState(false);
  const [showNoResultsModal, setShowNoResultsModal] = React.useState(false);
  const [showDncWarning, setShowDncWarning] = React.useState(false);
  const [skipTraceData, setSkipTraceData] = React.useState<{
    creditsUsed?: number;
    newBalance?: number;
  }>({});
  const [selectedPhone, setSelectedPhone] = React.useState<PhoneResult | null>(null);
  const [selectedEmail, setSelectedEmail] = React.useState<EmailResult | null>(null);

  const hasPhone = !!ownerPhone;
  const hasEmail = !!ownerEmail;
  const missingBoth = !hasPhone && !hasEmail;

  // Parse owner name into first/last
  const nameParts = ownerName?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const handleSkipTrace = async () => {
    setShowConfirmModal(false);
    
    const result = await runSkipTrace({
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      propertyId,
    });

    if (result.success && result.results) {
      setSkipTraceData({
        creditsUsed: result.creditsUsed,
        newBalance: result.newBalance,
      });
      
      if (result.results.totalPhonesFound === 0 && result.results.totalEmailsFound === 0) {
        setShowNoResultsModal(true);
      } else {
        setShowResultsModal(true);
      }
      
      refreshBalance();
    }
  };

  const handleSaveResults = () => {
    if (selectedPhone || selectedEmail) {
      onUpdate?.({
        owner_phone: selectedPhone?.number,
        owner_email: selectedEmail?.address,
      });
    }
    setShowResultsModal(false);
  };

  const handlePhoneClick = () => {
    if (phoneDnc) {
      setShowDncWarning(true);
    } else if (ownerPhone) {
      window.location.href = `tel:${ownerPhone}`;
    }
  };

  const handleDncProceed = () => {
    if (ownerPhone) {
      window.location.href = `tel:${ownerPhone}`;
    }
  };

  const getButtonConfig = () => {
    if (missingBoth) {
      return {
        variant: "primary" as const,
        label: `🔍 Skip Trace Owner ($${SKIP_TRACE_PRICE.toFixed(2)})`,
      };
    }
    if (!hasPhone || !hasEmail) {
      return {
        variant: "secondary" as const,
        label: `🔍 Find More Info ($${SKIP_TRACE_PRICE.toFixed(2)})`,
      };
    }
    return {
      variant: "ghost" as const,
      label: `🔍 Re-run Skip Trace ($${SKIP_TRACE_PRICE.toFixed(2)})`,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
          <CardTitle className="text-h3 font-medium">Owner Information</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm" className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              ${balance.toFixed(2)}
            </Badge>
            {onEdit && (
              <Button variant="ghost" size="sm" icon={<Pencil />} onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-1">
            <InfoRow
              label="Name"
              value={ownerName || "Unknown"}
              icon={User}
            />
            <InfoRow
              label="Phone"
              value={ownerPhone || "—"}
              icon={Phone}
              copyable={!!ownerPhone}
              onClick={ownerPhone ? handlePhoneClick : undefined}
              badge={
                phoneDnc ? (
                  <Badge variant="destructive" size="sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    DNC
                  </Badge>
                ) : null
              }
            />
            <InfoRow
              label="Email"
              value={ownerEmail || "—"}
              icon={Mail}
              copyable={!!ownerEmail}
            />
            <InfoRow
              label="Mailing Address"
              value={ownerAddress || "Same as property"}
              icon={MapPin}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle">
            <Button
              variant={buttonConfig.variant}
              fullWidth
              onClick={() => setShowConfirmModal(true)}
              loading={loading}
              icon={<Search />}
            >
              {buttonConfig.label}
            </Button>
            
            {skipTraced && skipTracedAt && (
              <p className="text-tiny text-content-tertiary text-center mt-2">
                Last run: {format(new Date(skipTracedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SkipTraceConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        address={`${address}, ${city}, ${state} ${zip}`}
        ownerName={ownerName}
        balance={balance}
        onConfirm={handleSkipTrace}
        loading={loading}
      />

      <SkipTraceResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        results={results}
        creditsUsed={skipTraceData.creditsUsed}
        newBalance={skipTraceData.newBalance}
        onSelectPhone={setSelectedPhone}
        onSelectEmail={setSelectedEmail}
        onSaveAndClose={handleSaveResults}
      />

      <NoResultsModal
        open={showNoResultsModal}
        onOpenChange={setShowNoResultsModal}
      />

      <DNCWarningModal
        open={showDncWarning}
        onOpenChange={setShowDncWarning}
        phoneNumber={ownerPhone || ""}
        onProceed={handleDncProceed}
      />
    </>
  );
}
