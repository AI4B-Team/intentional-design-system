import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Upload,
  Image,
  Video,
  ThumbsUp,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Send,
  X,
  Camera,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle2,
  Link2,
  Archive
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// Types
interface Attachment {
  id: string;
  type: "image" | "video" | "screen-recording";
  url: string;
  name: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface FeedbackItem {
  id: string;
  type: "general" | "bug" | "feature";
  title: string;
  description: string;
  severity?: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed" | "planned" | "completed";
  attachments: Attachment[];
  voteCount: number;
  hasVoted: boolean;
  comments: Comment[];
  createdAt: string;
  userName: string;
  similarityGroup?: string;
}

// Mock data
const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    type: "feature",
    title: "Add dark mode support",
    description: "It would be great to have a dark mode option for better viewing at night.",
    status: "planned",
    attachments: [],
    voteCount: 24,
    hasVoted: false,
    comments: [
      { id: "c1", userId: "u1", userName: "John D.", content: "This would be amazing! I work late nights often.", createdAt: "2024-01-20T10:30:00Z" },
      { id: "c2", userId: "u2", userName: "Sarah M.", content: "+1 for this feature!", createdAt: "2024-01-21T14:15:00Z" },
    ],
    createdAt: "2024-01-15T09:00:00Z",
    userName: "Mike S.",
  },
  {
    id: "2",
    type: "feature",
    title: "Bulk property import from CSV",
    description: "Allow importing multiple properties at once from a CSV file.",
    status: "open",
    attachments: [],
    voteCount: 18,
    hasVoted: true,
    comments: [],
    createdAt: "2024-01-18T11:00:00Z",
    userName: "Lisa K.",
  },
  {
    id: "3",
    type: "bug",
    title: "Map not loading on property detail page",
    description: "The map component fails to render on certain property pages. Getting a blank area instead.",
    severity: "high",
    status: "in_progress",
    attachments: [{ id: "a1", type: "image", url: "/placeholder.svg", name: "screenshot.png" }],
    voteCount: 5,
    hasVoted: false,
    comments: [
      { id: "c3", userId: "u3", userName: "Dev Team", content: "We're investigating this issue. It seems related to the API key.", createdAt: "2024-01-22T09:00:00Z" },
    ],
    createdAt: "2024-01-21T16:00:00Z",
    userName: "Tom R.",
    similarityGroup: "map-issues",
  },
  {
    id: "4",
    type: "bug",
    title: "Map crashes when zooming in",
    description: "Map becomes unresponsive after zooming in too much.",
    severity: "medium",
    status: "open",
    attachments: [],
    voteCount: 3,
    hasVoted: false,
    comments: [],
    createdAt: "2024-01-22T10:00:00Z",
    userName: "Anna P.",
    similarityGroup: "map-issues",
  },
  {
    id: "5",
    type: "bug",
    title: "Filter not persisting after page refresh",
    description: "When I set filters on the properties page and refresh, they reset to defaults.",
    severity: "low",
    status: "open",
    attachments: [],
    voteCount: 2,
    hasVoted: false,
    comments: [],
    createdAt: "2024-01-23T08:00:00Z",
    userName: "Chris L.",
  },
  {
    id: "6",
    type: "general",
    title: "Great platform overall!",
    description: "Just wanted to say the team is doing an amazing job. The new marketplace feature is exactly what I needed.",
    status: "closed",
    attachments: [],
    voteCount: 12,
    hasVoted: true,
    comments: [],
    createdAt: "2024-01-10T15:00:00Z",
    userName: "Rachel G.",
  },
  {
    id: "7",
    type: "general",
    title: "Love the new dashboard layout",
    description: "The recent UI updates make navigation so much easier. Really appreciate the attention to detail!",
    status: "open",
    attachments: [],
    voteCount: 8,
    hasVoted: false,
    comments: [
      { id: "c4", userId: "u4", userName: "Alex T.", content: "Agreed! The new sidebar is much cleaner.", createdAt: "2024-01-24T11:00:00Z" },
    ],
    createdAt: "2024-01-23T14:00:00Z",
    userName: "Jordan M.",
  },
  {
    id: "8",
    type: "general",
    title: "Suggestion for onboarding",
    description: "It would be helpful to have a quick tutorial or walkthrough for new users when they first sign up.",
    status: "open",
    attachments: [],
    voteCount: 15,
    hasVoted: true,
    comments: [],
    createdAt: "2024-01-22T09:30:00Z",
    userName: "Taylor B.",
  },
  {
    id: "9",
    type: "general",
    title: "Mobile experience feedback",
    description: "Using the app on my phone works well but some buttons are a bit small on the property cards.",
    status: "open",
    attachments: [],
    voteCount: 6,
    hasVoted: false,
    comments: [
      { id: "c5", userId: "u5", userName: "Casey R.", content: "Same here on my Android device.", createdAt: "2024-01-25T16:00:00Z" },
    ],
    createdAt: "2024-01-24T18:00:00Z",
    userName: "Morgan L.",
  },
];

