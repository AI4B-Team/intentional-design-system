import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  Sparkles,
  FileText,
  Calendar,
  Users,
  Zap,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

interface DialerDashboardProps {
  onStartCall: () => void;
  onSelectMode: (mode: 'start_call' | 'voice_agent' | 'listen_mode') => void;
}

interface RecentCall {
  id: string;
  name: string;
  property: string;
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

interface ScheduledCall {
  id: string;
  name: string;
  property: string;
  time: string;
  type: 'follow-up' | 'new' | 'callback';
}

interface CallScript {
  id: string;
  name: string;
  category: string;
  description: string;
  successRate: number;
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

  const quickStats = {
    queued: 45,
    scheduled: 8,
    followUps: 12,
    hotLeads: 5,
  };

  const recentCalls: RecentCall[] = [
    { id: '1', name: 'Sarah Johnson', property: '123 Maple Street', time: '2 hours ago', duration: '23:45', sentiment: 85, status: 'closed' },
    { id: '2', name: 'Michael Chen', property: '456 Oak Avenue', time: '4 hours ago', duration: '15:30', sentiment: 72, status: 'follow-up' },
    { id: '3', name: 'Emily Rodriguez', property: '789 Pine Road', time: 'Yesterday', duration: '19:15', sentiment: 91, status: 'closed' },
  ];

  const topPerformers: TopPerformer[] = [
    { rank: 1, name: 'John Smith', calls: 45, closeRate: 72, revenue: 124000 },
    { rank: 2, name: 'Sarah Williams', calls: 38, closeRate: 68, revenue: 98000 },
    { rank: 3, name: 'Mike Johnson', calls: 41, closeRate: 65, revenue: 87000 },
  ];

  const scheduledCalls: ScheduledCall[] = [
    { id: '1', name: 'Robert Martinez', property: '234 Elm Drive', time: '10:30 AM', type: 'follow-up' },
    { id: '2', name: 'Jennifer Lee', property: '567 Cedar Lane', time: '11:00 AM', type: 'callback' },
    { id: '3', name: 'David Brown', property: '890 Birch Court', time: '2:00 PM', type: 'new' },
  ];

  const callScripts: CallScript[] = [
    { id: '1', name: 'Motivated Seller', category: 'Outbound', description: 'For distressed property owners', successRate: 68 },
    { id: '2', name: 'Follow-up Close', category: 'Follow-up', description: 'Second touch negotiation', successRate: 72 },
    { id: '3', name: 'Objection Handler', category: 'Objections', description: 'Price & timeline concerns', successRate: 65 },
  ];

  const aiTips = [
    { id: '1', tip: 'Best calling hours today: 10 AM - 12 PM based on your success patterns', icon: Clock },
    { id: '2', tip: '5 hot leads haven\'t been contacted in 3+ days. Consider prioritizing them.', icon: Zap },
    { id: '3', tip: 'Your close rate improves 23% when you mention creative financing options', icon: Lightbulb },
  ];

