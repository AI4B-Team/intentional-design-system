import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Mail,
  X,
  Send,
  Sparkles,
  ChevronDown,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================
type ComposerChannel = 'sms' | 'email';

interface MergeField {
  key: string;
  label: string;
  value: string;
}

interface DialerComposerDrawerProps {
  open: boolean;
  channel: ComposerChannel;
  onClose: () => void;
  onChannelChange: (ch: ComposerChannel) => void;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  propertyAddress?: string;
  onSend: (data: { channel: ComposerChannel; subject?: string; body: string }) => void;
}

// ============================================================================
// AI DRAFT SUGGESTIONS (mock)
// ============================================================================
function getSmsDrafts(name: string, address: string): string[] {
  return [
    `Hi ${name}, great speaking with you about ${address}. I'd love to continue our conversation — what time works for a follow-up call?`,
    `Hey ${name}, just wanted to confirm our discussion about ${address}. We can close in as fast as 14 days with zero repairs. Let me know if you'd like to move forward.`,
    `${name}, thanks for your time today. I'll send over some numbers for ${address} shortly. Feel free to text me any questions!`,
  ];
}

function getEmailDrafts(name: string, address: string): Array<{ subject: string; body: string }> {
  return [
    {
      subject: `Follow-Up: ${address} — Cash Offer Details`,
      body: `Hi ${name},\n\nThank you for taking the time to speak with me today about your property at ${address}.\n\nAs discussed, we can provide a competitive cash offer with a flexible closing timeline — as fast as 14 days or at your convenience.\n\nI'll have the formal offer details ready within 24 hours. In the meantime, please don't hesitate to reach out with any questions.\n\nBest regards`,
    },
    {
      subject: `Next Steps for ${address}`,
      body: `Hi ${name},\n\nI wanted to follow up on our call regarding ${address}. Based on what you shared, I believe we can find a solution that works for your timeline.\n\nHere's what happens next:\n1. I'll run final numbers and prepare an offer\n2. We can schedule a walkthrough at your convenience\n3. Close on your timeline\n\nLooking forward to working with you.`,
    },
    {
      subject: `Quick Question About ${address}`,
      body: `Hi ${name},\n\nJust a quick follow-up from our conversation. I had one more question about the property condition at ${address} — would you say it needs mostly cosmetic updates or are there any major repairs needed?\n\nThis will help me put together the most accurate offer for you.\n\nThanks!`,
    },
  ];
}

