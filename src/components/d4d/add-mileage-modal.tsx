import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IRS_MILEAGE_RATES, MileagePurpose } from '@/hooks/useMileageLog';
import type { Database } from '@/integrations/supabase/types';

type MileageEntry = Database['public']['Tables']['d4d_mileage_log']['Row'];

interface AddMileageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: {
    date: string;
    description: string;
    final_miles: number;
    purpose: MileagePurpose;
    notes?: string;
    start_odometer?: number;
    end_odometer?: number;
  }) => void;
  editEntry?: MileageEntry | null;
  saving?: boolean;
}

const purposeOptions = [
  { value: 'business', label: 'Business', rate: 0.67 },
  { value: 'charity', label: 'Charity', rate: 0.14 },
  { value: 'medical', label: 'Medical', rate: 0.21 },
];

export function AddMileageModal({
  open,
  onOpenChange,
  onSave,
  editEntry,
  saving = false,
}: AddMileageModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [miles, setMiles] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');
  const [purpose, setPurpose] = useState<MileagePurpose>('business');
  const [notes, setNotes] = useState('');
  const [inputMethod, setInputMethod] = useState<'miles' | 'odometer'>('miles');

  const currentYear = new Date().getFullYear();
  const rates = IRS_MILEAGE_RATES[currentYear] || IRS_MILEAGE_RATES[2024];

  // Calculate miles from odometer
  const odometerMiles = startOdometer && endOdometer 
    ? Math.max(0, parseFloat(endOdometer) - parseFloat(startOdometer))
    : 0;

  const finalMiles = inputMethod === 'odometer' ? odometerMiles : parseFloat(miles) || 0;
  const deduction = finalMiles * rates[purpose];

  // Load edit data
  useEffect(() => {
    if (editEntry && open) {
      setDate(new Date(editEntry.date));
      setDescription(editEntry.description || '');
      setMiles(String(editEntry.final_miles || editEntry.calculated_miles || ''));
      setPurpose((editEntry.purpose as MileagePurpose) || 'business');
      setNotes(editEntry.notes || '');
      if (editEntry.start_odometer) {
        setStartOdometer(String(editEntry.start_odometer));
        setEndOdometer(String(editEntry.end_odometer || ''));
        setInputMethod('odometer');
      }
    } else if (open) {
      // Reset form
      setDate(new Date());
      setDescription('');
      setMiles('');
      setStartOdometer('');
      setEndOdometer('');
      setPurpose('business');
      setNotes('');
      setInputMethod('miles');
    }
  }, [editEntry, open]);

  const handleSave = () => {
    if (!description.trim() || finalMiles <= 0) return;

    onSave({
      date: format(date, 'yyyy-MM-dd'),
      description: description.trim(),
      final_miles: finalMiles,
      purpose,
      notes: notes.trim() || undefined,
      start_odometer: startOdometer ? parseFloat(startOdometer) : undefined,
      end_odometer: endOdometer ? parseFloat(endOdometer) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editEntry ? 'Edit Mileage Entry' : 'Add Manual Entry'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Purpose of Trip</label>
            <Input
              placeholder="e.g., Driving for dollars - Oak Hills"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Miles input method */}
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'miles' | 'odometer')}>
            <TabsList className="w-full">
              <TabsTrigger value="miles" className="flex-1">Enter Miles</TabsTrigger>
              <TabsTrigger value="odometer" className="flex-1">Odometer</TabsTrigger>
            </TabsList>
            <TabsContent value="miles" className="mt-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Miles Driven</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={miles}
                  onChange={(e) => setMiles(e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="odometer" className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Odometer</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Odometer</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                />
              </div>
              {odometerMiles > 0 && (
                <p className="text-sm text-muted-foreground">
                  Calculated: {odometerMiles.toFixed(1)} miles
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Purpose */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={purpose} onValueChange={(v) => setPurpose(v as MileagePurpose)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {purposeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label} - ${rates[opt.value as MileagePurpose]}/mi
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
            <Textarea
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Deduction preview */}
          {finalMiles > 0 && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tax Deduction</span>
                <span className="font-bold text-success">${deduction.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {finalMiles.toFixed(1)} mi × ${rates[purpose]}/mi
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!description.trim() || finalMiles <= 0 || saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editEntry ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
