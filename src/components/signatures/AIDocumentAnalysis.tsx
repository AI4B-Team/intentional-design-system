import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  PenTool,
  BookOpen,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignatureTemplate } from "@/types/signature-templates";

// ─── Types ──────────────────────────────────────────────────

export interface AIAnalysisResult {
  signatureLines: SignatureLineDetection[];
  pricingIssues: PricingIssue[];
  missingClauses: MissingClause[];
  complianceScore: number;
  suggestions: AISuggestion[];
}

interface SignatureLineDetection {
  id: string;
  page: number;
  label: string;
  confidence: number;
  fieldType: "signature" | "initial" | "date" | "text";
}

interface PricingIssue {
  id: string;
  severity: "error" | "warning" | "info";
  field: string;
  documentValue: string;
  expectedValue: string;
  description: string;
}

interface MissingClause {
  id: string;
  name: string;
  reason: string;
  importance: "critical" | "recommended" | "optional";
  suggestedContent?: string;
}

interface AISuggestion {
  id: string;
  type: "follow_up" | "action" | "review";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// ─── Mock AI analysis ───────────────────────────────────────

function generateMockAnalysis(template?: SignatureTemplate | null): AIAnalysisResult {
  return {
    signatureLines: [
      { id: "sl-1", page: 1, label: "Buyer Signature", confidence: 0.95, fieldType: "signature" },
      { id: "sl-2", page: 1, label: "Buyer Initials", confidence: 0.88, fieldType: "initial" },
      { id: "sl-3", page: 2, label: "Seller Signature", confidence: 0.92, fieldType: "signature" },
      { id: "sl-4", page: 2, label: "Date Signed", confidence: 0.97, fieldType: "date" },
      { id: "sl-5", page: 3, label: "Witness Signature", confidence: 0.72, fieldType: "signature" },
    ],
    pricingIssues: [
      { id: "pi-1", severity: "warning", field: "Purchase Price", documentValue: "$150,000", expectedValue: "$145,000", description: "Purchase price differs from deal asking price by $5,000" },
      { id: "pi-2", severity: "info", field: "Earnest Money", documentValue: "$1,000", expectedValue: "$1,500", description: "Earnest money is below typical 1% of purchase price" },
    ],
    missingClauses: [
      { id: "mc-1", name: "As-Is Condition", reason: "Property is distressed but no as-is clause found", importance: "critical" },
      { id: "mc-2", name: "Inspection Contingency", reason: "No inspection period defined in document", importance: "recommended" },
      { id: "mc-3", name: "Title Insurance Provision", reason: "Standard title insurance clause not detected", importance: "optional" },
    ],
    complianceScore: 74,
    suggestions: [
      { id: "sg-1", type: "follow_up", title: "Viewed 6+ hours ago — send follow-up", description: "Document was viewed over 6 hours ago without action. Consider sending a friendly reminder.", priority: "high" },
      { id: "sg-2", type: "action", title: "Add missing as-is clause", description: "This property appears distressed. Adding an as-is clause protects against post-close disputes.", priority: "high" },
      { id: "sg-3", type: "review", title: "Verify closing timeline", description: "The 30-day closing timeline may be aggressive for this deal type. Consider extending to 45 days.", priority: "medium" },
    ],
  };
}

// ─── Component ──────────────────────────────────────────────

interface AIDocumentAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  template?: SignatureTemplate | null;
  onApplySuggestion?: (suggestion: AISuggestion) => void;
  onAddClause?: (clause: MissingClause) => void;
}