  const modes = [
    {
      id: 'start_call' as const,
      label: 'Start Call',
      description: 'You talk, AI assists with real-time suggestions',
      icon: Play,
      bgColor: 'bg-brand',
      textColor: 'text-white',
    },
    {
      id: 'voice_agent' as const,
      label: 'Voice Agent',
      description: 'AI handles the call autonomously',
      icon: Bot,
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      badge: 'Beta',
    },
    {
      id: 'listen_mode' as const,
      label: 'Listen Mode',
      description: 'Capture external calls (Zoom, Meet, etc.)',
      icon: Headphones,
      bgColor: 'bg-info',
      textColor: 'text-white',
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

  const getCallTypeBadge = (type: ScheduledCall['type']) => {
    switch (type) {
      case 'follow-up':
        return <Badge variant="outline" className="text-info border-info/30">Follow-up</Badge>;
      case 'callback':
        return <Badge variant="outline" className="text-warning border-warning/30">Callback</Badge>;
      default:
        return <Badge variant="outline" className="text-success border-success/30">New Lead</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-foreground">
            Welcome Back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI co-pilot is ready to help you close more deals
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/settings/dialer')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-brand/20">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-h3 font-bold text-foreground">{quickStats.queued}</p>
              <p className="text-muted-foreground text-tiny">In Queue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-info/20">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-h3 font-bold text-foreground">{quickStats.scheduled}</p>
              <p className="text-muted-foreground text-tiny">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-h3 font-bold text-foreground">{quickStats.followUps}</p>
              <p className="text-muted-foreground text-tiny">Follow-ups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-h3 font-bold text-foreground">{quickStats.hotLeads}</p>
              <p className="text-muted-foreground text-tiny">Hot Leads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="border-border">
        <CardContent className="py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">Ready To Crush Your Quota?</h2>
              <p className="text-muted-foreground text-small">Choose your mode and let AI guide you to the close</p>
            </div>
          </div>

          {/* Mode Cards - No gradients */}
          <div className="grid md:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={cn(
                  "relative p-6 rounded-lg text-center transition-all",
                  "hover:scale-[1.02] hover:shadow-lg",
                  mode.bgColor,
                  mode.textColor
                )}
              >
                {mode.badge && (
                  <Badge className="absolute top-2 right-2 bg-white/20 text-white border-0">
                    {mode.badge}
                  </Badge>
                )}
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

      {/* AI Tips Section */}
      <Card className="border-brand/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-body">
            <Sparkles className="h-5 w-5 text-brand" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {aiTips.map((tip) => (
            <div 
              key={tip.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-brand/5 border border-brand/10"
            >
              <tip.icon className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
              <p className="text-small text-foreground">{tip.tip}</p>
            </div>
          ))}
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
                {stats.callsTrend}
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
                {stats.closeRateTrend}
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
                {stats.durationTrend}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{stats.avgDuration}</p>
              <p className="text-muted-foreground text-small">Avg Duration</p>
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
                {stats.revenueTrend}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-h1 font-bold text-foreground">{formatCurrency(stats.revenueImpact)}</p>
              <p className="text-muted-foreground text-small">Revenue Impact</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Calls & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                Today's Schedule
              </CardTitle>
              <Button variant="link" className="text-brand p-0 h-auto">
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledCalls.map((call) => (
                <div 
                  key={call.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{call.name}</p>
                      <p className="text-muted-foreground text-small">{call.property}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-foreground">{call.time}</p>
                    {getCallTypeBadge(call.type)}
                    <Button size="sm" variant="secondary" className="gap-1">
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand" />
                Recent Calls
              </CardTitle>
              <Button variant="link" className="text-brand p-0 h-auto" onClick={() => navigate('/dialer/history')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
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
                      <p className="text-muted-foreground text-small">{call.property} • {call.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
        </div>

        {/* Right Column - Scripts & Performers */}
        <div className="space-y-6">
          {/* Call Scripts */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand" />
                Call Scripts
              </CardTitle>
              <Button variant="link" className="text-brand p-0 h-auto" onClick={() => navigate('/dialer/scripts')}>
                Manage
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {callScripts.map((script) => (
                <div 
                  key={script.id}
                  className="p-3 rounded-lg border border-border hover:border-brand/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground text-small">{script.name}</p>
                      <Badge variant="secondary" className="mt-1 text-tiny">
                        {script.category}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-tiny mb-2">{script.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={script.successRate} className="h-1.5 flex-1" />
                    <span className="text-tiny text-success font-medium">{script.successRate}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-warning" />
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
                      performer.rank === 3 && "bg-accent/20 text-accent-foreground"
                    )}>
                      #{performer.rank}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-small">{performer.name}</p>
                      <p className="text-muted-foreground text-tiny">
                        {performer.calls} calls • {performer.closeRate}%
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-success text-small">{formatCurrency(performer.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
