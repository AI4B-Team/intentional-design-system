import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  BarChart3,
  Phone,
  Bot,
  Mic,
  MessageSquare,
  Volume2,
  Video,
  Mail,
  Sparkles,
} from 'lucide-react';

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  active?: boolean;
}

interface SessionSidebarProps {
  isLive: boolean;
  onLiveCallClick: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function SessionSidebar({
  isLive,
  onLiveCallClick,
  activeSection = 'calls',
  onSectionChange,
}: SessionSidebarProps) {
  const coreItems: SidebarNavItem[] = [
    { id: 'command', label: 'Command', icon: BarChart3 },
    { id: 'calls', label: 'Calls', icon: Phone, active: activeSection === 'calls' },
    { id: 'agent', label: 'Agent', icon: Bot },
  ];

  const callToolsItems: SidebarNavItem[] = [
    { id: 'transcribe', label: 'Transcribe', icon: Mic, badge: 'NEW' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, badge: 'NEW' },
    { id: 'playback', label: 'Playback', icon: Volume2, badge: 'NEW' },
    { id: 'recording', label: 'Recording', icon: Video, badge: 'NEW' },
  ];

  const dialerSmsItems: SidebarNavItem[] = [
    { id: 'power-dialer', label: 'Power Dialer', icon: Phone },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'follow-ups', label: 'Follow-ups', icon: Mail, badge: 'NEW' },
  ];

  const renderNavItem = (item: SidebarNavItem) => (
    <button
      key={item.id}
      onClick={() => onSectionChange?.(item.id)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        item.active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
      {item.badge && (
        <Badge className="ml-auto text-[9px] bg-success text-success-foreground px-1.5 py-0">
          {item.badge}
        </Badge>
      )}
    </button>
  );

  return (
    <div className="w-64 bg-white border-r border-border-subtle flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Master Closer</h2>
            <p className="text-xs text-muted-foreground">AI Sales Co-Pilot</p>
          </div>
        </div>
      </div>

      {/* Live Call Button */}
      <div className="p-4">
        <Button
          onClick={onLiveCallClick}
          className="w-full gap-2 font-semibold bg-destructive hover:bg-destructive/90 text-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {isLive ? 'LIVE Call' : 'Start Call'}
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {/* Core */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Core
          </p>
          <div className="space-y-1">
            {coreItems.map(renderNavItem)}
          </div>
        </div>

        {/* Call Tools */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Call Tools
          </p>
          <div className="space-y-1">
            {callToolsItems.map(renderNavItem)}
          </div>
        </div>

        {/* Dialer & SMS */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Dialer & SMS
          </p>
          <div className="space-y-1">
            {dialerSmsItems.map(renderNavItem)}
          </div>
        </div>
      </div>

      {/* AI Badge at Bottom */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI-Powered Assistance</span>
        </div>
      </div>
    </div>
  );
}
