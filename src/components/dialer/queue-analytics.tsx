import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, Target, Phone } from "lucide-react";

interface QueueAnalyticsProps {
  queueId: string;
  outcomes: {
    name: string;
    value: number;
    color: string;
  }[];
  callsByDay: {
    day: string;
    calls: number;
  }[];
  stats: {
    avgCallsToReach: number;
    avgTalkTime: number;
    conversionRate: number;
    bestTime: string;
  };
}

const COLORS = {
  appointment: "hsl(var(--success))",
  interested: "hsl(var(--info))",
  voicemail: "hsl(var(--warning))",
  noAnswer: "hsl(var(--muted-foreground))",
  notInterested: "hsl(var(--destructive))",
  other: "hsl(var(--accent))",
};

export function QueueAnalytics({
  queueId,
  outcomes,
  callsByDay,
  stats,
}: QueueAnalyticsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalOutcomes = outcomes.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-small bg-accent/10 text-accent">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-tiny text-muted-foreground">Best Time to Call</p>
              <p className="text-body font-semibold">{stats.bestTime}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Outcomes Pie Chart */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomes}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {outcomes.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = ((data.value / totalOutcomes) * 100).toFixed(0);
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
                {outcomes.map((outcome, idx) => {
                  const percent = ((outcome.value / totalOutcomes) * 100).toFixed(0);
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: outcome.color }}
                        />
                        <span className="text-small">{outcome.name}</span>
                      </div>
                      <span className="text-small text-muted-foreground">
                        {outcome.value} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calls by Day Bar Chart */}
        <Card variant="default" padding="none">
          <CardHeader>
            <CardTitle className="text-h3">Calls by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callsByDay}>
                  <XAxis
                    dataKey="day"
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
                  <Bar
                    dataKey="calls"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
