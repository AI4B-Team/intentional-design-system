import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  Users,
  Search,
  Hash,
  Delete,
  Mic,
  MicOff,
  Pause,
  Play,
  ExternalLink,
  User,
  Building,
  PhoneForwarded,
  PhoneMissed,
  PhoneIncoming,
  Volume2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CallerID {
  id: string;
  number: string;
  label: string;
  type: "local" | "tollfree" | "mobile";
}

interface RecentCall {
  id: string;
  name: string;
  phone: string;
  time: string;
  duration: string;
  type: "outgoing" | "incoming" | "missed";
  property?: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  type: "seller" | "buyer" | "agent" | "other";
  property?: string;
}

const mockRecentCalls: RecentCall[] = [
  { id: "1", name: "John Smith", phone: "+1 (555) 123-4567", time: "2 min ago", duration: "3:45", type: "outgoing", property: "123 Oak St" },
  { id: "2", name: "Sarah Johnson", phone: "+1 (555) 234-5678", time: "15 min ago", duration: "1:22", type: "incoming" },
  { id: "3", name: "Unknown", phone: "+1 (555) 345-6789", time: "1 hour ago", duration: "0:00", type: "missed" },
  { id: "4", name: "Mike Wilson", phone: "+1 (555) 456-7890", time: "2 hours ago", duration: "8:15", type: "outgoing", property: "456 Pine Ave" },
  { id: "5", name: "Emily Davis", phone: "+1 (555) 567-8901", time: "Yesterday", duration: "5:30", type: "incoming" },
];

const mockContacts: Contact[] = [
  { id: "1", name: "John Smith", phone: "+1 (555) 123-4567", type: "seller", property: "123 Oak St" },
  { id: "2", name: "Sarah Johnson", phone: "+1 (555) 234-5678", type: "buyer" },
  { id: "3", name: "Robert Brown", phone: "+1 (555) 345-6789", type: "agent" },
  { id: "4", name: "Mike Wilson", phone: "+1 (555) 456-7890", type: "seller", property: "456 Pine Ave" },
  { id: "5", name: "Emily Davis", phone: "+1 (555) 567-8901", type: "buyer" },
  { id: "6", name: "David Lee", phone: "+1 (555) 678-9012", type: "agent" },
];

const mockCallerIDs: CallerID[] = [
  { id: "1", number: "+1 (555) 100-0001", label: "Main Office", type: "local" },
  { id: "2", number: "+1 (555) 100-0002", label: "Sales Line", type: "local" },
  { id: "3", number: "+1 (800) 555-0100", label: "Toll-Free", type: "tollfree" },
  { id: "4", number: "+1 (555) 100-0004", label: "Mobile", type: "mobile" },
];

const keypadButtons = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