export function AIDocumentAnalysis({
  isOpen,
  onClose,
  documentName,
  template,
  onApplySuggestion,
  onAddClause,
}: AIDocumentAnalysisProps) {
  const [analyzing, setAnalyzing] = React.useState(true);
  const [result, setResult] = React.useState<AIAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<"signatures" | "pricing" | "clauses" | "suggestions">("signatures");

  React.useEffect(() => {
    if (isOpen) {
      setAnalyzing(true);
      setResult(null);
      setActiveTab("signatures");
      const timer = setTimeout(() => {
        setResult(generateMockAnalysis(template));
        setAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, template]);

  const severityIcons: Record<string, React.ElementType> = {
    error: XCircle,
    warning: AlertTriangle,
    info: CheckCircle,
  };

  const severityColors: Record<string, string> = {
    error: "text-destructive",
    warning: "text-warning",
    info: "text-brand",
  };

  const importanceColors: Record<string, string> = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    recommended: "bg-warning/10 text-warning border-warning/20",
    optional: "bg-muted text-muted-foreground",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle>AI Document Analysis</DialogTitle>
              <DialogDescription>{documentName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-brand animate-spin" />
              <FileSearch className="h-5 w-5 text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Analyzing document...</p>
              <p className="text-sm text-muted-foreground mt-1">Detecting signature fields, validating terms, and checking compliance</p>
            </div>
          </div>
        ) : result ? (
          <>
            {/* Compliance Score */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-border-subtle">
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold",
                result.complianceScore >= 80 ? "bg-success/10 text-success" :
                result.complianceScore >= 60 ? "bg-warning/10 text-warning" :
                "bg-destructive/10 text-destructive"
              )}>
                {result.complianceScore}
              </div>
              <div>
                <p className="font-semibold text-foreground">Compliance Score</p>
                <p className="text-sm text-muted-foreground">
                  {result.signatureLines.length} signature fields · {result.pricingIssues.length} pricing notes · {result.missingClauses.length} clause suggestions
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border-subtle -mx-6 px-6">
              {([
                { key: "signatures" as const, label: "Signatures", icon: PenTool, count: result.signatureLines.length },
                { key: "pricing" as const, label: "Pricing", icon: DollarSign, count: result.pricingIssues.length },
                { key: "clauses" as const, label: "Clauses", icon: BookOpen, count: result.missingClauses.length },
                { key: "suggestions" as const, label: "AI Insights", icon: Sparkles, count: result.suggestions.length },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.key ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <Badge variant="outline" className="text-[10px] h-4 ml-0.5">{tab.count}</Badge>
                </button>
              ))}
            </div>

            <div className="py-3 space-y-3">
              {/* Signature Lines */}
              {activeTab === "signatures" && result.signatureLines.map((line) => (
                <div key={line.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    line.fieldType === "signature" ? "bg-brand/10" : "bg-muted"
                  )}>
                    {line.fieldType === "signature" ? <PenTool className="h-4 w-4 text-brand" /> :
                     line.fieldType === "initial" ? <FileText className="h-4 w-4 text-muted-foreground" /> :
                     <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{line.label}</p>
                    <p className="text-xs text-muted-foreground">Page {line.page} · {line.fieldType}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      line.confidence >= 0.9 ? "bg-success/10 text-success" :
                      line.confidence >= 0.75 ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    )}>
                      {Math.round(line.confidence * 100)}% confident
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Pricing Issues */}
              {activeTab === "pricing" && result.pricingIssues.map((issue) => {
                const SevIcon = severityIcons[issue.severity] || AlertTriangle;
                return (
                  <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary">
                    <SevIcon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", severityColors[issue.severity])} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{issue.field}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-muted">Doc: {issue.documentValue}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="px-2 py-0.5 rounded bg-brand/10 text-brand">Expected: {issue.expectedValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Missing Clauses */}
              {activeTab === "clauses" && result.missingClauses.map((clause) => (
                <div key={clause.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary">
                  <Shield className={cn("h-5 w-5 flex-shrink-0 mt-0.5",
                    clause.importance === "critical" ? "text-destructive" :
                    clause.importance === "recommended" ? "text-warning" : "text-muted-foreground"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{clause.name}</p>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", importanceColors[clause.importance])}>
                        {clause.importance}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{clause.reason}</p>
                  </div>
                  {onAddClause && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onAddClause(clause)}>
                      Add
                    </Button>
                  )}
                </div>
              ))}

              {/* AI Suggestions */}
              {activeTab === "suggestions" && result.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary">
                  <Sparkles className={cn("h-5 w-5 flex-shrink-0 mt-0.5",
                    suggestion.priority === "high" ? "text-destructive" :
                    suggestion.priority === "medium" ? "text-warning" : "text-muted-foreground"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", priorityColors[suggestion.priority])}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                  </div>
                  {onApplySuggestion && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onApplySuggestion(suggestion)}>
                      Apply
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
