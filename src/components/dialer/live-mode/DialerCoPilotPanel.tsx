import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  ListTodo,
  StickyNote,
  ChevronDown,
  User,
  MapPin,
  Tag,
  Target,
  FileText,
  Lightbulb,
  Shield,
  ArrowRightLeft,
  Headphones,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================
export interface DialerContact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  type?: string;
  tags?: string[];
  leadScore?: number;
}

export interface ScriptDetail {
  id: string;
  name: string;
  opening?: string;
  questions?: string[];
  objections?: Array<{ objection: string; response: string }>;
  closing?: string;
}

type CallingMode = 'start' | 'voice' | 'listen';
type CallStatus = 'idle' | 'active';

interface DialerCoPilotPanelProps {
  contact: DialerContact | null;
  callingMode: CallingMode;
  callActive: boolean;
  selectedScriptName?: string;
  scripts: Array<{ id: string; name: string }>;
  selectedScriptId: string | null;
  selectedScriptDetail?: ScriptDetail | null;
  onSelectScript: (id: string) => void;
  onManageScripts?: () => void;
  onSms: () => void;
  onEmail: () => void;
}

// ============================================================================
// MOCK GUIDANCE DATA
// ============================================================================
function getPrepGuidance(contact: DialerContact, script?: ScriptDetail | null) {
  const firstName = contact.name.split(' ')[0];
  if (script) {
    return {
      opening: script.opening
        ?.replace(/\{\{name\}\}/g, firstName)
        .replace(/\{\{address\}\}/g, contact.address || 'your property') 
        || `"Hi ${firstName}, got a moment?"`,
      discoveryQuestions: script.questions || ["What's your timeline?", "Have you explored other options?", "What does an ideal outcome look like?"],
      likelyObjections: script.objections || [],
      closing: script.closing?.replace(/\{\{name\}\}/g, firstName) || null,
    };
  }
  return {
    opening: `"Hi ${firstName}, I know you weren't expecting my call — got 30 seconds for me to explain why I'm reaching out about ${contact.address || 'your property'}?"`,
    discoveryQuestions: [
      "What's your timeline for making a decision on the property?",
      "Have you explored any other options so far?",
      "What would an ideal outcome look like for you?",
    ],
    likelyObjections: [
      { objection: '"I need to think about it"', response: 'Acknowledge, then ask what specifically they need to think through.' },
      { objection: '"Your offer is too low"', response: 'Ask what number they had in mind — let them anchor first.' },
    ],
    closing: null,
  };
}

function getVoiceAgentPlan(contact: DialerContact) {
  return {
    plan: [
      'Introduce as property acquisition specialist',
      `Confirm ownership of ${contact.address || 'property'}`,
      'Assess motivation level and timeline',
      'Present flexible closing options',
      'Attempt to schedule follow-up or set appointment',
    ],
    guardrails: [
      'Do not commit to a specific price',
      'Do not make legal promises',
      'Transfer if prospect becomes hostile',
      'Maximum call duration: 5 minutes',
    ],
    transferConditions: [
      'Prospect requests to speak with a human',
      'High-intent signals detected (ready to sign)',
      'Complex legal questions arise',
      'Emotional distress detected',
    ],
  };
}

function getListenModeInsights(contact: DialerContact) {
  return {
    highlights: [
      'Prospect mentioned frustration with current timeline',
      'Property has been on market for 90+ days',
      'Open to creative financing options',
    ],
    nextSteps: [
      'Send comparable sales data within 24 hours',
      'Schedule in-person walkthrough',
      'Prepare preliminary offer letter',
    ],
    followUpDrafts: [
      `Hi ${contact.name.split(' ')[0]}, great conversation today. I'll have those numbers for ${contact.address || 'your property'} ready by tomorrow.`,
      `Hey ${contact.name.split(' ')[0]}, just wanted to confirm — I'll follow up on Thursday as discussed. Talk soon!`,
    ],
  };
}

