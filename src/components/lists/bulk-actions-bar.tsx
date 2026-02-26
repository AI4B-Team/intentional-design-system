import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Phone, Mail, UserPlus, X, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddToMailCampaignModal } from "./add-to-mail-campaign-modal";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  listId: string;
  selectedRecordIds: string[];
}

type BulkAction = "skip_trace" | "add_to_mail" | "add_to_properties" | "remove" | null;

export function BulkActionsBar({
  selectedCount,
  onClear,
  listId,
  selectedRecordIds,
}: BulkActionsBarProps) {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<BulkAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [addToSuppression, setAddToSuppression] = useState(false);
  const [skipExistingPhones, setSkipExistingPhones] = useState(true);
  const [showMailModal, setShowMailModal] = useState(false);

  const handleRemove = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const batchSize = 50;
      const batches = Math.ceil(selectedRecordIds.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = selectedRecordIds.slice(i * batchSize, (i + 1) * batchSize);
        
        await supabase
          .from("list_records")
          .update({ status: "removed" })
          .in("id", batch);

        if (addToSuppression) {
          const { data: records } = await supabase
            .from("list_records")
            .select("address_hash, address, city, state, zip, user_id")
            .in("id", batch);

          if (records) {
            const suppressions = records.map((r) => ({
              user_id: r.user_id,
              address_hash: r.address_hash,
              normalized_address: r.address_hash,
              address: r.address,
              city: r.city,
              state: r.state,
              zip: r.zip,
              reason: "do_not_contact" as const,
              source: "manual",
            }));

            await supabase.from("suppression_list").upsert(suppressions, {
              onConflict: "user_id,address_hash",
            });
          }
        }

        setProgress(Math.round(((i + 1) / batches) * 100));
      }

      toast.success(`${selectedRecordIds.length} records removed`);
      queryClient.invalidateQueries({ queryKey: ["list-records", listId] });
      onClear();
    } catch (error) {
      toast.error("Failed to remove records");
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleAddToProperties = async () => {
    setIsProcessing(true);
    setProgress(0);
    toast.info("Adding to properties... (simulated)");
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i);
    }

    toast.success(`${selectedRecordIds.length} records added to properties`);
    setIsProcessing(false);
    setActiveAction(null);
    onClear();
  };

  const estimatedSkipTraceCost = (selectedCount * 0.35).toFixed(2);

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background border rounded-lg shadow-lg p-3 flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAction("skip_trace")}
          >
            <Phone className="h-4 w-4 mr-1" />
            Skip Trace
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMailModal(true)}
          >
            <Mail className="h-4 w-4 mr-1" />
            Add to Mail
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAction("add_to_properties")}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add to Properties
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAction("remove")}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      {/* Skip Trace Confirmation */}
      <AlertDialog open={activeAction === "skip_trace"} onOpenChange={() => setActiveAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip Trace {selectedCount} Records?</AlertDialogTitle>
            <AlertDialogDescription>
              This will look up contact information for the selected records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Estimated Cost</span>
              <span className="font-bold">${estimatedSkipTraceCost}</span>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="skip-existing"
                checked={skipExistingPhones}
                onCheckedChange={(c) => setSkipExistingPhones(!!c)}
              />
              <label htmlFor="skip-existing" className="text-sm cursor-pointer">
                Skip records that already have a phone number
              </label>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              toast.info("Skip trace initiated (simulated)");
              setActiveAction(null);
              onClear();
            }}>
              Skip Trace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Mail Campaign Modal */}
      <AddToMailCampaignModal
        open={showMailModal}
        onOpenChange={setShowMailModal}
        selectedRecordIds={selectedRecordIds}
        onComplete={onClear}
      />

      {/* Add to Properties Confirmation */}
      <AlertDialog open={activeAction === "add_to_properties"} onOpenChange={() => setActiveAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Properties</AlertDialogTitle>
            <AlertDialogDescription>
              Import {selectedCount} records to your Properties database?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isProcessing ? (
            <div className="py-6">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-center gap-2">
                <Checkbox id="skip-dupes" defaultChecked />
                <label htmlFor="skip-dupes" className="text-sm cursor-pointer">
                  Skip duplicate addresses
                </label>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToProperties} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Import Records"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Confirmation */}
      <AlertDialog open={activeAction === "remove"} onOpenChange={() => setActiveAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selectedCount} Records?</AlertDialogTitle>
            <AlertDialogDescription>
              These records will be marked as removed from this list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isProcessing ? (
            <div className="py-6">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                Removing... {progress}%
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="add-suppression"
                  checked={addToSuppression}
                  onCheckedChange={(c) => setAddToSuppression(!!c)}
                />
                <label htmlFor="add-suppression" className="text-sm cursor-pointer">
                  Also add to suppression list (won't appear in future lists)
                </label>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Removing..." : "Remove Records"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
