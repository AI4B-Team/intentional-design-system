import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Phone,
  Mail,
  Users,
  AlertTriangle,
  Check,
  ChevronDown,
  Smartphone,
  PhoneCall,
  Globe,
  Skull,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SkipTraceResults, type PhoneResult, type EmailResult } from "@/hooks/useSkipTrace";

interface SkipTraceResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: SkipTraceResults | null;
  creditsUsed?: number;
  newBalance?: number;
  onSelectPhone?: (phone: PhoneResult) => void;
  onSelectEmail?: (email: EmailResult) => void;
  onSaveAndClose?: () => void;
}

function getPhoneTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "landline":
      return <PhoneCall className="h-4 w-4" />;
    case "voip":
      return <Globe className="h-4 w-4" />;
    default:
      return <Phone className="h-4 w-4" />;
  }
}

function getConfidenceColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-content-tertiary";
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function SkipTraceResultsModal({
  open,
  onOpenChange,
  results,
  creditsUsed,
  newBalance,
  onSelectPhone,
  onSelectEmail,
  onSaveAndClose,
}: SkipTraceResultsModalProps) {
  const [relativesOpen, setRelativesOpen] = React.useState(false);
  const [selectedPhone, setSelectedPhone] = React.useState<PhoneResult | null>(null);
  const [selectedEmail, setSelectedEmail] = React.useState<EmailResult | null>(null);

  React.useEffect(() => {
    if (results) {
      setSelectedPhone(results.primaryPhone);
      setSelectedEmail(results.primaryEmail);
    }
  }, [results]);

  if (!results) return null;

  const handleSelectPhone = (phone: PhoneResult) => {
    setSelectedPhone(phone);
    onSelectPhone?.(phone);
  };

  const handleSelectEmail = (email: EmailResult) => {
    setSelectedEmail(email);
    onSelectEmail?.(email);
  };

  const handleSave = () => {
    onSaveAndClose?.();
    onOpenChange(false);
  };

  const hasFlags = results.flags.deceased || results.flags.bankruptcy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-success" />
            Skip Trace Results
          </DialogTitle>
          <p className="text-small text-content-secondary">
            Found contact information
          </p>
        </DialogHeader>

        {/* Credits Summary */}
        <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-medium">
          <div className="text-small text-content-secondary">
            Credits Used:{" "}
            <span className="font-medium text-content">
              ${creditsUsed?.toFixed(2) || "0.35"}
            </span>
          </div>
          <div className="text-small text-content-secondary">
            New Balance:{" "}
            <span className="font-medium text-content">
              ${newBalance?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Phone Numbers */}
        {results.allPhones.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-small font-medium text-content flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Numbers ({results.allPhones.length})
            </h3>
            <div className="border border-border-subtle rounded-medium overflow-hidden">
              <table className="w-full text-small">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="text-left p-3 font-medium text-content-secondary">
                      Phone
                    </th>
                    <th className="text-left p-3 font-medium text-content-secondary">
                      Type
                    </th>
                    <th className="text-center p-3 font-medium text-content-secondary">
                      DNC
                    </th>
                    <th className="text-center p-3 font-medium text-content-secondary">
                      Confidence
                    </th>
                    <th className="text-right p-3 font-medium text-content-secondary">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {results.allPhones.map((phone, idx) => (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-colors",
                        selectedPhone?.number === phone.number && "bg-brand-accent/5"
                      )}
                    >
                      <td className="p-3 font-mono text-content">
                        {formatPhoneNumber(phone.number)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-content-secondary">
                          {getPhoneTypeIcon(phone.type)}
                          <span className="capitalize">{phone.type}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {phone.dnc ? (
                          <Badge variant="destructive" size="sm">
                            ⚠️ DNC
                          </Badge>
                        ) : (
                          <span className="text-content-tertiary">—</span>
                        )}
                      </td>
                      <td
                        className={cn(
                          "p-3 text-center font-medium",
                          getConfidenceColor(phone.score)
                        )}
                      >
                        {phone.score}%
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant={
                            selectedPhone?.number === phone.number
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => handleSelectPhone(phone)}
                        >
                          {selectedPhone?.number === phone.number
                            ? "Selected"
                            : "Use This"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email Addresses */}
        {results.allEmails.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-small font-medium text-content flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Addresses ({results.allEmails.length})
            </h3>
            <div className="border border-border-subtle rounded-medium overflow-hidden">
              <table className="w-full text-small">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="text-left p-3 font-medium text-content-secondary">
                      Email
                    </th>
                    <th className="text-center p-3 font-medium text-content-secondary">
                      Confidence
                    </th>
                    <th className="text-right p-3 font-medium text-content-secondary">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {results.allEmails.map((email, idx) => (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-colors",
                        selectedEmail?.address === email.address &&
                          "bg-brand-accent/5"
                      )}
                    >
                      <td className="p-3 text-content">{email.address}</td>
                      <td
                        className={cn(
                          "p-3 text-center font-medium",
                          getConfidenceColor(email.score)
                        )}
                      >
                        {email.score}%
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant={
                            selectedEmail?.address === email.address
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => handleSelectEmail(email)}
                        >
                          {selectedEmail?.address === email.address
                            ? "Selected"
                            : "Use This"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Relatives */}
        {results.relatives.length > 0 && (
          <Collapsible open={relativesOpen} onOpenChange={setRelativesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-surface-secondary rounded-medium hover:bg-surface-tertiary transition-colors">
              <div className="flex items-center gap-2 text-small font-medium text-content">
                <Users className="h-4 w-4" />
                Relatives ({results.relatives.length})
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-content-tertiary transition-transform",
                  relativesOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border border-border-subtle rounded-medium overflow-hidden">
                <table className="w-full text-small">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium text-content-secondary">
                        Name
                      </th>
                      <th className="text-left p-3 font-medium text-content-secondary">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {results.relatives.map((relative, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-content">{relative.name}</td>
                        <td className="p-3 font-mono text-content-secondary">
                          {relative.phone
                            ? formatPhoneNumber(relative.phone)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-tiny text-content-tertiary mt-2 px-1">
                Relatives may help you reach the owner
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Flags */}
        {hasFlags && (
          <div className="space-y-2">
            {results.flags.deceased && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-medium">
                <Skull className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-content">
                    Owner may be deceased
                  </div>
                  <div className="text-small text-content-secondary">
                    Verify before proceeding with any outreach
                  </div>
                </div>
              </div>
            )}
            {results.flags.bankruptcy && (
              <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-medium">
                <FileWarning className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-content">
                    Bankruptcy on file
                  </div>
                  <div className="text-small text-content-secondary">
                    May affect deal structure
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
