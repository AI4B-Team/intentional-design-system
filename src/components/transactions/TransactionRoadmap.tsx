import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  DollarSign,
  FileCheck,
  Key,
  Target,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Building,
  User,
  Phone,
  Mail,
  Search,
  Sparkles,
  ArrowRight,
  Home,
  Wrench,
  Users2,
  RefreshCcw,
  Repeat,
} from 'lucide-react';
import { toast } from 'sonner';

export type InvestmentStrategy = 'brrrr' | 'flip' | 'buy_and_hold' | 'wholesale' | 'str';

export interface TransactionData {
  id?: string;
  propertyId?: string;
  currentMilestone: number;
  
  // Milestone 1
  lenderName?: string;
  lenderPhone?: string;
  lenderEmail?: string;
  lenderConfirmed: boolean;
  realtorName?: string;
  realtorPhone?: string;
  realtorEmail?: string;
  realtorConfirmed: boolean;
  
  // Milestone 2
  listingPrice?: number;
  mao?: number;
  acceptedOffer?: number;
  escrowName?: string;
  escrowPhone?: string;
  escrowEmail?: string;
  escrowConfirmed: boolean;
  
  // Milestone 3
  inspectorName?: string;
  inspectorPhone?: string;
  inspectorAgentRecommended: boolean;
  appraiserName?: string;
  appraiserPhone?: string;
  appraiserAgentRecommended: boolean;
  insuranceName?: string;
  insuranceCarrier?: string;
  insurancePhone?: string;
  
  // Milestone 4
  closingFinancingFinalized: boolean;
  closingEscrowWired: boolean;
  closingFinalWalkthrough: boolean;
  closingDocumentsSigned: boolean;
  closingKeysReceived: boolean;
  
  // Milestone 5
  investmentStrategy?: InvestmentStrategy;
  strategyPhaseBuy: boolean;
  strategyPhaseRehab: boolean;
  strategyPhaseRent: boolean;
  strategyPhaseRefinance: boolean;
  strategyPhaseRepeat: boolean;
}

interface TransactionRoadmapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyAddress: string;
  propertyPrice: number;
  onSave?: (data: TransactionData) => void;
  initialData?: Partial<TransactionData>;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'locked' | 'active' | 'completed';
}

