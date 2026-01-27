import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useTestAttomConnection } from "@/hooks/useAttom";
import { Database, Check, X, AlertCircle } from "lucide-react";

export function AttomSettingsSection() {
  const [autoLookup, setAutoLookup] = React.useState(false);
  const testConnection = useTestAttomConnection();

  const handleTestConnection = () => {
    testConnection.mutate();
  };

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="text-h4 font-semibold text-content">ATTOM Property Data</h3>
            <p className="text-small text-content-secondary">
              Auto-fill property details from ATTOM's database
            </p>
          </div>
        </div>
        <Badge variant="secondary" size="sm">
          Configured
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="p-4 rounded-medium bg-surface-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-content">API Connection</p>
              <p className="text-small text-content-secondary mt-0.5">
                Test your ATTOM API key connection
              </p>
            </div>
            <div className="flex items-center gap-3">
              {testConnection.isSuccess && (
                <Badge variant="success" size="sm">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {testConnection.isError && (
                <Badge variant="error" size="sm">
                  <X className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Auto-lookup Toggle */}
        <div className="flex items-center justify-between p-4 rounded-medium border border-border">
          <div>
            <Label className="text-body font-medium">Auto-lookup on property add</Label>
            <p className="text-small text-content-secondary mt-0.5">
              Automatically fetch ATTOM data when adding a new property
            </p>
          </div>
          <Switch checked={autoLookup} onCheckedChange={setAutoLookup} />
        </div>

        {/* Cost Notice */}
        <div className="flex items-start gap-3 p-4 rounded-medium bg-warning/5 border border-warning/20">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-small font-medium text-content">Usage Costs</p>
            <p className="text-small text-content-secondary mt-0.5">
              ATTOM API lookups cost approximately $0.10-0.50 per request depending on
              the data type. AVM requests are typically more expensive than basic property lookups.
            </p>
          </div>
        </div>

        {/* API Key Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-tiny text-content-tertiary">
            Your ATTOM API key is securely stored in your backend environment variables.
            To update it, go to your backend configuration.
          </p>
        </div>
      </div>
    </Card>
  );
}