const Feedback: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [feedback, setFeedback] = useState(mockFeedback);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitType, setSubmitType] = useState<"general" | "bug" | "feature">("general");
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState<"low" | "medium" | "high">("medium");
  const [formAttachments, setFormAttachments] = useState<File[]>([]);

  const handleVote = (id: string) => {
    setFeedback(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          voteCount: item.hasVoted ? item.voteCount - 1 : item.voteCount + 1,
          hasVoted: !item.hasVoted,
        };
      }
      return item;
    }));
  };

  const handleAddComment = (feedbackId: string) => {
    const content = newComment[feedbackId];
    if (!content?.trim()) return;

    setFeedback(prev => prev.map(item => {
      if (item.id === feedbackId) {
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              id: Date.now().toString(),
              userId: "current-user",
              userName: "You",
              content: content.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return item;
    }));
    setNewComment(prev => ({ ...prev, [feedbackId]: "" }));
    toast.success("Comment added");
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setFormAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type: submitType,
      title: formTitle,
      description: formDescription,
      severity: submitType === "bug" ? formSeverity : undefined,
      status: "open",
      attachments: formAttachments.map((file, i) => ({
        id: `att-${i}`,
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        name: file.name,
      })),
      voteCount: 0,
      hasVoted: false,
      comments: [],
      createdAt: new Date().toISOString(),
      userName: "You",
    };

    setFeedback(prev => [newFeedback, ...prev]);
    setShowSubmitDialog(false);
    setFormTitle("");
    setFormDescription("");
    setFormSeverity("medium");
    setFormAttachments([]);
    toast.success(`${submitType === "bug" ? "Bug report" : submitType === "feature" ? "Feature request" : "Feedback"} submitted!`);
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const file = new File([blob], `screen-recording-${Date.now()}.webm`, { type: "video/webm" });
        setFormAttachments(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
        toast.success("Screen recording saved");
      };
      
      mediaRecorder.start();
      toast.info("Recording started. Click stop when done.");
      
      // Auto-stop after 5 minutes
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 300000);
    } catch (err) {
      toast.error("Could not start screen recording");
    }
  };

  const captureScreenshot = async () => {
    try {
      // Hide the dialog visually without unmounting it
      const dialogOverlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
      const dialogContent = document.querySelector('[data-radix-dialog-content]') as HTMLElement;
      
      if (dialogOverlay) dialogOverlay.style.visibility = 'hidden';
      if (dialogContent) dialogContent.style.visibility = 'hidden';
      
      // Small delay to ensure CSS is applied
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        ignoreElements: (element) => {
          // Ignore the dialog elements during capture
          return element.hasAttribute('data-radix-dialog-overlay') || 
                 element.hasAttribute('data-radix-dialog-content');
        }
      });
      
      // Restore dialog visibility
      if (dialogOverlay) dialogOverlay.style.visibility = 'visible';
      if (dialogContent) dialogContent.style.visibility = 'visible';
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" });
          setFormAttachments(prev => [...prev, file]);
          toast.success("Screenshot captured");
        }
      }, "image/png");
    } catch (err) {
      console.error('Screenshot error:', err);
      toast.error("Could not capture screenshot");
      // Restore dialog visibility on error
      const dialogOverlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
      const dialogContent = document.querySelector('[data-radix-dialog-content]') as HTMLElement;
      if (dialogOverlay) dialogOverlay.style.visibility = 'visible';
      if (dialogContent) dialogContent.style.visibility = 'visible';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium": return <AlertCircle className="h-4 w-4 text-warning" />;
      case "low": return <Info className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: "default" | "secondary" | "outline"; icon: React.ReactNode } } = {
      open: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
      in_progress: { variant: "default", icon: <Clock className="h-3 w-3" /> },
      resolved: { variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
      closed: { variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
      planned: { variant: "default", icon: <Clock className="h-3 w-3" /> },
      completed: { variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.open;
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  // Helper to check if feedback is archived (closed or resolved)
  const isArchived = (status: string) => status === "closed" || status === "resolved" || status === "completed";

  // Group bugs by similarity (exclude archived)
  const activeBugs = feedback.filter(f => f.type === "bug" && !isArchived(f.status));
  const groupedBugs = activeBugs.reduce((acc, bug) => {
    const group = bug.similarityGroup || bug.id;
    if (!acc[group]) acc[group] = [];
    acc[group].push(bug);
    return acc;
  }, {} as { [key: string]: FeedbackItem[] });

  const featureRequests = feedback.filter(f => f.type === "feature" && !isArchived(f.status)).sort((a, b) => b.voteCount - a.voteCount);
  const generalFeedback = feedback.filter(f => f.type === "general" && !isArchived(f.status));
  
  // Archived items
  const archivedFeedback = feedback.filter(f => isArchived(f.status)).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const renderFeedbackCard = (item: FeedbackItem, showSimilar?: FeedbackItem[]) => {
    const itemIsArchived = isArchived(item.status);
    
    return (
    <Card key={item.id} className={cn("mb-4", itemIsArchived && "opacity-70 bg-muted/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.type === "bug" && getSeverityIcon(item.severity)}
              <CardTitle className="text-base">{item.title}</CardTitle>
            </div>
            <CardDescription className="text-sm">{item.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(item.status)}
          </div>
        </div>
        
        {/* Attachments */}
        {item.attachments.length > 0 && (
          <div className="flex gap-2 mt-3">
            {item.attachments.map(att => (
              <div key={att.id} className="relative group">
                <img src={att.url} alt={att.name} className="h-16 w-16 object-cover rounded-md border" />
              </div>
            ))}
          </div>
        )}
        
        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>By {item.userName}</span>
          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Actions */}
        <div className="flex items-center gap-4 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => !itemIsArchived && handleVote(item.id)}
            disabled={itemIsArchived}
            className={cn("gap-2", item.hasVoted && "text-primary", itemIsArchived && "cursor-not-allowed")}
            title={itemIsArchived ? "Voting is closed" : undefined}
          >
            <ThumbsUp className={cn("h-4 w-4", item.hasVoted && "fill-current")} />
            {item.voteCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleComments(item.id)}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {item.comments.length}
          </Button>
          {itemIsArchived && (
            <span className="text-xs text-muted-foreground ml-auto">Archived</span>
          )}
        </div>
        
        {/* Similar bugs */}
        {showSimilar && showSimilar.length > 1 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Link2 className="h-3 w-3" />
              {showSimilar.length - 1} similar report{showSimilar.length > 2 ? "s" : ""}
            </div>
            <div className="space-y-2">
              {showSimilar.filter(s => s.id !== item.id).map(similar => (
                <div key={similar.id} className="text-sm p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(similar.severity)}
                    <span className="font-medium">{similar.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{similar.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comments */}
        <Collapsible open={expandedComments.includes(item.id)}>
          <CollapsibleContent className="mt-3 pt-3 border-t space-y-3">
            {item.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{comment.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {/* Add comment - only show if not archived */}
            {!itemIsArchived ? (
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment[item.id] || ""}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(item.id)}
                />
                <Button size="icon" onClick={() => handleAddComment(item.id)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground pt-2 text-center">
                Comments are closed for archived items
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
  };

  return (
    <PageLayout title="Feedback">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Center</h1>
          <p className="text-muted-foreground">Share your thoughts, report bugs, or request new features</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => { setSubmitType("general"); setShowSubmitDialog(true); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">General Feedback</h3>
              <p className="text-sm text-muted-foreground">Share your thoughts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => { setSubmitType("bug"); setShowSubmitDialog(true); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">Report a Bug</h3>
              <p className="text-sm text-muted-foreground">Something not working?</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => { setSubmitType("feature"); setShowSubmitDialog(true); }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Lightbulb className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">Feature Request</h3>
              <p className="text-sm text-muted-foreground">Suggest an improvement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 gap-3 bg-transparent p-0">
          <TabsTrigger value="general" className="gap-2 border border-border-subtle bg-surface data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary rounded-md px-4">
            <MessageSquare className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="bugs" className="gap-2 border border-border-subtle bg-surface data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary rounded-md px-4">
            <Bug className="h-4 w-4" />
            Bug Reports
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2 border border-border-subtle bg-surface data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary rounded-md px-4">
            <Lightbulb className="h-4 w-4" />
            Feature Requests
          </TabsTrigger>
          {archivedFeedback.length > 0 && (
            <TabsTrigger value="archived" className="gap-2 border border-border-subtle bg-surface data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary rounded-md px-4">
              <Archive className="h-4 w-4" />
              Archived ({archivedFeedback.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          {generalFeedback.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Feedback Yet</p>
            </div>
          ) : (
            generalFeedback.map(item => renderFeedbackCard(item))
          )}
        </TabsContent>

        <TabsContent value="bugs">
          {Object.keys(groupedBugs).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bug reports yet</p>
            </div>
          ) : (
            Object.entries(groupedBugs).map(([group, bugs]) => (
              <div key={group}>
                {renderFeedbackCard(bugs[0], bugs)}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="features">
          {featureRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feature requests yet</p>
            </div>
          ) : (
            featureRequests.map(item => renderFeedbackCard(item))
          )}
        </TabsContent>

        <TabsContent value="archived">
          {archivedFeedback.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No archived feedback yet</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                Archived items are closed for voting and new comments.
              </div>
              {archivedFeedback.map(item => renderFeedbackCard(item))}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent size="lg" className="!max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {submitType === "general" && <MessageSquare className="h-5 w-5 text-blue-600" />}
              {submitType === "bug" && <Bug className="h-5 w-5 text-red-600" />}
              {submitType === "feature" && <Lightbulb className="h-5 w-5 text-amber-600" />}
              {submitType === "general" && "Submit Feedback"}
              {submitType === "bug" && "Report a Bug"}
              {submitType === "feature" && "Request a Feature"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Title *</Label>
                <span className="text-xs text-muted-foreground">{formTitle.length}/100</span>
              </div>
              <Input
                id="title"
                maxLength={100}
                placeholder={
                  submitType === "bug" 
                    ? "Brief description of the issue" 
                    : submitType === "feature"
                    ? "What feature would you like?"
                    : "What's on your mind?"
                }
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder={
                  submitType === "bug"
                    ? "Steps to reproduce, expected behavior, actual behavior..."
                    : "Provide more details..."
                }
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            {submitType === "bug" && (
              <div>
                <Label>Severity</Label>
                <Select value={formSeverity} onValueChange={(v: "low" | "medium" | "high") => setFormSeverity(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-[100]">
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Low - Minor issue, workaround available
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        Medium - Affects functionality
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        High - Critical, blocking issue
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Attachments */}
            <div>
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Image className="h-4 w-4" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={captureScreenshot}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Screenshot Page
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startScreenRecording}
                  className="gap-2"
                >
                  <Video className="h-4 w-4" />
                  Record Screen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              {/* Attachment previews */}
              {formAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formAttachments.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center border">
                        {file.type.startsWith("image") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setLightboxImage(URL.createObjectURL(file))}
                          />
                        ) : (
                          <Video className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox for viewing images */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="!max-w-4xl !max-h-[90vh] p-2 bg-black/90 border-none">
          {lightboxImage && (
            <img
              src={lightboxImage}
              alt="Full size preview"
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Feedback;
