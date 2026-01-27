import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Minus,
  Sparkles,
  HelpCircle,
  Phone,
  FileText,
  Target,
} from "lucide-react";
import { useLeaderboard, useCategoryLeaderboard, useUserStats, getLevel, DEFAULT_POINT_VALUES } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type Timeframe = "today" | "week" | "month" | "all";

const TIMEFRAME_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RankIndicator({ rank, previousRank }: { rank: number; previousRank?: number }) {
  if (rank === 1) return <Flame className="h-4 w-4 text-warning" />;
  if (!previousRank) return <Sparkles className="h-4 w-4 text-info" />;
  if (rank < previousRank) return <ArrowUp className="h-4 w-4 text-success" />;
  if (rank > previousRank) return <ArrowDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-content-tertiary" />;
}

function PodiumCard({ entry, position }: { entry: any; position: 1 | 2 | 3 }) {
  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
  const colors = {
    1: "from-warning/20 to-warning/5 border-warning/30",
    2: "from-muted to-muted/50 border-muted",
    3: "from-amber-600/20 to-amber-600/5 border-amber-600/30",
  };
  const medals = {
    1: <Crown className="h-6 w-6 text-warning" />,
    2: <Medal className="h-5 w-5 text-content-secondary" />,
    3: <Medal className="h-5 w-5 text-amber-600" />,
  };

  return (
    <div className="flex flex-col items-center">
      <Avatar className={cn("border-2", position === 1 ? "h-16 w-16 border-warning" : "h-12 w-12 border-muted")}>
        <AvatarFallback className={cn("text-body font-semibold", position === 1 && "bg-warning/20 text-warning")}>
          {getInitials(entry.name)}
        </AvatarFallback>
      </Avatar>
      <div className="mt-2 text-center">
        <p className={cn("font-semibold", position === 1 ? "text-body" : "text-small")}>{entry.name}</p>
        <p className="text-small font-bold text-brand-accent">{entry.totalPoints.toLocaleString()} pts</p>
      </div>
      <div className={cn(
        "mt-3 w-24 rounded-t-lg bg-gradient-to-t border-t border-x flex items-end justify-center pb-2",
        heights[position],
        colors[position]
      )}>
        {medals[position]}
      </div>
    </div>
  );
}

function PointValuesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" icon={<HelpCircle className="h-4 w-4" />}>
          How points work
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Point Values</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-small font-semibold text-content">Activity Points</h4>
            <div className="grid grid-cols-2 gap-2 text-small">
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Lead Added</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.lead_added}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Skip Trace</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.skip_trace}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Contact Made</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.contact_made}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Appointment Set</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.appointment_set}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Offer Made</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.offer_made}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-surface-secondary">
                <span className="text-content-secondary">Offer Accepted</span>
                <span className="font-semibold text-content">+{DEFAULT_POINT_VALUES.offer_accepted}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-small font-semibold text-content">Deal Bonuses</h4>
            <div className="space-y-2 text-small">
              <div className="flex justify-between p-2 rounded bg-success/10">
                <span className="text-content-secondary">Deal Closed</span>
                <span className="font-semibold text-success">+{DEFAULT_POINT_VALUES.deal_closed}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-success/10">
                <span className="text-content-secondary">Profit &gt; $10K bonus</span>
                <span className="font-semibold text-success">+{DEFAULT_POINT_VALUES.deal_closed_10k_bonus}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-success/10">
                <span className="text-content-secondary">Profit &gt; $25K bonus</span>
                <span className="font-semibold text-success">+{DEFAULT_POINT_VALUES.deal_closed_25k_bonus}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-small font-semibold text-content">Streak Bonuses</h4>
            <div className="grid grid-cols-2 gap-2 text-small">
              <div className="flex justify-between p-2 rounded bg-warning/10">
                <span className="text-content-secondary">7-Day Streak</span>
                <span className="font-semibold text-warning">+{DEFAULT_POINT_VALUES.streak_7_day}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-warning/10">
                <span className="text-content-secondary">30-Day Streak</span>
                <span className="font-semibold text-warning">+{DEFAULT_POINT_VALUES.streak_30_day}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryLeaderboard({ category, timeframe }: { category: string; timeframe: Timeframe }) {
  const { data } = useCategoryLeaderboard(category as any, timeframe);
  const { user } = useAuth();

  const getMetricValue = (entry: any) => {
    switch (category) {
      case "points": return entry.totalPoints.toLocaleString();
      case "contacts": return entry.contactsMade;
      case "offers": return entry.offersSent;
      case "deals": return entry.dealsClosed;
      case "profit": return `$${entry.profit.toLocaleString()}`;
      default: return entry.totalPoints;
    }
  };

  return (
    <div className="space-y-2">
      {data.map((entry, idx) => {
        const isCurrentUser = entry.user_id === user?.id;
        return (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-medium",
              isCurrentUser && "bg-brand-accent/10",
              idx < 3 && "bg-warning/5"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {idx === 0 ? (
                <Crown className="h-4 w-4 text-warning" />
              ) : (
                <span className="text-small font-medium text-content-secondary">{idx + 1}</span>
              )}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-tiny">{getInitials(entry.name)}</AvatarFallback>
            </Avatar>
            <span className={cn("flex-1 text-small font-medium", isCurrentUser && "text-brand-accent")}>
              {isCurrentUser ? "You" : entry.name}
            </span>
            <span className="text-small font-bold tabular-nums">{getMetricValue(entry)}</span>
          </div>
        );
      })}
      {data.length === 0 && (
        <div className="text-center py-6 text-content-tertiary text-small">
          No data for this period
        </div>
      )}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = React.useState<Timeframe>("month");

  const { data: leaderboard, isLoading } = useLeaderboard(timeframe);
  const { data: stats } = useUserStats();

  // Find current user's rank
  const userRank = leaderboard?.find((e) => e.user_id === user?.id)?.rank;
  const teamAvgPoints = leaderboard && leaderboard.length > 0
    ? Math.round(leaderboard.reduce((sum, e) => sum + e.totalPoints, 0) / leaderboard.length)
    : 0;

  // Celebrate if user is #1
  React.useEffect(() => {
    if (userRank === 1 && leaderboard && leaderboard.length > 1) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [userRank, leaderboard?.length]);

  // Get top 3 for podium
  const top3 = leaderboard?.slice(0, 3) || [];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-lg">
        <PageHeader
          title="Team Leaderboard"
          description="Compete with your team and track performance"
        />
        <PointValuesModal />
      </div>

      {/* Time Period Selector */}
      <div className="mb-lg">
        <SegmentedControl
          value={timeframe}
          onChange={(v) => setTimeframe(v as Timeframe)}
          options={TIMEFRAME_OPTIONS}
        />
      </div>

      {/* Podium Display */}
      {top3.length >= 3 && (
        <Card variant="default" padding="lg" className="mb-lg">
          <div className="flex items-end justify-center gap-4">
            <PodiumCard entry={top3[1]} position={2} />
            <PodiumCard entry={top3[0]} position={1} />
            <PodiumCard entry={top3[2]} position={3} />
          </div>
        </Card>
      )}

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
                {userRank ? `#${userRank} of ${leaderboard?.length || 0}` : "Not ranked yet"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Your Points</p>
              <p className="text-h3 font-bold text-content">{(stats?.totalPoints || 0).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Team Avg</p>
              <p className="text-h3 font-bold text-content-secondary">{teamAvgPoints.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Streak</p>
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-warning" />
                <p className="text-h3 font-bold text-content">{stats?.currentStreak || 0}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-tiny text-content-secondary uppercase">Level</p>
              <Badge variant="secondary" size="sm">{stats?.level || "Rookie"}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs for different leaderboards */}
      <Tabs defaultValue="overall" className="space-y-md">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overall" className="gap-1.5">
            <Trophy className="h-4 w-4" /> Overall
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Phone className="h-4 w-4" /> Contacts
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-1.5">
            <FileText className="h-4 w-4" /> Offers
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5">
            <Target className="h-4 w-4" /> Deals
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-1.5">
            <DollarSign className="h-4 w-4" /> Profit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-h3 font-semibold text-content flex items-center gap-2">
                <Users className="h-5 w-5 text-content-secondary" />
                Team Rankings
              </h3>
              <Badge variant="secondary" size="sm">
                {leaderboard?.length || 0} members
              </Badge>
            </div>

            {leaderboard && leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left py-3 text-content-secondary font-medium w-16">Rank</th>
                      <th className="text-left py-3 text-content-secondary font-medium">Member</th>
                      <th className="text-right py-3 text-content-secondary font-medium">Points</th>
                      <th className="text-right py-3 text-content-secondary font-medium hidden sm:table-cell">Leads</th>
                      <th className="text-right py-3 text-content-secondary font-medium hidden sm:table-cell">Contacts</th>
                      <th className="text-right py-3 text-content-secondary font-medium hidden md:table-cell">Offers</th>
                      <th className="text-right py-3 text-content-secondary font-medium hidden md:table-cell">Closed</th>
                      <th className="text-right py-3 text-content-secondary font-medium">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => {
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
                            <div className="flex items-center gap-2">
                              <RankIndicator rank={entry.rank} previousRank={entry.previousRank} />
                              {entry.rank === 1 ? (
                                <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                                  <Crown className="h-5 w-5 text-warning" />
                                </div>
                              ) : entry.rank <= 3 ? (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Medal className="h-5 w-5 text-content-secondary" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-small font-medium text-content-secondary">{entry.rank}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-tiny">
                                  {getInitials(entry.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className={cn("font-medium", isCurrentUser && "text-brand-accent")}>
                                  {isCurrentUser ? "You" : entry.name}
                                </p>
                                <Badge variant="outline" size="sm" className="mt-0.5">
                                  {level.name}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <Badge
                              variant={entry.rank === 1 ? "warning" : entry.rank <= 3 ? "secondary" : "outline"}
                              size="sm"
                            >
                              {entry.totalPoints.toLocaleString()}
                            </Badge>
                          </td>
                          <td className="py-3 text-right tabular-nums hidden sm:table-cell">—</td>
                          <td className="py-3 text-right tabular-nums hidden sm:table-cell">{entry.contactsMade}</td>
                          <td className="py-3 text-right tabular-nums hidden md:table-cell">{entry.offersSent}</td>
                          <td className="py-3 text-right tabular-nums hidden md:table-cell">{entry.dealsClosed}</td>
                          <td className="py-3 text-right">
                            {entry.streak > 0 ? (
                              <div className="flex items-center justify-end gap-1">
                                <Flame className="h-4 w-4 text-warning" />
                                <span className="text-small font-medium">{entry.streak}d</span>
                              </div>
                            ) : (
                              <span className="text-content-tertiary">—</span>
                            )}
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
        </TabsContent>

        <TabsContent value="contacts">
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-content-secondary" />
              Most Contacts Made
            </h3>
            <CategoryLeaderboard category="contacts" timeframe={timeframe} />
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-content-secondary" />
              Most Offers Sent
            </h3>
            <CategoryLeaderboard category="offers" timeframe={timeframe} />
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-content-secondary" />
              Most Deals Closed
            </h3>
            <CategoryLeaderboard category="deals" timeframe={timeframe} />
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-semibold text-content mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-content-secondary" />
              Highest Profit
            </h3>
            <CategoryLeaderboard category="profit" timeframe={timeframe} />
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
