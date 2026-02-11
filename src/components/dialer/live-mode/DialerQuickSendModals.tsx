import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MessageSquare, Mail, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { DialerContact } from './DialerCoPilotPanel';

// ============================================================================
// MERGE FIELDS
// ============================================================================
const MERGE_FIELDS = [
  { key: '{{seller_name}}', label: 'Seller Name' },
  { key: '{{property_address}}', label: 'Property Address' },
  { key: '{{your_name}}', label: 'Your Name' },
  { key: '{{your_company}}', label: 'Your Company' },
  { key: '{{your_phone}}', label: 'Your Phone' },
];

// ============================================================================
// SMS TEMPLATES
// ============================================================================
const SMS_TEMPLATES = [
  { id: 'intro', name: 'Introduction', body: 'Hi {{seller_name}}, this is {{your_name}} with {{your_company}}. I was reaching out about {{property_address}}. Do you have a moment to chat?' },
  { id: 'followup', name: 'Follow-Up', body: 'Hey {{seller_name}}, just following up on our earlier conversation about {{property_address}}. Any updates on your end?' },
  { id: 'offer', name: 'Offer Sent', body: 'Hi {{seller_name}}, I just sent over a written offer for {{property_address}}. Let me know if you have any questions!' },
];

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================
const EMAIL_TEMPLATES = [
  { id: 'intro', name: 'Introduction', subject: 'Quick question about {{property_address}}', body: 'Hi {{seller_name}},\n\nMy name is {{your_name}} with {{your_company}}. I came across {{property_address}} and wanted to reach out to see if you\'d be open to discussing a potential sale.\n\nWe work with property owners to provide fast, hassle-free closings. I\'d love to learn more about your situation and see if we can help.\n\nBest regards,\n{{your_name}}\n{{your_phone}}' },
  { id: 'followup', name: 'Follow-Up', subject: 'Following up — {{property_address}}', body: 'Hi {{seller_name}},\n\nJust wanted to follow up on our recent conversation about {{property_address}}. Have you had a chance to think things over?\n\nI\'m happy to answer any questions or discuss next steps whenever you\'re ready.\n\nBest,\n{{your_name}}' },
  { id: 'offer', name: 'Written Offer', subject: 'Written offer for {{property_address}}', body: 'Hi {{seller_name}},\n\nAttached is our written offer for {{property_address}}. Key highlights:\n\n• Cash purchase — no financing contingencies\n• Flexible closing timeline\n• We cover all closing costs\n\nPlease review at your convenience and let me know your thoughts.\n\nBest regards,\n{{your_name}}\n{{your_company}}\n{{your_phone}}' },
];

// ============================================================================
// SMS MODAL
// ============================================================================
interface SmsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: DialerContact | null;
}

export function DialerSmsModal({ open, onOpenChange, contact }: SmsModalProps) {
  const [message, setMessage] = React.useState('');
  const [templateId, setTemplateId] = React.useState<string>('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const tpl = SMS_TEMPLATES.find(t => t.id === id);
    if (tpl) {
      const merged = tpl.body
        .replace(/\{\{seller_name\}\}/g, contact?.name?.split(' ')[0] || '{{seller_name}}')
        .replace(/\{\{property_address\}\}/g, contact?.address || '{{property_address}}');
      setMessage(merged);
    }
  };

  const insertField = (field: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = message.slice(0, start) + field + message.slice(end);
      setMessage(newVal);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    } else {
      setMessage(prev => prev + field);
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`SMS sent to ${contact?.name || 'contact'}`);
    setMessage('');
    setTemplateId('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setMessage('');
    setTemplateId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <MessageSquare className="h-4 w-4 text-primary" />
            Send SMS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</Label>
            <Input
              value={contact?.phone || ''}
              readOnly
              className="mt-1.5 bg-muted/50 text-[13px]"
            />
            {contact?.name && (
              <div className="text-[11px] text-muted-foreground mt-1">{contact.name}</div>
            )}
          </div>

          {/* Template */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template (optional)</Label>
            <Select value={templateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="mt-1.5 text-[13px]">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {SMS_TEMPLATES.map(tpl => (
                  <SelectItem key={tpl.id} value={tpl.id} className="text-[13px]">
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline">
                    <Plus className="h-3 w-3" /> Insert Field
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  {MERGE_FIELDS.map(field => (
                    <button
                      key={field.key}
                      onClick={() => insertField(field.key)}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      {field.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[120px] text-[13px] resize-none"
              maxLength={1600}
            />
            <div className="text-[10px] text-muted-foreground mt-1 text-right">
              {message.length} / 1,600
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} disabled={!message.trim()}>
            Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EMAIL MODAL
// ============================================================================
interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: DialerContact | null;
}

export function DialerEmailModal({ open, onOpenChange, contact }: EmailModalProps) {
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [templateId, setTemplateId] = React.useState<string>('');
  const [toEmail, setToEmail] = React.useState('');
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open && contact) {
      setToEmail((contact as any).email || '');
    }
  }, [open, contact]);

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const tpl = EMAIL_TEMPLATES.find(t => t.id === id);
    if (tpl) {
      const merge = (text: string) => text
        .replace(/\{\{seller_name\}\}/g, contact?.name?.split(' ')[0] || '{{seller_name}}')
        .replace(/\{\{property_address\}\}/g, contact?.address || '{{property_address}}');
      setSubject(merge(tpl.subject));
      setBody(merge(tpl.body));
    }
  };

  const insertField = (field: string) => {
    const ta = bodyRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = body.slice(0, start) + field + body.slice(end);
      setBody(newVal);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    } else {
      setBody(prev => prev + field);
    }
  };

  const handleSend = () => {
    if (!toEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter a message body');
      return;
    }
    toast.success(`Email sent to ${contact?.name || toEmail}`);
    setSubject('');
    setBody('');
    setTemplateId('');
    setToEmail('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSubject('');
    setBody('');
    setTemplateId('');
    setToEmail('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <Mail className="h-4 w-4 text-primary" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</Label>
            <Input
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1.5 text-[13px]"
              type="email"
            />
            {contact?.name && (
              <div className="text-[11px] text-muted-foreground mt-1">{contact.name}</div>
            )}
          </div>

          {/* Template */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template (optional)</Label>
            <Select value={templateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="mt-1.5 text-[13px]">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map(tpl => (
                  <SelectItem key={tpl.id} value={tpl.id} className="text-[13px]">
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</Label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="mt-1.5 text-[13px]"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Body</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline">
                    <Plus className="h-3 w-3" /> Insert Field
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  {MERGE_FIELDS.map(field => (
                    <button
                      key={field.key}
                      onClick={() => insertField(field.key)}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      {field.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              ref={bodyRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your email..."
              className="min-h-[180px] text-[13px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} disabled={!toEmail.trim() || !subject.trim() || !body.trim()}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
