import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Building2,
  Landmark,
  UserCheck,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface VendorEntry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const emptyVendor = (): VendorEntry => ({
  id: crypto.randomUUID(),
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  isDefault: true,
});

function VendorCard({
  title,
  description,
  icon: Icon,
  vendor,
  onChange,
  iconColor,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  vendor: VendorEntry;
  onChange: (v: VendorEntry) => void;
  iconColor: string;
}) {
  const update = (key: keyof VendorEntry, value: string | boolean) => {
    onChange({ ...vendor, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${iconColor}/10`}>
            <Icon className={`h-5 w-5 text-${iconColor}`} />
          </div>
          <div>
            <CardTitle className="text-body">{title}</CardTitle>
            <CardDescription className="text-tiny">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-tiny">Contact Name</Label>
            <Input
              placeholder="John Smith"
              value={vendor.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-tiny">Company</Label>
            <Input
              placeholder="Company name"
              value={vendor.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-tiny">Email</Label>
            <Input
              type="email"
              placeholder="email@company.com"
              value={vendor.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-tiny">Phone</Label>
            <Input
              placeholder="(555) 555-5555"
              value={vendor.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-tiny">Address</Label>
          <Input
            placeholder="123 Main St, City, ST 12345"
            value={vendor.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountDefaultsSection() {
  const [titleCompany, setTitleCompany] = React.useState<VendorEntry>(emptyVendor());
  const [lender, setLender] = React.useState<VendorEntry>(emptyVendor());
  const [agent, setAgent] = React.useState<VendorEntry>(emptyVendor());

  // EMD Defaults
  const [emdAmount, setEmdAmount] = React.useState("1000");
  const [emdType, setEmdType] = React.useState<"fixed" | "percentage">("fixed");
  const [emdPercentage, setEmdPercentage] = React.useState("1");
  const [autoSendToTitle, setAutoSendToTitle] = React.useState(true);
  const [closingTimeline, setClosingTimeline] = React.useState("21");

  const handleSave = () => {
    // Save to localStorage for now, will migrate to DB
    const defaults = {
      titleCompany,
      lender,
      agent,
      emd: { amount: emdAmount, type: emdType, percentage: emdPercentage },
      autoSendToTitle,
      closingTimeline,
    };
    localStorage.setItem("realelite_account_defaults", JSON.stringify(defaults));
    toast({ title: "Account Defaults Saved", description: "Your vendor and deal defaults have been updated." });
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("realelite_account_defaults");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.titleCompany) setTitleCompany(data.titleCompany);
        if (data.lender) setLender(data.lender);
        if (data.agent) setAgent(data.agent);
        if (data.emd) {
          setEmdAmount(data.emd.amount || "1000");
          setEmdType(data.emd.type || "fixed");
          setEmdPercentage(data.emd.percentage || "1");
        }
        if (data.autoSendToTitle !== undefined) setAutoSendToTitle(data.autoSendToTitle);
        if (data.closingTimeline) setClosingTimeline(data.closingTimeline);
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-h3 font-semibold text-content">Account Defaults</h2>
        <p className="text-small text-content-secondary mt-1">
          Set up your default vendors and deal parameters. These will auto-populate in contracts and offers.
        </p>
      </div>

      <VendorCard
        title="Title Company"
        description="Default title company for closing. Contracts will auto-send here."
        icon={Building2}
        iconColor="blue-400"
        vendor={titleCompany}
        onChange={setTitleCompany}
      />

      <VendorCard
        title="Preferred Lender"
        description="Default lender for financing. Used in automated pre-approval workflows."
        icon={Landmark}
        iconColor="emerald-400"
        vendor={lender}
        onChange={setLender}
      />

      <VendorCard
        title="Default Agent"
        description="Agent used for making offers through the automated system."
        icon={UserCheck}
        iconColor="purple-400"
        vendor={agent}
        onChange={setAgent}
      />

      {/* EMD & Deal Defaults */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-400/10">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-body">Deal Defaults</CardTitle>
              <CardDescription className="text-tiny">
                Default EMD, closing timeline, and offer parameters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-tiny">EMD Amount ($)</Label>
              <Input
                type="number"
                value={emdAmount}
                onChange={(e) => setEmdAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-tiny">EMD % (of offer)</Label>
              <Input
                type="number"
                value={emdPercentage}
                onChange={(e) => setEmdPercentage(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-tiny">Closing Timeline (days)</Label>
              <Input
                type="number"
                value={closingTimeline}
                onChange={(e) => setClosingTimeline(e.target.value)}
                placeholder="21"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-small font-medium text-content">Auto-Send to Title Company</p>
              <p className="text-tiny text-content-tertiary">
                Automatically forward executed contracts to your title company
              </p>
            </div>
            <Switch checked={autoSendToTitle} onCheckedChange={setAutoSendToTitle} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Account Defaults
        </Button>
      </div>
    </div>
  );
}
