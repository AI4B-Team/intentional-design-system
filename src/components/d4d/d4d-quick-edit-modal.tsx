import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];
type D4DPropertyUpdate = Database['public']['Tables']['d4d_properties']['Update'];

interface D4DQuickEditModalProps {
  property: D4DProperty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: D4DPropertyUpdate) => void;
  saving?: boolean;
}

const conditionOptions = [
  { value: 'distressed', label: 'Distressed' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'good', label: 'Good' },
];

const observationOptions = [
  { id: 'has_overgrown_lawn', label: 'Overgrown Lawn' },
  { id: 'has_mail_pileup', label: 'Mail Pileup' },
  { id: 'has_boarded_windows', label: 'Boarded Windows' },
  { id: 'has_roof_damage', label: 'Roof Damage' },
  { id: 'has_peeling_paint', label: 'Peeling Paint' },
  { id: 'has_for_sale_sign', label: 'For Sale Sign' },
  { id: 'has_notice_on_door', label: 'Notice on Door' },
  { id: 'has_broken_windows', label: 'Broken Windows' },
  { id: 'has_abandoned_vehicles', label: 'Abandoned Vehicles' },
  { id: 'has_code_violations', label: 'Code Violations' },
];

export function D4DQuickEditModal({
  property,
  open,
  onOpenChange,
  onSave,
  saving = false,
}: D4DQuickEditModalProps) {
  const [priority, setPriority] = useState(3);
  const [condition, setCondition] = useState<string>('');
  const [observations, setObservations] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Load property values when opened
  useEffect(() => {
    if (property && open) {
      setPriority(property.priority || 3);
      setCondition(property.condition || '');
      setNotes(property.written_notes || '');

      // Load observations from property
      const activeObs: string[] = [];
      observationOptions.forEach((opt) => {
        if (property[opt.id as keyof D4DProperty]) {
          activeObs.push(opt.id);
        }
      });
      setObservations(activeObs);
    }
  }, [property, open]);

  const toggleObservation = (id: string) => {
    setObservations((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!property) return;

    const updates: D4DPropertyUpdate = {
      priority,
      condition: condition || null,
      written_notes: notes || null,
    };

    // Add observation flags
    observationOptions.forEach((opt) => {
      (updates as Record<string, boolean>)[opt.id] = observations.includes(opt.id);
    });

    onSave(property.id, updates);
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Edit</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Address display */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            {property.formatted_address || `${property.street_number} ${property.street_name}`}
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 touch-target"
                  onClick={() => setPriority(star)}
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      star <= priority
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-sm font-medium mb-2 block">Condition</label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distress Indicators */}
          <div>
            <label className="text-sm font-medium mb-2 block">Distress Indicators</label>
            <div className="flex flex-wrap gap-2">
              {observationOptions.map((opt) => (
                <Badge
                  key={opt.id}
                  variant={observations.includes(opt.id) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all py-1.5 px-3 active:scale-[0.98]',
                    observations.includes(opt.id) && 'bg-primary'
                  )}
                  onClick={() => toggleObservation(opt.id)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <Textarea
              placeholder="Quick notes about this property..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
