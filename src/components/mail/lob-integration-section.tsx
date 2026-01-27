import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLobConnection, useUpdateLobConnection, testLobConnection } from "@/hooks/useMailCampaigns";
import { 
  Mail, 
  Check, 
  X, 
  Loader2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
];

export function LobIntegrationSection() {
  const { data: connection, isLoading } = useLobConnection();
  const updateConnection = useUpdateLobConnection();
  
  const [apiKey, setApiKey] = React.useState("");
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Return address state
  const [returnName, setReturnName] = React.useState(connection?.return_name || "");
  const [returnAddress1, setReturnAddress1] = React.useState(connection?.return_address_line1 || "");
  const [returnAddress2, setReturnAddress2] = React.useState(connection?.return_address_line2 || "");
  const [returnCity, setReturnCity] = React.useState(connection?.return_city || "");
  const [returnState, setReturnState] = React.useState(connection?.return_state || "");
  const [returnZip, setReturnZip] = React.useState(connection?.return_zip || "");

  // Defaults
  const [mailClass, setMailClass] = React.useState(connection?.default_mail_class || "usps_first_class");
  const [postcardSize, setPostcardSize] = React.useState(connection?.default_postcard_size || "6x9");

  React.useEffect(() => {
    if (connection) {
      setReturnName(connection.return_name || "");
      setReturnAddress1(connection.return_address_line1 || "");
      setReturnAddress2(connection.return_address_line2 || "");
      setReturnCity(connection.return_city || "");
      setReturnState(connection.return_state || "");
      setReturnZip(connection.return_zip || "");
      setMailClass(connection.default_mail_class || "usps_first_class");
      setPostcardSize(connection.default_postcard_size || "6x9");
    }
  }, [connection]);

  const isConnected = connection?.is_active;
  const webhookUrl = `${window.location.origin}/api/webhooks/lob`;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setTesting(true);
    try {
      const result = await testLobConnection(apiKey);
      if (result.success) {
        toast.success("Connection successful!");
        setIsConnecting(true);
      } else {
        toast.error(result.error || "Connection failed");
      }
    } catch (error) {
      toast.error("Failed to test connection");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await updateConnection.mutateAsync({
        api_key_encrypted: apiKey,
        is_active: true,
        account_name: "Lob Account",
      });
      toast.success("Lob connected successfully!");
      setApiKey("");
    } catch (error) {
      toast.error("Failed to connect Lob");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await updateConnection.mutateAsync({
        api_key_encrypted: null,
        is_active: false,
        account_name: null,
      });
      toast.success("Lob disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleSaveReturnAddress = async () => {
    try {
      await updateConnection.mutateAsync({
        return_name: returnName,
        return_address_line1: returnAddress1,
        return_address_line2: returnAddress2,
        return_city: returnCity,
        return_state: returnState,
        return_zip: returnZip,
      });
      toast.success("Return address saved");
    } catch (error) {
      toast.error("Failed to save return address");
    }
  };

  const handleSaveDefaults = async () => {
    try {
      await updateConnection.mutateAsync({
        default_mail_class: mailClass,
        default_postcard_size: postcardSize,
      });
      toast.success("Default settings saved");
    } catch (error) {
      toast.error("Failed to save defaults");
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-content-tertiary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <div>
                <CardTitle>Direct Mail (Lob)</CardTitle>
                <CardDescription>Send postcards and letters via Lob API</CardDescription>
              </div>
            </div>
            <Badge variant={isConnected ? "success" : "secondary"}>
              {isConnected ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                "Not Connected"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-small font-medium">Connected as {connection?.account_name}</p>
                  <p className="text-tiny text-content-tertiary">API key: ••••••••{connection?.api_key_encrypted?.slice(-4)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Lob API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Lob API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleTestConnection}
                  disabled={testing || !apiKey.trim()}
                >
                  {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Test Connection
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleConnect}
                  disabled={!apiKey.trim() || isConnecting}
                >
                  {isConnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Connect
                </Button>
              </div>

              <a 
                href="https://dashboard.lob.com/settings/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-small text-brand hover:underline inline-flex items-center gap-1"
              >
                Get your API key from lob.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <>
          {/* Webhook Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Setup</CardTitle>
              <CardDescription>
                Add this URL in your Lob dashboard to receive delivery status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={webhookUrl} readOnly className="font-mono text-small" />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-small text-content-secondary">
                <p className="font-medium mb-1">Events to subscribe:</p>
                <p className="text-tiny">postcard.created, postcard.mailed, postcard.in_transit, postcard.delivered, postcard.returned</p>
                <p className="text-tiny">letter.created, letter.mailed, letter.in_transit, letter.delivered, letter.returned</p>
              </div>
            </CardContent>
          </Card>

          {/* Return Address */}
          <Card>
            <CardHeader>
              <CardTitle>Default Return Address</CardTitle>
              <CardDescription>This address appears as the sender on all mail pieces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company/Name</Label>
                  <Input
                    value={returnName}
                    onChange={(e) => setReturnName(e.target.value)}
                    placeholder="Your Company LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input
                    value={returnAddress1}
                    onChange={(e) => setReturnAddress1(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input
                    value={returnAddress2}
                    onChange={(e) => setReturnAddress2(e.target.value)}
                    placeholder="Suite 100 (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={returnCity}
                    onChange={(e) => setReturnCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <select
                    value={returnState}
                    onChange={(e) => setReturnState(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md bg-background"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={returnZip}
                    onChange={(e) => setReturnZip(e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
              <Button onClick={handleSaveReturnAddress}>
                Save Return Address
              </Button>
            </CardContent>
          </Card>

          {/* Default Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Default Mail Class</Label>
                <RadioGroup value={mailClass} onValueChange={setMailClass}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="usps_first_class" id="first_class" />
                    <Label htmlFor="first_class">First Class (faster, higher cost)</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="usps_standard" id="standard" />
                    <Label htmlFor="standard">Standard (slower, lower cost)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Default Postcard Size</Label>
                <RadioGroup value={postcardSize} onValueChange={setPostcardSize}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="4x6" id="size_4x6" />
                    <Label htmlFor="size_4x6">4×6 (Standard)</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="6x9" id="size_6x9" />
                    <Label htmlFor="size_6x9">6×9 (Large)</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="6x11" id="size_6x11" />
                    <Label htmlFor="size_6x11">6×11 (Jumbo)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleSaveDefaults}>
                Save Default Settings
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
