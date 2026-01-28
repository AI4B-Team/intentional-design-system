import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface OverlapData {
  listA: string;
  listB: string;
  overlap: number;
  percentA: number;
  percentB: number;
}

export function DuplicateReportWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch lists for overlap calculation
  const { data: lists = [] } = useQuery({
    queryKey: ["lists-for-overlap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("id, name, total_records")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .order("total_records", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Generate mock overlap data (in production, this would be calculated server-side)
  const overlapData: OverlapData[] = lists.length >= 2
    ? [
        {
          listA: lists[0]?.name || "List A",
          listB: lists[1]?.name || "List B",
          overlap: Math.floor(Math.random() * 300) + 50,
          percentA: Math.floor(Math.random() * 30) + 10,
          percentB: Math.floor(Math.random() * 40) + 15,
        },
        ...(lists.length >= 3
          ? [
              {
                listA: lists[0]?.name || "List A",
                listB: lists[2]?.name || "List C",
                overlap: Math.floor(Math.random() * 200) + 30,
                percentA: Math.floor(Math.random() * 25) + 8,
                percentB: Math.floor(Math.random() * 35) + 10,
              },
            ]
          : []),
        ...(lists.length >= 3
          ? [
              {
                listA: lists[1]?.name || "List B",
                listB: lists[2]?.name || "List C",
                overlap: Math.floor(Math.random() * 150) + 20,
                percentA: Math.floor(Math.random() * 20) + 5,
                percentB: Math.floor(Math.random() * 30) + 8,
              },
            ]
          : []),
      ]
    : [];

  if (lists.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cross-List Duplicates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Create at least 2 lists to see overlap analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Cross-List Duplicates</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/marketing/lists/dedupe")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>List A</TableHead>
              <TableHead>List B</TableHead>
              <TableHead className="text-center">Overlap</TableHead>
              <TableHead className="text-center">% of A</TableHead>
              <TableHead className="text-center">% of B</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overlapData.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-sm">{row.listA}</TableCell>
                <TableCell className="font-medium text-sm">{row.listB}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{row.overlap}</Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {row.percentA}%
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {row.percentB}%
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => navigate("/marketing/lists?tab=stacked")}
                  >
                    <Layers3 className="h-3 w-3 mr-1" />
                    Stack
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
