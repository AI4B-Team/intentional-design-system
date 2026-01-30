import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Hash,
  Delete,
} from "lucide-react";

type CallStatus =
  | "idle"
  | "connecting"
  | "ringing"
  | "in-progress"
  | "completed"
  | "busy"
  | "no-answer"
  | "failed";

interface DialerControlsProps {
  phoneNumber: string;
  contactName?: string;
  callStatus: CallStatus;
  callDuration: number;
  onCall: () => void;
  onEndCall: () => void;
  onMuteToggle: () => void;
  onHoldToggle: () => void;
  isMuted: boolean;
  isOnHold: boolean;
  showKeypad?: boolean;
  onKeypadToggle?: () => void;
  onDigitPress?: (digit: string) => void;
}

export function DialerControls({
  phoneNumber,
  contactName,
  callStatus,
  callDuration,
  onCall,
  onEndCall,
  onMuteToggle,
  onHoldToggle,
  isMuted,
  isOnHold,
  showKeypad = false,
  onKeypadToggle,
  onDigitPress,
}: DialerControlsProps) {
  const [manualNumber, setManualNumber] = React.useState("");

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getStatusDisplay = () => {
    switch (callStatus) {
      case "connecting":
        return { text: "Connecting...", color: "text-info", icon: "📞" };
      case "ringing":
        return { text: "Ringing...", color: "text-warning", icon: "🔔" };
      case "in-progress":
        return { text: "Connected", color: "text-success", icon: "🔵" };
      case "completed":
        return { text: "Call Ended", color: "text-muted-foreground", icon: "🔴" };
      case "busy":
        return { text: "Busy", color: "text-warning", icon: "🔴" };
      case "no-answer":
        return { text: "No Answer", color: "text-muted-foreground", icon: "❌" };
      case "failed":
        return { text: "Failed", color: "text-destructive", icon: "❌" };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();
  const isOnCall = ["connecting", "ringing", "in-progress"].includes(callStatus);
  const displayNumber = showKeypad && manualNumber ? manualNumber : phoneNumber;

  const handleDigitPress = (digit: string) => {
    if (showKeypad && !isOnCall) {
      setManualNumber((prev) => prev + digit);
    }
    onDigitPress?.(digit);
  };

  const handleBackspace = () => {
    setManualNumber((prev) => prev.slice(0, -1));
  };

  const keypadDigits = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];

  // Active call UI
  if (isOnCall || callStatus === "completed") {
    return (
      <div className="bg-gradient-to-b from-foreground to-foreground/90 rounded-xl p-6 text-white text-center">
        {/* Status */}
        {status && (
          <div className="mb-4">
            <span className="text-2xl mr-2">{status.icon}</span>
            <span className={cn("text-lg font-medium", status.color)}>
              {status.text}
            </span>
          </div>
        )}

        {/* Duration */}
        {callStatus === "in-progress" && (
          <div className="text-5xl font-mono font-bold mb-4">
            {formatTime(callDuration)}
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-6">
          {contactName && (
            <h3 className="text-xl font-semibold">{contactName}</h3>
          )}
          <p className="text-muted">{formatPhone(displayNumber)}</p>
        </div>

        {/* Call Controls */}
        {callStatus === "in-progress" && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={onMuteToggle}
              className="rounded-full h-14 w-14"
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant={isOnHold ? "secondary" : "outline"}
              size="lg"
              onClick={onHoldToggle}
              className="rounded-full h-14 w-14"
            >
              {isOnHold ? (
                <Play className="h-6 w-6" />
              ) : (
                <Pause className="h-6 w-6" />
              )}
            </Button>
          </div>
        )}

        {/* End Call Button */}
        {isOnCall && (
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full h-16 w-16 mx-auto"
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        )}
      </div>
    );
  }

  // Idle state - dial pad
  return (
    <div className="space-y-4">
      {/* Phone Number Display */}
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-2xl font-mono font-semibold text-foreground">
          {formatPhone(displayNumber) || "Enter Phone Number..."}
        </p>
      </div>

      {/* Keypad Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onKeypadToggle}
          className="gap-2"
        >
          <Hash className="h-4 w-4" />
          {showKeypad ? "Hide Keypad" : "Show Keypad"}
        </Button>
      </div>

      {/* Keypad */}
      {showKeypad && (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {keypadDigits.flat().map((digit) => (
            <Button
              key={digit}
              variant="outline"
              size="lg"
              onClick={() => handleDigitPress(digit)}
              className="h-14 text-xl font-semibold"
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="outline"
            size="lg"
            onClick={handleBackspace}
            className="h-14 col-span-3"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Call Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onCall}
        disabled={!displayNumber}
        className="w-full h-16 text-lg gap-3"
      >
        <Phone className="h-6 w-6" />
        {contactName ? `Call ${contactName}` : "Call"}
      </Button>
    </div>
  );
}
