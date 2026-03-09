import * as React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallState, type ExecutionMode } from "@/contexts/CallContext";
import { LiveCallInline } from "@/components/calling/LiveCallInline";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDealSources, useUpdateDealSource, useDeleteDealSource } from "@/hooks/useDealSources";
import {
  Phone, MessageCircle, Search, Star, Sparkles, Play, Bot, X, ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  type CallingModeKey, MODE_THEME, EXECUTION_MODE_THEME,
  INITIAL_CONTACTS, type Activity, type Contact,
} from "@/components/communications/comms-config";
import { ViewSwitcher, ChannelFilters, StatusFilters, ChannelToolset } from "@/components/communications/comms-ui-primitives";
import { ContactListItem } from "@/components/communications/ContactListItem";
import { ConversationThread } from "@/components/communications/ConversationThread";
import { CoPilotPanel } from "@/components/communications/CoPilotPanel";
import { DialerView } from "@/components/communications/DialerView";

export default function Communications() {
  const callState = useCallState();
  const navigate = useNavigate();
  const { data: dbContacts = [], isLoading: isLoadingContacts } = useDealSources();
  const updateMutation = useUpdateDealSource();
  const deleteMutation = useDeleteDealSource();
  const [activeView, setActiveView] = useState("activity");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localActivities, setLocalActivities] = useState<Record<string, Activity[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [sendChannel, setSendChannel] = useState("");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [autoSelectedReason, setAutoSelectedReason] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [powerHourConfirmOpen, setPowerHourConfirmOpen] = useState(false);
  const [readinessNudgeDismissed, setReadinessNudgeDismissed] = useState(false);
  const [callingMode, setCallingMode] = useState<CallingModeKey>("start");
  const [focusMode, setFocusMode] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const userInteractedRef = React.useRef(false);
  const modeTheme = MODE_THEME[callingMode];
  const executionModeTheme = EXECUTION_MODE_THEME[callState.executionMode];
  const isPowerHour = callState.executionMode === "power-hour";

  // Handle URL params
  useEffect(() => {
    const view = searchParams.get("view");
    const mode = searchParams.get("mode") as ExecutionMode | null;
    let dirty = false;

    if (view === "dialer") {
      setActiveView("dialer");
      searchParams.delete("view");
      dirty = true;
    }

    if (mode && ["manual", "power-hour", "campaign", "team"].includes(mode)) {
      callState.setExecutionMode(mode);
      if (mode === "power-hour") {
        setActiveView("dialer");
        setFocusMode(true);
      }
      searchParams.delete("mode");
      dirty = true;
    }

    if (dirty) {
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (isPowerHour) setFocusMode(true);
  }, [isPowerHour]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F" && activeView === "dialer") {
        e.preventDefault();
        setFocusMode(f => !f);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeView]);

  const contacts: Contact[] = useMemo(() => {
    if (dbContacts.length === 0) return INITIAL_CONTACTS;

    return dbContacts.map((ds, i) => {
      const initials = ds.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      
      const mockContact = INITIAL_CONTACTS[i % INITIAL_CONTACTS.length];
      const activities = localActivities[ds.id] || mockContact?.activities || [];

      return {
        id: ds.id,
        dbId: ds.id,
        name: ds.name,
        address: ds.address || "No address",
        tag: ds.type ? ds.type.charAt(0).toUpperCase() + ds.type.slice(1) : "Contact",
        avatar: initials,
        sentiment: "neutral",
        lastActivity: ds.last_contact_date 
          ? new Date(ds.last_contact_date).toLocaleDateString() 
          : ds.updated_at 
            ? new Date(ds.updated_at).toLocaleDateString()
            : "—",
        unread: false,
        starred: false,
        activities,
        phone: ds.phone || undefined,
        email: ds.email || undefined,
        city: ds.city || undefined,
        state: ds.state || undefined,
        zip: ds.zip || undefined,
        company: ds.company || undefined,
        contactType: ds.type,
      };
    });
  }, [dbContacts, localActivities]);

  const selectedContact = useMemo(() => contacts.find(c => c.id === selectedContactId) || null, [contacts, selectedContactId]);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (channelFilter !== "all") {
      result = result.filter(c => c.activities.some(a => a.channel === channelFilter));
    }
    if (statusFilter === "unread") result = result.filter(c => c.unread);
    if (statusFilter === "starred") result = result.filter(c => c.starred);
    if (statusFilter === "needs_response") {
      result = result.filter(c => {
        const last = c.activities[c.activities.length - 1];
        return last && last.direction === "inbound";
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    return result;
  }, [contacts, channelFilter, statusFilter, searchQuery]);

  // Auto-select most relevant conversation
  const autoSelectedRef = React.useRef(false);
  useEffect(() => {
    if (autoSelectedRef.current || selectedContactId || contacts.length === 0 || userInteractedRef.current) return;

    let picked: Contact | null = null;
    let reason = "";

    const needsAttention = contacts.find(c => {
      const last = c.activities[c.activities.length - 1];
      return last && last.direction === "inbound";
    });
    if (needsAttention) {
      picked = needsAttention;
      reason = "Needs attention";
    }

    if (!picked) {
      const unread = contacts.find(c => c.unread);
      if (unread) {
        picked = unread;
        reason = "Unread conversation";
      }
    }

    if (!picked && contacts.length > 0) {
      picked = contacts[0];
      reason = "Most recent conversation";
    }

    if (picked) {
      autoSelectedRef.current = true;
      setSelectedContactId(picked.id);
      setAutoSelectedReason(reason);
    }
  }, [contacts, selectedContactId]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedContactId) return;

    const now = new Date();
    const timeStr = `Today ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    const newActivity: Activity = {
      id: `a_${Date.now()}`,
      channel: sendChannel,
      direction: "outbound",
      timestamp: timeStr,
      content: messageInput.trim(),
      sentiment: "neutral",
    };

    setLocalActivities(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || selectedContact?.activities || []), newActivity],
    }));

    toast.success(`${sendChannel.toUpperCase()} sent to ${selectedContact?.name}`);
    setMessageInput("");
  }, [messageInput, selectedContactId, sendChannel, selectedContact?.name]);

  const handleCall = useCallback(() => {
    if (!selectedContact) return;
    setLeftPanelOpen(false);
    callState.startCall({
      id: selectedContact.id,
      name: selectedContact.name,
      phone: selectedContact.phone || "No phone",
      address: selectedContact.address,
    }, "inline");
  }, [selectedContact, callState]);

  const handleQuickReply = useCallback((text: string) => {
    setMessageInput(text);
    toast.info("Quick reply loaded — press Enter to send");
  }, []);

  const handleEditContact = useCallback(() => {
    if (!selectedContact?.dbId) {
      toast.error("This contact cannot be edited (no database link)");
      return;
    }
    navigate(`/contacts/${selectedContact.dbId}`);
  }, [selectedContact, navigate]);

  const handleDeleteContact = useCallback(() => {
    if (!selectedContact?.dbId) {
      toast.error("This contact cannot be deleted (no database link)");
      return;
    }
    setDeleteConfirmOpen(true);
  }, [selectedContact]);

  const confirmDeleteContact = useCallback(() => {
    if (!selectedContact?.dbId) return;
    deleteMutation.mutate(selectedContact.dbId, {
      onSuccess: () => {
        toast.success(`${selectedContact.name} deleted`);
        setSelectedContactId(null);
        setDeleteConfirmOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete contact");
        setDeleteConfirmOpen(false);
      },
    });
  }, [selectedContact, deleteMutation]);

  const handleSelectContact = useCallback((id: string) => {
    userInteractedRef.current = true;
    setSelectedContactId(id);
    setAutoSelectedReason(null);
    setMessageInput("");
  }, []);

  const handleChannelFilter = useCallback((filter: string) => {
    userInteractedRef.current = true;
    setChannelFilter(filter);
    setAutoSelectedReason(null);
  }, []);

  const handleStatusFilter = useCallback((filter: string) => {
    userInteractedRef.current = true;
    setStatusFilter(filter);
    setAutoSelectedReason(null);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    if (q) userInteractedRef.current = true;
    setSearchQuery(q);
    setAutoSelectedReason(null);
  }, []);

  const handleDismissAutoSelect = useCallback(() => {
    setAutoSelectedReason(null);
    setSelectedContactId(null);
  }, []);

  return (
    <AppLayout fullWidth>
      <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
        {/* Top Bar */}
        <div className="px-4 md:px-6 py-3.5 border-b border-border flex items-center justify-between bg-background overflow-x-auto gap-3">
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <h1 className="text-2xl font-bold text-foreground">Communications</h1>
            <ViewSwitcher activeView={activeView} onSwitch={setActiveView} />
            {callState.executionMode !== "manual" && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border",
                executionModeTheme.bg, executionModeTheme.text, executionModeTheme.border,
              )}>
                <executionModeTheme.icon className="h-3 w-3" />
                {executionModeTheme.label}
                <button onClick={() => callState.setExecutionMode("manual")} className="ml-1 hover:opacity-70">
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {callState.isCallActive && (
              <div className="flex items-center gap-3">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse", modeTheme.badge)}>
                  <span className={cn("relative flex h-2 w-2")}>
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", modeTheme.dot)} />
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", modeTheme.dot)} />
                  </span>
                  <span className={modeTheme.badgeText}>{modeTheme.label}</span>
                </div>
                <span className="text-lg font-mono font-bold text-foreground tabular-nums">
                  {String(Math.floor(callState.callDuration / 60)).padStart(2, "0")}:{String(callState.callDuration % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            {(Object.entries(MODE_THEME) as [CallingModeKey, typeof MODE_THEME[CallingModeKey]][]).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  setCallingMode(key);
                  if (key === "voice") toast.info("AI Agent mode — AI handles calls autonomously");
                  if (key === "listen") toast.info("Hybrid mode — AI assists during your calls");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap",
                  callingMode === key
                    ? cn(theme.badge, theme.border, theme.badgeText)
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {key === "start" && <Play className="h-3 w-3" />}
                {key === "listen" && <Sparkles className="h-3 w-3" />}
                {key === "voice" && <Bot className="h-3 w-3" />}
                {key === "start" ? "Human" : key === "listen" ? "Hybrid" : "AI Agent"}
              </button>
            ))}

            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-muted border border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search contacts, messages..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground text-[13px] w-[200px] placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeView === "activity" ? (
            <>
              {/* Left: Contact List */}
              {callState.isCallActive && callState.displayMode === "inline" ? (
                <div className="border-r border-border flex flex-col overflow-hidden bg-background w-[56px] transition-all duration-300">
                  <div className="flex-1 overflow-auto py-1.5">
                    {filteredContacts.map(contact => (
                      <Tooltip key={contact.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSelectContact(contact.id)}
                            className={cn(
                              "relative w-full flex items-center justify-center py-2 transition-all",
                              selectedContactId === contact.id ? "bg-primary/10" : "hover:bg-muted/60"
                            )}
                          >
                            <div className={cn(
                              "relative w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all",
                              selectedContactId === contact.id
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {contact.avatar}
                            </div>
                            {contact.unread && (
                              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                            )}
                            {contact.starred && (
                              <Star className="absolute bottom-1 right-1.5 h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-muted-foreground">{contact.address}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "border-r border-border flex flex-col overflow-hidden bg-background transition-all duration-200",
                  leftPanelOpen ? "hidden md:flex w-full md:w-[420px]" : "w-0"
                )}>
                  {leftPanelOpen && (
                    <>
                      <div className="px-4 py-3.5 border-b border-border flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <ChannelFilters activeFilter={channelFilter} onFilter={handleChannelFilter} />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setLeftPanelOpen(false)}
                                className="p-1 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Minimize Panel</TooltipContent>
                          </Tooltip>
                        </div>
                        <StatusFilters activeStatus={statusFilter} onFilter={handleStatusFilter} />
                      </div>
                      <ChannelToolset channel={channelFilter} />
                      <div className="flex-1 overflow-auto">
                        {filteredContacts.map(contact => (
                          <ContactListItem
                            key={contact.id}
                            contact={contact}
                            isActive={selectedContactId === contact.id}
                            onClick={() => handleSelectContact(contact.id)}
                            onCall={() => {
                              handleSelectContact(contact.id);
                              callState.startCall({
                                id: contact.id,
                                name: contact.name,
                                phone: contact.phone || "No phone",
                                address: contact.address,
                              }, "inline");
                            }}
                            onSms={() => {
                              handleSelectContact(contact.id);
                              setSendChannel("sms");
                              toast.info(`SMS to ${contact.name} — type your message`);
                            }}
                            onCopy={() => {
                              navigator.clipboard.writeText(contact.phone || "");
                              toast.success(`Phone number copied for ${contact.name}`);
                            }}
                          />
                        ))}
                        {filteredContacts.length === 0 && (
                          <div className="py-10 px-5 text-center text-muted-foreground text-[13px]">
                            No conversations match your filters
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!leftPanelOpen && !(callState.isCallActive && callState.displayMode === "inline") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setLeftPanelOpen(true)}
                      className="flex items-center justify-center w-6 border-r border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Expand Panel</TooltipContent>
                </Tooltip>
              )}

              {/* Center: Thread or Live Call */}
              {callState.isCallActive && callState.displayMode === "inline" ? (
                <LiveCallInline
                  callingMode={callingMode}
                  onSmsClick={() => { setSendChannel("sms"); toast.info("Channel set to SMS"); }}
                  onEmailClick={() => { setSendChannel("email"); toast.info("Channel set to Email"); }}
                  onMoreClick={() => {
                    if (selectedContact?.dbId) navigate(`/contacts/${selectedContact.dbId}`);
                    else toast.error("No linked contact to edit");
                  }}
                />
              ) : (
                <ConversationThread
                  contact={selectedContact}
                  onCall={handleCall}
                  onSendMessage={handleSendMessage}
                  messageInput={messageInput}
                  onMessageInputChange={setMessageInput}
                  sendChannel={sendChannel}
                  onSendChannelChange={setSendChannel}
                  autoSelectedReason={autoSelectedReason}
                  onDismissAutoSelect={handleDismissAutoSelect}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  onSwitchToDialer={() => setActiveView("dialer")}
                  onStartPowerHour={() => setPowerHourConfirmOpen(true)}
                />
              )}

              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} callingMode={callingMode} />
            </>
          ) : (
            <>
              <DialerView callingMode={callingMode} setCallingMode={setCallingMode} focusMode={focusMode} isPowerHour={isPowerHour} onToggleFocus={() => setFocusMode(f => !f)} />
              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} callingMode={callingMode} />
            </>
          )}
        </div>
      </div>
      </TooltipProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContact?.name}? This will permanently remove them from your contacts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Power Hour Confirmation Modal */}
      <AlertDialog open={powerHourConfirmOpen} onOpenChange={setPowerHourConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Power Hour Mode
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This will pause notifications and guide you through high-priority calls only.
              <br />
              <span className="font-medium text-foreground mt-2 block">Ready to focus?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                callState.setExecutionMode("power-hour");
                setActiveView("dialer");
                setFocusMode(true);
                setPowerHourConfirmOpen(false);
                toast.success("Power Hour activated — 60 minutes of focused calling");
              }}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Start Power Hour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
