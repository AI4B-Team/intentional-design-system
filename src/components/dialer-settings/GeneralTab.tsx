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
import { Shield, Clock } from "lucide-react";
import { DAYS_OF_WEEK, TIMEZONES, type DialerSettingsValues } from "./dialer-settings-constants";

interface GeneralTabProps {
  settings: DialerSettingsValues;
  handleSettingChange: <K extends keyof DialerSettingsValues>(key: K, value: DialerSettingsValues[K]) => void;
  toggleCallingDay: (day: string) => void;
}

export function GeneralTab({ settings, handleSettingChange, toggleCallingDay }: GeneralTabProps) {
  return (
    <>
            {/* Dialing Behavior */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Dialing Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-dial next contact</Label>
                    <p className="text-small text-muted-foreground">
                      Automatically dial next contact after disposition
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoDialNext}
                    onCheckedChange={(v) => handleSettingChange("autoDialNext", v)}
                  />
                </div>

                {settings.autoDialNext && (
                  <div className="flex items-center gap-4 pl-4 border-l-2 border-muted">
                    <Label>Delay between calls</Label>
                    <Input
                      type="number"
                      value={settings.delayBetweenCalls}
                      onChange={(e) =>
                        handleSettingChange("delayBetweenCalls", parseInt(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                    <span className="text-small text-muted-foreground">seconds</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show preview before dial</Label>
                    <p className="text-small text-muted-foreground">
                      Display contact info for review before calling
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPreviewBeforeDial}
                    onCheckedChange={(v) => handleSettingChange("showPreviewBeforeDial", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Play sound on connect</Label>
                    <p className="text-small text-muted-foreground">
                      Audio notification when call is answered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={settings.connectSound}
                      onValueChange={(v) => handleSettingChange("connectSound", v)}
                      disabled={!settings.playSoundOnConnect}
                    >
                      <SelectTrigger className="w-32 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="beep">Beep</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={settings.playSoundOnConnect}
                      onCheckedChange={(v) => handleSettingChange("playSoundOnConnect", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Queue Settings */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Default Queue Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default max attempts</Label>
                    <Input
                      type="number"
                      value={settings.defaultMaxAttempts}
                      onChange={(e) =>
                        handleSettingChange("defaultMaxAttempts", parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days between attempts</Label>
                    <Input
                      type="number"
                      value={settings.defaultDaysBetweenAttempts}
                      onChange={(e) =>
                        handleSettingChange(
                          "defaultDaysBetweenAttempts",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Calling hours start</Label>
                    <Input
                      type="time"
                      value={settings.defaultCallingHoursStart}
                      onChange={(e) =>
                        handleSettingChange("defaultCallingHoursStart", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Calling hours end</Label>
                    <Input
                      type="time"
                      value={settings.defaultCallingHoursEnd}
                      onChange={(e) =>
                        handleSettingChange("defaultCallingHoursEnd", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.defaultTimezone}
                      onValueChange={(v) => handleSettingChange("defaultTimezone", v)}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default calling days</Label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day.id}
                        variant={
                          settings.defaultCallingDays.includes(day.id) ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => toggleCallingDay(day.id)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Handling */}
            <Card variant="default" padding="none">
              <CardHeader>
                <CardTitle className="text-h3">Call Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      Respect Do Not Call list
                    </Label>
                    <p className="text-small text-muted-foreground">
                      Strongly recommended for compliance
                    </p>
                  </div>
                  <Switch
                    checked={settings.respectDNC}
                    onCheckedChange={(v) => handleSettingChange("respectDNC", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respect TCPA quiet hours</Label>
                    <p className="text-small text-muted-foreground">
                      No calls before 8 AM or after 9 PM recipient's local time
                    </p>
                  </div>
                  <Switch
                    checked={settings.respectTCPA}
                    onCheckedChange={(v) => handleSettingChange("respectTCPA", v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-skip recently called</Label>
                    <p className="text-small text-muted-foreground">
                      Skip contacts called within specified days
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.autoSkipRecentlyCalled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={settings.skipIfCalledWithinDays}
                          onChange={(e) =>
                            handleSettingChange(
                              "skipIfCalledWithinDays",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16"
                        />
                        <span className="text-small text-muted-foreground">days</span>
                      </div>
                    )}
                    <Switch
                      checked={settings.autoSkipRecentlyCalled}
                      onCheckedChange={(v) => handleSettingChange("autoSkipRecentlyCalled", v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card variant="default" padding="none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-h3">Keyboard Shortcuts</CardTitle>
                  <Switch
                    checked={settings.enableKeyboardShortcuts}
                    onCheckedChange={(v) => handleSettingChange("enableKeyboardShortcuts", v)}
                  />
                </div>
              </CardHeader>
              {settings.enableKeyboardShortcuts && (
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Shortcut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Start call</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Space</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>End call</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Escape</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Mute</TableCell>
                        <TableCell>
                          <Badge variant="secondary">M</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hold</TableCell>
                        <TableCell>
                          <Badge variant="secondary">H</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Save & Next</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Enter</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Button variant="link" className="mt-2 px-0">
                    Customize Shortcuts
                  </Button>
                </CardContent>
              )}
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => toast.success("Settings saved")}>
                Save Changes
              </Button>
            </div>
    </>
  );
}
