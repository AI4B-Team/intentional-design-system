import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallState } from "@/contexts/CallContext";
import { DailyGoalsTracker } from "@/components/dialer/daily-goals-tracker";
import { PostCallActions } from "@/components/dialer/post-call-actions";
import { CampaignBadge } from "@/components/dialer/campaign-badge";
import { DialerIntelligenceBar } from "@/components/dialer/intelligence";
import { type CallingModeKey, MOCK_DIALER_QUEUE, MOCK_CALL_SCRIPTS } from "./comms-config";
import {
  Phone, Play, Mic, ChevronRight, Upload, Plus, Download,
  Trash2, FolderOpen, UserPlus, X, Target, Zap,
} from "lucide-react";
import { toast } from "sonner";

interface DialerViewProps {
  callingMode: CallingModeKey;
  setCallingMode: (m: CallingModeKey) => void;
  focusMode?: boolean;
  isPowerHour?: boolean;
  onToggleFocus?: () => void;
}

export function DialerView({ callingMode, setCallingMode, focusMode = false, isPowerHour = false, onToggleFocus }: DialerViewProps) {
  const callState = useCallState();
  const navigate = useNavigate();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [dialerContacts, setDialerContacts] = useState(MOCK_DIALER_QUEUE);
  const [calledContactIds, setCalledContactIds] = useState<Set<string>>(new Set());
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const modes = [
    { key: "start", label: "Call Now", desc: "CALL WITH REAL-TIME AI COACHING", icon: Play, colorClass: "bg-primary text-primary-foreground", inactiveClass: "bg-primary/5 text-foreground border-primary/20" },
    { key: "voice", label: "Voice Agent", desc: "AI HANDLES THE CALL AUTONOMOUSLY", icon: Mic, colorClass: "bg-info text-info-foreground", inactiveClass: "bg-info/5 text-foreground border-info/20", beta: true },
    { key: "listen", label: "Listen Mode", desc: "CAPTURE EXTERNAL CALLS (ZOOM, MEET, ETC.)", icon: Phone, colorClass: "bg-secondary text-secondary-foreground border border-border", inactiveClass: "bg-background text-foreground border-border" },
  ];

  const handleCallFromQueue = (item: typeof MOCK_DIALER_QUEUE[0]) => {
    if (callingMode === "voice") {
      toast.info(`AI Voice Agent calling ${item.name}...`, { duration: 3000 });
      setCalledContactIds(prev => new Set(prev).add(item.id));
      return;
    }
    if (callingMode === "listen") {
      toast.info(`Listen Mode active — monitoring call to ${item.name}`, { duration: 3000 });
      setCalledContactIds(prev => new Set(prev).add(item.id));
      return;
    }
    setCalledContactIds(prev => new Set(prev).add(item.id));
    callState.startCall({
      id: item.id,
      name: item.name,
      phone: item.phone,
      address: item.address,
      campaignName: item.campaign || undefined,
    }, "dialer");
  };

  const handleStartPowerDial = () => {
    if (callingMode === "voice") {
      toast.success(`AI Voice Agent session starting with ${dialerContacts.length} contacts...`);
      setCalledContactIds(new Set(dialerContacts.map(c => c.id)));
      return;
    }
    if (callingMode === "listen") {
      toast.info("Listen Mode activated — ready to capture external calls");
      return;
    }
    const queueContacts = dialerContacts.map(item => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      address: item.address,
    }));
    callState.setDialerQueue(queueContacts);
    if (selectedScriptId) {
      const script = MOCK_CALL_SCRIPTS.find(s => s.id === selectedScriptId);
      if (script) {
        callState.setSelectedScript({
          id: script.id,
          name: script.name,
          type: script.type,
          phases: ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"],
        });
      }
    }
    callState.startDialerSession();
    if (!focusMode && onToggleFocus) onToggleFocus();
  };

  const handleSelectScript = (scriptId: string) => {
    setSelectedScriptId(prev => prev === scriptId ? null : scriptId);
    const script = MOCK_CALL_SCRIPTS.find(s => s.id === scriptId);
    if (script) {
      toast.info(`Script selected: ${script.name}`);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      return;
    }
    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("number"));
    const addressIdx = header.findIndex(h => h.includes("address"));

    if (phoneIdx === -1) {
      toast.error("CSV must contain a 'phone' or 'number' column");
      return;
    }

    const newContacts: typeof MOCK_DIALER_QUEUE = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
      const phone = cols[phoneIdx];
      if (!phone) continue;
      newContacts.push({
        id: `csv_${Date.now()}_${i}`,
        name: nameIdx >= 0 ? cols[nameIdx] || "Unknown" : "Unknown",
        phone,
        address: addressIdx >= 0 ? cols[addressIdx] || "" : "",
        time: "",
        type: "Imported",
        campaign: "",
      });
    }

    if (newContacts.length === 0) {
      toast.error("No valid contacts found in CSV");
      return;
    }

    setDialerContacts(prev => [...prev, ...newContacts]);
    toast.success(`${newContacts.length} contacts imported`);
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are supported");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("File must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleManualAdd = () => {
    if (!manualPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    const newContact = {
      id: `manual_${Date.now()}`,
      name: manualName.trim() || "Unknown",
      phone: manualPhone.trim(),
      address: manualAddress.trim(),
      time: "",
      type: "Manual" as const,
      campaign: "",
    };
    setDialerContacts(prev => [...prev, newContact]);
    setManualName("");
    setManualPhone("");
    setManualAddress("");
    setShowManualEntry(false);
    toast.success(`${newContact.name} added to dialing list`);
  };

  const handleRemoveContact = (id: string) => {
    setDialerContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleClearList = () => {
    setDialerContacts([]);
    toast.info("Dialing list cleared");
  };

  const downloadTemplate = () => {
    const csv = "name,phone,address\nJohn Doe,(555) 123-4567,123 Main St\nJane Smith,(555) 987-6543,456 Oak Ave\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialer_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const showAutoAdvance = callState.isDialerSessionActive && callState.autoAdvanceCountdown !== null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-5">
      {/* Focus Mode / Power Hour Header Banner */}
      {(focusMode || isPowerHour) && (
        <div className={cn(
          "flex items-center justify-between px-4 py-2.5 rounded-lg border",
          isPowerHour
            ? "bg-warning/5 border-warning/20"
            : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center gap-2.5">
            {isPowerHour ? (
              <>
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-xs font-bold text-warning uppercase tracking-wider">Power Hour</span>
                <span className="text-[11px] text-muted-foreground">· Locked in. One queue. One goal.</span>
              </>
            ) : (
              <>
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Focus Mode</span>
                <span className="text-[11px] text-muted-foreground">· Distractions hidden. Ctrl+Shift+F to toggle.</span>
              </>
            )}
          </div>
          {!isPowerHour && (
            <button
              onClick={onToggleFocus}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Exit Focus
            </button>
          )}
        </div>
      )}

      {!isPowerHour && <DialerIntelligenceBar />}
      <DailyGoalsTracker />
      <PostCallActions />

      {showAutoAdvance && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
          <p className="text-sm text-foreground">
            Auto-dialing next contact in <span className="font-bold text-primary">{callState.autoAdvanceCountdown}s</span>
          </p>
          <div className="flex gap-2">
            <button onClick={callState.cancelAutoAdvance} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Pause
            </button>
            <button onClick={callState.advanceDialerQueue} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              Skip to Next
            </button>
          </div>
        </div>
      )}

      {!isPowerHour && (
        <div className="p-5 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-[13px] font-semibold text-foreground">Select Calling Mode</div>
            <div className="flex items-center gap-2">
              {!focusMode && (
                <button
                  onClick={onToggleFocus}
                  className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                >
                  <Target className="h-3 w-3" /> Focus Session
                </button>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <button
                  onClick={handleStartPowerDial}
                  disabled={callState.isCallActive || dialerContacts.length === 0}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-colors",
                    callState.isCallActive || dialerContacts.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {callState.isDialerSessionActive ? "Resume Dialer" : "Start Dialing"}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  {callState.isDialerSessionActive ? "Continue where you left off" : "AI-optimized calling sequence"}
                </span>
              </div>
            </div>
          </div>
          {!focusMode && (
            <div className="flex gap-3">
              {modes.map(({ key, label, desc, icon: Icon, colorClass, inactiveClass, beta }) => (
                <button
                  key={key}
                  onClick={() => {
                    setCallingMode(key as CallingModeKey);
                    if (key === "voice") toast.info("Voice Agent mode — AI will handle calls autonomously");
                    if (key === "listen") toast.info("Listen Mode — captures external calls from Zoom, Meet, etc.");
                  }}
                  className={cn(
                    "flex-1 p-6 rounded-lg text-center transition-all relative border-2",
                    callingMode === key
                      ? cn(colorClass, "border-transparent shadow-sm")
                      : cn(inactiveClass, "hover:opacity-80")
                  )}
                >
                  {beta && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-foreground/20 text-[9px] font-bold tracking-wider">BETA</span>
                  )}
                  <Icon className="h-6 w-6 mx-auto mb-2.5" />
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[10px] mt-1 opacity-70 tracking-wide">{desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex-1 flex flex-col gap-5">
          <div className="p-5 bg-muted/30 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] font-semibold text-foreground">
                My Dialing List
                <span className="ml-2 text-xs text-muted-foreground font-normal">({dialerContacts.length} contacts)</span>
              </div>
              <div className="flex items-center gap-2">
                {dialerContacts.length > 0 && (
                  <button
                    onClick={handleClearList}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {dialerContacts.length === 0 ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <div className="text-sm font-semibold text-foreground mb-1">Import Numbers</div>
                <div className="text-xs text-muted-foreground mb-1">Drag & drop a CSV file</div>
                <button onClick={downloadTemplate} className="text-xs text-primary font-medium hover:underline mb-4">
                  Download template
                </button>
                <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" /> Choose A File
                  </button>
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Enter Manually
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-3">Up to 1MB or 1,000 rows · CSV file only</div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-3 w-3" /> Import CSV
                  </button>
                  <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <UserPlus className="h-3 w-3" /> Add Contact
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors ml-auto"
                  >
                    <Download className="h-3 w-3" /> Template
                  </button>
                </div>

                {showManualEntry && (
                  <div className="p-3.5 mb-3 bg-muted/50 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">Add Contact</span>
                      <button onClick={() => setShowManualEntry(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      placeholder="Name"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      placeholder="Phone *"
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
                    />
                    <input
                      placeholder="Address"
                      value={manualAddress}
                      onChange={e => setManualAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={handleManualAdd}
                      className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Add to List
                    </button>
                  </div>
                )}

                <div className="space-y-1.5 max-h-[400px] overflow-auto">
                  {dialerContacts.map((item, idx) => {
                    const isCalled = calledContactIds.has(item.id);
                    const isActive = callState.isDialerSessionActive && callState.dialerQueueIndex === idx;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all",
                          isActive
                            ? "bg-primary/10 border-primary/30 shadow-sm"
                            : isCalled
                              ? "bg-muted/30 border-border/30 opacity-60"
                              : "bg-background border-border/50 hover:border-border"
                        )}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[13px] font-medium truncate", isCalled ? "line-through text-muted-foreground" : "text-foreground")}>
                              {item.name}
                            </span>
                            {item.campaign && <CampaignBadge campaignName={item.campaign} />}
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-bold">ACTIVE</span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{item.phone}</span>
                            {item.address && <span>· {item.address}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            item.type === "Callback" ? "bg-warning/10 text-warning" :
                            item.type === "Follow-up" ? "bg-info/10 text-info" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {item.type}
                          </span>
                          <button
                            onClick={() => handleCallFromQueue(item)}
                            disabled={callState.isCallActive || isCalled}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                              isCalled
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-success/10 text-success hover:bg-success/20"
                            )}
                          >
                            <Phone className="h-3 w-3" /> Call
                          </button>
                          {!callState.isDialerSessionActive && (
                            <button
                              onClick={() => handleRemoveContact(item.id)}
                              className="p-1 text-muted-foreground/50 hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {!focusMode && !isPowerHour && <div className="w-[280px] flex flex-col gap-5">
          <div className="p-5 bg-muted/30 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] font-semibold text-foreground">Call Scripts</div>
              <button onClick={() => navigate("/dialer/scripts")} className="text-xs text-primary cursor-pointer font-medium hover:underline">Manage</button>
            </div>
            {MOCK_CALL_SCRIPTS.map((script) => (
              <div
                key={script.id}
                className={cn(
                  "p-3.5 rounded-lg mb-2.5 border cursor-pointer transition-all",
                  selectedScriptId === script.id
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/50 border-border/50 hover:border-primary/30"
                )}
                onClick={() => handleSelectScript(script.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                      {script.name}
                      {selectedScriptId === script.id && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold">SELECTED</span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-0.5">{script.type}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{script.desc}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate("/dialer/scripts"); }} className="p-1 hover:bg-muted rounded transition-colors">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${script.progress}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-primary font-mono">{script.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}
