import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// ============ TYPES ============

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: "deals" | "profit" | "speed" | "activity" | "special";
  threshold: number;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  deal_id: string | null;
  achievement?: Achievement;
}

export interface ActivityPoint {
  id: string;
  user_id: string;
  activity_type: string;
  points: number;
  reference_id: string | null;
  created_at: string;
}

export interface UserStats {
  totalPoints: number;
  level: string;
  levelNumber: number;
  pointsToNextLevel: number;
  levelProgress: number;
  dealsClosed: number;
  totalProfit: number;
  currentStreak: number;
}

export interface LeaderboardEntry {
  user_id: string;
  email: string;
  totalPoints: number;
  dealsClosed: number;
  profit: number;
  streak: number;
  rank: number;
}

// ============ LEVEL SYSTEM ============

const LEVELS = [
  { name: "Rookie", minPoints: 0 },
  { name: "Investor", minPoints: 500 },
  { name: "Pro", minPoints: 1500 },
  { name: "Expert", minPoints: 4000 },
  { name: "Master", minPoints: 10000 },
  { name: "Legend", minPoints: 25000 },
];

export function getLevel(points: number): { name: string; level: number; pointsToNext: number; progress: number } {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const levelIndex = LEVELS.findIndex((l) => l.name === currentLevel.name);
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
  const progress = pointsNeededForNext > 0 ? Math.round((pointsInLevel / pointsNeededForNext) * 100) : 100;

  return {
    name: currentLevel.name,
    level: levelIndex + 1,
    pointsToNext: Math.max(0, nextLevel.minPoints - points),
    progress: Math.min(100, progress),
  };
}