// ============================================================================
// MERGE FIELDS HELPER
// ============================================================================
function getMergeFields(contactName: string, propertyAddress: string, phone?: string, email?: string): MergeField[] {
  const firstName = contactName.split(' ')[0] || contactName;
  return [
    { key: '{{seller_name}}', label: 'Seller Name', value: contactName },
    { key: '{{first_name}}', label: 'First Name', value: firstName },
    { key: '{{property_address}}', label: 'Property Address', value: propertyAddress || '123 Main St' },
    { key: '{{phone}}', label: 'Phone', value: phone || '' },
    { key: '{{email}}', label: 'Email', value: email || '' },
    { key: '{{company}}', label: 'Company', value: 'REI Acquisitions' },
  ];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function DialerComposerDrawer({
  open,
  channel,
  onClose,
  onChannelChange,
  contactName,
  contactPhone,
  contactEmail,
  propertyAddress,
  onSend,
}: DialerComposerDrawerProps) {
  const [body, setBody] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [showMergeFields, setShowMergeFields] = React.useState(false);
  const [selectedDraft, setSelectedDraft] = React.useState<number | null>(null);
  const [sending, setSending] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const address = propertyAddress || '1847 Maple Street';
  const firstName = contactName.split(' ')[0] || contactName;
  const mergeFields = getMergeFields(contactName, address, contactPhone, contactEmail);

  // Reset when channel or open changes
  React.useEffect(() => {
    if (open) {
      setBody('');
      setSubject('');
      setSelectedDraft(null);
      setShowMergeFields(false);
    }
  }, [open, channel]);

  const smsDrafts = getSmsDrafts(firstName, address);
  const emailDrafts = getEmailDrafts(firstName, address);

  const handleSelectDraft = (idx: number) => {
    setSelectedDraft(idx);
    if (channel === 'sms') {
      setBody(smsDrafts[idx]);
    } else {
      setSubject(emailDrafts[idx].subject);
      setBody(emailDrafts[idx].body);
    }
  };

  const insertMergeField = (field: MergeField) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.slice(0, start) + field.key + body.slice(end);
      setBody(newBody);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + field.key.length;
      }, 0);
    } else {
      setBody(prev => prev + field.key);
    }
    setShowMergeFields(false);
  };

  const handleSend = async () => {
    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setSending(true);
    // Resolve merge fields
    let resolvedBody = body;
    let resolvedSubject = subject;
    for (const f of mergeFields) {
      resolvedBody = resolvedBody.split(f.key).join(f.value);
      resolvedSubject = resolvedSubject.split(f.key).join(f.value);
    }
    // Simulate send delay
    await new Promise(r => setTimeout(r, 800));
    onSend({ channel, subject: channel === 'email' ? resolvedSubject : undefined, body: resolvedBody });
    setSending(false);
    setBody('');
    setSubject('');
    toast.success(`${channel === 'sms' ? 'SMS' : 'Email'} sent to ${firstName}`);
    onClose();
  };

  if (!open) return null;

  const drafts = channel === 'sms' ? smsDrafts : emailDrafts;

  return (
    <div className="w-[380px] border-l border-border flex flex-col bg-background flex-shrink-0 animate-in slide-in-from-right-4 duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {channel === 'sms' ? (
            <MessageSquare className="h-4 w-4 text-primary" />
          ) : (
            <Mail className="h-4 w-4 text-primary" />
          )}
          <span className="text-[13px] font-bold text-foreground">
            {channel === 'sms' ? 'SMS Composer' : 'Email Composer'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Channel toggle */}
          <button
            onClick={() => onChannelChange(channel === 'sms' ? 'email' : 'sms')}
            className="px-2.5 py-1 rounded-md border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Switch to {channel === 'sms' ? 'Email' : 'SMS'}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* To: line */}
      <div className="px-4 py-2.5 border-b border-border/50 text-[12px]">
        <span className="text-muted-foreground">To: </span>
        <span className="font-semibold text-foreground">
          {contactName} {channel === 'sms' ? (contactPhone || '') : (contactEmail || '')}
        </span>
      </div>

      {/* AI Drafts */}
      <div className="px-4 py-3 border-b border-border/50 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
          <Sparkles className="h-3 w-3" /> AI-Generated Drafts
        </div>
        <div className="space-y-1.5 max-h-[180px] overflow-auto">
          {drafts.map((draft, idx) => {
            const text = channel === 'sms' ? (draft as string) : (draft as { subject: string; body: string }).subject;
            const isSelected = selectedDraft === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectDraft(idx)}
                className={cn(
                  'w-full text-left p-2.5 rounded-lg border transition-colors text-[11px] leading-relaxed',
                  isSelected
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border/50 hover:border-primary/20 hover:bg-muted/30 text-muted-foreground'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2">{text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Composer area */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* Subject (Email only) */}
        {channel === 'email' && (
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] outline-none focus:border-primary/50"
              placeholder="Email subject..."
            />
          </div>
        )}

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
            <div className="relative">
              <button
                onClick={() => setShowMergeFields(!showMergeFields)}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-border text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Insert Field <ChevronDown className="h-2.5 w-2.5" />
              </button>
              {showMergeFields && (
                <div className="absolute right-0 top-full mt-1 z-50 w-[200px] rounded-lg border border-border bg-background shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
                  {mergeFields.map(field => (
                    <button
                      key={field.key}
                      onClick={() => insertMergeField(field)}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <span className="text-foreground font-medium">{field.label}</span>
                      <span className="text-muted-foreground font-mono text-[9px]">{field.key}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={channel === 'sms' ? 'Type your SMS...' : 'Type your email body...'}
            rows={channel === 'sms' ? 4 : 8}
            className="text-[13px] resize-none"
          />
          {channel === 'sms' && (
            <div className="text-[10px] text-muted-foreground text-right mt-1">
              {body.length}/160 characters
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => { setBody(''); setSubject(''); setSelectedDraft(null); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Clear
        </button>
        <Button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="gap-1.5 text-xs"
          size="sm"
        >
          <Send className="h-3.5 w-3.5" />
          {sending ? 'Sending...' : `Send ${channel === 'sms' ? 'SMS' : 'Email'}`}
        </Button>
      </div>
    </div>
  );
}
