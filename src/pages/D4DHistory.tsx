import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  Download,
  Route,
  Clock,
  MapPin,
  DollarSign,
  Car,
} from 'lucide-react';
import { D4DSessionCard } from '@/components/d4d/d4d-session-card';
import { useDrivingSessions, SessionFilters } from '@/hooks/useDrivingSessions';
import { formatDuration } from '@/lib/format-duration';

export default function D4DHistory() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SessionFilters>({
    dateRange: 'all',
    status: 'all',
  });

  const { sessions, isLoading, stats } = useDrivingSessions(filters);

  // Group sessions by month
  const groupedSessions = useMemo(() => {
    const groups: Record<string, typeof sessions> = {};

    sessions.forEach((session) => {
      const date = session.started_at ? new Date(session.started_at) : new Date();
      const monthKey = format(date, 'MMMM yyyy');

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(session);
    });

    return groups;
  }, [sessions]);

  const handleExportMileage = () => {
    // Generate CSV for mileage log
    const headers = ['Date', 'Session Name', 'Miles', 'Duration', 'Properties', 'Deduction'];
    const rows = sessions.map((s) => [
      s.started_at ? format(new Date(s.started_at), 'yyyy-MM-dd') : '',
      s.name || 'Driving Session',
      (s.total_miles || 0).toFixed(1),
      formatDuration(s.total_duration_seconds || 0),
      s.properties_tagged || 0,
      `$${((s.total_miles || 0) * 0.67).toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `d4d-mileage-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                <h1 className="text-lg font-semibold">Driving History</h1>
                <p className="text-sm text-muted-foreground">
                  {sessions.length} sessions
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportMileage}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="px-4 pb-3 flex gap-2">
            <Select
              value={filters.dateRange}
              onValueChange={(v) => setFilters({ ...filters, dateRange: v as SessionFilters['dateRange'] })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v as SessionFilters['status'] })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex-shrink-0 p-4 border-b">
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
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{stats.totalProperties}</p>
                <p className="text-xs text-muted-foreground">Properties</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
                <p className="text-lg font-bold font-mono text-success">
                  ${stats.estimatedDeduction.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Est. Deduction</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium mb-1">No driving sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first session to begin tracking
              </p>
              <Button onClick={() => navigate('/d4d')}>
                Start Driving
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([month, monthSessions]) => (
                <div key={month}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {month}
                  </h3>
                  <div className="space-y-3">
                    {monthSessions.map((session) => (
                      <D4DSessionCard
                        key={session.id}
                        session={session}
                        onClick={() => navigate(`/d4d/history/${session.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
