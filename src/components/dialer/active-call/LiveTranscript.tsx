import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'prospect';
  speakerName?: string;
  text: string;
  timestamp: string;
  confidence?: number;
}

interface LiveTranscriptProps {
  messages: TranscriptMessage[];
  isListening?: boolean;
  userName?: string;
  prospectName?: string;
}

export function LiveTranscript({
  messages,
  isListening = true,
  userName = 'You',
  prospectName = 'Prospect',
}: LiveTranscriptProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white border border-border-subtle rounded-lg flex flex-col h-[500px]">
      {/* Transcript Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Waiting for conversation to begin...</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.speaker === 'user';
            const speakerName = isUser ? userName : message.speakerName || prospectName;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <Avatar className={cn(
                  'h-9 w-9 flex-shrink-0',
                  isUser ? 'bg-primary' : 'bg-muted'
                )}>
                  <AvatarFallback className={cn(
                    'text-xs font-semibold',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {getInitials(speakerName)}
                  </AvatarFallback>
                </Avatar>

                {/* Message Bubble */}
                <div className={cn(
                  'max-w-[70%] space-y-1',
                  isUser ? 'items-end' : 'items-start'
                )}>
                  {/* Speaker Info */}
                  <div className={cn(
                    'flex items-center gap-2 text-xs text-muted-foreground',
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <span className="font-medium">{speakerName}</span>
                    <span>{message.timestamp}</span>
                    {message.confidence && (
                      <>
                        <span>•</span>
                        <span>{message.confidence}% confident</span>
                      </>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    'rounded-2xl px-4 py-3',
                    isUser
                      ? 'bg-primary/10 text-foreground rounded-tr-md'
                      : 'bg-muted text-foreground rounded-tl-md'
                  )}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Listening Status Bar */}
      {isListening && (
        <div className="border-t border-border-subtle bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
              <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse delay-150" />
            </div>
            <span className="text-sm font-medium text-primary">AI Is Listening & Analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
