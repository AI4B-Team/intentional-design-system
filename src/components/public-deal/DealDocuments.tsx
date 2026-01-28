import React from 'react';
import { FileText, Lock, FileCheck, FileSpreadsheet, ClipboardList, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DispoDocument } from '@/hooks/usePublicDeal';

interface DealDocumentsProps {
  documents: DispoDocument[];
  requiresVerification: boolean;
}

const documentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  contract: FileText,
  inspection: FileCheck,
  comps: FileSpreadsheet,
  repair_estimate: ClipboardList,
  title: Home,
};

export function DealDocuments({ documents, requiresVerification }: DealDocumentsProps) {
  const hasDocuments = documents.length > 0;

  if (!hasDocuments) return null;

  // For now, show the locked state if verification is required
  // In a full implementation, you'd check buyer's verification status
  const isVerified = false; // This would come from buyer session

  if (requiresVerification && !isVerified) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Documents Available for Verified Buyers Only
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Register and upload proof of funds to access the full deal package including contracts, 
              inspection reports, and detailed scope of work.
            </p>
            <Button variant="outline">
              Register as Buyer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Deal Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc, index) => {
            const IconComponent = documentIcons[doc.type] || FileText;
            return (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-secondary/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{doc.name}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
