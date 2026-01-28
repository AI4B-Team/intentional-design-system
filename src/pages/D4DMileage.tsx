import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  Download,
  Route,
  DollarSign,
  Calendar,
  Car,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Info,
  FileText,
} from 'lucide-react';
import { useMileageLog, IRS_MILEAGE_RATES } from '@/hooks/useMileageLog';
import { AddMileageModal } from '@/components/d4d/add-mileage-modal';
import { MileageExportModal } from '@/components/d4d/mileage-export-modal';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type MileageEntry = Database['public']['Tables']['d4d_mileage_log']['Row'];

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

export default function D4DMileage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([format(new Date(), 'yyyy-MM')]));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editEntry, setEditEntry] = useState<MileageEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<MileageEntry | null>(null);

  const {
    entries,
    isLoading,
    stats,
    monthlyData,
    addEntry,
    updateEntry,
    deleteEntry: deleteEntryMutation,
    currentRates,
  } = useMileageLog(selectedYear);

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const handleSaveEntry = async (entry: {
    date: string;
    description: string;
    final_miles: number;
    purpose: 'business' | 'charity' | 'medical';
    notes?: string;
    start_odometer?: number;
    end_odometer?: number;
  }) => {
    if (editEntry) {
      await updateEntry.mutateAsync({
        id: editEntry.id,
        updates: {
          date: entry.date,
          description: entry.description,
          final_miles: entry.final_miles,
          purpose: entry.purpose,
          notes: entry.notes || null,
          start_odometer: entry.start_odometer || null,
          end_odometer: entry.end_odometer || null,
        },
      });
      setEditEntry(null);
    } else {
      await addEntry.mutateAsync({
        date: entry.date,
        description: entry.description,
        final_miles: entry.final_miles,
        purpose: entry.purpose,
        notes: entry.notes || null,
        start_odometer: entry.start_odometer || null,
        end_odometer: entry.end_odometer || null,
      });
    }
    setShowAddModal(false);
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntry) return;
    await deleteEntryMutation.mutateAsync(deleteEntry.id);
    setDeleteEntry(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/d4d')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Mileage Log</h1>
                <p className="text-sm text-muted-foreground">
                  Track business miles for taxes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowExportModal(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Route className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold font-mono">{stats.totalMiles.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Total Miles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Car className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold font-mono">{stats.businessMiles.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Business Miles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
                    <p className="text-lg font-bold font-mono text-success">
                      ${stats.totalDeduction.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Deduction</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{entries.length}</p>
                    <p className="text-xs text-muted-foreground">Entries</p>
                  </CardContent>
                </Card>
              </div>

              {/* IRS Rate Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-muted/50">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>
                  Based on {selectedYear} IRS rate of ${currentRates.business}/mile for business
                </span>
              </div>

              {/* Monthly Breakdown */}
              <div className="space-y-3">
                {monthlyData.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <h3 className="font-medium mb-1">No mileage entries</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add manual entries or drive with D4D to track mileage
                      </p>
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  monthlyData.map((month) => {
                    const isExpanded = expandedMonths.has(month.month);
                    const monthName = format(parseISO(month.month + '-01'), 'MMMM yyyy');

                    return (
                      <Collapsible
                        key={month.month}
                        open={isExpanded}
                        onOpenChange={() => toggleMonth(month.month)}
                      >
                        <Card>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <CardTitle className="text-sm font-medium">
                                    {monthName}
                                  </CardTitle>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {month.totalMiles.toFixed(1)} mi | ${month.totalDeduction.toFixed(2)}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 px-4 pb-4">
                              <div className="divide-y">
                                {month.entries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="py-3 flex items-center justify-between group"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {format(parseISO(entry.date), 'M/d')}
                                        </span>
                                        <span className="text-sm text-muted-foreground truncate">
                                          {entry.description || 'No description'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right text-sm">
                                        <span className="font-mono">
                                          {(entry.final_miles || entry.calculated_miles || 0).toFixed(1)}
                                        </span>
                                        <span className="text-muted-foreground ml-1">mi</span>
                                      </div>
                                      <span className="text-sm font-medium text-success">
                                        ${(entry.deduction_amount || 0).toFixed(2)}
                                      </span>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditEntry(entry);
                                            setShowAddModal(true);
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteEntry(entry);
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => setShowAddModal(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Manual Entry
                              </Button>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })
                )}
              </div>

              {/* IRS Compliance Note */}
              <Card className="border-border bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">IRS Recordkeeping Requirements</h4>
                      <p className="text-xs text-muted-foreground">
                        The IRS requires you to keep records of: date of each trip, business purpose,
                        and miles driven. This log helps you maintain compliant records. Consult a tax
                        professional for advice specific to your situation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Floating Add Button */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add/Edit Modal */}
      <AddMileageModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditEntry(null);
        }}
        onSave={handleSaveEntry}
        editEntry={editEntry}
        saving={addEntry.isPending || updateEntry.isPending}
      />

      {/* Export Modal */}
      <MileageExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        year={selectedYear}
        stats={stats}
        monthlyData={monthlyData}
        entries={entries}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEntry} onOpenChange={(open) => !open && setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mileage entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The entry for {deleteEntry?.date} will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
