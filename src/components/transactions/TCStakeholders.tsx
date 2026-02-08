import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Users,
  Building,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Scale,
  DollarSign,
  Search,
  Shield,
  Briefcase,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Stakeholder, StakeholderType, STAKEHOLDER_LABELS } from "@/lib/transaction-stages";
import { toast } from "sonner";

interface TCStakeholdersProps {
  stakeholders: Stakeholder[];
  onUpdateStakeholder: (id: string, updates: Partial<Stakeholder>) => void;
  onAddStakeholder: (stakeholder: Omit<Stakeholder, "id">) => void;
  className?: string;
}

const STAKEHOLDER_ICONS: Record<StakeholderType, React.ElementType> = {
  seller: User,
  seller_agent: Briefcase,
  buyer: User,
  buyer_agent: Briefcase,
  title_company: Scale,
  lender: DollarSign,
  inspector: Search,
  appraiser: Building,
  insurance: Shield,
  attorney: Briefcase,
};

const STAKEHOLDER_COLORS: Record<StakeholderType, string> = {
  seller: "bg-red-500/10 text-red-600",
  seller_agent: "bg-red-500/10 text-red-600",
  buyer: "bg-emerald-500/10 text-emerald-600",
  buyer_agent: "bg-emerald-500/10 text-emerald-600",
  title_company: "bg-indigo-500/10 text-indigo-600",
  lender: "bg-blue-500/10 text-blue-600",
  inspector: "bg-amber-500/10 text-amber-600",
  appraiser: "bg-purple-500/10 text-purple-600",
  insurance: "bg-cyan-500/10 text-cyan-600",
  attorney: "bg-slate-500/10 text-slate-600",
};

export function TCStakeholders({
  stakeholders,
  onUpdateStakeholder,
  onAddStakeholder,
  className,
}: TCStakeholdersProps) {
  const [expanded, setExpanded] = useState(true);

  const confirmedCount = stakeholders.filter(s => s.isConfirmed).length;
  const totalCount = stakeholders.length;

  // Group stakeholders by category
  const groups = {
    parties: stakeholders.filter(s => ["seller", "seller_agent", "buyer", "buyer_agent"].includes(s.type)),
    services: stakeholders.filter(s => ["title_company", "lender", "inspector", "appraiser", "insurance", "attorney"].includes(s.type)),
  };

  const handleSendMessage = (stakeholder: Stakeholder) => {
    toast.success(`Message draft created for ${stakeholder.name}`, {
      description: "Check your Inbox to send"
    });
  };

  return (
    <Card className={cn("p-4", className)}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Transaction Team</h3>
                <p className="text-sm text-muted-foreground">
                  {confirmedCount} of {totalCount} confirmed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {confirmedCount === totalCount && totalCount > 0 && (
                <Badge className="bg-success/10 text-success border-success/20 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All Confirmed
                </Badge>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {/* Parties */}
          {groups.parties.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Transaction Parties</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {groups.parties.map(stakeholder => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onUpdate={onUpdateStakeholder}
                    onSendMessage={handleSendMessage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {groups.services.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Providers</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {groups.services.map(stakeholder => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onUpdate={onUpdateStakeholder}
                    onSendMessage={handleSendMessage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Stakeholder */}
          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onUpdate: (id: string, updates: Partial<Stakeholder>) => void;
  onSendMessage: (stakeholder: Stakeholder) => void;
}

function StakeholderCard({ stakeholder, onUpdate, onSendMessage }: StakeholderCardProps) {
  const Icon = STAKEHOLDER_ICONS[stakeholder.type];
  const colorClass = STAKEHOLDER_COLORS[stakeholder.type];

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      stakeholder.isConfirmed ? "bg-success/5 border-success/20" : "bg-card"
    )}>
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn(colorClass)}>
          <Icon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{stakeholder.name}</span>
          {stakeholder.isConfirmed && (
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {STAKEHOLDER_LABELS[stakeholder.type]}
          {stakeholder.company && ` • ${stakeholder.company}`}
        </p>
        
        <div className="flex items-center gap-3 mt-2">
          {stakeholder.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => onSendMessage(stakeholder)}
            >
              <Mail className="h-3 w-3" />
              Email
            </Button>
          )}
          {stakeholder.phone && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              asChild
            >
              <a href={`tel:${stakeholder.phone}`}>
                <Phone className="h-3 w-3" />
                Call
              </a>
            </Button>
          )}
        </div>
      </div>

      <Checkbox
        checked={stakeholder.isConfirmed}
        onCheckedChange={(checked) => 
          onUpdate(stakeholder.id, { isConfirmed: checked === true })
        }
        className="mt-1"
      />
    </div>
  );
}
