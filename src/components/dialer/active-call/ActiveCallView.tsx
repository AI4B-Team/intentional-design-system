import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import {
  LiveCallHeader,
  LiveTranscript,
  CallStructurePanel,
  SmartSuggestions,
  type TranscriptMessage,
  type CallPhase,
} from './index';

interface ActiveCallViewProps {
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
  currentPhaseId?: string;
  onNextPhase?: () => void;
}

export function ActiveCallView({
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
  currentPhaseId,
  onNextPhase,
}: ActiveCallViewProps) {
  // Mock data for demo - in real app these would come from props/hooks
  const [sentiment] = React.useState({ label: 'Neutral', value: 35 });
  const [suggestions] = React.useState([
    {
      id: '1',
      type: 'response' as const,
      text: "I can definitely hear the frustration in your voice, and honestly, that's exactly why I reached out. You've got a great property, it shouldn't be sitting there collecting dust.",
      reasoning: "Empathizes with the prospect's frustration to build rapport before moving to the 'why'.",
      confidence: 95,
    },
  ]);
  const [stats] = React.useState({
    objections: 3,
    talkRatio: 85,
    nextSteps: 2,
  });

  const callTemplate = {
    name: 'Outbound Sales',
    category: 'sales',
    description: 'Generate interest and book next steps',
  };

  const handleUseSuggestion = (_suggestion: any) => {
    // TODO: implement suggestion usage (e.g. populate input field)
  };

  const handleCopySuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <LiveCallHeader
        contactName={contactName}
        subtitle={contactSubtitle}
        callType={callType}
        callDuration={callDuration}
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        onMuteToggle={onMuteToggle}
        onSpeakerToggle={onSpeakerToggle}
        onTransfer={onTransfer}
        onEndCall={onEndCall}
        sentiment={sentiment}
      />

      {/* Main Content - 2 Column Layout */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Left Column - Transcript */}
        <div className="lg:col-span-7">
          <LiveTranscript
            messages={transcript}
            isListening={true}
            userName="You"
            prospectName={contactName.split(' ')[0]}
          />
        </div>

        {/* Right Column - AI Co-Pilot */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Co-Pilot Header */}
          <div className="bg-white border border-border-subtle rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">AI Co-Pilot</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time suggestions and guidance</p>
          </div>

          {/* Call Structure */}
          <CallStructurePanel
            phases={phases}
            currentPhaseId={currentPhaseId}
            onNextPhase={onNextPhase}
            onSwitchTemplate={() => console.log('Switch template')}
            callTemplate={callTemplate}
          />

          {/* Smart Suggestions */}
          <SmartSuggestions
            suggestions={suggestions}
            stats={stats}
            onUseSuggestion={handleUseSuggestion}
            onCopySuggestion={handleCopySuggestion}
            onRefresh={() => console.log('Refresh suggestions')}
          />
        </div>
      </div>
    </div>
  );
}
