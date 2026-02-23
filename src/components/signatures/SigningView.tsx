import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  CheckCircle,
  FileText,
  PenTool,
  Calendar,
  User,
  Shield,
  Clock,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SignaturePad, SignatureCaptureResult } from "@/components/signatures/SignaturePad";
import { DocumentField } from "@/types/document-fields";

interface SigningField {
  field: DocumentField;
  completed: boolean;
  signatureData?: SignatureCaptureResult;
  value?: string;
}

interface SigningViewProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  signerName: string;
  signerEmail: string;
  fields: DocumentField[];
  onComplete: (signatures: Record<string, SignatureCaptureResult>) => void;
}

export function SigningView({
  isOpen,
  onClose,
  documentName,
  signerName,
  signerEmail,
  fields,
  onComplete,
}: SigningViewProps) {
  const recipientFields = fields.filter((f) => f.assignedTo === "recipient");
  const [signingFields, setSigningFields] = React.useState<SigningField[]>(
    recipientFields.map((f) => ({ field: f, completed: false }))
  );
  const [activeFieldIndex, setActiveFieldIndex] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const completedCount = signingFields.filter((f) => f.completed).length;
  const totalRequired = signingFields.filter((f) => f.field.required).length;
  const requiredCompleted = signingFields.filter((f) => f.field.required && f.completed).length;
  const allRequiredDone = requiredCompleted >= totalRequired;

  const handleSignatureApply = (result: SignatureCaptureResult) => {
    if (activeFieldIndex === null) return;
    setSigningFields((prev) =>
      prev.map((sf, i) =>
        i === activeFieldIndex ? { ...sf, completed: true, signatureData: result } : sf
      )
    );
    setActiveFieldIndex(null);
  };

  const handleSubmit = () => {
    const signatures: Record<string, SignatureCaptureResult> = {};
    signingFields.forEach((sf) => {
      if (sf.signatureData) {
        signatures[sf.field.id] = sf.signatureData;
      }
    });
    setIsSubmitted(true);
    onComplete(signatures);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Document Signed!</h2>
            <p className="text-sm text-muted-foreground mb-1">
              {documentName}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Signed by {signerName} on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface-secondary rounded-lg px-4 py-2">
              <Shield className="h-3.5 w-3.5" />
              A signed copy has been sent to all parties
            </div>
            <Button className="mt-6 gap-2" onClick={onClose}>
              <Download className="h-4 w-4" />
              Download Signed Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <div>
              <DialogTitle>{documentName}</DialogTitle>
              <DialogDescription>
                Please review and sign. Signing as {signerName} ({signerEmail}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${totalRequired > 0 ? (requiredCompleted / totalRequired) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {requiredCompleted}/{totalRequired} required
          </span>
        </div>

        {/* Document preview area */}
        <Card padding="none" className="bg-white border-2 border-border-subtle min-h-[200px] relative">
          <div className="p-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="h-3 bg-muted/40 rounded w-full" />
              <div className="h-3 bg-muted/40 rounded w-5/6" />
              <div className="h-3 bg-muted/40 rounded w-4/6" />
              <div className="h-6" />
              <div className="h-3 bg-muted/40 rounded w-full" />
              <div className="h-3 bg-muted/40 rounded w-3/4" />
            </div>
          </div>
        </Card>

        {/* Fields to complete */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Fields to Complete</p>
          {signingFields.map((sf, index) => {
            const isSignatureType = sf.field.type === "signature" || sf.field.type === "initials";
            return (
              <div
                key={sf.field.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer",
                  sf.completed
                    ? "border-success/30 bg-success/5"
                    : activeFieldIndex === index
                    ? "border-brand bg-brand/5"
                    : "border-border-subtle hover:border-muted-foreground/30"
                )}
                onClick={() => {
                  if (isSignatureType && !sf.completed) {
                    setActiveFieldIndex(index);
                  }
                }}
              >
                {sf.completed ? (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                ) : sf.field.type === "signature" ? (
                  <PenTool className="h-4 w-4 text-brand flex-shrink-0" />
                ) : sf.field.type === "date" ? (
                  <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{sf.field.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{sf.field.type}</p>
                </div>

                {sf.field.required && !sf.completed && (
                  <Badge variant="outline" className="text-[10px] h-5 text-destructive border-destructive/20">
                    Required
                  </Badge>
                )}

                {sf.completed && sf.signatureData && (
                  <img
                    src={sf.signatureData.dataUrl}
                    alt="Signature"
                    className="h-8 max-w-[120px] object-contain"
                  />
                )}

                {!sf.completed && isSignatureType && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <PenTool className="h-3 w-3" />
                    Sign
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Signature pad (shown when a field is active) */}
        {activeFieldIndex !== null && (
          <div className="border border-brand/20 rounded-lg p-4 bg-brand/5">
            <p className="text-sm font-medium text-foreground mb-3">
              {signingFields[activeFieldIndex].field.type === "initials" ? "Add Your Initials" : "Sign Here"}
            </p>
            <SignaturePad
              onComplete={handleSignatureApply}
              signerName={signerName}
            />
          </div>
        )}

        {/* Security footer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 pt-2">
          <Shield className="h-3.5 w-3.5" />
          <span>By signing, you agree that your electronic signature is legally binding.</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredDone}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Complete Signing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
