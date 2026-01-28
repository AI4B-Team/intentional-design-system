import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MileageStats, MonthlyMileage } from '@/hooks/useMileageLog';
import type { Database } from '@/integrations/supabase/types';

type MileageEntry = Database['public']['Tables']['d4d_mileage_log']['Row'];

interface MileageExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  stats: MileageStats;
  monthlyData: MonthlyMileage[];
  entries: MileageEntry[];
}

type ExportFormat = 'pdf' | 'csv' | 'irs';

interface ExportOptions {
  tripDetails: boolean;
  monthlySummaries: boolean;
  annualTotals: boolean;
  irsRate: boolean;
  vehicleInfo: boolean;
}

export function MileageExportModal({
  open,
  onOpenChange,
  year,
  stats,
  monthlyData,
  entries,
}: MileageExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    tripDetails: true,
    monthlySummaries: true,
    annualTotals: true,
    irsRate: true,
    vehicleInfo: false,
  });
  const [exporting, setExporting] = useState(false);

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateCSV = () => {
    const headers = ['Date', 'Description', 'Purpose', 'Miles', 'Rate', 'Deduction', 'Notes'];
    const rows = entries.map((e) => [
      e.date,
      e.description || '',
      e.purpose || 'business',
      (e.final_miles || e.calculated_miles || 0).toFixed(1),
      `$${(e.mileage_rate || 0.67).toFixed(2)}`,
      `$${(e.deduction_amount || 0).toFixed(2)}`,
      e.notes || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    return csv;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      if (exportFormat === 'csv') {
        const csv = generateCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mileage-log-${year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded!');
      } else if (exportFormat === 'pdf' || exportFormat === 'irs') {
        // Generate a simple text-based report that can be printed as PDF
        let report = `MILEAGE LOG REPORT\n`;
        report += `Tax Year: ${year}\n`;
        report += `Generated: ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
        report += `${'='.repeat(50)}\n\n`;

        if (options.annualTotals) {
          report += `ANNUAL SUMMARY\n`;
          report += `-`.repeat(30) + '\n';
          report += `Total Miles: ${stats.totalMiles.toFixed(1)}\n`;
          report += `Business Miles: ${stats.businessMiles.toFixed(1)}\n`;
          report += `Total Deduction: $${stats.totalDeduction.toFixed(2)}\n`;
          report += `Total Sessions: ${stats.sessionCount}\n\n`;
        }

        if (options.monthlySummaries) {
          report += `MONTHLY BREAKDOWN\n`;
          report += `-`.repeat(30) + '\n';
          monthlyData.forEach((m) => {
            const monthName = format(new Date(m.month + '-01'), 'MMMM yyyy');
            report += `${monthName}: ${m.totalMiles.toFixed(1)} mi | $${m.totalDeduction.toFixed(2)}\n`;
          });
          report += '\n';
        }

        if (options.tripDetails) {
          report += `DETAILED LOG\n`;
          report += `-`.repeat(30) + '\n';
          entries.forEach((e) => {
            report += `${e.date} | ${e.description || 'N/A'} | ${(e.final_miles || 0).toFixed(1)} mi | $${(e.deduction_amount || 0).toFixed(2)}\n`;
          });
          report += '\n';
        }

        if (exportFormat === 'irs') {
          report += `\nCERTIFICATION\n`;
          report += `-`.repeat(30) + '\n';
          report += `I certify that the above mileage was driven for legitimate\n`;
          report += `business purposes related to my real estate investment activities.\n\n`;
          report += `Signature: _________________ Date: _________\n`;
        }

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mileage-report-${year}${exportFormat === 'irs' ? '-irs' : ''}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report downloaded!');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Summary Report', icon: FileText },
    { value: 'csv', label: 'CSV Detailed Log', icon: FileSpreadsheet },
    { value: 'irs', label: 'IRS-Ready Report', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Mileage Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Year */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tax Year</label>
            <Select value={String(year)} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(year)}>{year}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <div className="space-y-2">
              {formatOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setExportFormat(opt.value as ExportFormat)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                      exportFormat === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Include</label>
            <div className="space-y-3">
              {[
                { key: 'tripDetails', label: 'Trip details (date, description, miles)' },
                { key: 'monthlySummaries', label: 'Monthly summaries' },
                { key: 'annualTotals', label: 'Annual totals' },
                { key: 'irsRate', label: 'IRS standard mileage rate used' },
                { key: 'vehicleInfo', label: 'Vehicle information (if entered)' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={options[opt.key as keyof ExportOptions]}
                    onCheckedChange={() => toggleOption(opt.key as keyof ExportOptions)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
