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
import { Plus, Settings, Clock, ArrowLeft } from "lucide-react";

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

  // Update copilot phase based on call state
  React.useEffect(() => {
    if (dialer.isOnCall) {
      copilot.setPhase('during');
    } else if (!showDisposition) {
      copilot.setPhase('before');
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

  // Show dashboard view
  if (currentView === 'dashboard') {
    return (
      <PageLayout title="Dialer">
        <DialerDashboard 
          onStartCall={() => setCurrentView('calling')}
          onSelectMode={handleModeSelect}
        />
      </PageLayout>
    );
  }

  // Show calling view
  return (
    <PageLayout
      title="Power Dialer"
      headerActions={
        <div className="flex items-center gap-4">
          {/* Back to Dashboard */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentView('dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusIndicator.emoji}</span>
            <span className={cn("font-medium", statusIndicator.color)}>
              {statusIndicator.text}
            </span>
          </div>

          {/* Session Timer */}
          {sessionStartTime && (
            <Badge variant="secondary" className="gap-2 text-body">
              <Clock className="h-4 w-4" />
              Session: {formatSessionTime(sessionDuration)}
            </Badge>
          )}

          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Queue
          </Button>
        </div>
      }
    >
      {/* Stats Bar */}
      <DialerStatsBar
        callsMade={stats.callsMade}
        contactsReached={stats.contactsReached}
        appointmentsSet={stats.appointmentsSet}
        totalTalkTime={stats.totalTalkTime}
        sessionDuration={sessionDuration}
      />

      {/* Main Content - 3 Column Layout */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column - Queue & Contact */}
        <div className="lg:col-span-3 space-y-6">
          {/* Queue Selector */}
          <QueueSelector
            selectedQueueId={selectedQueueId}
            onQueueChange={setSelectedQueueId}
            onCreateQueue={() => toast.info("Create queue coming soon")}
            onPauseQueue={() => setIsPaused(!isPaused)}
            onSkipContact={handleSkipContact}
            isPaused={isPaused}
            isOnCall={dialer.isOnCall}
          />

          {/* Current Contact Card */}
          <CurrentContactCard
            contact={dialer.currentContact}
            onStartCalling={handleStartCalling}
          />

          {/* Auto-dial Settings */}
          <div className="bg-white border border-border-subtle rounded-medium p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground text-small">
                  Dialer Settings
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-dial" className="text-small">
                Auto-dial next contact
              </Label>
              <Switch
                id="auto-dial"
                checked={autoDialEnabled}
                onCheckedChange={setAutoDialEnabled}
              />
            </div>
            {autoDialEnabled && (
              <div className="flex items-center justify-between">
                <Label className="text-small">Delay between calls</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoDialDelay(Math.max(1, autoDialDelay - 1))}
                    disabled={autoDialDelay <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{autoDialDelay}s</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoDialDelay(Math.min(10, autoDialDelay + 1))}
                    disabled={autoDialDelay >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column - Dialer & Script */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dialer Controls */}
          <DialerControls
            phoneNumber={dialer.currentContact?.phone_number || ""}
            contactName={dialer.currentContact?.contact_name}
            callStatus={dialer.callStatus}
            callDuration={dialer.callDuration}
            onCall={handleMakeCall}
            onEndCall={dialer.endCall}
            onMuteToggle={() => setIsMuted(!isMuted)}
            onHoldToggle={() => setIsOnHold(!isOnHold)}
            isMuted={isMuted}
            isOnHold={isOnHold}
            showKeypad={showKeypad}
            onKeypadToggle={() => setShowKeypad(!showKeypad)}
          />

          {/* Script Panel */}
          <CallScriptPanel
            script={currentScript}
            mergeData={mergeData}
            notes={callNotes}
            onNotesChange={setCallNotes}
          />
        </div>

        {/* Right Column - AI Copilot */}
        <div className="lg:col-span-4 space-y-6">
          <DialerCopilotPanel
            phase={copilot.phase}
            callMode={callMode}
            onCallModeChange={setCallMode}
            briefing={copilot.briefing}
            suggestions={copilot.suggestions}
            objectionResponse={copilot.objectionResponse}
            sentiment={copilot.sentiment}
            postCallActions={copilot.postCallActions}
            isLoading={copilot.isLoading}
            contactName={dialer.currentContact?.contact_name}
            isOnCall={dialer.isOnCall}
            onObjectionSubmit={handleObjectionSubmit}
            onClearObjection={copilot.clearObjection}
            onSuggestionClick={handleSuggestionClick}
            onRefreshSuggestions={handleRefreshSuggestions}
            onCreateTask={handleCreateTask}
            onSendSms={handleSendSms}
            onSendEmail={handleSendEmail}
            onUpdateStage={handleUpdateStage}
          />
        </div>
      </div>

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
