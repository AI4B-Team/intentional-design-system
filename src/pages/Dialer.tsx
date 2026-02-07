import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useDialer } from "@/hooks/useDialer";
import { useDialerCopilot } from "@/hooks/useDialerCopilot";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DialerStatsBar,
  QueueSelector,
  CurrentContactCard,
  DialerControls,
  CallScriptPanel,
  DispositionPanel,
  AutoDialCountdown,
} from "@/components/dialer";
import { DialerDashboard } from "@/components/dialer/dashboard";
import { DialerCopilotPanel, type CallMode, type ContactContext } from "@/components/dialer/copilot";
import { ActiveCallView, type TranscriptMessage, type CallPhase } from "@/components/dialer/active-call";
import { Plus, Settings, Clock, ArrowLeft, Sparkles } from "lucide-react";

interface SessionStats {
  callsMade: number;
  contactsReached: number;
  appointmentsSet: number;
  totalTalkTime: number;
  sessionDuration: number;
}

type DialerView = 'dashboard' | 'calling';

export default function Dialer() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const dialer = useDialer();
  const copilot = useDialerCopilot();

  // View state
  const [currentView, setCurrentView] = React.useState<DialerView>('dashboard');
  
  // Call mode state
  const [callMode, setCallMode] = React.useState<CallMode>('listen_mode');

  // Session state
  const [sessionStartTime, setSessionStartTime] = React.useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = React.useState(0);
  const [selectedQueueId, setSelectedQueueId] = React.useState<string | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [showDisposition, setShowDisposition] = React.useState(false);
  const [showKeypad, setShowKeypad] = React.useState(false);
  const [callNotes, setCallNotes] = React.useState("");
  const [isMuted, setIsMuted] = React.useState(false);
  const [isOnHold, setIsOnHold] = React.useState(false);
  const [showCountdown, setShowCountdown] = React.useState(false);
  const [autoDialEnabled, setAutoDialEnabled] = React.useState(true);
  const [autoDialDelay, setAutoDialDelay] = React.useState(3);
  const [nextContact, setNextContact] = React.useState<any>(null);
  const [liveTranscript, setLiveTranscript] = React.useState("");
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(true);
  const [demoDuration, setDemoDuration] = React.useState(18);
  
  // Mock transcript messages for demo
  const [transcriptMessages, setTranscriptMessages] = React.useState<TranscriptMessage[]>([]);
  
  // Call phases
  const [callPhases] = React.useState<CallPhase[]>([
    { id: '1', name: 'Pattern Interrupt', status: 'completed', duration: '02:30' },
    { id: '2', name: 'Permission', status: 'completed', duration: '00:08' },
    { id: '3', name: 'Value Prop', status: 'current', duration: '0:00' },
    { id: '4', name: 'Qualification', status: 'pending', duration: '0:00' },
    { id: '5', name: 'Close for Next Step', status: 'pending', duration: '0:00' },
  ]);
  // Session stats
  const [stats, setStats] = React.useState<SessionStats>({
    callsMade: 0,
    contactsReached: 0,
    appointmentsSet: 0,
    totalTalkTime: 0,
    sessionDuration: 0,
  });

  // Fetch current script for selected queue
  const { data: currentScript } = useQuery({
    queryKey: ["call-script", selectedQueueId],
    queryFn: async () => {
      if (!selectedQueueId) return null;

      // Get queue to find script ID
      const { data: queue } = await supabase
        .from("call_queues")
        .select("call_script_id")
        .eq("id", selectedQueueId)
        .single();

      if (!queue?.call_script_id) {
        // Get default script
        const { data: defaultScript } = await supabase
          .from("call_scripts")
          .select("*")
          .eq("is_default", true)
          .maybeSingle();
        return defaultScript;
      }

      const { data: script } = await supabase
        .from("call_scripts")
        .select("*")
        .eq("id", queue.call_script_id)
        .single();

      return script;
    },
    enabled: !!selectedQueueId,
  });

  // Initialize dialer on mount
  React.useEffect(() => {
    dialer.initialize();
  }, []);

  // Session timer
  React.useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Demo mode timer
  React.useEffect(() => {
    if (!demoMode) return;

    const interval = setInterval(() => {
      setDemoDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [demoMode]);
  // Show disposition panel when call ends
  React.useEffect(() => {
    if (
      dialer.callStatus === "completed" ||
      dialer.callStatus === "busy" ||
      dialer.callStatus === "no-answer"
    ) {
      setShowDisposition(true);
      copilot.setPhase('after');
    }
  }, [dialer.callStatus]);

  // Update copilot phase and populate demo transcript when call starts
  React.useEffect(() => {
    if (dialer.isOnCall) {
      copilot.setPhase('during');
      // Add demo transcript messages
      setTranscriptMessages([
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
          speakerName: dialer.currentContact?.contact_name?.split(' ')[0] || 'Prospect',
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
          speakerName: dialer.currentContact?.contact_name?.split(' ')[0] || 'Prospect',
          text: "Yeah, I still need to sell. It's been sitting for a while and I'm getting frustrated honestly.",
          timestamp: '00:45',
          confidence: 89,
        },
      ]);
    } else if (!showDisposition) {
      copilot.setPhase('before');
      setTranscriptMessages([]);
    }
  }, [dialer.isOnCall, showDisposition]);

  // Fetch briefing when contact changes
  React.useEffect(() => {
    if (dialer.currentContact) {
      const context: ContactContext = {
        contactName: dialer.currentContact.contact_name,
        propertyAddress: dialer.currentContact.property_address,
        lastContactDate: undefined,
        lastOffer: undefined,
        arv: undefined,
        equity: undefined,
        motivation: undefined,
        callHistory: [],
      };
      copilot.fetchBriefing(context);
    }
  }, [dialer.currentContact?.id]);

  // Periodically refresh suggestions during call
  React.useEffect(() => {
    if (!dialer.isOnCall) return;

    const interval = setInterval(() => {
      if (dialer.currentContact) {
        const context: ContactContext = {
          contactName: dialer.currentContact.contact_name,
          propertyAddress: dialer.currentContact.property_address,
        };
        copilot.fetchSuggestions(context, liveTranscript);
        copilot.analyzeSentiment(liveTranscript);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [dialer.isOnCall, liveTranscript]);

  // Build contact context for copilot
  const getContactContext = (): ContactContext => ({
    contactName: dialer.currentContact?.contact_name,
    propertyAddress: dialer.currentContact?.property_address,
    lastContactDate: undefined,
  });

  // Handle objection from copilot
  const handleObjectionSubmit = (text: string) => {
    copilot.handleObjection(text, getContactContext());
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    toast.info(`Suggestion: ${text}`);
  };

  // Refresh suggestions manually
  const handleRefreshSuggestions = () => {
    copilot.fetchSuggestions(getContactContext(), liveTranscript);
  };

  // Post-call actions
  const handleCreateTask = (task: any) => {
    toast.success(`Task created: ${task.title}`);
  };

  const handleSendSms = (message: string) => {
    toast.success("SMS queued for sending");
  };

  const handleSendEmail = (email: { subject: string; body: string }) => {
    toast.success("Email draft created");
  };

  const handleUpdateStage = (stage: string) => {
    toast.success(`Stage updated to: ${stage}`);
  };

  // Format session time
  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (dialer.isOnCall) {
      return { emoji: "🟡", text: "On Call", color: "text-warning" };
    }
    if (dialer.isReady) {
      return { emoji: "🟢", text: "Ready", color: "text-success" };
    }
    return { emoji: "🔴", text: "Not Ready", color: "text-destructive" };
  };

  const statusIndicator = getStatusIndicator();

  // Handle mode selection from dashboard
  const handleModeSelect = (mode: 'start_call' | 'voice_agent' | 'listen_mode') => {
    if (mode === 'start_call') {
      setCallMode('listen_mode');
    } else if (mode === 'voice_agent') {
      setCallMode('voice_agent');
    } else {
      setCallMode('listen_mode');
    }
    setCurrentView('calling');
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
  };

  // Handle start calling
  const handleStartCalling = async () => {
    if (!selectedQueueId) {
      toast.error("Please select a queue first");
      return;
    }

    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }

    const contact = await dialer.getNextContact(selectedQueueId);
    if (!contact) {
      toast.info("No more contacts in this queue");
      return;
    }

    handleMakeCall();
  };

  // Handle make call
  const handleMakeCall = async () => {
    if (!dialer.currentContact) return;

    const result = await dialer.makeCall({
      phoneNumber: dialer.currentContact.phone_number,
      contactName: dialer.currentContact.contact_name,
      queueId: dialer.currentContact.queue_id,
      queueContactId: dialer.currentContact.id,
      propertyId: dialer.currentContact.property_id,
    });

    if (result) {
      setStats((prev) => ({ ...prev, callsMade: prev.callsMade + 1 }));
    }
  };

  // Handle disposition save
  const handleDispositionSave = async (
    dispositionId: string,
    notes: string,
    followUpDate?: string,
    continueDialing?: boolean
  ) => {
    await dialer.setDisposition(dispositionId, notes, followUpDate);

    const { data: disposition } = await supabase
      .from("call_dispositions")
      .select("marks_as_success, name")
      .eq("id", dispositionId)
      .single();

    if (disposition?.marks_as_success) {
      setStats((prev) => ({ ...prev, contactsReached: prev.contactsReached + 1 }));
    }

    if (disposition?.name === "Appointment Set") {
      setStats((prev) => ({ ...prev, appointmentsSet: prev.appointmentsSet + 1 }));
    }

    setStats((prev) => ({
      ...prev,
      totalTalkTime: prev.totalTalkTime + dialer.callDuration,
    }));

    setShowDisposition(false);
    setCallNotes("");

    if (continueDialing && autoDialEnabled && selectedQueueId) {
      const next = await dialer.getNextContact(selectedQueueId);
      if (next) {
        setNextContact(next);
        setShowCountdown(true);
      } else {
        toast.success("Queue complete! 🎉");
      }
    }
  };

  // Handle auto-dial countdown complete
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setNextContact(null);
    handleMakeCall();
  };

  // Handle skip contact
  const handleSkipContact = async () => {
    if (!selectedQueueId) return;
    await dialer.skipContact();
    const next = await dialer.getNextContact(selectedQueueId);
    if (!next) {
      toast.info("No more contacts in queue");
    }
  };

  // Merge data for script
  const mergeData = {
    owner_name: dialer.currentContact?.contact_name || "",
    owner_first_name: dialer.currentContact?.contact_name?.split(" ")[0] || "",
    property_address: dialer.currentContact?.property_address || "",
    your_name: user?.user_metadata?.full_name || "Investor",
    your_company: "Your Company",
    your_phone: "",
  };

  // Demo contact for the active call view
  const activeContactName = demoMode ? 'Marcus Williams' : (dialer.currentContact?.contact_name || 'Marcus Williams');
  const activeContactSubtitle = demoMode ? 'Motivated Seller • 1847 Maple Street' : `Motivated Seller • ${dialer.currentContact?.property_address || '1847 Maple Street'}`;
  const activeCallDuration = demoMode ? demoDuration : dialer.callDuration;
  const isActiveCall = dialer.isOnCall || demoMode;

  // Default transcript for demo
  const defaultTranscript: TranscriptMessage[] = [
    { id: '1', speaker: 'user', text: "Hey, I know you weren't expecting this call. Got 30 seconds for me to explain why I'm reaching out?", timestamp: '00:00', confidence: 93 },
    { id: '2', speaker: 'prospect', speakerName: 'Marcus', text: "Uh... I'm pretty slammed right now. What is this about?", timestamp: '00:04', confidence: 88 },
    { id: '3', speaker: 'user', text: "Fair enough, I'll be quick. I noticed you have a property on Maple Street. Are you still looking to sell, or has your situation changed?", timestamp: '00:30', confidence: 91 },
    { id: '4', speaker: 'prospect', speakerName: 'Marcus', text: "Yeah, I still need to sell. It's been sitting for a while and I'm getting frustrated honestly.", timestamp: '00:45', confidence: 89 },
  ];

  // Always show the active call view as the main interface
  return (
    <PageLayout title="Dialer">
      <ActiveCallView
        contactName={activeContactName}
        contactSubtitle={activeContactSubtitle}
        callType="Outbound Sales"
        callDuration={activeCallDuration}
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onSpeakerToggle={() => setIsSpeakerOn(!isSpeakerOn)}
        onTransfer={() => toast.info('Transfer coming soon')}
        onEndCall={() => {
          if (demoMode) {
            setDemoMode(false);
          } else {
            dialer.endCall();
          }
        }}
        transcript={isActiveCall ? (demoMode ? defaultTranscript : transcriptMessages) : defaultTranscript}
        phases={callPhases}
        currentPhaseId="3"
        onNextPhase={() => toast.info('Advancing to next phase')}
      />

      {/* Disposition Panel */}
      <DispositionPanel
        open={showDisposition}
        onOpenChange={setShowDisposition}
        onSave={handleDispositionSave}
      />

      {/* Auto-dial Countdown */}
      {showCountdown && (
        <AutoDialCountdown
          seconds={autoDialDelay}
          contactName={nextContact?.contact_name}
          onCancel={() => {
            setShowCountdown(false);
            setNextContact(null);
          }}
          onComplete={handleCountdownComplete}
        />
      )}
    </PageLayout>
  );
}
