import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Key, Zap, CheckCircle2, XCircle, Loader2, Lock } from "lucide-react";
import { testAIConnection, AI_MODELS } from "@/lib/ai-analysis";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function AISettingsSection() {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-3-sonnet");
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");
  const [statusMessage, setStatusMessage] = useState("");

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Claude API key to test the connection.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      const result = await testAIConnection(apiKey);
      setConnectionStatus(result.success ? "success" : "error");
      setStatusMessage(result.message);
      
      toast({
        title: result.success ? "Connection Successful" : "Connection Info",
        description: result.message,
        variant: result.success ? "default" : "default",
      });
    } catch (error) {
      setConnectionStatus("error");
      setStatusMessage("Failed to test connection");
      toast({
        title: "Connection Failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = () => {
    // TODO: Save to user preferences in Supabase
    toast({
      title: "Settings Saved",
      description: "Your AI configuration has been saved. API integration coming soon!",
    });
  };

  return (
    <Card variant="default" padding="none">
      <CardHeader className="border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Analysis Configuration
              <Badge variant="info" size="sm">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Configure AI-powered property analysis features
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Status Banner */}
        <div className="p-4 bg-info/10 border border-info/20 rounded-medium">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-small font-medium text-info">AI Integration Coming Soon</p>
              <p className="text-tiny text-info/80 mt-1">
                AI-powered analysis features are currently in development. Save your API key now 
                to be ready when the integration goes live. Your key will be encrypted and stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Claude API Key
            </Label>
            {connectionStatus !== "untested" && (
              <div className={cn(
                "flex items-center gap-1.5 text-tiny",
                connectionStatus === "success" ? "text-success" : "text-warning"
              )}>
                {connectionStatus === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {statusMessage}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              id="api-key"
              type="password"
              placeholder="sk-ant-api03-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <Button
              variant="secondary"
              size="md"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              icon={isTesting ? <Loader2 className="animate-spin" /> : <Zap />}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
          </div>
          <p className="text-tiny text-content-tertiary">
            Get your API key from{" "}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <Label htmlFor="model" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Model
          </Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <span className="text-content-tertiary">- {model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-tiny text-content-tertiary">
            Claude 3 Sonnet is recommended for the best balance of speed and accuracy.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            AI-Powered Features
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Distress Analysis", description: "Motivation scoring & contact strategy" },
              { name: "ARV Calculation", description: "Comp analysis & value estimation" },
              { name: "Repair Estimates", description: "Itemized cost breakdowns" },
              { name: "Offer Recommendations", description: "Strategic pricing & negotiation" },
              { name: "Exit Strategies", description: "ROI comparison & risk analysis" },
              { name: "Offer Letters", description: "Professional document generation" },
            ].map((feature) => (
              <div
                key={feature.name}
                className="flex items-center gap-3 p-3 bg-surface-secondary rounded-medium"
              >
                <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-small font-medium text-content">{feature.name}</p>
                  <p className="text-tiny text-content-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border-subtle">
          <Button variant="primary" size="md" onClick={handleSaveSettings}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