export function DialerQuickAccess() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("keypad");
  const [selectedCallerId, setSelectedCallerId] = useState(mockCallerIDs[0].id);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDigitPress = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.length > 0) {
      setIsInCall(true);
      setCallDuration(0);
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setIsMuted(false);
    setIsOnHold(false);
    setCallDuration(0);
  };

  const handleQuickDial = (phone: string) => {
    setPhoneNumber(phone.replace(/\D/g, ""));
    setActiveTab("keypad");
  };

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const selectedCallerIdData = mockCallerIDs.find((c) => c.id === selectedCallerId) || mockCallerIDs[0];

  const getCallerIdTypeLabel = (type: CallerID["type"]) => {
    switch (type) {
      case "local":
        return "Local";
      case "tollfree":
        return "Toll-Free";
      case "mobile":
        return "Mobile";
    }
  };

  const getCallTypeIcon = (type: RecentCall["type"]) => {
    switch (type) {
      case "outgoing":
        return <PhoneForwarded className="h-3.5 w-3.5 text-primary" />;
      case "incoming":
        return <PhoneIncoming className="h-3.5 w-3.5 text-success" />;
      case "missed":
        return <PhoneMissed className="h-3.5 w-3.5 text-destructive" />;
    }
  };

  const getContactTypeIcon = (type: Contact["type"]) => {
    switch (type) {
      case "seller":
        return <Building className="h-3.5 w-3.5 text-primary" />;
      case "buyer":
        return <User className="h-3.5 w-3.5 text-success" />;
      case "agent":
        return <Users className="h-3.5 w-3.5 text-warning" />;
      default:
        return <User className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative p-2 rounded-md transition-colors",
            isInCall
              ? "text-success bg-success/10 animate-pulse"
              : "text-content-secondary hover:text-content hover:bg-surface-secondary"
          )}
        >
          {isInCall ? (
            <PhoneCall className="h-5 w-5" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
          {isInCall && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-success rounded-full border-2 border-white" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 bg-background">
        {/* Active Call Banner */}
        {isInCall && (
          <div className="bg-success/10 border-b border-success/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Active Call</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatDuration(callDuration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn("h-8 w-8", isMuted && "bg-muted")}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn("h-8 w-8", isOnHold && "bg-muted")}
                  onClick={() => setIsOnHold(!isOnHold)}
                >
                  {isOnHold ? (
                    <Play className="h-4 w-4 text-warning" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-destructive/10 hover:bg-destructive/20"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10">
            <TabsTrigger
              value="keypad"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Hash className="h-4 w-4 mr-1.5" />
              Keypad
            </TabsTrigger>
            <TabsTrigger
              value="recents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Recents
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4 mr-1.5" />
              Contacts
            </TabsTrigger>
          </TabsList>

          {/* Keypad Tab */}
          <TabsContent value="keypad" className="m-0 p-4">
            {/* Caller ID Selector */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Call From</label>
              <Select value={selectedCallerId} onValueChange={setSelectedCallerId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedCallerIdData.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {selectedCallerIdData.number}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {mockCallerIDs.map((callerId) => (
                    <SelectItem key={callerId.id} value={callerId.id}>
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{callerId.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{callerId.number}</span>
                          <span className="text-[10px] uppercase font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {getCallerIdTypeLabel(callerId.type)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Display */}
            <div className="relative mb-4">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+*#]/g, ""))}
                placeholder="Enter Number"
                className="h-12 text-center text-xl font-mono tracking-wider pr-10"
              />
              {phoneNumber && (
                <button
                  onClick={handleBackspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Delete className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {keypadButtons.map((btn) => (
                <button
                  key={btn.digit}
                  onClick={() => handleDigitPress(btn.digit)}
                  className="h-12 rounded-lg bg-surface-secondary hover:bg-muted transition-colors flex flex-col items-center justify-center"
                >
                  <span className="text-lg font-semibold">{btn.digit}</span>
                  {btn.letters && (
                    <span className="text-[9px] text-muted-foreground tracking-widest">
                      {btn.letters}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Call Button */}
            <Button
              onClick={isInCall ? handleEndCall : handleCall}
              disabled={!phoneNumber && !isInCall}
              className={cn(
                "w-full h-12 text-base font-semibold",
                isInCall
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-success hover:bg-success/90"
              )}
            >
              {isInCall ? (
                <>
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Call
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5 mr-2" />
                  Call
                </>
              )}
            </Button>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/dialer")}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open Dialer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/dialer/queues")}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Call Queues
              </Button>
            </div>
          </TabsContent>

          {/* Recents Tab */}
          <TabsContent value="recents" className="m-0">
            <ScrollArea className="h-[340px]">
              <div className="p-2">
                {mockRecentCalls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => handleQuickDial(call.phone)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getCallTypeIcon(call.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{call.name}</p>
                        <span className="text-xs text-muted-foreground">{call.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{call.phone}</p>
                        <span className="text-xs text-muted-foreground font-mono">
                          {call.duration}
                        </span>
                      </div>
                      {call.property && (
                        <p className="text-xs text-primary truncate mt-0.5">
                          {call.property}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate("/dialer/history");
                  setOpen(false);
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                View All History
              </Button>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="m-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Contacts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="p-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleQuickDial(contact.phone)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getContactTypeIcon(contact.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      {contact.property && (
                        <p className="text-xs text-primary truncate mt-0.5">
                          {contact.property}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {contact.type}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate("/deal-sources");
                  setOpen(false);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                View All Contacts
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
