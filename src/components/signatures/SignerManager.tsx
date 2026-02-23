import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  GripVertical,
  Trash2,
  ArrowDownUp,
  Users,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Signer,
  SigningOrder,
  ReminderSettings,
  ReminderFrequency,
  SigningWorkflow,
  createSigner,
  signerStatusConfig,
} from "@/types/signing-workflow";

interface SignerManagerProps {
  workflow: SigningWorkflow;
  onWorkflowChange: (workflow: SigningWorkflow) => void;
  /** If true, shows status badges (for detail view). Otherwise shows editable form (for send flow). */
  readOnly?: boolean;
}

export function SignerManager({ workflow, onWorkflowChange, readOnly = false }: SignerManagerProps) {
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");

  const handleAddSigner = () => {
    if (!newEmail.trim()) return;
    const signer = createSigner(
      newName.trim() || newEmail.split("@")[0],
      newEmail.trim(),
      workflow.signers.length + 1
    );
    onWorkflowChange({
      ...workflow,
      signers: [...workflow.signers, signer],
    });
    setNewName("");
    setNewEmail("");
  };

  const handleRemoveSigner = (id: string) => {
    const updated = workflow.signers
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onWorkflowChange({ ...workflow, signers: updated });
  };

  const handleRoleChange = (id: string, role: Signer["role"]) => {
    onWorkflowChange({
      ...workflow,
      signers: workflow.signers.map((s) => (s.id === id ? { ...s, role } : s)),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const signers = [...workflow.signers];
    [signers[index - 1], signers[index]] = [signers[index], signers[index - 1]];
    onWorkflowChange({
      ...workflow,
      signers: signers.map((s, i) => ({ ...s, order: i + 1 })),
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= workflow.signers.length - 1) return;
    const signers = [...workflow.signers];
    [signers[index], signers[index + 1]] = [signers[index + 1], signers[index]];
    onWorkflowChange({
      ...workflow,
      signers: signers.map((s, i) => ({ ...s, order: i + 1 })),
    });
  };

  return (
    <div className="space-y-4">
      {/* Signing Order Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Signing Order</Label>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <span className={cn("text-xs", workflow.signingOrder === "parallel" ? "text-brand font-medium" : "text-muted-foreground")}>
              Parallel
            </span>
            <Switch
              checked={workflow.signingOrder === "sequential"}
              onCheckedChange={(checked) =>
                onWorkflowChange({ ...workflow, signingOrder: checked ? "sequential" : "parallel" })
              }
            />
            <span className={cn("text-xs", workflow.signingOrder === "sequential" ? "text-brand font-medium" : "text-muted-foreground")}>
              Sequential
            </span>
          </div>
        )}
        {readOnly && (
          <Badge variant="outline" className="text-xs capitalize">
            {workflow.signingOrder}
          </Badge>
        )}
      </div>

      {/* Signers List */}
      <div className="space-y-2">
        {workflow.signers.map((signer, index) => {
          const statusInfo = signerStatusConfig[signer.status];
          return (
            <div
              key={signer.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-surface-secondary"
            >
              {workflow.signingOrder === "sequential" && !readOnly && (
                <div className="flex flex-col gap-0.5">
                  <button
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground rotate-180" />
                  </button>
                  <button
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= workflow.signers.length - 1}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}

              {workflow.signingOrder === "sequential" && (
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-xs flex items-center justify-center font-semibold flex-shrink-0">
                  {index + 1}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{signer.name}</p>
                <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
              </div>

              {!readOnly && (
                <Select
                  value={signer.role}
                  onValueChange={(val) => handleRoleChange(signer.id, val as Signer["role"])}
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signer">Signer</SelectItem>
                    <SelectItem value="cc">CC</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {readOnly && (
                <Badge variant="outline" className="text-[10px] capitalize h-5">
                  {signer.role}
                </Badge>
              )}

              <Badge variant="outline" className={cn("text-[10px] h-5", statusInfo.color)}>
                {statusInfo.label}
              </Badge>

              {readOnly && signer.viewCount > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Eye className="h-3 w-3" /> {signer.viewCount}
                </span>
              )}

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveSigner(signer.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}

        {workflow.signers.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No signers added yet
          </div>
        )}
      </div>

      {/* Add Signer Form */}
      {!readOnly && (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Name</Label>
            <Input
              placeholder="Signer name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Email *</Label>
            <Input
              placeholder="email@example.com"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddSigner()}
            />
          </div>
          <Button size="sm" variant="outline" className="gap-1 h-8" onClick={handleAddSigner}>
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      )}

      {/* Reminder Settings */}
      {!readOnly && (
        <div className="border-t border-border-subtle pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Auto Reminders</Label>
            <Switch
              checked={workflow.reminders.enabled}
              onCheckedChange={(checked) =>
                onWorkflowChange({
                  ...workflow,
                  reminders: { ...workflow.reminders, enabled: checked },
                })
              }
            />
          </div>

          {workflow.reminders.enabled && (
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={workflow.reminders.frequency}
                  onValueChange={(val) =>
                    onWorkflowChange({
                      ...workflow,
                      reminders: { ...workflow.reminders, frequency: val as ReminderFrequency },
                    })
                  }
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="every_2_days">Every 2 days</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Reminders</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={workflow.reminders.maxReminders}
                  onChange={(e) =>
                    onWorkflowChange({
                      ...workflow,
                      reminders: { ...workflow.reminders, maxReminders: parseInt(e.target.value) || 5 },
                    })
                  }
                  className="w-20 h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expires (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={workflow.expirationDays}
                  onChange={(e) =>
                    onWorkflowChange({
                      ...workflow,
                      expirationDays: parseInt(e.target.value) || 30,
                    })
                  }
                  className="w-20 h-8 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