export function TransactionRoadmap({
  open,
  onOpenChange,
  propertyAddress,
  propertyPrice,
  onSave,
  initialData,
}: TransactionRoadmapProps) {
  const [currentMilestone, setCurrentMilestone] = React.useState(initialData?.currentMilestone || 1);
  const [data, setData] = React.useState<TransactionData>({
    currentMilestone: 1,
    lenderConfirmed: false,
    realtorConfirmed: false,
    escrowConfirmed: false,
    inspectorAgentRecommended: false,
    appraiserAgentRecommended: false,
    closingFinancingFinalized: false,
    closingEscrowWired: false,
    closingFinalWalkthrough: false,
    closingDocumentsSigned: false,
    closingKeysReceived: false,
    strategyPhaseBuy: false,
    strategyPhaseRehab: false,
    strategyPhaseRent: false,
    strategyPhaseRefinance: false,
    strategyPhaseRepeat: false,
    listingPrice: propertyPrice,
    ...initialData,
  });

  const milestones: Milestone[] = [
    {
      id: 1,
      title: 'Assemble Deal Team',
      description: 'Select your lender and realtor',
      icon: Users,
      status: currentMilestone > 1 ? 'completed' : currentMilestone === 1 ? 'active' : 'locked',
    },
    {
      id: 2,
      title: 'Make & Negotiate Offer',
      description: 'Define MAO and get under contract',
      icon: DollarSign,
      status: currentMilestone > 2 ? 'completed' : currentMilestone === 2 ? 'active' : 'locked',
    },
    {
      id: 3,
      title: 'Due Diligence',
      description: 'Inspections, appraisal, insurance',
      icon: FileCheck,
      status: currentMilestone > 3 ? 'completed' : currentMilestone === 3 ? 'active' : 'locked',
    },
    {
      id: 4,
      title: 'Close the Deal',
      description: 'Final checklist to ownership',
      icon: Key,
      status: currentMilestone > 4 ? 'completed' : currentMilestone === 4 ? 'active' : 'locked',
    },
    {
      id: 5,
      title: 'Execute Strategy',
      description: 'Turn property into performing asset',
      icon: Target,
      status: currentMilestone > 5 ? 'completed' : currentMilestone === 5 ? 'active' : 'locked',
    },
  ];

  const updateData = (updates: Partial<TransactionData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canAdvanceMilestone1 = (data.lenderConfirmed || data.lenderName) && (data.realtorConfirmed || data.realtorName);
  const canAdvanceMilestone2 = data.acceptedOffer && data.escrowConfirmed;
  const canAdvanceMilestone3 = data.inspectorName && data.appraiserName && data.insuranceName;
  const canAdvanceMilestone4 = data.closingFinancingFinalized && data.closingEscrowWired && 
    data.closingFinalWalkthrough && data.closingDocumentsSigned && data.closingKeysReceived;
  const canAdvanceMilestone5 = data.investmentStrategy && (
    data.strategyPhaseBuy || data.strategyPhaseRehab || data.strategyPhaseRent || 
    data.strategyPhaseRefinance || data.strategyPhaseRepeat
  );

  const handleAdvance = () => {
    if (currentMilestone < 5) {
      setCurrentMilestone(prev => prev + 1);
      updateData({ currentMilestone: currentMilestone + 1 });
      toast.success(`Milestone ${currentMilestone} completed!`);
    } else {
      toast.success('All milestones completed! 🎉');
      onSave?.(data);
      onOpenChange(false);
    }
  };

  const handleSave = () => {
    onSave?.(data);
    toast.success('Progress saved');
    onOpenChange(false);
  };

  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'active':
        return <Circle className="h-5 w-5 text-primary fill-primary/20" />;
      default:
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Transaction Roadmap</DialogTitle>
              <p className="text-sm text-muted-foreground">{propertyAddress}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Left Sidebar - Milestone Progress */}
          <div className="w-64 border-r border-border bg-muted/30 p-4">
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <button
                  key={milestone.id}
                  onClick={() => milestone.status !== 'locked' && setCurrentMilestone(milestone.id)}
                  disabled={milestone.status === 'locked'}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                    milestone.status === 'active' && 'bg-primary/10 border border-primary/30',
                    milestone.status === 'completed' && 'bg-success/5 hover:bg-success/10',
                    milestone.status === 'locked' && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="mt-0.5">{getMilestoneIcon(milestone.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      milestone.status === 'active' && 'text-primary',
                      milestone.status === 'completed' && 'text-success'
                    )}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {milestone.description}
                    </p>
                  </div>
                  {milestone.status === 'active' && (
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Current Milestone Steps */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {currentMilestone === 1 && (
                <Milestone1DealTeam data={data} updateData={updateData} />
              )}
              {currentMilestone === 2 && (
                <Milestone2Offer data={data} updateData={updateData} propertyPrice={propertyPrice} />
              )}
              {currentMilestone === 3 && (
                <Milestone3DueDiligence data={data} updateData={updateData} />
              )}
              {currentMilestone === 4 && (
                <Milestone4Closing data={data} updateData={updateData} />
              )}
              {currentMilestone === 5 && (
                <Milestone5Strategy data={data} updateData={updateData} />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <Button variant="outline" onClick={handleSave}>
            Save Progress
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Milestone {currentMilestone} of 5
            </Badge>
            <Button 
              onClick={handleAdvance}
              disabled={
                (currentMilestone === 1 && !canAdvanceMilestone1) ||
                (currentMilestone === 2 && !canAdvanceMilestone2) ||
                (currentMilestone === 3 && !canAdvanceMilestone3) ||
                (currentMilestone === 4 && !canAdvanceMilestone4) ||
                (currentMilestone === 5 && !canAdvanceMilestone5)
              }
              className="gap-2"
            >
              {currentMilestone === 5 ? 'Complete' : 'Next Milestone'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Milestone 1: Assemble Deal Team
function Milestone1DealTeam({ data, updateData }: { data: TransactionData; updateData: (updates: Partial<TransactionData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Assemble Your Deal Team</h3>
        <p className="text-sm text-muted-foreground">
          Select or confirm your lender and realtor to move forward.
        </p>
      </div>

      {/* Lender Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Lender</h4>
            <p className="text-sm text-muted-foreground">Who will finance this deal?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="lender-confirmed"
              checked={data.lenderConfirmed}
              onCheckedChange={(checked) => updateData({ lenderConfirmed: checked === true })}
            />
            <Label htmlFor="lender-confirmed" className="text-sm">
              I already have a lender
            </Label>
          </div>

          {!data.lenderConfirmed && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  placeholder="Lender name"
                  value={data.lenderName || ''}
                  onChange={(e) => updateData({ lenderName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={data.lenderPhone || ''}
                  onChange={(e) => updateData({ lenderPhone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  placeholder="Email address"
                  value={data.lenderEmail || ''}
                  onChange={(e) => updateData({ lenderEmail: e.target.value })}
                />
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search Marketplace Directory
          </Button>
        </div>
      </Card>

      {/* Realtor Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <User className="h-5 w-5 text-info" />
          </div>
          <div>
            <h4 className="font-semibold">Real Estate Agent</h4>
            <p className="text-sm text-muted-foreground">Your transaction agent of record</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="realtor-confirmed"
              checked={data.realtorConfirmed}
              onCheckedChange={(checked) => updateData({ realtorConfirmed: checked === true })}
            />
            <Label htmlFor="realtor-confirmed" className="text-sm">
              I already have an agent
            </Label>
          </div>

          {!data.realtorConfirmed && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  placeholder="Agent name"
                  value={data.realtorName || ''}
                  onChange={(e) => updateData({ realtorName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={data.realtorPhone || ''}
                  onChange={(e) => updateData({ realtorPhone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  placeholder="Email address"
                  value={data.realtorEmail || ''}
                  onChange={(e) => updateData({ realtorEmail: e.target.value })}
                />
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search Saved Contacts
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Milestone 2: Make & Negotiate Offer
function Milestone2Offer({ data, updateData, propertyPrice }: { data: TransactionData; updateData: (updates: Partial<TransactionData>) => void; propertyPrice: number }) {
  const maoWarning = data.acceptedOffer && data.mao && data.acceptedOffer > data.mao;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Make & Negotiate Offer</h3>
        <p className="text-sm text-muted-foreground">
          Capture the economics and get the property under contract.
        </p>
      </div>

      {/* Pricing */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Listing Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-8"
                value={data.listingPrice || propertyPrice}
                onChange={(e) => updateData({ listingPrice: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Maximum Allowable Offer (MAO)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-8"
                placeholder="Your max offer"
                value={data.mao || ''}
                onChange={(e) => updateData({ mao: Number(e.target.value) })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used as a decision guardrail</p>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Accepted Offer Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              className={cn('pl-8', maoWarning && 'border-warning')}
              placeholder="Enter when offer is accepted"
              value={data.acceptedOffer || ''}
              onChange={(e) => updateData({ acceptedOffer: Number(e.target.value) })}
            />
          </div>
          {maoWarning && (
            <p className="text-xs text-warning mt-1 flex items-center gap-1">
              ⚠️ Accepted offer exceeds your MAO by ${(data.acceptedOffer! - data.mao!).toLocaleString()}
            </p>
          )}
        </div>
      </Card>

      {/* Escrow/Title */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold">Escrow / Title Provider</h4>
            <p className="text-sm text-muted-foreground">For closing coordination</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input
                placeholder="Title company name"
                value={data.escrowName || ''}
                onChange={(e) => updateData({ escrowName: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input
                placeholder="Phone number"
                value={data.escrowPhone || ''}
                onChange={(e) => updateData({ escrowPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="escrow-confirmed"
              checked={data.escrowConfirmed}
              onCheckedChange={(checked) => updateData({ escrowConfirmed: checked === true })}
            />
            <Label htmlFor="escrow-confirmed" className="text-sm">
              Escrow provider confirmed
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Milestone 3: Due Diligence
function Milestone3DueDiligence({ data, updateData }: { data: TransactionData; updateData: (updates: Partial<TransactionData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Under Contract / Due Diligence</h3>
        <p className="text-sm text-muted-foreground">
          Validate the deal before closing.
        </p>
      </div>

      {/* Inspector */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Search className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Home Inspector</h4>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="inspector-recommended"
              checked={data.inspectorAgentRecommended}
              onCheckedChange={(checked) => updateData({ inspectorAgentRecommended: checked === true })}
            />
            <Label htmlFor="inspector-recommended" className="text-xs text-muted-foreground">
              Agent recommended
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Inspector name" value={data.inspectorName || ''} onChange={(e) => updateData({ inspectorName: e.target.value })} />
          <Input placeholder="Phone" value={data.inspectorPhone || ''} onChange={(e) => updateData({ inspectorPhone: e.target.value })} />
        </div>
      </Card>

      {/* Appraiser */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-info" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Appraiser</h4>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="appraiser-recommended"
              checked={data.appraiserAgentRecommended}
              onCheckedChange={(checked) => updateData({ appraiserAgentRecommended: checked === true })}
            />
            <Label htmlFor="appraiser-recommended" className="text-xs text-muted-foreground">
              Agent recommended
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Appraiser name" value={data.appraiserName || ''} onChange={(e) => updateData({ appraiserName: e.target.value })} />
          <Input placeholder="Phone" value={data.appraiserPhone || ''} onChange={(e) => updateData({ appraiserPhone: e.target.value })} />
        </div>
      </Card>

      {/* Insurance */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h4 className="font-semibold">Insurance Provider</h4>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Provider name" value={data.insuranceName || ''} onChange={(e) => updateData({ insuranceName: e.target.value })} />
          <Input placeholder="Carrier" value={data.insuranceCarrier || ''} onChange={(e) => updateData({ insuranceCarrier: e.target.value })} />
        </div>
      </Card>
    </div>
  );
}

// Milestone 4: Closing the Deal
function Milestone4Closing({ data, updateData }: { data: TransactionData; updateData: (updates: Partial<TransactionData>) => void }) {
  const items = [
    { key: 'closingFinancingFinalized', label: 'Finalize financing with lender', checked: data.closingFinancingFinalized },
    { key: 'closingEscrowWired', label: 'Wire escrow deposit', checked: data.closingEscrowWired },
    { key: 'closingFinalWalkthrough', label: 'Complete final walkthrough', checked: data.closingFinalWalkthrough },
    { key: 'closingDocumentsSigned', label: 'Sign all closing documents', checked: data.closingDocumentsSigned },
    { key: 'closingKeysReceived', label: 'Take possession (keys transferred)', checked: data.closingKeysReceived },
  ];

  const completedCount = items.filter(i => i.checked).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Close the Deal</h3>
        <p className="text-sm text-muted-foreground">
          Final checklist to ownership transfer.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Closing Checklist</h4>
          <Badge variant="secondary">{completedCount} / {items.length}</Badge>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id={item.key}
                checked={item.checked}
                onCheckedChange={(checked) => updateData({ [item.key]: checked === true })}
              />
              <Label htmlFor={item.key} className={cn('flex-1', item.checked && 'line-through text-muted-foreground')}>
                {item.label}
              </Label>
              {item.checked && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Milestone 5: Execute Investment Strategy
function Milestone5Strategy({ data, updateData }: { data: TransactionData; updateData: (updates: Partial<TransactionData>) => void }) {
  const strategies = [
    { id: 'brrrr', label: 'BRRRR', description: 'Buy, Rehab, Rent, Refinance, Repeat' },
    { id: 'flip', label: 'Fix & Flip', description: 'Renovate and sell for profit' },
    { id: 'buy_and_hold', label: 'Buy & Hold', description: 'Long-term rental investment' },
    { id: 'wholesale', label: 'Wholesale', description: 'Assign contract to end buyer' },
    { id: 'str', label: 'Short-Term Rental', description: 'Airbnb / vacation rental' },
  ];

  const brrrrPhases = [
    { key: 'strategyPhaseBuy', label: 'Buy', description: 'Purchase completed within MAO', icon: Home, checked: data.strategyPhaseBuy },
    { key: 'strategyPhaseRehab', label: 'Rehab', description: 'Track renovation readiness', icon: Wrench, checked: data.strategyPhaseRehab },
    { key: 'strategyPhaseRent', label: 'Rent', description: 'Confirm tenant placement', icon: Users2, checked: data.strategyPhaseRent },
    { key: 'strategyPhaseRefinance', label: 'Refinance', description: 'Capture refinance event', icon: RefreshCcw, checked: data.strategyPhaseRefinance },
    { key: 'strategyPhaseRepeat', label: 'Repeat', description: 'Property leverage-ready', icon: Repeat, checked: data.strategyPhaseRepeat },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Execute Investment Strategy</h3>
        <p className="text-sm text-muted-foreground">
          Turn the property into a performing asset.
        </p>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Select Strategy</h4>
        <RadioGroup
          value={data.investmentStrategy}
          onValueChange={(value) => updateData({ investmentStrategy: value as InvestmentStrategy })}
          className="grid grid-cols-2 gap-3"
        >
          {strategies.map((strategy) => (
            <div key={strategy.id} className={cn(
              'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              data.investmentStrategy === strategy.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}>
              <RadioGroupItem value={strategy.id} id={strategy.id} className="mt-0.5" />
              <Label htmlFor={strategy.id} className="cursor-pointer">
                <span className="font-medium">{strategy.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{strategy.description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {data.investmentStrategy === 'brrrr' && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">BRRRR Execution Phases</h4>
          <div className="space-y-3">
            {brrrrPhases.map((phase) => (
              <div key={phase.key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox
                  id={phase.key}
                  checked={phase.checked}
                  onCheckedChange={(checked) => updateData({ [phase.key]: checked === true })}
                />
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <phase.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={phase.key} className={cn('font-medium', phase.checked && 'text-success')}>
                    {phase.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                </div>
                {phase.checked && <CheckCircle2 className="h-4 w-4 text-success" />}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
