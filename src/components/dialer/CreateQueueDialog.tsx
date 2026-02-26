import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 6; // 6 AM to 8 PM
  const label = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
  const value = `${hour.toString().padStart(2, '0')}:00`;
  return { label: hour === 12 ? '12:00 PM' : label, value };
});

const RETRY_OPTIONS = [
  { label: '1 hour', value: '0.04' },
  { label: '4 hours', value: '0.17' },
  { label: '24 hours (1 day)', value: '1' },
  { label: '48 hours (2 days)', value: '2' },
];

export function CreateQueueDialog({ open, onOpenChange }: CreateQueueDialogProps) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [callingHoursStart, setCallingHoursStart] = useState('09:00');
  const [callingHoursEnd, setCallingHoursEnd] = useState('17:00');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [retryInterval, setRetryInterval] = useState('1');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCallingHoursStart('09:00');
    setCallingHoursEnd('17:00');
    setMaxAttempts(3);
    setRetryInterval('1');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Queue name is required');
      return;
    }
    if (!user || !organizationId) {
      toast.error('You must be logged in to create a queue');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('call_queues').insert({
        name: name.trim(),
        description: description.trim() || null,
        calling_hours_start: callingHoursStart,
        calling_hours_end: callingHoursEnd,
        max_attempts: maxAttempts,
        days_between_attempts: parseFloat(retryInterval),
        organization_id: organizationId,
        user_id: user.id,
        source_type: 'manual',
        status: 'active',
      });

      if (error) throw error;

      toast.success('Queue created');
      queryClient.invalidateQueries({ queryKey: ['call-queues', organizationId] });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Create queue error:', err);
      toast.error('Failed to create queue', { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Call Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="queue-name">Queue Name *</Label>
            <Input
              id="queue-name"
              placeholder="e.g. Hot Leads - Dallas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="queue-desc">Description</Label>
            <Textarea
              id="queue-desc"
              placeholder="Optional notes about this queue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Calling Hours Start</Label>
              <Select value={callingHoursStart} onValueChange={setCallingHoursStart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Calling Hours End</Label>
              <Select value={callingHoursEnd} onValueChange={setCallingHoursEnd}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Max Attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                min={1}
                max={20}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Between Attempts</Label>
              <Select value={retryInterval} onValueChange={setRetryInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETRY_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
