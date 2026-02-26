import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, 
  Trash2, 
  Sparkles, 
  User, 
  PenSquare, 
  History, 
  Settings, 
  Maximize2, 
  Mic,
  MicOff,
  SlidersHorizontal,
  X,
  MessageSquare,
  Home,
  DollarSign,
  TrendingUp,
  BarChart3,
  Link2,
  Database,
  Globe,
  Layers,
  ChevronRight,
  Check,
  Search,
  FileText,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAIVAChat } from "@/hooks/useAIVAChat";
import { useAIVAConversations } from "@/hooks/useAIVAConversations";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { AttachContextPopover, AttachmentChips, type AttachedItem } from "./AttachContextPopover";

type PanelView = "chat" | "history" | "settings";

interface AIVAChatProps {
  className?: string;
  onClose?: () => void;
}

export function AIVAChat({ className, onClose }: AIVAChatProps) {
  const { messages, isLoading, sendMessage, clearMessages, loadMessages } = useAIVAChat();
  const {
    conversations,
    activeConversationId,
    isLoadingHistory,
    loadConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    startNewConversation,
  } = useAIVAConversations();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchType, setSearchType] = useState<"database" | "online" | "both">("both");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // Panel view state (replaces dialog states)
  const [panelView, setPanelView] = useState<PanelView>("chat");
  const [historySearch, setHistorySearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Settings state
  const [autoSaveConversations, setAutoSaveConversations] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [streamResponses, setStreamResponses] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [defaultVoice, setDefaultVoice] = useState("rachel");
  const [attachedContext, setAttachedContext] = useState<AttachedItem[]>([]);

  // Auto-save conversation after AI responses complete
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    const firstUserMsg = messages.find(m => m.role === "user");
    const title = firstUserMsg?.content.slice(0, 50) || "New Conversation";

    if (activeConversationId) {
      updateConversation(activeConversationId, messages);
    } else {
      createConversation(messages, title);
    }
  }, [isLoading]); // Only trigger when loading transitions to false

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    let messageContent = input;
    if (attachedContext.length > 0) {
      const contextData = attachedContext.map(({ type, label, data }) => ({ type, label, ...data }));
      messageContent = `[ATTACHED CONTEXT]\n${JSON.stringify(contextData, null, 2)}\n[END CONTEXT]\n\nUser message: ${input}`;
    }
    
    sendMessage(messageContent, searchType);
    setInput("");
    setAttachedContext([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Mic functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        try {
          // Upload to storage
          const fileName = `voice-${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from('voice-recordings')
            .upload(fileName, audioBlob, { contentType: 'audio/webm' });
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('voice-recordings')
            .getPublicUrl(fileName);
          
          // Transcribe
          const { data, error: fnError } = await supabase.functions.invoke('transcribe-audio', {
            body: { audioUrl: publicUrl }
          });
          
          if (fnError || !data?.transcript) throw fnError || new Error('No transcript');
          
          setInput(data.transcript);
          setTimeout(() => inputRef.current?.focus(), 50);
          toast.success("Voice captured — review and send");
        } catch (err) {
          console.error('Transcription failed:', err);
          toast.error("Transcription failed — please try again");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started", { description: "Speak now..." });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone", {
        description: "Please check your browser permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // New chat functionality
  const handleNewChat = () => {
    clearMessages();
    startNewConversation();
    setInput("");
  };

  const suggestedQuestions = [
    "Show me properties in Cleveland, OH under $150K",
    "Analyze my pipeline and suggest next steps",
    "Find distressed properties in my target areas",
    "Calculate ARV for 123 Main Street",
    "What are the best exit strategies for a wholesale deal?",
  ];

  // Quick actions for the tools menu
  const quickActions = [
    { label: "Analyze Property", icon: Home, color: "text-blue-500", prompt: "Analyze this property for investment potential including ARV, repairs estimate, and recommended offer price" },
    { label: "Generate Offer", icon: DollarSign, color: "text-emerald-500", prompt: "Generate a competitive offer based on the property details and comparable sales" },
    { label: "Find Comps", icon: TrendingUp, color: "text-orange-500", prompt: "Find comparable properties sold in the last 6 months within a 1-mile radius" },
    { label: "Market Analysis", icon: BarChart3, color: "text-purple-500", prompt: "Run a comprehensive market analysis for this area including trends and forecasts" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleAttachItem = useCallback((item: AttachedItem) => {
    setAttachedContext((prev) => [...prev, item]);
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachedContext((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card className={cn(
        "flex flex-col overflow-hidden transition-all",
        isExpanded ? "fixed inset-4 z-50 h-auto" : "h-full",
        className
      )}>
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-muted">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg"
                    onClick={handleNewChat}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">New Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg"
                    onClick={clearMessages}
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">Clear Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-lg",
                      panelView === "history" && "bg-muted"
                    )}
                    onClick={() => setPanelView(panelView === "history" ? "chat" : "history")}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">History</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-9 w-9 rounded-lg",
                      panelView === "settings" && "bg-muted"
                    )}
                    onClick={() => setPanelView(panelView === "settings" ? "chat" : "settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">
                  {isExpanded ? "Collapse" : "Expand"}
                </TooltipContent>
              </Tooltip>
              {onClose && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white text-gray-900 border shadow-md">Close</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* Panel Content - conditionally rendered based on panelView */}
        {panelView === "history" ? (
          /* History Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* History Header with Back Button */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => {
                  setPanelView("chat");
                  setHistorySearch("");
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Chat History</h2>
            </div>
            
            {/* Search Input */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Conversations..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 border-0"
                />
              </div>
            </div>
            
            {/* History List */}
            <ScrollArea className="flex-1">
              <div className="px-4 pb-4 space-y-2">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {conversations
                      .filter((chat) =>
                        chat.title.toLowerCase().includes(historySearch.toLowerCase())
                      )
                      .map((chat) => (
                        <div
                          key={chat.id}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors group",
                            activeConversationId === chat.id && "bg-muted border-primary/30"
                          )}
                        >
                          <button
                            className="flex-1 text-left min-w-0"
                            onClick={async () => {
                              const msgs = await loadConversation(chat.id);
                              if (msgs) {
                                loadMessages(msgs);
                                setPanelView("chat");
                              }
                            }}
                          >
                            <p className="font-medium text-sm truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(chat.updated_at)}</p>
                          </button>
                          {confirmDeleteId === chat.id ? (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  deleteConversation(chat.id);
                                  setConfirmDeleteId(null);
                                }}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={() => setConfirmDeleteId(chat.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      ))}
                    {conversations.filter((chat) =>
                      chat.title.toLowerCase().includes(historySearch.toLowerCase())
                    ).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                          {historySearch ? "No Matching Conversations" : "No Chat History Yet"}
                        </p>
                        <p className="text-sm text-muted-foreground/60">
                          {historySearch ? "Try a different search term" : "Your conversations will appear here"}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : panelView === "settings" ? (
          /* Settings Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Settings Header with Back Button */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                onClick={() => setPanelView("chat")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            
            {/* Settings Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {/* Auto-save Conversations */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Auto-save Conversations</p>
                    <p className="text-xs text-muted-foreground">Automatically save chat history</p>
                  </div>
                  <Switch
                    checked={autoSaveConversations}
                    onCheckedChange={setAutoSaveConversations}
                  />
                </div>
                
                {/* Show Timestamps */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Show Timestamps</p>
                    <p className="text-xs text-muted-foreground">Display time on messages</p>
                  </div>
                  <Switch
                    checked={showTimestamps}
                    onCheckedChange={setShowTimestamps}
                  />
                </div>
                
                {/* Stream Responses */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Stream Responses</p>
                    <p className="text-xs text-muted-foreground">Show responses as they generate</p>
                  </div>
                  <Switch
                    checked={streamResponses}
                    onCheckedChange={setStreamResponses}
                  />
                </div>
                
                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Sound Effects</p>
                    <p className="text-xs text-muted-foreground">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={soundEffects}
                    onCheckedChange={setSoundEffects}
                  />
                </div>
                
                {/* Default Voice */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div>
                    <p className="font-medium text-sm">Default Voice</p>
                  </div>
                  <Select value={defaultVoice} onValueChange={setDefaultVoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rachel">Rachel (Female)</SelectItem>
                      <SelectItem value="james">James (Male)</SelectItem>
                      <SelectItem value="sophia">Sophia (Female)</SelectItem>
                      <SelectItem value="michael">Michael (Male)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Default Search Mode */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div>
                    <p className="font-medium text-sm">Default Search Mode</p>
                    <p className="text-xs text-muted-foreground">Choose what AIVA searches by default</p>
                  </div>
                  <Select value={searchType} onValueChange={(v) => setSearchType(v as "database" | "online" | "both")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="database">Database Only</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="both">Both (Default)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Chat Panel (default) */
          <>
            {/* Chat Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-full px-4 pt-24 pb-6">
                  {/* Three Dots - Animated */}
                  <div className="flex gap-2 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                  </div>
                  
                  {/* Heading */}
                  <h2 className="text-xl font-bold text-foreground mb-1">How Can I Help?</h2>
                  <p className="text-muted-foreground text-xs text-center max-w-xs mb-5">
                    Your AI-powered assistant for property search, deal analysis, and market research.
                  </p>
                  
                  {/* Suggestions Label */}
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-3">
                    <Sparkles className="h-3 w-3" />
                    <span>Suggestions</span>
                  </div>
                  
                  {/* Suggestion Pills - Compact */}
                  <div className="flex flex-col gap-1.5 w-full max-w-sm">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg border text-xs transition-all",
                          "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                          "border-border bg-background text-foreground"
                        )}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t px-2 pt-3 mt-auto shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col gap-3 rounded-xl border-2 border-primary bg-background p-3">
                  {/* Input Field - taller */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AIVA Anything"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm py-2"
                  />
                  
                  {/* Attachment Chips */}
                  <AttachmentChips items={attachedContext} onRemove={handleRemoveAttachment} />
                  
                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    {/* Left Side - Tools + Attach */}
                    <div className="flex items-center gap-1">
                      {/* Tools Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 rounded-full gap-2 border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 bg-transparent">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span className="text-xs font-normal">Tools</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          {/* Capabilities */}
                          <DropdownMenuLabel className="text-xs text-muted-foreground">What I Can Do</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2 cursor-default" onSelect={(e) => e.preventDefault()}>
                            <Search className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Property Search</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-default" onSelect={(e) => e.preventDefault()}>
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Deal Analysis</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-default" onSelect={(e) => e.preventDefault()}>
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Market Research</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Quick Actions */}
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
                          {quickActions.map((action) => (
                            <DropdownMenuItem 
                              key={action.label}
                              onClick={() => handleQuickAction(action.prompt)}
                              className="gap-2"
                            >
                              <action.icon className={cn("h-4 w-4", action.color)} />
                              <span>{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Search Mode */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                              <Layers className="h-4 w-4 text-indigo-500" />
                              <span>Search Mode</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={searchType} onValueChange={(v) => setSearchType(v as "database" | "online" | "both")}>
                                <DropdownMenuRadioItem value="database" className="gap-2">
                                  <Database className="h-4 w-4 text-cyan-500" />
                                  Database Only
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="online" className="gap-2">
                                  <Globe className="h-4 w-4 text-teal-500" />
                                  Online Only
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="both" className="gap-2">
                                  <Layers className="h-4 w-4 text-indigo-500" />
                                  Both (Default)
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Attach Button - Chain Link Icon */}
                      <AttachContextPopover onAttach={handleAttachItem}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-transparent transition-colors"
                              >
                                <Link2 className="h-4 w-4" strokeWidth={2} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-gray-900 border shadow-md">Attach Context</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </AttachContextPopover>
                    </div>
                    
                    {/* Right Icons */}
                    <div className="flex items-center gap-1">
                      {isRecording ? (
                        /* Recording State - Show waves + cancel/confirm */
                        <div className="flex items-center gap-2">
                          {/* Audio Waves Animation */}
                          <div className="flex items-center gap-0.5 h-8 px-2">
                            <span className="w-1 h-3 bg-destructive rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-5 bg-destructive rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ animationDelay: "100ms" }} />
                            <span className="w-1 h-4 bg-destructive rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                            <span className="w-1 h-6 bg-destructive rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
                            <span className="w-1 h-3 bg-destructive rounded-full animate-[soundwave_0.5s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
                          </div>
                          
                          {/* Cancel Recording */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={stopRecording}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-900 border shadow-md">Cancel</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Confirm Recording */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-100"
                                  onClick={stopRecording}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-900 border shadow-md">Done</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        /* Default State - Mic + Send */
                        <div className="flex items-center gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 text-slate-300 hover:text-destructive hover:bg-transparent transition-colors"
                                  onClick={startRecording}
                                >
                                  <Mic className="h-6 w-6" strokeWidth={1.5} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-900 border shadow-md">Voice Input</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="submit" 
                                  variant="ghost"
                                  size="icon" 
                                  disabled={!input.trim() || isLoading}
                                  className={cn(
                                    "h-11 w-11 rounded-full border-0 shadow-none transition-colors disabled:opacity-100",
                                    input.trim() && !isLoading
                                      ? "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700"
                                      : "bg-muted/40 text-muted-foreground/40"
                                  )}
                                >
                                  <Send className="h-5 w-5" strokeWidth={1.5} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white text-gray-900 border shadow-md">Send</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </Card>

      {/* Expanded overlay backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsExpanded(false)} 
        />
      )}
    </>
  );
}
