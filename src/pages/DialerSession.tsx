import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/page-layout';
import { SessionSidebar, SessionCallView, type TranscriptMessage, type CallPhase } from '@/components/dialer/session';

export default function DialerSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'start_call';

  // Call state
  const [isLive, setIsLive] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(311); // 05:11 in seconds
  const [activeSection, setActiveSection] = React.useState('calls');

  // Demo transcript data matching the reference image
  const [transcript] = React.useState<TranscriptMessage[]>([
    {
      id: '1',
      speaker: 'user',
      text: "Hey, I know you weren't expecting this call. Got 30 seconds for me to explain why I'm reaching out?",
      timestamp: '00:00',
      confidence: 93,
    },
    {
      id: '2',
      speaker: 'prospect',
      speakerName: 'Marcus',
      text: "Uh... I'm pretty slammed right now. What is this about?",
      timestamp: '00:04',
      confidence: 88,
    },
    {
      id: '3',
      speaker: 'user',
      text: "Fair enough, I'll be quick. I noticed you have a property on Maple Street. Are you still looking to sell, or has your situation changed?",
      timestamp: '00:30',
      confidence: 91,
    },
    {
      id: '4',
      speaker: 'prospect',
      speakerName: 'Marcus',
      text: "Yeah, I still need to sell. It's been sitting for a while and I'm getting frustrated honestly.",
      timestamp: '00:45',
      confidence: 89,
    },
  ]);

  // Call phases
  const [phases] = React.useState<CallPhase[]>([
    { id: '1', name: 'Pattern Interrupt', status: 'completed', duration: '02:30' },
    { id: '2', name: 'Permission', status: 'completed', duration: '05:11' },
    { id: '3', name: 'Value Prop', status: 'current', duration: '0:00' },
    { id: '4', name: 'Qualification', status: 'pending', duration: '0:00' },
    { id: '5', name: 'Close for Next Step', status: 'pending', duration: '0:00' },
  ]);

  // Call duration timer
  React.useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleEndCall = () => {
    setIsLive(false);
    toast.success('Call ended');
    // Navigate back to dialer dashboard after a short delay
    setTimeout(() => {
      navigate('/dialer');
    }, 1500);
  };

  const handleLiveCallClick = () => {
    if (!isLive) {
      setIsLive(true);
      setCallDuration(0);
      toast.success('Call started');
    }
  };

  const handleNextPhase = () => {
    toast.info('Advancing to next phase');
  };

  const handleTransfer = () => {
    toast.info('Transfer feature coming soon');
  };

  return (
    <PageLayout fullWidth>
      <div className="flex flex-1 min-h-0 bg-background">
        {/* Left Sidebar - Session specific */}
        <SessionSidebar
          isLive={isLive}
          onLiveCallClick={handleLiveCallClick}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <SessionCallView
          contactName="Marcus Williams"
          contactSubtitle="Motivated Seller • 1847 Maple Street"
          callType="Outbound Sales"
          callDuration={callDuration}
          isMuted={isMuted}
          isSpeakerOn={isSpeakerOn}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onSpeakerToggle={() => setIsSpeakerOn(!isSpeakerOn)}
          onTransfer={handleTransfer}
          onEndCall={handleEndCall}
          transcript={transcript}
          phases={phases}
          onNextPhase={handleNextPhase}
        />
      </div>
    </PageLayout>
  );
}
