import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Shield, HardDrive } from "lucide-react";
import { type DialerSettingsValues } from "./dialer-settings-constants";

interface RecordingTabProps {
  settings: DialerSettingsValues;
  handleSettingChange: <K extends keyof DialerSettingsValues>(key: K, value: DialerSettingsValues[K]) => void;
}

export function RecordingTab({ settings, handleSettingChange }: RecordingTabProps) {
  return (
    <>
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Call Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable call recording</Label>
                    <p className="text-small text-muted-foreground">
                      Record all calls for quality and training purposes
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRecording}
                    onCheckedChange={(v) => handleSettingChange("enableRecording", v)}
                  />
                </div>

                {settings.enableRecording && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Recording announcement</Label>
                        <p className="text-small text-muted-foreground">
                          Play "This call may be recorded" message
                        </p>
                        <p className="text-tiny text-warning mt-1">
                          Required in some states (two-party consent)
                        </p>
                      </div>
                      <Switch
                        checked={settings.recordingAnnouncement}
                        onCheckedChange={(v) => handleSettingChange("recordingAnnouncement", v)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Announcement audio</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="default">
                          <SelectTrigger className="flex-1 bg-card">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50">
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="custom">Upload Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">Preview</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Auto-delete recordings after</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={settings.autoDeleteRecordingsAfterDays || ""}
                          onChange={(e) =>
                            handleSettingChange(
                              "autoDeleteRecordingsAfterDays",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-24"
                          disabled={settings.autoDeleteRecordingsAfterDays === null}
                        />
                        <span className="text-small text-muted-foreground">days</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Checkbox
                            checked={settings.autoDeleteRecordingsAfterDays === null}
                            onCheckedChange={(checked) =>
                              handleSettingChange(
                                "autoDeleteRecordingsAfterDays",
                                checked ? null : 90
                              )
                            }
                          />
                          <Label className="font-normal">Never delete</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-medium">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-small font-medium">Storage used: 2.3 GB of 10 GB</p>
                        <div className="w-full h-2 bg-muted rounded-full mt-1">
                          <div className="w-[23%] h-full bg-primary rounded-full" />
                        </div>
                      </div>
                      <Button variant="link" className="px-0">
                        Manage Storage
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Transcription</CardTitle>
                <CardDescription>Premium feature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-transcribe calls</Label>
                    <p className="text-small text-muted-foreground">
                      Uses AI to transcribe recorded calls
                    </p>
                    <p className="text-tiny text-muted-foreground mt-1">
                      Additional cost: $0.05/minute
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoTranscribe}
                    onCheckedChange={(v) => handleSettingChange("autoTranscribe", v)}
                  />
                </div>

                {settings.autoTranscribe && (
                  <div className="space-y-2">
                    <Label>Transcription language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-48 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Recording Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Who can access recordings</Label>
                  <Select
                    value={settings.recordingAccess}
                    onValueChange={(v) => handleSettingChange("recordingAccess", v)}
                  >
                    <SelectTrigger className="w-64 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="only_me">Only me</SelectItem>
                      <SelectItem value="admins">Admins and Managers</SelectItem>
                      <SelectItem value="all">All team members</SelectItem>
                    </SelectContent>
                  </Select>
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
