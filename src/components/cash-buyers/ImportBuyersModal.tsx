import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useCreateCashBuyer } from '@/hooks/useCashBuyers';
import { toast } from 'sonner';

interface ImportBuyersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'map' | 'review';

const fieldOptions = [
  { value: 'skip', label: 'Skip' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'company_name', label: 'Company' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'markets', label: 'Markets' },
  { value: 'zip_codes', label: 'Zip Codes' },
  { value: 'notes', label: 'Notes' },
];

export function ImportBuyersModal({ open, onOpenChange }: ImportBuyersModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  const createBuyer = useCreateCashBuyer();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      const parsed = lines.map((line) => {
        // Simple CSV parsing (doesn't handle quoted commas)
        return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
      });

      if (parsed.length > 0) {
        setHeaders(parsed[0]);
        setCsvData(parsed.slice(1));

        // Auto-map common column names
        const autoMappings: Record<number, string> = {};
        parsed[0].forEach((header, index) => {
          const lower = header.toLowerCase();
          if (lower.includes('email')) autoMappings[index] = 'email';
          else if (lower.includes('first') && lower.includes('name')) autoMappings[index] = 'first_name';
          else if (lower.includes('last') && lower.includes('name')) autoMappings[index] = 'last_name';
          else if (lower === 'name' || lower === 'full name') autoMappings[index] = 'full_name';
          else if (lower.includes('company')) autoMappings[index] = 'company_name';
          else if (lower.includes('phone')) autoMappings[index] = 'phone';
          else if (lower.includes('city') || lower.includes('market')) autoMappings[index] = 'markets';
          else if (lower.includes('zip')) autoMappings[index] = 'zip_codes';
          else autoMappings[index] = 'skip';
        });
        setMappings(autoMappings);
        setStep('map');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    setImporting(true);

    const emailIndex = Object.entries(mappings).find(([_, v]) => v === 'email')?.[0];
    if (!emailIndex) {
      toast.error('Email column is required');
      setImporting(false);
      return;
    }

    let successCount = 0;
    let skipCount = 0;

    for (const row of csvData) {
      const buyerData: Record<string, any> = {};

      Object.entries(mappings).forEach(([indexStr, field]) => {
        if (field === 'skip') return;
        const index = parseInt(indexStr);
        const value = row[index];
        if (!value) return;

        if (field === 'markets' || field === 'zip_codes') {
          buyerData[field] = value.split(/[,;]/).map((v) => v.trim()).filter(Boolean);
        } else {
          buyerData[field] = value;
        }
      });

      if (!buyerData.email) {
        skipCount++;
        continue;
      }

      try {
        await createBuyer.mutateAsync(buyerData as any);
        successCount++;
      } catch (error) {
        skipCount++;
      }
    }

    toast.success(`Imported ${successCount} buyers. ${skipCount} skipped.`);
    setImporting(false);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setStep('upload');
    setCsvData([]);
    setHeaders([]);
    setMappings({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const validBuyers = csvData.filter((row) => {
    const emailIndex = Object.entries(mappings).find(([_, v]) => v === 'email')?.[0];
    return emailIndex && row[parseInt(emailIndex)]?.includes('@');
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Buyers from CSV</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload CSV File</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to upload
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              CSV should include at minimum an Email column
            </p>
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Map your CSV columns to buyer fields
            </p>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CSV Column</TableHead>
                    <TableHead>Maps To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {headers.map((header, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell>
                        <Select
                          value={mappings[index] || 'skip'}
                          onValueChange={(value) =>
                            setMappings((prev) => ({ ...prev, [index]: value }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={() => setStep('review')}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Found {csvData.length} rows</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>{validBuyers.length} valid buyers will be imported</span>
              </div>
              {csvData.length - validBuyers.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{csvData.length - validBuyers.length} rows will be skipped (missing email)</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Preview of first 5 buyers:
            </p>

            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.entries(mappings)
                      .filter(([_, v]) => v !== 'skip')
                      .map(([index, field]) => (
                        <TableHead key={index} className="capitalize">
                          {field.replace('_', ' ')}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validBuyers.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.entries(mappings)
                        .filter(([_, v]) => v !== 'skip')
                        .map(([index]) => (
                          <TableCell key={index} className="truncate max-w-[150px]">
                            {row[parseInt(index)]}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('map')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing || validBuyers.length === 0}>
                {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Import {validBuyers.length} Buyers
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
