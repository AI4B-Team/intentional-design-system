import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Calculator, 
  DollarSign,
  FileText,
  Check,
  Loader2
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DrivingSession = Database['public']['Tables']['driving_sessions']['Row'];

interface D4DMileageCardProps {
  session: DrivingSession;
  onUpdateMiles?: (miles: number) => void;
  onAddToLog?: () => void;
  isInLog?: boolean;
  saving?: boolean;
}

// 2024 IRS standard mileage rate
const IRS_MILEAGE_RATE = 0.67;

export function D4DMileageCard({
  session,
  onUpdateMiles,
  onAddToLog,
  isInLog = false,
  saving = false,
}: D4DMileageCardProps) {
  const calculatedMiles = session.total_miles || 0;
  const [editedMiles, setEditedMiles] = useState<string>(calculatedMiles.toFixed(1));
  const [isEditing, setIsEditing] = useState(false);

  const finalMiles = parseFloat(editedMiles) || calculatedMiles;
  const deduction = finalMiles * IRS_MILEAGE_RATE;

  const handleSaveMiles = () => {
    const miles = parseFloat(editedMiles);
    if (!isNaN(miles) && miles >= 0 && onUpdateMiles) {
      onUpdateMiles(miles);
    }
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" />
            Mileage Tracking
          </CardTitle>
          {isInLog && (
            <Badge variant="outline" className="text-success border-success/30">
              <Check className="h-3 w-3 mr-1" />
              In Log
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calculated Miles */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">GPS Calculated</span>
          </div>
          <span className="font-mono font-medium">{calculatedMiles.toFixed(1)} mi</span>
        </div>

        {/* Editable Final Miles */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Final Miles</span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                value={editedMiles}
                onChange={(e) => setEditedMiles(e.target.value)}
                className="w-24 h-8 text-right font-mono"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveMiles}>
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="font-mono font-medium hover:text-primary transition-colors"
            >
              {finalMiles.toFixed(1)} mi
              <span className="text-xs text-muted-foreground ml-1">(edit)</span>
            </button>
          )}
        </div>

        {/* IRS Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">2024 IRS Rate</span>
          </div>
          <span className="font-mono">${IRS_MILEAGE_RATE}/mi</span>
        </div>

        {/* Tax Deduction */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Tax Deduction</span>
          </div>
          <span className="font-mono font-bold text-success">${deduction.toFixed(2)}</span>
        </div>

        {/* Add to Log Button */}
        {!isInLog && onAddToLog && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onAddToLog}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Add to Mileage Log
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
