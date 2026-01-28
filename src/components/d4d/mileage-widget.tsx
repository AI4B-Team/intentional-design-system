import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Route, DollarSign, ExternalLink } from 'lucide-react';
import { useMileageLog } from '@/hooks/useMileageLog';

interface MileageWidgetProps {
  annualGoal?: number; // Optional goal in miles
}

export function MileageWidget({ annualGoal = 2000 }: MileageWidgetProps) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { stats, isLoading } = useMileageLog(currentYear);

  const progressPercent = annualGoal > 0 ? (stats.totalMiles / annualGoal) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4 h-24" />
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/d4d/mileage')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Mileage This Year
          </h3>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-6 mb-3">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-bold">{stats.totalMiles.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">miles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            <div>
              <p className="text-lg font-bold">${stats.totalDeduction.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">deduction</p>
            </div>
          </div>
        </div>

        {annualGoal > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to {annualGoal} mi goal</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
