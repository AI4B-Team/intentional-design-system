import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DISPOSITION_CATEGORIES, EMOJI_OPTIONS, type Disposition } from "./dialer-settings-constants";

interface DispositionDialogProps {
  editingDisposition: Disposition | null;
  isAddingDisposition: boolean;
  newDisposition: Partial<Disposition>;
  setEditingDisposition: React.Dispatch<React.SetStateAction<Disposition | null>>;
  setIsAddingDisposition: React.Dispatch<React.SetStateAction<boolean>>;
  setNewDisposition: React.Dispatch<React.SetStateAction<Partial<Disposition>>>;
  saveDispositionMutation: { mutate: (d: Partial<Disposition>) => void; isPending: boolean };
}

export function DispositionDialog({
  editingDisposition,
  isAddingDisposition,
  newDisposition,
  setEditingDisposition,
  setIsAddingDisposition,
  setNewDisposition,
  saveDispositionMutation,
}: DispositionDialogProps) {
  return (
        <Dialog
          open={isAddingDisposition || !!editingDisposition}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingDisposition(false);
              setEditingDisposition(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle>
                {editingDisposition ? "Edit Disposition" : "Add Custom Disposition"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingDisposition?.name || newDisposition.name}
                    onChange={(e) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, name: e.target.value })
                        : setNewDisposition({ ...newDisposition, name: e.target.value })
                    }
                    placeholder="e.g., Callback Requested"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={editingDisposition?.icon || newDisposition.icon || "📞"}
                    onValueChange={(v) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, icon: v })
                        : setNewDisposition({ ...newDisposition, icon: v })
                    }
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <SelectItem key={emoji} value={emoji}>
                          {emoji}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingDisposition?.category || newDisposition.category}
                    onValueChange={(v) =>
                      editingDisposition
                        ? setEditingDisposition({ ...editingDisposition, category: v })
                        : setNewDisposition({ ...newDisposition, category: v })
                    }
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      {DISPOSITION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div>
                            <span>{cat.label}</span>
                            <span className="text-muted-foreground ml-2 text-tiny">
                              ({cat.description})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Keyboard Shortcut</Label>
                  <Select
                    value={
                      editingDisposition?.keyboard_shortcut ||
                      newDisposition.keyboard_shortcut ||
                      "none"
                    }
                    onValueChange={(v) => {
                      const value = v === "none" ? null : v;
                      editingDisposition
                        ? setEditingDisposition({
                            ...editingDisposition,
                            keyboard_shortcut: value,
                          })
                        : setNewDisposition({ ...newDisposition, keyboard_shortcut: value });
                    }}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="none">None</SelectItem>
                      {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <SelectItem key={num} value={num}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Behavior</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.removes_from_queue ??
                        newDisposition.removes_from_queue ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              removes_from_queue: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, removes_from_queue: !!v })
                      }
                    />
                    <Label className="font-normal">Removes contact from queue</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.adds_to_dnc ?? newDisposition.adds_to_dnc ?? false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({ ...editingDisposition, adds_to_dnc: !!v })
                          : setNewDisposition({ ...newDisposition, adds_to_dnc: !!v })
                      }
                    />
                    <Label className="font-normal">Adds number to Do Not Call list</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.schedules_followup ??
                        newDisposition.schedules_followup ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              schedules_followup: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, schedules_followup: !!v })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label className="font-normal">Schedules automatic follow-up</Label>
                      {(editingDisposition?.schedules_followup ??
                        newDisposition.schedules_followup) && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-small text-muted-foreground">
                            Days until follow-up:
                          </span>
                          <Input
                            type="number"
                            value={
                              editingDisposition?.default_followup_days ??
                              newDisposition.default_followup_days ??
                              3
                            }
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              editingDisposition
                                ? setEditingDisposition({
                                    ...editingDisposition,
                                    default_followup_days: val,
                                  })
                                : setNewDisposition({
                                    ...newDisposition,
                                    default_followup_days: val,
                                  });
                            }}
                            className="w-16"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        editingDisposition?.marks_as_success ??
                        newDisposition.marks_as_success ??
                        false
                      }
                      onCheckedChange={(v) =>
                        editingDisposition
                          ? setEditingDisposition({
                              ...editingDisposition,
                              marks_as_success: !!v,
                            })
                          : setNewDisposition({ ...newDisposition, marks_as_success: !!v })
                      }
                    />
                    <Label className="font-normal">Counts as "success" in stats</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingDisposition(false);
                  setEditingDisposition(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  saveDispositionMutation.mutate(editingDisposition || newDisposition);
                }}
                disabled={
                  !(editingDisposition?.name || newDisposition.name) ||
                  saveDispositionMutation.isPending
                }
              >
                Save Disposition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  );
}
