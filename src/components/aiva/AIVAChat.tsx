import React, { useState, useRef, useEffect } from "react";
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
  Paperclip,
  Database,
  Globe,
  Layers,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAIVAChat } from "@/hooks/useAIVAChat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIVAChatProps {
  className?: string;
  onClose?: () => void;
}

export function AIVAChat({ className, onClose }: AIVAChatProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useAIVAChat();
  const [input, setInput] = useState("");
  const [searchType, setSearchType] = useState<"database" | "online" | "both">("both");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  // Dialog states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom when new messages arrive
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
    sendMessage(input, searchType);
    setInput("");
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
        
        // For now, show a toast that voice transcription is coming soon
        // In production, you would send this to a speech-to-text service
        toast.info("Voice input captured! Transcription coming soon.", {
          description: "Voice-to-text will be available in a future update."
        });
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
    setInput("");
    toast.success("Started new chat");
  };

  const suggestedQuestions = [
    "Show me properties in Cleveland, OH under $150K",
  ];

  // Quick actions for the tools menu
  const quickActions = [
    { label: "Analyze Property", icon: Home, prompt: "Analyze this property for investment potential including ARV, repairs estimate, and recommended offer price" },
    { label: "Generate Offer", icon: DollarSign, prompt: "Generate a competitive offer based on the property details and comparable sales" },
    { label: "Find Comps", icon: TrendingUp, prompt: "Find comparable properties sold in the last 6 months within a 1-mile radius" },
    { label: "Market Analysis", icon: BarChart3, prompt: "Run a comprehensive market analysis for this area including trends and forecasts" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleAttachContext = () => {
    toast.info("Context attachments coming soon!", {
      description: "You'll be able to attach property data, lists, or files."
    });
  };

  // Placeholder chat history
  const chatHistory = [
    { id: "1", title: "Property search in Atlanta", date: "Today" },
    { id: "2", title: "Market analysis Phoenix", date: "Yesterday" },
    { id: "3", title: "Deal pipeline review", date: "2 days ago" },
  ];

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-muted">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-900 border shadow-md">Chat</TooltipContent>
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
                <TooltipContent className="bg-white text-gray-900 border shadow-md">New Chat</TooltipContent>
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
                <TooltipContent className="bg-white text-gray-900 border shadow-md">Clear Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setHistoryOpen(true)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-900 border shadow-md">History</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-900 border shadow-md">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
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
                <TooltipContent className="bg-white text-gray-900 border shadow-md">
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
                  <TooltipContent className="bg-white text-gray-900 border shadow-md">Close</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              {/* Three Dots */}
              <div className="flex gap-1.5 mb-6">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
              
              {/* Heading */}
              <h2 className="text-2xl font-bold text-foreground mb-2">How Can I Help?</h2>
              <p className="text-muted-foreground text-sm text-center max-w-xs mb-8">
                Your AI-powered assistant for property search, deal analysis, and market research. Ask me anything about real estate!
              </p>
              
              {/* Suggestions Label */}
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Suggestions</span>
              </div>
              
              {/* Suggestion Pills */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                      "hover:border-primary hover:bg-primary/5",
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
        <div className="border-t p-3 pb-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col gap-3 rounded-xl border bg-background p-3">
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
              
              {/* Bottom Row */}
              <div className="flex items-center justify-between">
                {/* Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 rounded-full gap-2">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span className="text-xs">Tools</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {/* Quick Actions */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
                    {quickActions.map((action) => (
                      <DropdownMenuItem 
                        key={action.label}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="gap-2"
                      >
                        <action.icon className="h-4 w-4" />
                        <span>{action.label}</span>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Search Mode */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Search Mode</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={searchType} onValueChange={(v) => setSearchType(v as "database" | "online" | "both")}>
                          <DropdownMenuRadioItem value="database" className="gap-2">
                            <Database className="h-4 w-4" />
                            Database Only
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="online" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Online Only
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="both" className="gap-2">
                            <Layers className="h-4 w-4" />
                            Both (Default)
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Attach Context */}
                    <DropdownMenuItem onClick={handleAttachContext} className="gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span>Attach Context</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
                    /* Default State - Attach + Mic + Send */
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              onClick={handleAttachContext}
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-gray-900 border shadow-md">Attach Context</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={startRecording}
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white text-gray-900 border shadow-md">Voice Input</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!input.trim() || isLoading}
                        className="h-8 w-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Chat History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                onClick={() => {
                  toast.info("Chat history will be restored in a future update");
                  setHistoryOpen(false);
                }}
              >
                <p className="font-medium text-sm">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{chat.date}</p>
              </button>
            ))}
            {chatHistory.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No chat history yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AIVA Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Default Search Mode</p>
                <p className="text-xs text-muted-foreground">Choose what AIVA searches by default</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="capitalize">
                    {searchType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSearchType("database")}>
                    Database
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchType("online")}>
                    Online
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchType("both")}>
                    Both
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Voice Input</p>
                <p className="text-xs text-muted-foreground">Enable microphone for voice commands</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enabled
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
