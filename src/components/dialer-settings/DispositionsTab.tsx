import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { getCategoryBadge, type Disposition } from "./dialer-settings-constants";

interface DispositionsTabProps {
  dispositions: Disposition[];
  setEditingDisposition: (d: Disposition | null) => void;
  setIsAddingDisposition: (v: boolean) => void;
  toggleDispositionMutation: { mutate: (v: { id: string; is_active: boolean }) => void };
  deleteDispositionMutation: { mutate: (id: string) => void };
}

export function DispositionsTab({
  dispositions,
  setEditingDisposition,
  setIsAddingDisposition,
  toggleDispositionMutation,
  deleteDispositionMutation,
}: DispositionsTabProps) {
  return (
    <>
            <Card variant="default" padding="none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-h3">Active Dispositions</CardTitle>
                    <CardDescription>Drag to reorder. Click to edit.</CardDescription>
                  </div>
                  <Button variant="primary" onClick={() => setIsAddingDisposition(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Disposition
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Disposition</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Shortcut</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="text-center">Enabled</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispositions.map((disposition) => (
                      <TableRow key={disposition.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{disposition.icon || "📞"}</span>
                            <span className="font-medium">{disposition.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCategoryBadge(disposition.category)}>
                            {disposition.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {disposition.keyboard_shortcut ? (
                            <Badge variant="secondary">{disposition.keyboard_shortcut}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {disposition.removes_from_queue && (
                              <Badge variant="outline" size="sm">
                                Removes
                              </Badge>
                            )}
                            {disposition.schedules_followup && (
                              <Badge variant="outline" size="sm">
                                Schedules
                              </Badge>
                            )}
                            {disposition.adds_to_dnc && (
                              <Badge variant="outline" size="sm">
                                DNC
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={disposition.is_active ?? true}
                            onCheckedChange={(checked) =>
                              toggleDispositionMutation.mutate({
                                id: disposition.id,
                                is_active: checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingDisposition(disposition)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!disposition.is_system && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDispositionMutation.mutate(disposition.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dispositions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No dispositions configured. Add your first disposition to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
    </>
  );
}
