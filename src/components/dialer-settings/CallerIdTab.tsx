import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, ExternalLink, Shield, Check } from "lucide-react";

export function CallerIdTab() {
  return (
    <>
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Outbound Caller ID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div>
                    <Label>Your Twilio Number</Label>
                    <p className="text-h3 font-mono font-semibold">(555) 123-4567</p>
                  </div>
                  <Button variant="outline">Change Number</Button>
                </div>

                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="{{your_company}}" className="flex-1" />
                    <Button variant="outline">Edit</Button>
                  </div>
                  <p className="text-tiny text-muted-foreground">
                    Name shown on caller ID (if supported by carrier)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Local Presence</CardTitle>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable local presence</Label>
                    <p className="text-small text-muted-foreground">
                      Display a local number matching the area code you're calling
                    </p>
                    <p className="text-tiny text-success mt-1">
                      Improves answer rates by 30-40%
                    </p>
                  </div>
                  <div className="text-right">
                    <Switch />
                    <p className="text-tiny text-muted-foreground mt-1">
                      +$0.01/call
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Caller ID Reputation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="font-medium">Good</span>
                  <span className="text-muted-foreground">- Your number has a healthy reputation</span>
                </div>

                <div className="bg-muted/30 rounded-medium p-4">
                  <p className="text-small font-medium mb-2">Tips to maintain good reputation:</p>
                  <ul className="text-small text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Don't make excessive calls to same numbers</li>
                    <li>Respect DNC requests promptly</li>
                    <li>Maintain reasonable answer rates</li>
                    <li>Avoid "spam likely" flags</li>
                  </ul>
                </div>

                <Button variant="outline">Check Reputation</Button>
              </CardContent>
            </Card>
    </>
  );
}
