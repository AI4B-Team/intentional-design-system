import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, Phone, PhoneOff, Mic, MicOff, Volume2, ArrowRight, Target, MessageSquare, RefreshCw, CheckCircle2, Circle, Zap, Copy, Clock, Settings } from 'lucide-react';

export interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'prospect';
  speakerName?: string;
  text: string;
  timestamp: string;
  confidence?: number;
}

export interface CallPhase {
  id: string;
  name: string;
  duration?: string;
  status: 'completed' | 'current' | 'pending';
}

interface SessionCallViewProps {
  contactName: string;
  contactSubtitle?: string;
  callType?: string;
  callDuration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onMuteToggle: () => void;
  onSpeakerToggle: () => void;
  onTransfer: () => void;
  onEndCall: () => void;
  transcript: TranscriptMessage[];
  phases: CallPhase[];
  onNextPhase?: () => void;
}

export function SessionCallView({
  contactName,
  contactSubtitle,
  callType = 'Outbound Sales',
  callDuration,
  isMuted,
  isSpeakerOn,
  onMuteToggle,
  onSpeakerToggle,
  onTransfer,
  onEndCall,
  transcript,
  phases,
  onNextPhase,
}: SessionCallViewProps) {
  const [sentiment] = React.useState({ label: 'Neutral', value: 35 });
  const [suggestion] = React.useState({
    text: "I can definitely hear the frustration in your voice, and honestly, that's exactly why I reached out. You've got a great property, it shouldn't be sitting there collecting dust.",
    reasoning: "Empathizes with the prospect's frustration to build rapport.",
    confidence: 95,
  });
  const [stats] = React.useState({ objections: 3, talkRatio: 85, nextSteps: 2 });

  const callTemplate = {
    name: 'Outbound Sales',
    category: 'sales',
    description: 'Generate interest and book next steps',
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSentimentColor = (value: number) => {
    if (value >= 60) return 'bg-success';
    if (value >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getPhaseIcon = (status: CallPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'current':
        return <Clock className="h-5 w-5 text-success" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Header */}
      <div className="bg-white border border-border-subtle rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(contactName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{contactName}</h2>
                <Badge variant="secondary" className="bg-success/10 text-success text-[10px] font-medium">
                  <Phone className="h-2.5 w-2.5 mr-1" />
                  Live Call
                </Badge>
                <Badge variant="secondary" className="bg-warning/10 text-warning text-[10px] font-medium">
                  {callType}
                </Badge>
              </div>
              {contactSubtitle && (
                <p className="text-sm text-muted-foreground">{contactSubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(callDuration)}
              </p>
              <p className="text-xs text-muted-foreground">Call Duration</p>
            </div>
            <Button variant="destructive" size="lg" onClick={onEndCall} className="h-12 w-12 rounded-full p-0">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant={isMuted ? 'secondary' : 'outline'} size="sm" onClick={onMuteToggle}
              className={cn('gap-2', isMuted && 'bg-destructive/10 text-destructive hover:bg-destructive/20')}>
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button variant={isSpeakerOn ? 'secondary' : 'outline'} size="sm" onClick={onSpeakerToggle} className="gap-2">
              <Volume2 className="h-4 w-4" />
              Speaker {isSpeakerOn ? 'On' : 'Off'}
            </Button>
            <Button variant="default" size="sm" onClick={onTransfer} className="gap-2 bg-primary hover:bg-primary/90">
              <ArrowRight className="h-4 w-4" />
              Transfer
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm">😐</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{sentiment.label}</p>
                <p className="text-xs text-muted-foreground">Prospect Sentiment</p>
              </div>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full transition-all', getSentimentColor(sentiment.value))} style={{ width: `${sentiment.value}%` }} />
            </div>
            <span className="text-sm font-semibold text-foreground tabular-nums">{sentiment.value}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Transcript */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-border-subtle rounded-lg p-4 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Live Transcript</span>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
                Listening
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {transcript.map((message) => (
                <div key={message.id} className={cn('flex gap-3', message.speaker === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.speaker === 'prospect' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {message.speakerName?.[0] || 'SP'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('max-w-[80%]', message.speaker === 'user' ? 'items-end' : 'items-start')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {message.speaker === 'user' ? 'You' : message.speakerName || 'Prospect'}
                      </span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      {message.confidence && (
                        <span className="text-xs text-muted-foreground">• {message.confidence}% confident</span>
                      )}
                    </div>
                    <div className={cn(
                      'rounded-lg px-4 py-3 text-sm',
                      message.speaker === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}>
                      {message.text}
                    </div>
                  </div>
                  {message.speaker === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">YO</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* AI Co-Pilot Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Co-Pilot Header */}
          <div className="bg-white border border-border-subtle rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">AI Co-Pilot</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time suggestions and guidance</p>
          </div>

          {/* Call Template - Yellow themed */}
          <div className="bg-warning/5 border border-warning/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Call Template</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Switch
              </Button>
            </div>
            <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="h-10 w-10 rounded-lg bg-warning flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{callTemplate.name}</h4>
                  <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning">{callTemplate.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{callTemplate.description}</p>
              </div>
            </div>
          </div>

          {/* Call Structure */}
          <div className="bg-white border border-border-subtle rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Call Structure</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onNextPhase} className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowRight className="h-3 w-3" />
                Next Phase
              </Button>
            </div>
            <div className="space-y-2">
              {phases.map((phase) => (
                <div key={phase.id} className={cn(
                  'flex items-center justify-between py-3 px-4 rounded-xl transition-colors',
                  (phase.status === 'current' || phase.status === 'completed') && 'bg-success/10',
                  phase.status === 'pending' && 'bg-muted/50'
                )}>
                  <div className="flex items-center gap-3">
                    {getPhaseIcon(phase.status)}
                    <span className={cn(
                      'text-sm font-medium',
                      (phase.status === 'current' || phase.status === 'completed') && 'text-foreground',
                      phase.status === 'pending' && 'text-foreground'
                    )}>{phase.name}</span>
                  </div>
                  <span className={cn(
                    'text-sm tabular-nums',
                    (phase.status === 'current' || phase.status === 'completed') ? 'text-foreground/70' : 'text-muted-foreground'
                  )}>{phase.duration || '0:00'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-white border border-border-subtle rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Smart Suggestions</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-foreground">{suggestion.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-subtle">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{stats.objections}</p>
                  <p className="text-[10px] text-muted-foreground">Objections</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-success">{stats.talkRatio}%</p>
                  <p className="text-[10px] text-muted-foreground">Talk Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{stats.nextSteps}</p>
                  <p className="text-[10px] text-muted-foreground">Next Steps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
