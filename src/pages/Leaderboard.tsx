import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Flame,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLeaderboard, useUserStats, getLevel } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type SortBy = "points" | "deals" | "profit" | "streak";
type Timeframe = "week" | "month" | "quarter" | "all";

const TIMEFRAME_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "all", label: "All Time" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
        <Crown className="h-5 w-5 text-warning" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Medal className="h-5 w-5 text-content-secondary" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
        <Medal className="h-5 w-5 text-warning" />
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-small font-medium text-content-secondary">{rank}</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = React.useState<Timeframe>("month");
  const [sortBy, setSortBy] = React.useState<SortBy>("points");

  const { data: leaderboard, isLoading } = useLeaderboard(timeframe);
  const { data: stats } = useUserStats();

  // Sort leaderboard
  const sortedLeaderboard = React.useMemo(() => {
    if (!leaderboard) return [];
    return [...leaderboard].sort((a, b) => {
      switch (sortBy) {
        case "points":
          return b.totalPoints - a.totalPoints;
        case "deals":
          return b.dealsClosed - a.dealsClosed;
        case "profit":
          return b.profit - a.profit;
        case "streak":
          return b.streak - a.streak;
        default:
          return 0;
      }
    }).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [leaderboard, sortBy]);

  // Find current user's rank
  const userRank = sortedLeaderboard.find((e) => e.user_id === user?.id)?.rank;
  const teamAvgPoints = leaderboard && leaderboard.length > 0
    ? Math.round(leaderboard.reduce((sum, e) => sum + e.totalPoints, 0) / leaderboard.length)
    : 0;

  // Celebrate if user is #1
  React.useEffect(() => {
    if (userRank === 1 && sortedLeaderboard.length > 1) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [userRank, sortedLeaderboard.length]);

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Leaderboard" }]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Leaderboard" }]}>
      <PageHeader
        title="Leaderboard"
        description="Compete with your team and track performance"
      />

      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-lg">
        <SegmentedControl
          value={timeframe}
          onChange={(v) => setTimeframe(v as Timeframe)}
          options={TIMEFRAME_OPTIONS}
        />
        <div className="flex items-center gap-2">
          <span className="text-small text-content-secondary">Sort by:</span>
          <div className="flex gap-1">
            {(["points", "deals", "profit"] as SortBy[]).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(option)}
                className="capitalize"
              >
                {option === "points" && <Star className="h-3.5 w-3.5 mr-1" />}
                {option === "deals" && <Trophy className="h-3.5 w-3.5 mr-1" />}
                {option === "profit" && <DollarSign className="h-3.5 w-3.5 mr-1" />}
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Stats Card */}
      <Card variant="default" padding="lg" className="mb-lg bg-gradient-to-r from-brand-accent/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-accent/20 flex items-center justify-center">
              {userRank === 1 ? (
                <Crown className="h-8 w-8 text-warning" />
              ) : (
                <span className="text-h2 font-bold text-brand-accent">#{userRank || "-"}</span>
              )}
            </div>
            <div>
              <p className="text-small text-content-secondary">Your Rank</p>
              <p className="text-h3 font-bold text-content">
                {userRank ? `#${userRank} of ${sortedLeaderboard.length}` : "Not ranked yet"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Your Points</p>
              <p className="text-h3 font-bold text-content">{(stats?.totalPoints || 0).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Team Avg</p>
              <p className="text-h3 font-bold text-content-secondary">{teamAvgPoints.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">vs Avg</p>
              <div className="flex items-center justify-center gap-1">
                {(stats?.totalPoints || 0) > teamAvgPoints ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-success" />
                    <span className="text-h3 font-bold text-success">
                      +{Math.round((((stats?.totalPoints || 0) - teamAvgPoints) / Math.max(teamAvgPoints, 1)) * 100)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 text-destructive" />
                    <span className="text-h3 font-bold text-destructive">
                      {Math.round((((stats?.totalPoints || 0) - teamAvgPoints) / Math.max(teamAvgPoints, 1)) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-h3 font-semibold text-content flex items-center gap-2">
            <Users className="h-5 w-5 text-content-secondary" />
            Team Rankings
          </h3>
          <Badge variant="secondary" size="sm">
            {sortedLeaderboard.length} members
          </Badge>
        </div>

        {sortedLeaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 text-content-secondary font-medium w-16">Rank</th>
                  <th className="text-left py-3 text-content-secondary font-medium">User</th>
                  <th className="text-right py-3 text-content-secondary font-medium">
                    <button
                      className={cn("hover:text-content", sortBy === "deals" && "text-content font-semibold")}
                      onClick={() => setSortBy("deals")}
                    >
                      Deals
                    </button>
                  </th>
                  <th className="text-right py-3 text-content-secondary font-medium">
                    <button
                      className={cn("hover:text-content", sortBy === "profit" && "text-content font-semibold")}
                      onClick={() => setSortBy("profit")}
                    >
                      Profit
                    </button>
                  </th>
                  <th className="text-right py-3 text-content-secondary font-medium">
                    <button
                      className={cn("hover:text-content", sortBy === "points" && "text-content font-semibold")}
                      onClick={() => setSortBy("points")}
                    >
                      Points
                    </button>
                  </th>
                  <th className="text-right py-3 text-content-secondary font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((entry) => {
                  const level = getLevel(entry.totalPoints);
                  const isCurrentUser = entry.user_id === user?.id;

                  return (
                    <tr
                      key={entry.user_id}
                      className={cn(
                        "border-b border-border-subtle",
                        isCurrentUser && "bg-brand-accent/5",
                        entry.rank <= 3 && "bg-warning/5"
                      )}
                    >
                      <td className="py-3">
                        <RankBadge rank={entry.rank} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-small font-medium text-content-secondary">
                              {entry.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={cn("font-medium", isCurrentUser && "text-brand-accent")}>
                              {isCurrentUser ? "You" : entry.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right tabular-nums font-medium">{entry.dealsClosed}</td>
                      <td className="py-3 text-right tabular-nums text-success font-medium">
                        ${entry.profit.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={entry.rank === 1 ? "warning" : entry.rank <= 3 ? "secondary" : "outline"}
                          size="sm"
                        >
                          {entry.totalPoints.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary" size="sm">
                          {level.name}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-content-secondary">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-body">No activity yet this period</p>
            <p className="text-small mt-1">Start closing deals to appear on the leaderboard!</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
