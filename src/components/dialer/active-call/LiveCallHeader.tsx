import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ArrowRight } from 'lucide-react';

interface LiveCallHeaderProps {
  contactName: string;
  subtitle?: string;
  callType?: string;
  callDuration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onMuteToggle: () => void;
  onSpeakerToggle: () => void;
  onTransfer: () => void;
  onEndCall: () => void;
  sentiment?: {
    label: string;
    value: number;
  };
}

export function LiveCallHeader({
  contactName,
  subtitle,
  callType = 'Outbound Sales',
  callDuration,
  isMuted,
  isSpeakerOn,
  onMuteToggle,
  onSpeakerToggle,
  onTransfer,
  onEndCall,
  sentiment,
}: LiveCallHeaderProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSentimentColor = (value: number) => {
    if (value >= 60) return 'bg-success';
    if (value >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="bg-white border border-border-subtle rounded-lg p-4 space-y-4">
      {/* Top Row - Contact Info & Duration */}
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
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
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
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="h-12 w-12 rounded-full p-0"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Row - Controls & Sentiment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isMuted ? 'secondary' : 'outline'}
            size="sm"
            onClick={onMuteToggle}
            className={cn(
              'gap-2',
              isMuted && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant={isSpeakerOn ? 'secondary' : 'outline'}
            size="sm"
            onClick={onSpeakerToggle}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Speaker {isSpeakerOn ? 'On' : 'Off'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onTransfer}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <ArrowRight className="h-4 w-4" />
            Transfer
          </Button>
        </div>

        {sentiment && (
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
              <div
                className={cn('h-full transition-all', getSentimentColor(sentiment.value))}
                style={{ width: `${sentiment.value}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {sentiment.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
