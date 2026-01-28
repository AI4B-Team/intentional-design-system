import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

interface SuppressionSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuppressionSettingsSheet({ open, onOpenChange }: SuppressionSettingsSheetProps) {
  const [autoReturnedMail, setAutoReturnedMail] = useState(true);
  const [autoWrongNumber, setAutoWrongNumber] = useState(true);
  const [autoAlreadySold, setAutoAlreadySold] = useState(true);
  const [autoNoResponse, setAutoNoResponse] = useState(false);
  const [noResponseThreshold, setNoResponseThreshold] = useState("3");

  const handleSave = () => {
    toast.success("Settings saved");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Suppression Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div>
            <h3 className="font-medium mb-3">Automatic Suppression</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically add addresses to your suppression list when certain conditions are met.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="auto-returned"
                  checked={autoReturnedMail}
                  onCheckedChange={(c) => setAutoReturnedMail(!!c)}
                />
                <div>
                  <label htmlFor="auto-returned" className="text-sm font-medium cursor-pointer">
                    Add returned mail automatically
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When mail is returned undeliverable
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="auto-wrong"
                  checked={autoWrongNumber}
                  onCheckedChange={(c) => setAutoWrongNumber(!!c)}
                />
                <div>
                  <label htmlFor="auto-wrong" className="text-sm font-medium cursor-pointer">
                    Add "wrong number" call results automatically
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When a call is marked as wrong number
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="auto-sold"
                  checked={autoAlreadySold}
                  onCheckedChange={(c) => setAutoAlreadySold(!!c)}
                />
                <div>
                  <label htmlFor="auto-sold" className="text-sm font-medium cursor-pointer">
                    Add properties marked "Already Sold"
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When a property's status is updated to sold
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="auto-no-response"
                  checked={autoNoResponse}
                  onCheckedChange={(c) => setAutoNoResponse(!!c)}
                />
                <div className="flex-1">
                  <label htmlFor="auto-no-response" className="text-sm font-medium cursor-pointer">
                    Add properties with no response after
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={noResponseThreshold}
                      onChange={(e) => setNoResponseThreshold(e.target.value)}
                      className="w-16 h-8"
                      min="1"
                      max="10"
                      disabled={!autoNoResponse}
                    />
                    <span className="text-sm text-muted-foreground">mail pieces</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Matching Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              How addresses are matched against the suppression list.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox id="fuzzy" defaultChecked />
                <div>
                  <label htmlFor="fuzzy" className="text-sm font-medium cursor-pointer">
                    Use fuzzy matching
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Match "123 Main St" with "123 Main Street"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="ignore-unit" defaultChecked />
                <div>
                  <label htmlFor="ignore-unit" className="text-sm font-medium cursor-pointer">
                    Ignore unit numbers
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Suppress all units if main address is suppressed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Notifications</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox id="notify-auto" defaultChecked />
                <div>
                  <label htmlFor="notify-auto" className="text-sm font-medium cursor-pointer">
                    Notify when addresses are auto-suppressed
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="notify-expired" />
                <div>
                  <label htmlFor="notify-expired" className="text-sm font-medium cursor-pointer">
                    Notify when suppressions expire
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
