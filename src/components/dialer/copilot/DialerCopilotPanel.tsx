import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  GraduationCap,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CopilotBeforeCall } from './CopilotBeforeCall';
import { CopilotDuringCall } from './CopilotDuringCall';
import { CopilotAfterCall } from './CopilotAfterCall';
import { CallModeSelector } from './CallModeSelector';
import { CopilotTemplatesTab } from './tabs/CopilotTemplatesTab';
import { CopilotKnowledgeTab } from './tabs/CopilotKnowledgeTab';
import { CopilotPracticeTab } from './tabs/CopilotPracticeTab';
import type { 
  ContactContext, 
  BriefingData, 
  SuggestionsData, 
  ObjectionData, 
  SentimentData,
  PostCallData,
  CallMode,
  CopilotPhase,
} from './types';

interface DialerCopilotPanelProps {
  phase: CopilotPhase;
  callMode: CallMode;
  onCallModeChange: (mode: CallMode) => void;
  briefing: BriefingData | null;
  suggestions: SuggestionsData | null;
  objectionResponse: ObjectionData | null;
  sentiment: SentimentData | null;
  postCallActions: PostCallData | null;
  isLoading: boolean;
  contactName?: string;
  isOnCall?: boolean;
  onObjectionSubmit: (text: string) => void;
  onClearObjection: () => void;
  onSuggestionClick?: (text: string) => void;
  onRefreshSuggestions?: () => void;
  onCreateTask?: (task: PostCallData['followUpTask']) => void;
  onSendSms?: (message: string) => void;
  onSendEmail?: (email: { subject: string; body: string }) => void;
  onUpdateStage?: (stage: string) => void;
}

export function DialerCopilotPanel({
  phase,
  callMode,
  onCallModeChange,
  briefing,
  suggestions,
  objectionResponse,
  sentiment,
  postCallActions,
  isLoading,
  contactName,
  isOnCall,
  onObjectionSubmit,
  onClearObjection,
  onSuggestionClick,
  onRefreshSuggestions,
  onCreateTask,
  onSendSms,
  onSendEmail,
  onUpdateStage,
}: DialerCopilotPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'copilot' | 'templates' | 'knowledge' | 'practice'>('copilot');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="bg-white border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">AI Copilot</span>
          <Badge variant="default" className="bg-primary/20 text-primary text-[10px]">
            {phase === 'before' ? 'Pre-Call' : phase === 'during' ? 'Live' : 'Post-Call'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 w-7 p-0"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-border-subtle">
            <div className="flex px-2">
              {[
                { id: 'copilot', label: 'Copilot', icon: Sparkles },
                { id: 'templates', label: 'Templates', icon: BookOpen },
                { id: 'knowledge', label: 'Knowledge', icon: GraduationCap },
                { id: 'practice', label: 'Practice', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {activeTab === 'copilot' && (
              <>
                {/* Call Mode Selector - only show before call */}
                {phase === 'before' && (
                  <CallModeSelector
                    mode={callMode}
                    onModeChange={onCallModeChange}
                    disabled={isOnCall}
                  />
                )}

                {/* Phase-specific content */}
                {phase === 'before' && (
                  <CopilotBeforeCall
                    briefing={briefing}
                    isLoading={isLoading}
                    contactName={contactName}
                  />
                )}

                {phase === 'during' && (
                  <CopilotDuringCall
                    suggestions={suggestions}
                    objectionResponse={objectionResponse}
                    sentiment={sentiment}
                    isLoading={isLoading}
                    onObjectionSubmit={onObjectionSubmit}
                    onClearObjection={onClearObjection}
                    onSuggestionClick={onSuggestionClick}
                    onRefreshSuggestions={onRefreshSuggestions}
                  />
                )}

                {phase === 'after' && (
                  <CopilotAfterCall
                    postCallActions={postCallActions}
                    isLoading={isLoading}
                    onCreateTask={onCreateTask}
                    onSendSms={onSendSms}
                    onSendEmail={onSendEmail}
                    onUpdateStage={onUpdateStage}
                  />
                )}
              </>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Quick conversation templates</p>
                {[
                  { label: 'Opening - Cold Lead', category: 'Opening' },
                  { label: 'Opening - Warm Lead', category: 'Opening' },
                  { label: 'Price Discovery', category: 'Discovery' },
                  { label: 'Motivation Questions', category: 'Discovery' },
                  { label: 'Seller Financing Pitch', category: 'Negotiation' },
                  { label: 'Subject-To Explanation', category: 'Negotiation' },
                  { label: 'Close - Set Appointment', category: 'Closing' },
                  { label: 'Close - Send Offer', category: 'Closing' },
                ].map((template, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-3 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{template.label}</span>
                      <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Train the AI on your processes</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Company Info', count: 3 },
                    { label: 'Pricing Rules', count: 5 },
                    { label: 'Market Data', count: 12 },
                    { label: 'Scripts', count: 8 },
                  ].map((kb, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border-subtle bg-muted/30">
                      <p className="text-sm font-medium">{kb.label}</p>
                      <p className="text-xs text-muted-foreground">{kb.count} documents</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Knowledge Base
                </Button>
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Practice with AI role-play</p>
                <div className="grid gap-3">
                  {[
                    { scenario: 'Cold Call - Absentee Owner', difficulty: 'Easy' },
                    { scenario: 'Handling "Too Low" Objection', difficulty: 'Medium' },
                    { scenario: 'Negotiating with Agent', difficulty: 'Hard' },
                    { scenario: 'Subject-To Pitch', difficulty: 'Medium' },
                  ].map((practice, i) => (
                    <button
                      key={i}
                      className="w-full text-left p-3 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{practice.scenario}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px]",
                            practice.difficulty === 'Easy' && "border-success/50 text-success",
                            practice.difficulty === 'Medium' && "border-warning/50 text-warning",
                            practice.difficulty === 'Hard' && "border-destructive/50 text-destructive"
                          )}
                        >
                          {practice.difficulty}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
                <Button variant="default" className="w-full">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Start Practice Session
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
