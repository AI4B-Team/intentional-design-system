import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Mail,
  Smartphone,
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export type AuthMethod = "email_otp" | "sms_otp" | "kba";
export type AuthStatus = "pending" | "verified" | "failed" | "expired";

export interface SignerAuthConfig {
  enabled: boolean;
  methods: AuthMethod[];
  requireAll: boolean; // require all methods or just one
}

export interface SignerAuthResult {
  method: AuthMethod;
  status: AuthStatus;
  verifiedAt?: Date;
  attempts: number;
  maxAttempts: number;
}

export const defaultAuthConfig: SignerAuthConfig = {
  enabled: false,
  methods: ["email_otp"],
  requireAll: false,
};

// ─── Auth Configuration Component ───────────────────────────

interface AuthConfigProps {
  config: SignerAuthConfig;
  onChange: (config: SignerAuthConfig) => void;
}

const authMethods: { value: AuthMethod; label: string; description: string; icon: React.ElementType }[] = [
  { value: "email_otp", label: "Email Verification", description: "Send a 6-digit code to signer's email", icon: Mail },
  { value: "sms_otp", label: "SMS Verification", description: "Send a 6-digit code via text message", icon: Smartphone },
  { value: "kba", label: "Knowledge-Based Auth", description: "Ask identity questions only the signer can answer", icon: HelpCircle },
];

export function SignerAuthConfigPanel({ config, onChange }: AuthConfigProps) {
  const toggleMethod = (method: AuthMethod) => {
    const methods = config.methods.includes(method)
      ? config.methods.filter((m) => m !== method)
      : [...config.methods, method];
    onChange({ ...config, methods, enabled: methods.length > 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-brand" />
        <h4 className="text-sm font-semibold text-foreground">Signer Identity Verification</h4>
      </div>

      <div className="space-y-2">
        {authMethods.map((method) => {
          const isSelected = config.methods.includes(method.value);
          return (
            <Card
              key={method.value}
              padding="sm"
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-brand bg-brand/5 shadow-sm" : "hover:bg-surface-secondary"
              )}
              onClick={() => toggleMethod(method.value)}
            >
              <div className="flex items-center gap-3 px-1">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-brand/10" : "bg-muted"
                )}>
                  <method.icon className={cn("h-4 w-4", isSelected ? "text-brand" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  isSelected ? "border-brand bg-brand" : "border-border-subtle"
                )}>
                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {config.methods.length > 1 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary text-sm">
          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <span className="text-muted-foreground">Require </span>
            <button
              className="font-medium text-brand underline underline-offset-2"
              onClick={() => onChange({ ...config, requireAll: !config.requireAll })}
            >
              {config.requireAll ? "all methods" : "any one method"}
            </button>
            <span className="text-muted-foreground"> to pass</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auth Challenge Dialog ──────────────────────────────────

interface SignerAuthChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (results: SignerAuthResult[]) => void;
  signerName: string;
  signerEmail: string;
  config: SignerAuthConfig;
}

const kbaQuestions = [
  { question: "What is the last 4 digits of your SSN?", placeholder: "1234" },
  { question: "What is your date of birth?", placeholder: "MM/DD/YYYY" },
  { question: "What street did you grow up on?", placeholder: "Elm Street" },
];

export function SignerAuthChallenge({
  isOpen,
  onClose,
  onVerified,
  signerName,
  signerEmail,
  config,
}: SignerAuthChallengeProps) {
  const [currentMethod, setCurrentMethod] = React.useState<AuthMethod>(config.methods[0] || "email_otp");
  const [otpCode, setOtpCode] = React.useState("");
  const [kbaAnswer, setKbaAnswer] = React.useState("");
  const [kbaIndex] = React.useState(Math.floor(Math.random() * kbaQuestions.length));
  const [verifying, setVerifying] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);
  const [results, setResults] = React.useState<SignerAuthResult[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setOtpCode("");
      setKbaAnswer("");
      setVerifying(false);
      setCodeSent(false);
      setResults([]);
      setCurrentMethod(config.methods[0] || "email_otp");
    }
  }, [isOpen, config]);

  const handleSendCode = () => {
    setCodeSent(true);
    toast.success(
      currentMethod === "email_otp"
        ? `Verification code sent to ${signerEmail}`
        : `Verification code sent via SMS`
    );
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      const result: SignerAuthResult = {
        method: currentMethod,
        status: "verified",
        verifiedAt: new Date(),
        attempts: 1,
        maxAttempts: 3,
      };
      const newResults = [...results, result];
      setResults(newResults);
      setVerifying(false);

      const allRequired = config.requireAll
        ? config.methods.every((m) => newResults.some((r) => r.method === m && r.status === "verified"))
        : newResults.some((r) => r.status === "verified");

      if (allRequired) {
        toast.success("Identity verified successfully");
        onVerified(newResults);
      } else {
        const remaining = config.methods.filter((m) => !newResults.some((r) => r.method === m));
        if (remaining.length > 0) {
          setCurrentMethod(remaining[0]);
          setOtpCode("");
          setKbaAnswer("");
          setCodeSent(false);
        }
      }
    }, 1500);
  };

  const currentMethodInfo = authMethods.find((m) => m.value === currentMethod);
  const MethodIcon = currentMethodInfo?.icon || Shield;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle>Verify Your Identity</DialogTitle>
              <DialogDescription>
                {signerName}, please verify your identity before signing
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress for multi-method */}
        {config.methods.length > 1 && (
          <div className="flex items-center gap-2 py-2">
            {config.methods.map((method, i) => {
              const verified = results.some((r) => r.method === method && r.status === "verified");
              const active = method === currentMethod;
              return (
                <React.Fragment key={method}>
                  {i > 0 && <div className="h-px flex-1 bg-border-subtle" />}
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                    verified ? "bg-success text-white" :
                    active ? "bg-brand text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {verified ? "✓" : i + 1}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
            <MethodIcon className="h-5 w-5 text-brand" />
            <div>
              <p className="text-sm font-medium text-foreground">{currentMethodInfo?.label}</p>
              <p className="text-xs text-muted-foreground">{currentMethodInfo?.description}</p>
            </div>
          </div>

          {/* Email / SMS OTP */}
          {(currentMethod === "email_otp" || currentMethod === "sms_otp") && (
            <div className="space-y-3">
              {!codeSent ? (
                <Button className="w-full gap-2" onClick={handleSendCode}>
                  <Mail className="h-4 w-4" />
                  Send Verification Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label>Enter 6-digit code</Label>
                  <Input
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-lg tracking-[0.5em] font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Code sent to {currentMethod === "email_otp" ? signerEmail : "your phone"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* KBA */}
          {currentMethod === "kba" && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium text-foreground">{kbaQuestions[kbaIndex].question}</p>
              </div>
              <Input
                placeholder={kbaQuestions[kbaIndex].placeholder}
                value={kbaAnswer}
                onChange={(e) => setKbaAnswer(e.target.value)}
              />
            </div>
          )}

          {/* Verified Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span>{authMethods.find((m) => m.value === r.method)?.label} — Verified</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleVerify}
            disabled={verifying || (currentMethod !== "kba" && (!codeSent || otpCode.length < 6)) || (currentMethod === "kba" && !kbaAnswer.trim())}
            className="gap-2"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
