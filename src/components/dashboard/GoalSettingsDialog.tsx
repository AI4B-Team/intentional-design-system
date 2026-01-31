import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Users, FileText, Handshake, BadgeDollarSign, Save } from "lucide-react";
import { toast } from "sonner";

interface GoalSettingsDialogProps {
  children: React.ReactNode;
}

interface Goals {
  leadsGoal: number;
  offersGoal: number;
  contractsGoal: number;
  soldGoal: number;
  revenueGoal: number;
  profitGoal: number;
}

const defaultGoals: Goals = {
  leadsGoal: 50,
  offersGoal: 20,
  contractsGoal: 10,
  soldGoal: 5,
  revenueGoal: 500000,
  profitGoal: 100000,
};

export function GoalSettingsDialog({ children }: GoalSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState<Goals>(defaultGoals);

  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem("dashboardGoals");
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch {
        setGoals(defaultGoals);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("dashboardGoals", JSON.stringify(goals));
    toast.success("Goals saved successfully!");
    setOpen(false);
    // Trigger a re-render of the dashboard by dispatching a custom event
    window.dispatchEvent(new CustomEvent("goalsUpdated"));
  };

  const handleChange = (key: keyof Goals, value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    setGoals((prev) => ({ ...prev, [key]: numValue }));
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Settings
          </DialogTitle>
          <DialogDescription>
            Set monthly targets to track your business performance against goals.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid gap-6 py-4">
            {/* Pipeline Goals */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Pipeline Goals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadsGoal" className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-info" />
                    Leads Target
                  </Label>
                  <Input
                    id="leadsGoal"
                    type="text"
                    value={formatNumber(goals.leadsGoal)}
                    onChange={(e) => handleChange("leadsGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offersGoal" className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-warning" />
                    Offers Target
                  </Label>
                  <Input
                    id="offersGoal"
                    type="text"
                    value={formatNumber(goals.offersGoal)}
                    onChange={(e) => handleChange("offersGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractsGoal" className="flex items-center gap-2 text-muted-foreground">
                    <Handshake className="h-4 w-4 text-accent" />
                    Contracts Target
                  </Label>
                  <Input
                    id="contractsGoal"
                    type="text"
                    value={formatNumber(goals.contractsGoal)}
                    onChange={(e) => handleChange("contractsGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soldGoal" className="flex items-center gap-2 text-muted-foreground">
                    <BadgeDollarSign className="h-4 w-4 text-success" />
                    Sold Target
                  </Label>
                  <Input
                    id="soldGoal"
                    type="text"
                    value={formatNumber(goals.soldGoal)}
                    onChange={(e) => handleChange("soldGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Financial Goals */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Financial Goals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenueGoal" className="text-muted-foreground">
                    Revenue Target ($)
                  </Label>
                  <Input
                    id="revenueGoal"
                    type="text"
                    value={formatNumber(goals.revenueGoal)}
                    onChange={(e) => handleChange("revenueGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitGoal" className="text-muted-foreground">
                    Profit Target ($)
                  </Label>
                  <Input
                    id="profitGoal"
                    type="text"
                    value={formatNumber(goals.profitGoal)}
                    onChange={(e) => handleChange("profitGoal", e.target.value)}
                    className="tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Goals
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to get current goals
export function useGoals(): Goals {
  const [goals, setGoals] = useState<Goals>(defaultGoals);

  useEffect(() => {
    const loadGoals = () => {
      const savedGoals = localStorage.getItem("dashboardGoals");
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals));
        } catch {
          setGoals(defaultGoals);
        }
      }
    };

    loadGoals();

    // Listen for goal updates
    const handleGoalsUpdated = () => loadGoals();
    window.addEventListener("goalsUpdated", handleGoalsUpdated);
    return () => window.removeEventListener("goalsUpdated", handleGoalsUpdated);
  }, []);

  return goals;
}
