import * as React from "react";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Zap,
  Target,
  DollarSign,
  Clock,
  Activity,
  Sparkles,
  Lock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  useAchievements,
  useUserAchievements,
  useUserStats,
  type Achievement,
} from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  deals: <Target className="h-4 w-4" />,
  profit: <DollarSign className="h-4 w-4" />,
  speed: <Zap className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
  special: <Sparkles className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  deals: "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
  profit: "bg-success/10 text-success border-success/20",
  speed: "bg-warning/10 text-warning border-warning/20",
  activity: "bg-info/10 text-info border-info/20",
  special: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

function AchievementCard({
  achievement,
  earned,
  earnedAt,
  progress,
}: {
  achievement: Achievement;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}) {
  return (
    <Card
      variant="default"
      padding="md"
      className={cn(
        "relative transition-all duration-200",
        earned
          ? "border-success/30 bg-success/5 hover:-translate-y-0.5"
          : "opacity-60 hover:opacity-80"
      )}
    >
      {/* Lock icon for unearned */}
      {!earned && (
        <div className="absolute top-3 right-3">
          <Lock className="h-4 w-4 text-content-tertiary" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "h-14 w-14 rounded-xl flex items-center justify-center text-2xl mb-3",
          earned ? CATEGORY_COLORS[achievement.category] : "bg-muted text-content-tertiary"
        )}
      >
        {achievement.icon}
      </div>

      {/* Name & Description */}
      <h3 className="font-semibold text-content text-body">{achievement.name}</h3>
      <p className="text-small text-content-secondary mt-1">{achievement.description}</p>

      {/* Progress or Earned Date */}
      {earned ? (
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="success" size="sm">
            +{achievement.points} pts
          </Badge>
          <span className="text-tiny text-content-tertiary">
            {earnedAt && formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
          </span>
        </div>
      ) : progress !== undefined && progress > 0 ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-tiny text-content-secondary mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : (
        <div className="mt-3">
          <Badge variant="secondary" size="sm">
            {achievement.points} pts
          </Badge>
        </div>
      )}
    </Card>
  );
}

export default function Achievements() {
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: userAchievements, isLoading: userAchievementsLoading } = useUserAchievements();
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const isLoading = achievementsLoading || userAchievementsLoading || statsLoading;

  // Build earned map
  const earnedMap = React.useMemo(() => {
    const map = new Map<string, { earned: boolean; earnedAt?: string }>();
    (userAchievements || []).forEach((ua) => {
      if (ua.achievement) {
        map.set(ua.achievement.id, { earned: true, earnedAt: ua.earned_at });
      }
    });
    return map;
  }, [userAchievements]);

  // Group achievements by category
  const groupedAchievements = React.useMemo(() => {
    const groups: Record<string, Achievement[]> = {
      deals: [],
      profit: [],
      speed: [],
      activity: [],
      special: [],
    };
    (achievements || []).forEach((a) => {
      if (groups[a.category]) {
        groups[a.category].push(a);
      }
    });
    return groups;
  }, [achievements]);

  // Recent achievements
  const recentAchievements = React.useMemo(() => {
    return (userAchievements || []).slice(0, 5);
  }, [userAchievements]);

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Achievements" }]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        </div>
      </DashboardLayout>
    );
  }

  const totalEarned = userAchievements?.length || 0;
  const totalAchievements = achievements?.length || 0;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Achievements" }]}>
      <PageHeader
        title="Achievements"
        description="Track your progress and unlock rewards"
      />

      {/* Progress Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-md mb-lg">
        {/* Level Card */}
        <Card variant="default" padding="lg" className="lg:col-span-2 bg-gradient-to-br from-brand-accent/10 to-brand-accent/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-small text-content-secondary uppercase tracking-wide">Your Level</p>
              <h2 className="text-display font-bold text-brand-accent mt-1">
                {stats?.level || "Rookie"}
              </h2>
            </div>
            <div className="h-16 w-16 rounded-full bg-brand-accent/20 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-brand-accent" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-small">
              <span className="text-content-secondary">Level {stats?.levelNumber || 1}</span>
              <span className="text-content-secondary">
                {stats?.pointsToNextLevel || 0} pts to next level
              </span>
            </div>
            <Progress value={stats?.levelProgress || 0} className="h-2" />
          </div>
        </Card>

        {/* Stats Cards */}
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-5 w-5 text-warning" />
            <span className="text-small text-content-secondary">Total Points</span>
          </div>
          <p className="text-h2 font-bold text-content">{(stats?.totalPoints || 0).toLocaleString()}</p>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-5 w-5 text-success" />
            <span className="text-small text-content-secondary">Achievements</span>
          </div>
          <p className="text-h2 font-bold text-content">
            {totalEarned}
            <span className="text-body text-content-tertiary font-normal">/{totalAchievements}</span>
          </p>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card variant="default" padding="md" className="mb-lg">
          <h3 className="text-h3 font-semibold text-content mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-3">
            {recentAchievements.map((ua) => (
              <div
                key={ua.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border",
                  CATEGORY_COLORS[ua.achievement?.category || "deals"]
                )}
              >
                <span className="text-xl">{ua.achievement?.icon}</span>
                <div>
                  <p className="font-medium text-small">{ua.achievement?.name}</p>
                  <p className="text-tiny opacity-70">
                    {format(new Date(ua.earned_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievement Grid by Category */}
      <Tabs defaultValue="all" className="space-y-md">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5">
            {CATEGORY_ICONS.deals} Deals
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-1.5">
            {CATEGORY_ICONS.profit} Profit
          </TabsTrigger>
          <TabsTrigger value="speed" className="gap-1.5">
            {CATEGORY_ICONS.speed} Speed
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            {CATEGORY_ICONS.activity} Activity
          </TabsTrigger>
          <TabsTrigger value="special" className="gap-1.5">
            {CATEGORY_ICONS.special} Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
            {(achievements || []).map((achievement) => {
              const earnedData = earnedMap.get(achievement.id);
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  earned={earnedData?.earned || false}
                  earnedAt={earnedData?.earnedAt}
                />
              );
            })}
          </div>
        </TabsContent>

        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
              {categoryAchievements.map((achievement) => {
                const earnedData = earnedMap.get(achievement.id);
                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    earned={earnedData?.earned || false}
                    earnedAt={earnedData?.earnedAt}
                  />
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
}
