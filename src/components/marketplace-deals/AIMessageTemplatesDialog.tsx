import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EmailTemplate {
  subject: string;
  body: string;
  tone: string;
}

interface SmsTemplate {
  message: string;
  tone: string;
}

interface AIMessageTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerType: "flipper" | "landlord";
  propertyAddress: string;
  messageType: "email" | "sms";
  dealDetails?: {
    price?: number;
    arv?: number;
    profit?: number;
    capRate?: number;
  };
}

export function AIMessageTemplatesDialog({
  open,
  onOpenChange,
  buyerName,
  buyerEmail,
  buyerPhone,
  buyerType,
  propertyAddress,
  messageType,
  dealDetails,
}: AIMessageTemplatesDialogProps) {
  const [templates, setTemplates] = useState<EmailTemplate[] | SmsTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-buyer-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            buyerName,
            buyerType,
            propertyAddress,
            messageType,
            dealDetails,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add credits to continue.");
        }
        throw new Error("Failed to generate templates");
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate templates";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && templates.length === 0 && !loading) {
      generateTemplates();
    }
  }, [open]);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUseTemplate = (template: EmailTemplate | SmsTemplate) => {
    if (messageType === "email" && "subject" in template) {
      const mailtoUrl = `mailto:${buyerEmail}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
      window.location.href = mailtoUrl;
    } else if (messageType === "sms" && "message" in template && buyerPhone) {
      window.location.href = `sms:${buyerPhone}?body=${encodeURIComponent(template.message)}`;
    }
    onOpenChange(false);
  };

  const getToneColor = (tone: string) => {
    const lowerTone = tone.toLowerCase();
    if (lowerTone.includes("urgent")) return "bg-destructive/10 text-destructive border-destructive/30";
    if (lowerTone.includes("professional") || lowerTone.includes("formal")) return "bg-primary/10 text-primary border-primary/30";
    return "bg-success/10 text-success border-success/30";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            AI {messageType === "email" ? "Email" : "SMS"} Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {messageType === "email" ? (
                <Mail className="h-4 w-4" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              <span>To: {buyerName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateTemplates}
              disabled={loading}
              className="text-xs"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
              Regenerate
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating personalized templates...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Badge at top */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getToneColor("tone" in template ? template.tone : ""))}
                    >
                      {"tone" in template ? template.tone : "Template"}
                    </Badge>
                  </div>

                  {/* Content */}
                  {messageType === "email" && "subject" in template ? (
                    <div className="space-y-2 mb-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Subject:</span>
                        <p className="text-sm font-medium">{(template as EmailTemplate).subject}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Body:</span>
                        <p className="text-sm whitespace-pre-wrap">{(template as EmailTemplate).body}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mb-3">{(template as SmsTemplate).message}</p>
                  )}

                  {/* Actions at bottom */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleCopy(
                        messageType === "email" && "body" in template 
                          ? `${(template as EmailTemplate).subject}\n\n${(template as EmailTemplate).body}`
                          : (template as SmsTemplate).message,
                        index
                      )}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 mr-1 text-success" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