// ============ HOOKS ============

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true })
        .order("threshold", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["user-achievements", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          id,
          user_id,
          achievement_id,
          earned_at,
          deal_id,
          achievements (*)
        `)
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data.map((ua) => ({
        ...ua,
        achievement: ua.achievements as unknown as Achievement,
      })) as UserAchievement[];
    },
    enabled: !!targetUserId,
  });
}

export function useActivityPoints(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["activity-points", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_points")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ActivityPoint[];
    },
    enabled: !!targetUserId,
  });
}

export function useUserStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total points
      const { data: pointsData } = await supabase
        .from("activity_points")
        .select("points")
        .eq("user_id", user.id);

      const totalPoints = (pointsData || []).reduce((sum, p) => sum + p.points, 0);

      // Get closed deals
      const { count: dealsClosed } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "closed");

      // Get profit estimate
      const { data: closedDeals } = await supabase
        .from("properties")
        .select("arv, mao_standard")
        .eq("status", "closed");

      const totalProfit = (closedDeals || []).reduce((sum, d) => {
        if (d.arv && d.mao_standard) {
          return sum + (d.arv - d.mao_standard);
        }
        return sum + 15000;
      }, 0);

      // Calculate level
      const levelInfo = getLevel(totalPoints);

      return {
        totalPoints,
        level: levelInfo.name,
        levelNumber: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNext,
        levelProgress: levelInfo.progress,
        dealsClosed: dealsClosed || 0,
        totalProfit,
        currentStreak: 0, // Would need daily tracking to implement
      } as UserStats;
    },
    enabled: !!user?.id,
  });
}

export function useLeaderboard(timeframe: "week" | "month" | "quarter" | "all" = "month") {
  return useQuery({
    queryKey: ["leaderboard", timeframe],
    queryFn: async () => {
      // Get all activity points with user info
      let query = supabase.from("activity_points").select("user_id, points, created_at");

      // Filter by timeframe
      const now = new Date();
      if (timeframe === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (timeframe === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", monthAgo.toISOString());
      } else if (timeframe === "quarter") {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", quarterAgo.toISOString());
      }

      const { data: pointsData } = await query;

      // Aggregate by user
      const userPoints = new Map<string, number>();
      (pointsData || []).forEach((p) => {
        userPoints.set(p.user_id, (userPoints.get(p.user_id) || 0) + p.points);
      });

      // Get deal counts per user
      const { data: properties } = await supabase
        .from("properties")
        .select("user_id, status");

      const userDeals = new Map<string, number>();
      (properties || []).forEach((p) => {
        if (p.status === "closed") {
          userDeals.set(p.user_id, (userDeals.get(p.user_id) || 0) + 1);
        }
      });

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = Array.from(userPoints.entries()).map(([user_id, totalPoints]) => ({
        user_id,
        email: user_id.substring(0, 8) + "...", // Placeholder - would need profiles table
        totalPoints,
        dealsClosed: userDeals.get(user_id) || 0,
        profit: (userDeals.get(user_id) || 0) * 15000,
        streak: 0,
        rank: 0,
      }));

      // Sort and rank
      entries.sort((a, b) => b.totalPoints - a.totalPoints);
      entries.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      return entries;
    },
  });
}

// ============ MUTATIONS ============

export function useAwardPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityType,
      points,
      referenceId,
    }: {
      activityType: string;
      points: number;
      referenceId?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("activity_points").insert({
        user_id: user.id,
        activity_type: activityType,
        points,
        reference_id: referenceId || null,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-points"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useAwardAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const awardPoints = useAwardPoints();

  return useMutation({
    mutationFn: async ({
      achievementId,
      dealId,
    }: {
      achievementId: string;
      dealId?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if already earned
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId)
        .single();

      if (existing) return null; // Already earned

      const { data, error } = await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: achievementId,
        deal_id: dealId || null,
      }).select(`
        *,
        achievements (*)
      `).single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data) {
        const achievement = data.achievements as unknown as Achievement;
        
        // Award bonus points
        await awardPoints.mutateAsync({
          activityType: "achievement_bonus",
          points: achievement.points,
          referenceId: data.id,
        });

        // Show celebration
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `+${achievement.points} points`,
          duration: 5000,
        });

        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });
}

// ============ ACHIEVEMENT CHECKER ============

export function useCheckAchievements() {
  const { user } = useAuth();
  const { data: achievements } = useAchievements();
  const { data: userAchievements } = useUserAchievements();
  const awardAchievement = useAwardAchievement();

  const checkAndAward = async () => {
    if (!user?.id || !achievements || !userAchievements) return;

    const earnedCodes = new Set(userAchievements.map((ua) => ua.achievement?.code));

    // Get user stats
    const { count: dealsCount } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "closed");

    const { data: pointsData } = await supabase
      .from("activity_points")
      .select("points")
      .eq("user_id", user.id);

    const { data: offersData } = await supabase
      .from("offers")
      .select("id")
      .in("property_id", (await supabase.from("properties").select("id").eq("user_id", user.id)).data?.map(p => p.id) || []);

    const { data: outreachData } = await supabase
      .from("outreach_log")
      .select("id")
      .eq("user_id", user.id);

    const totalDeals = dealsCount || 0;
    const totalOffers = offersData?.length || 0;
    const totalContacts = outreachData?.length || 0;

    // Check deal milestones
    const dealAchievements = [
      { code: "first_deal", threshold: 1 },
      { code: "5_deals", threshold: 5 },
      { code: "10_deals", threshold: 10 },
      { code: "25_deals", threshold: 25 },
      { code: "100_deals", threshold: 100 },
    ];

    for (const da of dealAchievements) {
      if (totalDeals >= da.threshold && !earnedCodes.has(da.code)) {
        const achievement = achievements.find((a) => a.code === da.code);
        if (achievement) {
          await awardAchievement.mutateAsync({ achievementId: achievement.id });
        }
      }
    }

    // Check activity achievements
    if (totalOffers >= 50 && !earnedCodes.has("offer_machine")) {
      const achievement = achievements.find((a) => a.code === "offer_machine");
      if (achievement) {
        await awardAchievement.mutateAsync({ achievementId: achievement.id });
      }
    }

    if (totalContacts >= 100 && !earnedCodes.has("dialer")) {
      const achievement = achievements.find((a) => a.code === "dialer");
      if (achievement) {
        await awardAchievement.mutateAsync({ achievementId: achievement.id });
      }
    }
  };

  return { checkAndAward };
}

// Activity point values
export const POINT_VALUES = {
  lead_added: 5,
  contact_made: 10,
  appointment_set: 25,
  offer_sent: 20,
  deal_closed: 100,
};
