import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Archive, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ListSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: {
    id: string;
    name: string;
    description: string | null;
    list_type: string;
  };
}

export function ListSettingsSheet({ open, onOpenChange, list }: ListSettingsSheetProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [autoSkipTrace, setAutoSkipTrace] = useState(false);
  const [autoAddHighMotivation, setAutoAddHighMotivation] = useState(false);
  const [weeklyRefresh, setWeeklyRefresh] = useState(false);
  const [notifyNewRecords, setNotifyNewRecords] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("lists")
        .update({
          name,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", list.id);

      if (error) throw error;

      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["list", list.id] });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from("lists")
        .update({ status: "archived" })
        .eq("id", list.id);

      if (error) throw error;

      toast.success("List archived");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      navigate("/marketing/lists");
    } catch (error) {
      toast.error("Failed to archive list");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Delete records first
      await supabase.from("list_records").delete().eq("list_id", list.id);

      // Then delete the list
      const { error } = await supabase.from("lists").delete().eq("id", list.id);

      if (error) throw error;

      toast.success("List deleted");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      navigate("/marketing/lists");
    } catch (error) {
      toast.error("Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>List Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Automation */}
          <div className="space-y-4">
            <h3 className="font-medium">Automation</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="auto-skip"
                  checked={autoSkipTrace}
                  onCheckedChange={(c) => setAutoSkipTrace(!!c)}
                />
                <div>
                  <label htmlFor="auto-skip" className="text-sm font-medium cursor-pointer">
                    Auto-skip trace new records
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically skip trace when records are added
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="auto-add"
                  checked={autoAddHighMotivation}
                  onCheckedChange={(c) => setAutoAddHighMotivation(!!c)}
                />
                <div>
                  <label htmlFor="auto-add" className="text-sm font-medium cursor-pointer">
                    Auto-add high motivation (700+) to Properties
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically import high motivation records
                  </p>
                </div>
              </div>

              {list.list_type === "criteria" && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="weekly-refresh"
                    checked={weeklyRefresh}
                    onCheckedChange={(c) => setWeeklyRefresh(!!c)}
                  />
                  <div>
                    <label htmlFor="weekly-refresh" className="text-sm font-medium cursor-pointer">
                      Weekly refresh from criteria
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Pull fresh data matching criteria weekly
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="notify-new"
                  checked={notifyNewRecords}
                  onCheckedChange={(c) => setNotifyNewRecords(!!c)}
                />
                <div>
                  <label htmlFor="notify-new" className="text-sm font-medium cursor-pointer">
                    Notify when new records match criteria
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="weekly-summary"
                  checked={weeklySummary}
                  onCheckedChange={(c) => setWeeklySummary(!!c)}
                />
                <div>
                  <label htmlFor="weekly-summary" className="text-sm font-medium cursor-pointer">
                    Weekly list summary email
                  </label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleArchive}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive List
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete List
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete List?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{list.name}" and all its records.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
