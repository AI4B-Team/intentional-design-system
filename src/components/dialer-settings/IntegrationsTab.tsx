import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Copy, Calendar, Mail, MessageSquare, Clock, Phone } from "lucide-react";
import { type DialerSettingsValues } from "./dialer-settings-constants";

interface IntegrationsTabProps {
  settings: DialerSettingsValues;
  handleSettingChange: <K extends keyof DialerSettingsValues>(key: K, value: DialerSettingsValues[K]) => void;
  copyToClipboard: (text: string) => void;
  webhookUrls: { voice: string; status: string; recording: string };
}

export function IntegrationsTab({ settings, handleSettingChange, copyToClipboard, webhookUrls }: IntegrationsTabProps) {
  return (
    <>
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">CRM Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-medium bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">GoHighLevel</p>
                      <Badge variant="success" size="sm">
                        Connected
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">Disconnect</Button>
                </div>

                <div className="space-y-3">
                  <p className="text-small font-medium">When call is made:</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.logCallsToGHL}
                        onCheckedChange={(v) => handleSettingChange("logCallsToGHL", !!v)}
                      />
                      <Label className="font-normal">Log call in GHL contact timeline</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.updateGHLDisposition}
                        onCheckedChange={(v) => handleSettingChange("updateGHLDisposition", !!v)}
                      />
                      <Label className="font-normal">Update GHL contact with disposition</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.createGHLFollowupTasks}
                        onCheckedChange={(v) => handleSettingChange("createGHLFollowupTasks", !!v)}
                      />
                      <Label className="font-normal">Create task for follow-ups</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Calendar Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-medium">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-small text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="primary">Connect</Button>
                </div>

                <div className="space-y-3">
                  <p className="text-small font-medium">When appointment is set:</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.createCalendarEvents}
                        onCheckedChange={(v) => handleSettingChange("createCalendarEvents", !!v)}
                      />
                      <Label className="font-normal">Create calendar event</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.sendCalendarInvite}
                        onCheckedChange={(v) => handleSettingChange("sendCalendarInvite", !!v)}
                      />
                      <Label className="font-normal">
                        Send calendar invite to contact (if email available)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={settings.addCalendarReminder}
                        onCheckedChange={(v) => handleSettingChange("addCalendarReminder", !!v)}
                      />
                      <Label className="font-normal">Add reminder 1 hour before</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>SMS notification on missed callback</Label>
                      <p className="text-small text-muted-foreground">
                        Get notified when you miss a callback
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Email daily call summary</Label>
                      <p className="text-small text-muted-foreground">
                        Receive a daily summary of your calling activity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={settings.dailySummaryTime}
                      onValueChange={(v) => handleSettingChange("dailySummaryTime", v)}
                      disabled={!settings.emailDailySummary}
                    >
                      <SelectTrigger className="w-32 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={settings.emailDailySummary}
                      onCheckedChange={(v) => handleSettingChange("emailDailySummary", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twilio Setup Section */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Phone System Setup</CardTitle>
                <CardDescription>Configure your Twilio integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success text-white flex items-center justify-center text-small font-bold">
                      1
                    </div>
                    <span className="font-medium">Connect Twilio Account</span>
                    <Badge variant="success" size="sm">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-success text-white flex items-center justify-center text-small font-bold">
                      2
                    </div>
                    <span className="font-medium">Get a Phone Number</span>
                    <Badge variant="success" size="sm">
                      (555) 123-4567
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-small font-bold">
                        3
                      </div>
                      <span className="font-medium">Configure Webhooks</span>
                    </div>
                    <div className="ml-8 p-4 bg-muted/30 rounded-medium space-y-2">
                      <p className="text-small text-muted-foreground mb-3">
                        Configure these URLs in your Twilio console:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-card rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Voice URL</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.voice}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.voice)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-card rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Status Callback</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.status}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.status)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-card rounded-small border">
                          <div>
                            <p className="text-tiny text-muted-foreground">Recording Callback</p>
                            <p className="text-small font-mono truncate max-w-[400px]">
                              {webhookUrls.recording}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrls.recording)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Copy className="h-4 w-4 mr-1" />
                        Copy All URLs
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-small font-bold">
                      4
                    </div>
                    <span className="font-medium">Test Connection</span>
                  </div>
                  <div className="ml-8">
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Make Test Call
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-medium">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-small font-medium text-success">Ready to make calls</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </div>
    </>
  );
}
