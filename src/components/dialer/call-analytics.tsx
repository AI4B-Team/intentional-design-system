import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Phone, TrendingUp, Clock, Target } from "lucide-react";

interface CallAnalyticsProps {
  volumeData: Array<{ date: string; made: number; answered: number; appointments: number }>;
  dispositionData: Array<{ name: string; value: number; color: string }>;
  durationData: Array<{ range: string; count: number }>;
  heatmapData: Array<{ hour: string; mon: number; tue: number; wed: number; thu: number; fri: number; sat: number }>;
  stats: {
    avgCallsToReach: number;
    avgTalkTime: number;
    conversionRate: number;
  };
}

const HOURS = ["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CallAnalytics({
  volumeData,
  dispositionData,
  durationData,
  heatmapData,
  stats,
}: CallAnalyticsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 70) return "bg-success";
    if (value >= 40) return "bg-warning";
    return "bg-destructive/50";
  };

  const totalDispositions = dispositionData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-small bg-info/10 text-info">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-tiny text-muted-foreground">Avg Calls to Reach</p>
              <p className="text-h3 font-semibold">{stats.avgCallsToReach.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-small bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-tiny text-muted-foreground">Avg Talk Time</p>
              <p className="text-h3 font-semibold">{formatTime(stats.avgTalkTime)}</p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-small bg-success/10 text-success">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-tiny text-muted-foreground">Conversion Rate</p>
              <p className="text-h3 font-semibold">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Call Volume Over Time */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Call Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-border-subtle rounded-small px-3 py-2 shadow-md">
                            <p className="font-medium mb-1">{label}</p>
                            {payload.map((entry: any, i: number) => (
                              <p key={i} className="text-small" style={{ color: entry.color }}>
                                {entry.name}: {entry.value}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="made"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Made"
                  />
                  <Line
                    type="monotone"
                    dataKey="answered"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                    name="Answered"
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    dot={false}
                    name="Appointments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disposition Breakdown */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Disposition Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dispositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dispositionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = ((data.value / totalDispositions) * 100).toFixed(0);
                          return (
                            <div className="bg-white border border-border-subtle rounded-small px-3 py-2 shadow-md">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-small text-muted-foreground">
                                {data.value} ({percent}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {dispositionData.slice(0, 6).map((item, idx) => {
                  const percent = ((item.value / totalDispositions) * 100).toFixed(0);
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-small truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="text-small text-muted-foreground">
                        {item.value} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Talk Time Distribution */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Talk Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationData}>
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-border-subtle rounded-small px-3 py-2 shadow-md">
                            <p className="font-medium">{label}</p>
                            <p className="text-small text-muted-foreground">
                              {payload[0].value} calls
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Best Times Heatmap */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Best Times to Call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-tiny text-muted-foreground font-normal p-1" />
                    {DAY_LABELS.map((day) => (
                      <th
                        key={day}
                        className="text-center text-tiny text-muted-foreground font-normal p-1"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="text-tiny text-muted-foreground pr-2 py-1">
                        {row.hour}
                      </td>
                      {DAYS.map((day) => {
                        const value = (row as any)[day] || 0;
                        return (
                          <td key={day} className="p-0.5">
                            <div
                              className={cn(
                                "h-6 w-full rounded-small flex items-center justify-center text-white text-tiny",
                                getHeatmapColor(value)
                              )}
                              title={`${value}% connect rate`}
                            >
                              {value > 0 && `${value}%`}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-tiny">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span>High (70%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span>Medium (40-70%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-destructive/50" />
                <span>Low (&lt;40%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
