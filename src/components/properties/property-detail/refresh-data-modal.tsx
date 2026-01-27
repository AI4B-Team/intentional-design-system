import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAttomLookup, useUpdatePropertyWithAttom } from "@/hooks/useAttom";
import { formatAttomCurrency, type AttomPropertyData } from "@/lib/attom";
import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  currentData: {
    address: string;
    city: string | null;
    state: string | null;
    zip: string | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    year_built?: number | null;
    owner_name?: string | null;
    assessed_value?: number | null;
    tax_amount?: number | null;
  };
}

interface ComparisonRow {
  field: string;
  label: string;
  current: any;
  new: any;
  formatter?: (v: any) => string;
}

export function RefreshDataModal({
  open,
  onOpenChange,
  propertyId,
  currentData,
}: RefreshDataModalProps) {
  const [newData, setNewData] = React.useState<AttomPropertyData | null>(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const attomLookup = useAttomLookup();
  const updateProperty = useUpdatePropertyWithAttom();

  // Fetch when modal opens
  React.useEffect(() => {
    if (open && !hasLoaded) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const result = await attomLookup.mutateAsync({
        address: currentData.address,
        city: currentData.city || "",
        state: currentData.state || "",
        zip: currentData.zip || "",
      });
      setNewData(result);
      setHasLoaded(true);
    } catch (error) {
      setHasLoaded(true);
    }
  };

  const handleClose = () => {
    setNewData(null);
    setHasLoaded(false);
    onOpenChange(false);
  };

  const handleUpdateAll = async () => {
    if (!newData) return;

    await updateProperty.mutateAsync({
      propertyId,
      attomData: newData,
    });

    handleClose();
  };

  // Build comparison rows
  const comparisons: ComparisonRow[] = [
    { field: "beds", label: "Bedrooms", current: currentData.beds, new: newData?.beds },
    { field: "baths", label: "Bathrooms", current: currentData.baths, new: newData?.baths },
    { field: "sqft", label: "Square Feet", current: currentData.sqft, new: newData?.sqft, formatter: (v) => v?.toLocaleString() },
    { field: "year_built", label: "Year Built", current: currentData.year_built, new: newData?.year_built },
    { field: "owner_name", label: "Owner Name", current: currentData.owner_name, new: newData?.owner_name },
    { field: "assessed_value", label: "Assessed Value", current: currentData.assessed_value, new: newData?.assessed_value, formatter: formatAttomCurrency },
    { field: "tax_amount", label: "Annual Taxes", current: currentData.tax_amount, new: newData?.tax_amount, formatter: formatAttomCurrency },
  ];

  const changedFields = comparisons.filter(
    (c) => c.new != null && c.current !== c.new
  );

  const isLoading = attomLookup.isPending;
  const hasError = attomLookup.isError;
  const hasChanges = changedFields.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refresh Property Data
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner size="lg" />
              <p className="mt-3 text-small text-content-secondary">
                Fetching latest data from ATTOM...
              </p>
            </div>
          )}

          {hasError && (
            <div className="text-center py-6">
              <X className="h-10 w-10 mx-auto mb-2 text-destructive" />
              <p className="text-body text-content">Property not found</p>
              <p className="text-small text-content-secondary mt-1">
                Unable to find this property in the ATTOM database.
              </p>
            </div>
          )}

          {!isLoading && !hasError && hasLoaded && (
            <>
              {!hasChanges ? (
                <div className="text-center py-6">
                  <Check className="h-10 w-10 mx-auto mb-2 text-success" />
                  <p className="text-body text-content">Data is up to date</p>
                  <p className="text-small text-content-secondary mt-1">
                    No differences found between current and latest data.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-small text-content-secondary">
                    The following fields have new values:
                  </p>
                  <div className="border border-border rounded-medium overflow-hidden">
                    <table className="w-full text-small">
                      <thead className="bg-surface-secondary">
                        <tr>
                          <th className="text-left py-2 px-3 text-content-secondary font-medium">Field</th>
                          <th className="text-left py-2 px-3 text-content-secondary font-medium">Current</th>
                          <th className="text-left py-2 px-3 text-content-secondary font-medium">New</th>
                        </tr>
                      </thead>
                      <tbody>
                        {changedFields.map((row) => (
                          <tr key={row.field} className="border-t border-border">
                            <td className="py-2 px-3 text-content">{row.label}</td>
                            <td className="py-2 px-3 text-content-secondary">
                              {row.formatter ? row.formatter(row.current) : row.current || "—"}
                            </td>
                            <td className="py-2 px-3">
                              <Badge variant="success" size="sm">
                                {row.formatter ? row.formatter(row.new) : row.new}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {hasChanges && (
            <Button
              variant="primary"
              onClick={handleUpdateAll}
              disabled={updateProperty.isPending}
            >
              {updateProperty.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update All"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
