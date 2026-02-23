import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Shield, CheckCircle, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { SignatureCaptureResult } from "@/components/signatures/SignaturePad";
import { toast } from "sonner";

interface CompletionCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  signers: Array<{
    name: string;
    email: string;
    signedAt: Date;
    ipAddress?: string;
    signature?: SignatureCaptureResult;
  }>;
  createdAt: Date;
  completedAt: Date;
  documentId: string;
}

export function CompletionCertificate({
  isOpen,
  onClose,
  documentName,
  signers,
  createdAt,
  completedAt,
  documentId,
}: CompletionCertificateProps) {
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${documentName.replace(/\s+/g, "_")}_Certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Certificate downloaded");
    } catch {
      toast.error("Failed to generate certificate");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gap-2 flex items-center">
            <Shield className="h-5 w-5 text-success" />
            Certificate of Completion
          </DialogTitle>
          <DialogDescription>Proof that all parties signed the document.</DialogDescription>
        </DialogHeader>

        <div ref={certificateRef} className="bg-white p-8 rounded-lg border border-border-subtle space-y-6">
          {/* Header */}
          <div className="text-center border-b border-border-subtle pb-4">
            <Shield className="h-10 w-10 text-success mx-auto mb-2" />
            <h2 className="text-lg font-bold text-foreground">Certificate of Completion</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Document ID: {documentId}
            </p>
          </div>

          {/* Document info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Document:</span>
              <span className="font-semibold text-foreground">{documentName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium text-foreground">{format(createdAt, "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium text-success">{format(completedAt, "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>

          {/* Signers */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Signing Parties
            </h3>
            {signers.map((signer, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface-secondary">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{signer.name}</p>
                  <p className="text-xs text-muted-foreground">{signer.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Signed {format(signer.signedAt, "MMM d, yyyy 'at' h:mm a")}
                    {signer.ipAddress && ` · IP: ${signer.ipAddress}`}
                  </p>
                </div>
                {signer.signature && (
                  <img
                    src={signer.signature.dataUrl}
                    alt={`${signer.name}'s signature`}
                    className="h-8 max-w-[100px] object-contain border border-border-subtle rounded bg-white p-0.5"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Security footer */}
          <div className="border-t border-border-subtle pt-4 text-center">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This certificate confirms that all parties listed above electronically signed the document.
              Each signature was captured with timestamp and IP address verification.
              This document has not been modified since completion.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleDownloadPdf} className="gap-2">
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
