import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Loader2, ArrowRightLeft } from 'lucide-react';

interface TransferCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callSid?: string | null;
  callId?: string | null;
  onTransferComplete?: () => void;
}

export function TransferCallDialog({
  open,
  onOpenChange,
  callSid,
  callId,
  onTransferComplete,
}: TransferCallDialogProps) {
  const [transferNumber, setTransferNumber] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!transferNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!callSid) {
      toast.error('No active call to transfer');
      return;
    }

    setIsTransferring(true);

    try {
      const { data, error } = await supabase.functions.invoke('transfer-call', {
        body: {
          callSid,
          transferTo: transferNumber.trim(),
          callId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Call transferred successfully', {
          description: `Transferred to ${data.transferredTo}`,
        });
        onOpenChange(false);
        setTransferNumber('');
        onTransferComplete?.();
      } else {
        throw new Error(data?.error || 'Transfer failed');
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      toast.error('Failed to transfer call', {
        description: err?.message || 'Please try again',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Transfer Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Enter the phone number to transfer this call to. The active call will be
            immediately redirected to the new number.
          </p>

          <div className="space-y-2">
            <Label htmlFor="transfer-number" className="text-sm font-medium">
              Transfer to
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="transfer-number"
                placeholder="(555) 123-4567"
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                className="pl-10"
                disabled={isTransferring}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTransfer();
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!transferNumber.trim() || isTransferring}
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer Call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
