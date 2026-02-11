import * as React from 'react';
import { cn } from '@/lib/utils';
import { useCallState } from '@/contexts/CallContext';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Bot,
  Copy,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  Mail,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DialerComposerDrawer } from './DialerComposerDrawer';

// ============================================================================
// TYPES
// ============================================================================
interface QueueItem {
  id: string;
  name: string;
  phone: string;
  address?: string;
  type?: string;
  status?: 'waiting' | 'active' | 'completed' | 'skipped';
}

type AIState = 'listening' | 'analyzing' | 'strategy_shift' | 'objection_detected' | 'high_intent';
type CallMode = 'human' | 'ai_agent';

interface TranscriptMsg {
  id: string;
  speaker: 'user' | 'prospect';
  speakerName?: string;
  text: string;
  timestamp: string;
  tags?: Array<{ label: string; type: 'objection' | 'tone' | 'intent' }>;
}

interface SuggestionCard {
  id: string;
  type: 'question' | 'response' | 'coach';
  text: string;
}

interface CallPhaseItem {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
}

// ============================================================================
// AI STATE CONFIG
// ============================================================================
const AI_STATE_CONFIG: Record<AIState, { color: string; bgColor: string; dotColor: string; label: string; animate: boolean }> = {
  listening: { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-500', label: 'Listening', animate: true },
  analyzing: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500', label: 'Analyzing', animate: true },
  strategy_shift: { color: 'text-violet-500', bgColor: 'bg-violet-500/10', dotColor: 'bg-violet-500', label: 'Strategy Shift', animate: false },
  objection_detected: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500', label: 'Objection Detected', animate: true },
  high_intent: { color: 'text-red-500', bgColor: 'bg-red-500/10', dotColor: 'bg-red-500', label: 'High Intent — Push Close', animate: true },
};

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_TRANSCRIPT: TranscriptMsg[] = [
  { id: '1', speaker: 'user', text: "Hey, I know you weren't expecting this call. Got 30 seconds for me to explain why I'm reaching out?", timestamp: '00:00' },
  { id: '2', speaker: 'prospect', speakerName: 'Marcus', text: "Uh... I'm pretty slammed right now. What is this about?", timestamp: '00:04', tags: [{ label: 'Tone: Guarded', type: 'tone' }] },
  { id: '3', speaker: 'user', text: "Fair enough, I'll be quick. I noticed you have a property on Maple Street. Are you still looking to sell, or has your situation changed?", timestamp: '00:30' },
  { id: '4', speaker: 'prospect', speakerName: 'Marcus', text: "Yeah, I still need to sell. It's been sitting for a while and I'm getting frustrated honestly.", timestamp: '00:45', tags: [{ label: 'Objection: Price', type: 'objection' }, { label: 'Tone: Frustrated', type: 'tone' }, { label: 'Intent: Medium', type: 'intent' }] },
];

const MOCK_SUGGESTIONS: SuggestionCard[] = [
  { id: 's1', type: 'question', text: "What's your ideal timeline for getting this resolved?" },
  { id: 's2', type: 'response', text: "I can definitely hear the frustration. That's exactly why I reached out — your property shouldn't be sitting there collecting dust." },
  { id: 's3', type: 'coach', text: "Mirror their last sentence to build rapport before transitioning to value prop." },
];

const MOCK_PHASES: CallPhaseItem[] = [
  { id: 'p1', name: 'Pattern Interrupt', status: 'completed' },
  { id: 'p2', name: 'Permission', status: 'completed' },
  { id: 'p3', name: 'Value Prop', status: 'current' },
  { id: 'p4', name: 'Qualification', status: 'pending' },
  { id: 'p5', name: 'Close', status: 'pending' },
];

const MOCK_QUEUE: QueueItem[] = [
  { id: 'q1', name: 'Marcus Williams', phone: '(555) 123-4567', status: 'active' },
  { id: 'q2', name: 'Jennifer Lee', phone: '(555) 234-5678', status: 'waiting' },
  { id: 'q3', name: 'David Park', phone: '(555) 345-6789', status: 'waiting' },
  { id: 'q4', name: 'Angela Torres', phone: '(555) 456-7890', status: 'waiting' },
  { id: 'q5', name: 'Tom Bradley', phone: '(555) 567-8901', status: 'waiting' },
];

// ============================================================================
// FORMAT HELPERS
// ============================================================================
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============================================================================
// QUEUE SIDEBAR (Left 25%)
// ============================================================================
function QueueSidebar({ queue, activeId }: { queue: QueueItem[]; activeId?: string }) {
  return (
    <div className="w-[240px] border-r border-border flex flex-col bg-background flex-shrink-0">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Queue</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{queue.length} contacts</div>
      </div>
      <div className="flex-1 overflow-auto">
        {queue.map((item) => {
          const isActive = item.id === activeId;
          const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 border-b border-border/30 cursor-pointer transition-colors',
                isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40 border-l-2 border-l-transparent',
                item.status === 'completed' && 'opacity-40'
              )}
            >
              <div className="relative">
                <div className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {initials}
                </div>
                <span className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
                  isActive ? 'bg-emerald-500' : item.status === 'completed' ? 'bg-muted-foreground' : 'bg-amber-400'
                )} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground truncate">{item.name}</div>
                {isActive && (
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">ON CALL</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// CENTER CALL VIEW (50%)
// ============================================================================
function CenterCallView({
  contactName,
  callDuration,
  aiState,
  confidence,
  phases,
  currentStrategy,
  transcript,
  suggestions,
  callMode,
  isMuted,
  onMuteToggle,
  onEndCall,
  onAITakeOver,
  onUseSuggestion,
  smsComposerOpen,
  onSmsComposerToggle,
  smsMessage,
  onSmsChange,
  onSmsSend,
}: {
  contactName: string;
  callDuration: number;
  aiState: AIState;
  confidence: number;
  phases: CallPhaseItem[];
  currentStrategy: string;
  transcript: TranscriptMsg[];
  suggestions: SuggestionCard[];
  callMode: CallMode;
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
  onAITakeOver: () => void;
  onUseSuggestion: (text: string) => void;
  smsComposerOpen: boolean;
  onSmsComposerToggle: () => void;
  smsMessage: string;
  onSmsChange: (v: string) => void;
  onSmsSend: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stateConfig = AI_STATE_CONFIG[aiState];
  const currentPhase = phases.find(p => p.status === 'current');

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const typeStyles: Record<string, { border: string; badge: string; label: string }> = {
    question: { border: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-600', label: 'QUESTION' },
    response: { border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-600', label: 'RESPONSE' },
    coach: { border: 'border-muted-foreground/20', badge: 'bg-muted text-muted-foreground', label: 'COACH' },
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* === LIVE CALL HEADER === */}
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between flex-shrink-0 bg-background">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-bold text-foreground">{contactName}</h2>
              <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider', stateConfig.bgColor, stateConfig.color)}>
                <span className="relative flex h-2 w-2">
                  {stateConfig.animate && <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', stateConfig.dotColor)} />}
                  <span className={cn('relative inline-flex rounded-full h-2 w-2', stateConfig.dotColor)} />
                </span>
                {stateConfig.label}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
              <span>Stage: <span className="font-semibold text-foreground">{currentPhase?.name || '—'}</span></span>
              <span>·</span>
              <span>Confidence: <span className="font-semibold text-foreground">{confidence}%</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-mono font-bold text-foreground tabular-nums">{formatDuration(callDuration)}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={onMuteToggle} className={cn('p-2 rounded-lg border transition-colors', isMuted ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'border-border text-muted-foreground hover:text-foreground')}>
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button onClick={onEndCall} className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              <PhoneOff className="h-4 w-4" />
            </button>
            <button onClick={onAITakeOver} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-500/30 bg-violet-500/5 text-violet-600 text-xs font-semibold hover:bg-violet-500/10 transition-colors">
              <Bot className="h-3.5 w-3.5" /> AI Take Over
            </button>
          </div>
        </div>
      </div>

      {/* === STAGE PROGRESS BAR === */}
      <div className="px-5 py-2.5 border-b border-border/50 flex-shrink-0 bg-muted/20">
        <div className="flex items-center gap-1">
          {phases.map((phase, i) => (
            <React.Fragment key={phase.id}>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all',
                phase.status === 'current' && 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 animate-pulse',
                phase.status === 'completed' && 'bg-primary/10 text-primary',
                phase.status === 'pending' && 'text-muted-foreground/60 border border-border/50'
              )}>
                {phase.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                {phase.status === 'current' && <Clock className="h-3 w-3" />}
                {phase.status === 'pending' && <Circle className="h-3 w-3" />}
                {phase.name}
              </div>
              {i < phases.length - 1 && (
                <ArrowRight className={cn('h-3 w-3 flex-shrink-0', phase.status === 'completed' ? 'text-primary/50' : 'text-muted-foreground/30')} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* === CURRENT STRATEGY LINE === */}
      <div className="px-5 py-2 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          <Target className="h-3 w-3 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">Current Strategy:</span>
          <span className="font-semibold text-foreground">{currentStrategy}</span>
        </div>
      </div>

      {/* === LIVE TRANSCRIPT === */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-4">
        {transcript.map((msg) => {
          const isUser = msg.speaker === 'user';
          const name = isUser ? 'You' : msg.speakerName || 'Prospect';
          return (
            <div key={msg.id} className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {name.slice(0, 1)}
              </div>
              <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start')}>
                <div className={cn('flex items-center gap-2 text-[10px] text-muted-foreground', isUser ? 'flex-row-reverse' : 'flex-row')}>
                  <span className="font-semibold">{name}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className={cn(
                  'rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                  isUser ? 'bg-primary/10 text-foreground rounded-tr-md' : 'bg-muted text-foreground rounded-tl-md'
                )}>
                  {msg.text}
                </div>
                {msg.tags && msg.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {msg.tags.map((tag, i) => (
                      <span key={i} className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-semibold',
                        tag.type === 'objection' && 'bg-amber-500/10 text-amber-600',
                        tag.type === 'tone' && 'bg-violet-500/10 text-violet-500',
                        tag.type === 'intent' && 'bg-blue-500/10 text-blue-500',
                      )}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* Listening indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
          <span className={cn('text-[11px] font-semibold', stateConfig.color)}>{stateConfig.label}...</span>
        </div>
      </div>

      {/* === SUGGESTION STACK (Sticky) === */}
      <div className="border-t border-border bg-muted/20 px-5 py-3 flex-shrink-0 space-y-2">
        {suggestions.slice(0, 3).map((s) => {
          const style = typeStyles[s.type];
          return (
            <div key={s.id} className={cn('flex items-start gap-3 p-3 rounded-lg border bg-background', style.border)}>
              <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold tracking-wider flex-shrink-0 mt-0.5', style.badge)}>
                {style.label}
              </span>
              <p className="text-[12px] text-foreground leading-relaxed flex-1">{s.text}</p>
              <button
                onClick={() => onUseSuggestion(s.text)}
                className={cn(
                  'px-2.5 py-1 rounded text-[10px] font-bold flex-shrink-0 transition-colors',
                  s.type === 'coach'
                    ? 'bg-muted text-foreground hover:bg-muted-foreground/10'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {s.type === 'coach' ? 'Apply' : 'Use'}
              </button>
            </div>
          );
        })}
      </div>

      {/* === SMS COMPOSER SLIDE-UP === */}
      {smsComposerOpen && (
        <div className="border-t border-primary/20 bg-primary/5 px-5 py-3 flex-shrink-0 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Quick SMS to {contactName.split(' ')[0]}
            </div>
            <button onClick={onSmsComposerToggle} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={smsMessage}
              onChange={e => onSmsChange(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] outline-none focus:border-primary/50"
            />
            <button onClick={onSmsSend} disabled={!smsMessage.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {['Send', 'Rewrite Tone', 'Insert Offer Range', 'Schedule 10 AM'].map(label => (
              <button key={label} className="px-2.5 py-1 rounded-md border border-border text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STRATEGY PANEL (Right 25%)
// ============================================================================
function StrategyPanel({
  sentiment,
  sentimentScore,
  dealProbability,
  directive,
  contactName,
  onSmsClick,
  onEmailClick,
}: {
  sentiment: string;
  sentimentScore: number;
  dealProbability: number;
  directive: string;
  contactName: string;
  onSmsClick: () => void;
  onEmailClick: () => void;
}) {
  const sentimentColor = sentimentScore >= 60 ? 'text-emerald-600' : sentimentScore >= 40 ? 'text-amber-500' : 'text-red-500';
  const sentimentBg = sentimentScore >= 60 ? 'bg-emerald-500' : sentimentScore >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-[300px] border-l border-border flex flex-col bg-background flex-shrink-0 overflow-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-foreground">Strategy Panel</div>
          <div className="text-[10px] text-muted-foreground">Real-time tactical intel</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Prospect Sentiment */}
        <div className="p-3.5 rounded-lg border border-border bg-muted/30">
          <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-2">Prospect Sentiment</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700', sentimentBg)} style={{ width: `${sentimentScore}%` }} />
              </div>
            </div>
            <span className={cn('text-sm font-bold tabular-nums', sentimentColor)}>{sentimentScore}%</span>
          </div>
          <div className={cn('text-xs font-semibold mt-1.5 capitalize', sentimentColor)}>{sentiment}</div>
        </div>

        {/* Directive */}
        <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5">
          <div className="text-[10px] text-primary font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Directive
          </div>
          <div className="text-xs text-foreground leading-relaxed font-medium">{directive}</div>
        </div>

        {/* Deal Probability */}
        <div className="p-3.5 rounded-lg border border-border bg-muted/30">
          <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-2">Deal Probability</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-foreground tabular-nums">{dealProbability}%</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
                <TrendingUp className="h-3 w-3" /> +8% since call start
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Based on engagement signals</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Quick Actions</div>
          <button
            onClick={onSmsClick}
            className="w-full flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-[12px] font-semibold text-foreground">Send SMS</div>
              <div className="text-[10px] text-muted-foreground">Quick follow-up message</div>
            </div>
          </button>
          <button
            onClick={onEmailClick}
            className="w-full flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
          >
            <Mail className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-[12px] font-semibold text-foreground">Send Email</div>
              <div className="text-[10px] text-muted-foreground">AI-drafted follow-up</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI AGENT MODE OVERLAY
// ============================================================================
function AIAgentHeader({
  scriptName,
  currentStep,
  interruptConfidence,
  onInterrupt,
  onSwitchToHuman,
}: {
  scriptName: string;
  currentStep: string;
  interruptConfidence: number;
  onInterrupt: () => void;
  onSwitchToHuman: () => void;
}) {
  return (
    <div className="px-5 py-3 border-b border-violet-500/20 bg-violet-500/5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 text-[10px] font-bold tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          AI AGENT ACTIVE
        </div>
        <div className="text-[11px] text-muted-foreground">
          Script: <span className="font-semibold text-foreground">{scriptName}</span>
          <span className="mx-2">·</span>
          Step: <span className="font-semibold text-foreground">{currentStep}</span>
          <span className="mx-2">·</span>
          Confidence: <span className="font-semibold text-foreground">{interruptConfidence}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onInterrupt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-600 text-xs font-semibold hover:bg-amber-500/10 transition-colors">
          <AlertTriangle className="h-3 w-3" /> Interrupt
        </button>
        <button onClick={onSwitchToHuman} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/10 transition-colors">
          <Phone className="h-3 w-3" /> Switch to Human
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT: DialerLiveMode
// ============================================================================
export function DialerLiveMode({ callingMode: externalMode, onMessageSent }: { callingMode?: string; onMessageSent?: (data: { contactId: string; contactName: string; channel: 'sms' | 'email'; subject?: string; body: string }) => void }) {
  const callState = useCallState();
  const [aiState, setAiState] = React.useState<AIState>('listening');
  const [callMode, setCallMode] = React.useState<CallMode>(externalMode === 'voice' ? 'ai_agent' : 'human');
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [composerChannel, setComposerChannel] = React.useState<'sms' | 'email'>('sms');
  const [sayThisText, setSayThisText] = React.useState<string | null>(null);

  const contactName = callState.currentContact?.name || 'Unknown';
  const isHumanMode = callMode === 'human';
  const modeBadgeLabel = callMode === 'ai_agent' ? 'Voice Agent' : externalMode === 'listen' ? 'Listen Mode' : 'Human Call';
  const modeBadgeColor = callMode === 'ai_agent' ? 'bg-violet-500/10 text-violet-600' : externalMode === 'listen' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600';

  // Sync external mode on mount
  React.useEffect(() => {
    if (externalMode === 'voice') setCallMode('ai_agent');
    else setCallMode('human');
  }, [externalMode]);

  // Cycle AI states for demo feel
  React.useEffect(() => {
    const states: AIState[] = ['listening', 'analyzing', 'listening', 'objection_detected', 'listening', 'strategy_shift', 'listening', 'high_intent'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setAiState(states[idx]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUseSuggestion = (text: string) => {
    if (isHumanMode) {
      setSayThisText(text);
      toast.success('Loaded into teleprompter — say this to the prospect');
    } else {
      toast.success('Queued as next AI utterance');
    }
  };

  const handleOpenSms = () => {
    setComposerChannel('sms');
    setComposerOpen(true);
  };

  const handleOpenEmail = () => {
    setComposerChannel('email');
    setComposerOpen(true);
  };

  const handleComposerSend = (data: { channel: 'sms' | 'email'; subject?: string; body: string }) => {
    onMessageSent?.({
      contactId: callState.currentContact?.id || '',
      contactName,
      ...data,
    });
  };

  const handleEndCall = () => {
    callState.endCall();
  };

  const handleAITakeOver = () => {
    setCallMode('ai_agent');
    toast.info('AI Agent taking over the call');
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left: Queue */}
      <QueueSidebar queue={MOCK_QUEUE} activeId="q1" />

      {/* Center: Call View */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mode Badge Bar */}
        <div className="px-5 py-2 border-b border-border/50 flex items-center justify-between flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider', modeBadgeColor)}>
              {modeBadgeLabel.toUpperCase()}
            </span>
            {callState.currentContact?.address && (
              <span className="text-[11px] text-muted-foreground">
                📍 {callState.currentContact.address}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={callState.toggleHold}
              className={cn(
                'p-2 rounded-lg border transition-colors text-xs flex items-center gap-1.5',
                callState.isOnHold ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Pause className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{callState.isOnHold ? 'Resume' : 'Hold'}</span>
            </button>
            <button
              onClick={callState.toggleRecording}
              className={cn(
                'p-2 rounded-lg border transition-colors text-xs flex items-center gap-1.5',
                callState.isRecording ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', callState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/30')} />
              <span className="text-[10px] font-semibold">{callState.isRecording ? 'Recording' : 'Record'}</span>
            </button>
          </div>
        </div>

        {/* AI Agent header (shown in AI mode) */}
        {callMode === 'ai_agent' && (
          <AIAgentHeader
            scriptName="Motivated Seller v2"
            currentStep="Value Anchor"
            interruptConfidence={91}
            onInterrupt={() => { setCallMode('human'); toast.info('AI paused — you have control'); }}
            onSwitchToHuman={() => { setCallMode('human'); toast.info('Switched to human mode'); }}
          />
        )}

        <CenterCallView
          contactName={contactName}
          callDuration={callState.callDuration}
          aiState={aiState}
          confidence={82}
          phases={MOCK_PHASES}
          currentStrategy="Empathy → Value Framing → Anchor at $175K"
          transcript={MOCK_TRANSCRIPT}
          suggestions={MOCK_SUGGESTIONS}
          callMode={callMode}
          isMuted={callState.isMuted}
          onMuteToggle={callState.toggleMute}
          onEndCall={handleEndCall}
          onAITakeOver={handleAITakeOver}
          onUseSuggestion={handleUseSuggestion}
          smsComposerOpen={false}
          onSmsComposerToggle={() => {}}
          smsMessage=""
          onSmsChange={() => {}}
          onSmsSend={() => {}}
        />

        {/* "Say This" Teleprompter Bar (Human Mode) */}
        {sayThisText && isHumanMode && (
          <div className="border-t border-primary/20 bg-primary/5 px-5 py-3 flex-shrink-0 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary">SAY THIS</span>
            </div>
            <div className="flex-1 text-[13px] text-foreground font-medium leading-relaxed">{sayThisText}</div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => { navigator.clipboard.writeText(sayThisText); toast.success('Copied to clipboard'); }}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setSayThisText(null)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Strategy Panel OR Composer Drawer */}
      {composerOpen ? (
        <DialerComposerDrawer
          open={composerOpen}
          channel={composerChannel}
          onClose={() => setComposerOpen(false)}
          onChannelChange={setComposerChannel}
          contactName={contactName}
          contactPhone={callState.currentContact?.phone}
          propertyAddress={callState.currentContact?.address}
          onSend={handleComposerSend}
        />
      ) : (
        <StrategyPanel
          sentiment="neutral"
          sentimentScore={45}
          dealProbability={62}
          directive="Lead with empathy on property condition frustration. Mention your ability to close in 14 days with no repairs needed. Present offer range $165K–$180K only after establishing rapport."
          contactName={contactName}
          onSmsClick={handleOpenSms}
          onEmailClick={handleOpenEmail}
        />
      )}
    </div>
  );
}
