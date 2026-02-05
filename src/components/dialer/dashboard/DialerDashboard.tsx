import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Play, 
  Bot, 
  Headphones, 
  Phone, 
  Target, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface DialerDashboardProps {
  onStartCall: () => void;
  onSelectMode: (mode: 'start_call' | 'voice_agent' | 'listen_mode') => void;
}

interface RecentCall {
  id: string;
  name: string;
  company: string;
  time: string;
  duration: string;
  sentiment: number;
  status: 'closed' | 'follow-up' | 'pending';
}

interface TopPerformer {
  rank: number;
  name: string;
  calls: number;
  closeRate: number;
  revenue: number;
}

export function DialerDashboard({ onStartCall, onSelectMode }: DialerDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  // Mock data - in production, fetch from API
  const stats = {
    totalCalls: 247,
    callsTrend: '+23%',
    closeRate: 67,
    closeRateTrend: '+12%',
    avgDuration: '18:43',
    durationTrend: '-3 min',
    revenueImpact: 284000,
    revenueTrend: '+$67K',
  };

  const recentCalls: RecentCall[] = [
    { id: '1', name: 'Sarah Johnson', company: 'Acme Corp', time: '2 hours ago', duration: '23:45', sentiment: 85, status: 'closed' },
    { id: '2', name: 'Michael Chen', company: 'TechStart Inc', time: '4 hours ago', duration: '15:30', sentiment: 72, status: 'follow-up' },
    { id: '3', name: 'Emily Rodriguez', company: 'Growth Labs', time: 'Yesterday', duration: '19:15', sentiment: 91, status: 'closed' },
  ];

  const topPerformers: TopPerformer[] = [
    { rank: 1, name: 'John Smith', calls: 45, closeRate: 72, revenue: 124000 },
    { rank: 2, name: 'Sarah Williams', calls: 38, closeRate: 68, revenue: 98000 },
    { rank: 3, name: 'Mike Johnson', calls: 41, closeRate: 65, revenue: 87000 },
  ];

  const modes = [
    {
      id: 'start_call' as const,
      label: 'Start Call',
      description: 'You talk, AI assists with real-time suggestions',
      icon: Play,
      gradient: 'from-brand to-brand-dark',
    },
    {
      id: 'voice_agent' as const,
      label: 'Voice Agent',
      description: 'AI handles the call autonomously',
      icon: Bot,
      gradient: 'from-slate-600 to-slate-800',
    },
    {
      id: 'listen_mode' as const,
      label: 'Listen Mode',
      description: 'Capture external calls (Zoom, Meet, etc.)',
      icon: Headphones,
      gradient: 'from-emerald-500 to-emerald-700',
    },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getStatusBadge = (status: RecentCall['status']) => {
    switch (status) {
      case 'closed':
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            Closed
          </Badge>
        );
      case 'follow-up':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
            <ArrowRight className="h-3 w-3" />
            Follow-up
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-h1 font-bold text-foreground">
          Welcome Back, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI co-pilot is ready to help you close more deals
        </p>
      </div>

      {/* CTA Section */}
      <Card className="border-brand/20 bg-gradient-to-r from-brand/5 to-transparent">
        <CardContent className="py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">Ready To Crush Your Quota?</h2>
              <p className="text-muted-foreground text-small">Choose your mode and let AI guide you to the close</p>
            </div>
          </div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={cn(
                  "relative p-6 rounded-lg text-white text-center transition-all",
                  "hover:scale-[1.02] hover:shadow-lg",
                  "bg-gradient-to-br",
                  mode.gradient
                )}
              >
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <mode.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-body mb-1">{mode.label}</h3>
                <p className="text-white/80 text-tiny">{mode.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-brand" />
              </div>
              <Badge variant="outline" className="text-success border-success/30 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {stats.callsTrend} vs last week
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{stats.totalCalls}</p>
              <p className="text-muted-foreground text-small">Total Calls</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
              <Badge variant="outline" className="text-success border-success/30 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {stats.closeRateTrend} with AI assist
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{stats.closeRate}%</p>
              <p className="text-muted-foreground text-small">Close Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <Badge variant="outline" className="text-success border-success/30 gap-1">
                {stats.durationTrend} with AI
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{stats.avgDuration}</p>
              <p className="text-muted-foreground text-small">Avg Call Duration</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <Badge variant="outline" className="text-success border-success/30 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {stats.revenueTrend} this month
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{formatCurrency(stats.revenueImpact)}</p>
              <p className="text-muted-foreground text-small">Revenue Impact</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls & Top Performers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Calls */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand" />
              Recent Calls
            </CardTitle>
            <Button variant="link" className="text-brand p-0 h-auto" onClick={() => navigate('/dialer/history')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCalls.map((call) => (
              <div 
                key={call.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand/10 text-brand font-semibold">
                      {call.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{call.name}</p>
                    <p className="text-muted-foreground text-small">{call.company} • {call.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium text-foreground">{call.duration}</p>
                    <p className="text-muted-foreground text-tiny">Duration</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{call.sentiment}%</p>
                    <p className="text-muted-foreground text-tiny">Sentiment</p>
                  </div>
                  {getStatusBadge(call.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              Top Performers
            </CardTitle>
            <Button variant="link" className="text-brand p-0 h-auto">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((performer) => (
              <div 
                key={performer.rank}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-small font-bold",
                    performer.rank === 1 && "bg-warning/20 text-warning",
                    performer.rank === 2 && "bg-muted text-muted-foreground",
                    performer.rank === 3 && "bg-accent/20 text-accent"
                  )}>
                    #{performer.rank}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-small">{performer.name}</p>
                    <p className="text-muted-foreground text-tiny">
                      {performer.calls} calls • {performer.closeRate}% close rate
                    </p>
                  </div>
                </div>
                <p className="font-bold text-success">{formatCurrency(performer.revenue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