// ============================================================================
// COMPONENT
// ============================================================================
export function DialerCoPilotPanel({
  contact,
  callingMode,
  callActive,
  scripts,
  selectedScriptId,
  selectedScriptDetail,
  onSelectScript,
  onManageScripts,
  onSms,
  onEmail,
}: DialerCoPilotPanelProps) {
  const [showScriptDropdown, setShowScriptDropdown] = React.useState(false);

  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  return (
    <div className="w-[400px] border-l border-border flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">AI Command Center</div>
            <div className="text-[11px] text-muted-foreground">Call coaching & live insights</div>
          </div>
        </div>
        {contact && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">AI Active</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!contact ? (
          /* Empty state */
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="h-8 w-8 opacity-30 mx-auto mb-3" />
            <p className="text-[13px] font-medium">Select a contact from the queue</p>
            <p className="text-[11px] mt-1">AI coaching will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1) Contact Snapshot */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5">Contact Snapshot</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-foreground">{contact.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{contact.phone}</span>
                </div>
                {contact.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{contact.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {contact.type && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                      {contact.type}
                    </span>
                  )}
                  {contact.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50">
                      {tag}
                    </span>
                  ))}
                  {contact.leadScore != null && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      contact.leadScore >= 70 ? "bg-emerald-500/10 text-emerald-600" :
                      contact.leadScore >= 40 ? "bg-amber-500/10 text-amber-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      Score: {contact.leadScore}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 1b) Top AI Insight */}
            <TopInsightCard contact={contact} />

            {/* 2) Script in Use */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase">Script In Use</div>
                {onManageScripts && (
                  <button onClick={onManageScripts} className="text-[11px] text-primary font-medium hover:underline">
                    Manage
                  </button>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowScriptDropdown(!showScriptDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background text-[13px] text-foreground hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{selectedScript?.name || 'Select a script...'}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {showScriptDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-background shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
                    {scripts.map(script => (
                      <button
                        key={script.id}
                        onClick={() => {
                          onSelectScript(script.id);
                          setShowScriptDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[12px] hover:bg-muted transition-colors flex items-center gap-2",
                          selectedScriptId === script.id && "bg-primary/5 text-primary font-medium"
                        )}
                      >
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        {script.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3) Live Guidance Panel — content changes by mode + call state */}
            {callingMode === 'start' && !callActive && (
              <PrepGuidance contact={contact} script={selectedScriptDetail} />
            )}
            {callingMode === 'start' && callActive && (
              <LiveSuggestionsPanel contact={contact} />
            )}
            {callingMode === 'voice' && (
              <VoiceAgentPanel contact={contact} callActive={callActive} />
            )}
            {callingMode === 'listen' && (
              <ListenModePanel contact={contact} />
            )}

            {/* 4) Quick Actions */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSms}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Send SMS
                </button>
                <button
                  onClick={onEmail}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Send Email
                </button>
                <button
                  onClick={() => toast.info('Follow-up task created')}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <ListTodo className="h-3.5 w-3.5 text-primary" />
                  Follow-Up Task
                </button>
                <button
                  onClick={() => toast.info('Notes panel opened')}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <StickyNote className="h-3.5 w-3.5 text-primary" />
                  Add Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-PANELS
// ============================================================================

/** Before call in Start Call mode */
function PrepGuidance({ contact, script }: { contact: DialerContact; script?: ScriptDetail | null }) {
  const guidance = getPrepGuidance(contact, script);
  return (
    <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
      <div className="text-[11px] text-primary font-semibold tracking-wider uppercase flex items-center gap-1.5">
        <Lightbulb className="h-3 w-3" /> Call Prep
      </div>

      <div>
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Opening Line</div>
        <div className="text-xs text-foreground leading-relaxed italic bg-background/60 rounded-md p-2.5 border border-border/30">
          {guidance.opening}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Key Questions</div>
        <div className="space-y-1.5">
          {guidance.discoveryQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{q}</span>
            </div>
          ))}
        </div>
      </div>

      {guidance.likelyObjections.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Objection Handlers</div>
          <div className="space-y-1.5">
            {guidance.likelyObjections.map((obj, i) => (
              <div key={i} className="p-2 bg-background rounded-md border border-border/50">
                <div className="text-[11px] font-semibold text-destructive/80 mb-0.5">{obj.objection}</div>
                <div className="text-[11px] text-muted-foreground">{obj.response}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {guidance.closing && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Closing Line</div>
          <div className="text-xs text-foreground leading-relaxed italic bg-background/60 rounded-md p-2.5 border border-border/30">
            {guidance.closing}
          </div>
        </div>
      )}
    </div>
  );
}

/** During call in Start Call mode — real-time suggestion stack */
function LiveSuggestionsPanel({ contact }: { contact: DialerContact }) {
  const firstName = contact.name.split(' ')[0];
  const suggestions = [
    { type: 'question' as const, text: `${firstName}, what would need to happen for you to feel confident moving forward this week?`, confidence: 89 },
    { type: 'response' as const, text: `I completely understand. Most sellers I work with felt the same way at first — let me share what changed their mind.`, confidence: 84 },
    { type: 'coach' as const, text: `Mirror their frustration before transitioning. Use: "That sounds really stressful — I can see why you'd want this resolved."`, confidence: 92 },
    { type: 'question' as const, text: `Have you gotten any other offers on the property so far?`, confidence: 78 },
  ];

  const typeStyles = {
    question: { label: 'Question', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
    response: { label: 'Response', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
    coach: { label: 'Coach', color: 'text-muted-foreground bg-muted border-border/50' },
  };

  return (
    <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/20 space-y-2.5">
      <div className="text-[11px] text-primary font-semibold tracking-wider uppercase flex items-center gap-1.5">
        <Target className="h-3 w-3" /> Live Suggestions
      </div>
      {suggestions.map((s, i) => {
        const style = typeStyles[s.type];
        return (
          <div key={i} className={cn("p-2.5 rounded-lg border", style.color)}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">{style.label}</span>
              <span className="text-[10px] font-semibold opacity-60">{s.confidence}%</span>
            </div>
            <div className="text-[11px] leading-relaxed">{s.text}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Voice Agent mode */
function VoiceAgentPanel({ contact, callActive }: { contact: DialerContact; callActive: boolean }) {
  const plan = getVoiceAgentPlan(contact);
  return (
    <div className="space-y-3">
      <div className="p-3.5 bg-violet-500/5 rounded-lg border border-violet-500/20">
        <div className="text-[11px] text-violet-600 font-semibold tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <ClipboardList className="h-3 w-3" /> Agent Plan
        </div>
        <div className="space-y-1.5">
          {plan.plan.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/10 text-violet-600 flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
        <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <Shield className="h-3 w-3" /> Guardrails
        </div>
        <div className="space-y-1.5">
          {plan.guardrails.map((g, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-destructive/70">
              <span className="mt-1 flex-shrink-0">•</span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
        <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <ArrowRightLeft className="h-3 w-3" /> Transfer Conditions
        </div>
        <div className="space-y-1.5">
          {plan.transferConditions.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="mt-1 flex-shrink-0 text-primary">→</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Listen mode */
function ListenModePanel({ contact }: { contact: DialerContact }) {
  const insights = getListenModeInsights(contact);
  return (
    <div className="space-y-3">
      <div className="p-3.5 bg-blue-500/5 rounded-lg border border-blue-500/20">
        <div className="text-[11px] text-blue-600 font-semibold tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <Headphones className="h-3 w-3" /> Highlights
        </div>
        <div className="space-y-1.5">
          {insights.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="mt-1 flex-shrink-0 text-blue-500">•</span>
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
        <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2">Next Steps</div>
        <div className="space-y-1.5">
          {insights.nextSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
        <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2">Follow-Up Drafts</div>
        <div className="space-y-1.5">
          {insights.followUpDrafts.map((draft, i) => (
            <button
              key={i}
              onClick={() => {
                navigator.clipboard.writeText(draft);
                toast.success('Draft copied to clipboard');
              }}
              className="w-full text-left p-2.5 rounded-lg border border-border/50 bg-background hover:border-primary/30 transition-colors text-[11px] text-muted-foreground leading-relaxed"
            >
              {draft}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TOP INSIGHT CARD — surfaces one key AI insight in the Command Center
// ============================================================================
function getTopInsight(contact: DialerContact): { label: string; text: string; type: 'opportunity' | 'warning' | 'info' } {
  const score = contact.leadScore ?? 50;
  if (score >= 70) {
    return {
      label: 'High-Value Lead',
      text: `${contact.name.split(' ')[0]} shows strong motivation signals. Lead directly with your best offer and emphasize speed-to-close.`,
      type: 'opportunity',
    };
  }
  if (contact.tags?.includes('Expired') || contact.tags?.includes('Pre-foreclosure')) {
    return {
      label: 'Time-Sensitive',
      text: `This is a distress signal — approach with empathy first. Ask about their timeline before discussing price.`,
      type: 'warning',
    };
  }
  if (contact.type === 'Absentee Owner') {
    return {
      label: 'Absentee Owner',
      text: `Remote owners often prioritize convenience over price. Highlight your ability to handle everything remotely.`,
      type: 'info',
    };
  }
  return {
    label: 'Suggested Approach',
    text: `Build rapport first — ${contact.name.split(' ')[0]} hasn't been contacted recently. A warm, consultative opener will work best.`,
    type: 'info',
  };
}

function TopInsightCard({ contact }: { contact: DialerContact }) {
  const insight = getTopInsight(contact);
  const colors = {
    opportunity: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
    info: 'bg-primary/5 border-primary/20 text-primary',
  };

  return (
    <div className={cn('p-3 rounded-lg border', colors[insight.type])}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{insight.label}</span>
      </div>
      <p className="text-[12px] leading-relaxed text-foreground/80">{insight.text}</p>
    </div>
  );
}
