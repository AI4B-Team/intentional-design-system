import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
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
  organization_id?: string;
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
  organization_id: string | null;
  activity_type: string;
  points: number;
  reference_id: string | null;
  entity_id: string | null;
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
  longestStreak: number;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  totalPoints: number;
  dealsClosed: number;
  contactsMade: number;
  offersSent: number;
  profit: number;
  streak: number;
  rank: number;
  previousRank?: number;
  rankChange?: "up" | "down" | "same" | "new";
}

export interface GamificationSettings {
  id: string;
  organization_id: string;
  enabled: boolean;
  point_values: PointValues;
  streak_requirements: { daily_minimum_points: number };
}

export interface PointValues {
  lead_added: number;
  skip_trace: number;
  contact_made: number;
  appointment_set: number;
  appointment_completed: number;
  offer_made: number;
  offer_accepted: number;
  deal_closed: number;
  deal_closed_10k_bonus: number;
  deal_closed_25k_bonus: number;
  streak_7_day: number;
  streak_30_day: number;
}

// Default point values
export const DEFAULT_POINT_VALUES: PointValues = {
  lead_added: 10,
  skip_trace: 5,
  contact_made: 15,
  appointment_set: 25,
  appointment_completed: 20,
  offer_made: 30,
  offer_accepted: 50,
  deal_closed: 100,
  deal_closed_10k_bonus: 50,
  deal_closed_25k_bonus: 100,
  streak_7_day: 25,
  streak_30_day: 100,
};

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

export function useGamificationSettings() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["gamification-settings", organization?.id],
    queryFn: async () => {
      if (!organization) return null;

      const { data, error } = await supabase
        .from("gamification_settings")
        .select("*")
        .eq("organization_id", organization.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // Return defaults if no settings exist
      if (!data) {
        return {
          id: "",
          organization_id: organization.id,
          enabled: true,
          point_values: DEFAULT_POINT_VALUES,
          streak_requirements: { daily_minimum_points: 10 },
        } as GamificationSettings;
      }

      return {
        ...data,
        point_values: data.point_values as unknown as PointValues,
        streak_requirements: data.streak_requirements as unknown as { daily_minimum_points: number },
      } as GamificationSettings;
    },
    enabled: !!organization,
  });
}

export function useUpdateGamificationSettings() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<GamificationSettings>) => {
      if (!organization) throw new Error("No organization");

      const { data, error } = await supabase
        .from("gamification_settings")
        .upsert({
          organization_id: organization.id,
          ...settings,
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-settings"] });
      toast.success("Gamification settings updated");
    },
  });
}

export function useAchievements() {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["achievements", organization?.id],
    queryFn: async () => {
      let query = supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true })
        .order("threshold", { ascending: true });

      // Get both global and org-specific achievements
      if (organization) {
        query = query.or(`organization_id.is.null,organization_id.eq.${organization.id}`);
      } else {
        query = query.is("organization_id", null);
      }

      const { data, error } = await query;
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

export function useUserStreak() {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ["user-streak", user?.id, organization?.id],
    queryFn: async () => {
      if (!user || !organization) return null;

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .eq("organization_id", organization.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!organization,
  });
}

export function useUserStats() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { data: streakData } = useUserStreak();

  return useQuery({
    queryKey: ["user-stats", user?.id, organization?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total points (org-scoped if available)
      let pointsQuery = supabase
        .from("activity_points")
        .select("points")
        .eq("user_id", user.id);

      if (organization) {
        pointsQuery = pointsQuery.or(`organization_id.eq.${organization.id},organization_id.is.null`);
      }

      const { data: pointsData } = await pointsQuery;
      const totalPoints = (pointsData || []).reduce((sum, p) => sum + p.points, 0);

      // Get closed deals
      let dealsQuery = supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "closed");

      if (organization) {
        dealsQuery = dealsQuery.eq("organization_id", organization.id);
      }

      const { count: dealsClosed } = await dealsQuery;

      // Get profit estimate
      let profitQuery = supabase
        .from("properties")
        .select("arv, mao_standard")
        .eq("user_id", user.id)
        .eq("status", "closed");

      if (organization) {
        profitQuery = profitQuery.eq("organization_id", organization.id);
      }

      const { data: closedDeals } = await profitQuery;
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
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
      } as UserStats;
    },
    enabled: !!user?.id,
  });
}

export function useLeaderboard(timeframe: "today" | "week" | "month" | "all" = "month") {
  const { organization, members } = useOrganization();

  return useQuery({
    queryKey: ["leaderboard", organization?.id, timeframe],
    queryFn: async () => {
      if (!organization) return [];

      // Get all activity points with user info
      let query = supabase
        .from("activity_points")
        .select("user_id, points, activity_type, created_at")
        .eq("organization_id", organization.id);

      // Filter by timeframe
      const now = new Date();
      if (timeframe === "today") {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        query = query.gte("created_at", todayStart.toISOString());
      } else if (timeframe === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (timeframe === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data: pointsData } = await query;

      // Aggregate by user
      const userStats = new Map<string, {
        points: number;
        contacts: number;
        offers: number;
        deals: number;
      }>();

      (pointsData || []).forEach((p) => {
        const current = userStats.get(p.user_id) || { points: 0, contacts: 0, offers: 0, deals: 0 };
        current.points += p.points;
        
        if (p.activity_type === "contact_made") current.contacts++;
        if (p.activity_type === "offer_made") current.offers++;
        if (p.activity_type === "deal_closed") current.deals++;
        
        userStats.set(p.user_id, current);
      });

      // Get streaks for all users
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("user_id, current_streak")
        .eq("organization_id", organization.id);

      const streakMap = new Map<string, number>();
      (streaks || []).forEach((s) => {
        streakMap.set(s.user_id, s.current_streak);
      });

      // Build leaderboard entries with member info
      const entries: LeaderboardEntry[] = Array.from(userStats.entries()).map(([user_id, stats]) => {
        const member = members.find((m) => m.user_id === user_id);
        return {
          user_id,
          name: member?.user?.full_name || member?.user?.email || "Unknown",
          email: member?.user?.email || "",
          totalPoints: stats.points,
          dealsClosed: stats.deals,
          contactsMade: stats.contacts,
          offersSent: stats.offers,
          profit: stats.deals * 15000, // Estimate
          streak: streakMap.get(user_id) || 0,
          rank: 0,
          rankChange: "same" as const,
        };
      });

      // Sort and rank
      entries.sort((a, b) => b.totalPoints - a.totalPoints);
      entries.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      return entries;
    },
    enabled: !!organization,
    refetchInterval: 60000,
  });
}

export function useCategoryLeaderboard(
  category: "points" | "leads" | "contacts" | "offers" | "deals" | "profit",
  timeframe: "today" | "week" | "month" | "all" = "month"
) {
  const { data: leaderboard } = useLeaderboard(timeframe);

  return {
    data: (leaderboard || [])
      .sort((a, b) => {
        switch (category) {
          case "points": return b.totalPoints - a.totalPoints;
          case "leads": return b.totalPoints - a.totalPoints; // Would need separate tracking
          case "contacts": return b.contactsMade - a.contactsMade;
          case "offers": return b.offersSent - a.offersSent;
          case "deals": return b.dealsClosed - a.dealsClosed;
          case "profit": return b.profit - a.profit;
          default: return 0;
        }
      })
      .slice(0, 10)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 })),
  };
}

// ============ MUTATIONS ============

export function useAwardPoints() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const { data: settings } = useGamificationSettings();

  return useMutation({
    mutationFn: async ({
      activityType,
      points,
      referenceId,
      entityId,
      showToast = true,
    }: {
      activityType: string;
      points?: number;
      referenceId?: string;
      entityId?: string;
      showToast?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get point value from settings or use provided/default
      const pointValues = settings?.point_values || DEFAULT_POINT_VALUES;
      const finalPoints = points ?? (pointValues as any)[activityType] ?? 10;

      const insertData: any = {
        user_id: user.id,
        activity_type: activityType,
        points: finalPoints,
        reference_id: referenceId || null,
      };

      if (organization) {
        insertData.organization_id = organization.id;
      }

      if (entityId) {
        insertData.entity_id = entityId;
      }

      const { data, error } = await supabase
        .from("activity_points")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Update streak
      if (organization) {
        await updateStreak(user.id, organization.id);
      }

      return { ...data, showToast, activityType, finalPoints };
    },
    onSuccess: (data) => {
      if (data.showToast) {
        const actionLabels: Record<string, string> = {
          lead_added: "Lead added",
          contact_made: "Contact logged",
          appointment_set: "Appointment set",
          offer_made: "Offer sent",
          deal_closed: "Deal closed",
        };
        const label = actionLabels[data.activityType] || data.activityType.replace("_", " ");
        toast.success(`+${data.finalPoints} points`, { description: label, duration: 2000 });
      }

      queryClient.invalidateQueries({ queryKey: ["activity-points"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
    },
  });
}

async function updateStreak(userId: string, organizationId: string) {
  const today = new Date().toISOString().split("T")[0];

  // Get existing streak record
  const { data: existing } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (!existing) {
    // Create new streak record
    await supabase.from("user_streaks").insert({
      user_id: userId,
      organization_id: organizationId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    } as any);
    return;
  }

  const lastDate = existing.last_activity_date;
  if (lastDate === today) return; // Already logged today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (lastDate === yesterdayStr) {
    // Consecutive day
    newStreak = (existing.current_streak || 0) + 1;
  }

  const longestStreak = Math.max(newStreak, existing.longest_streak || 0);

  await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", existing.id);
}

export function useAwardAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const awardPoints = useAwardPoints();

  return useMutation({
    mutationFn: async ({
      achievementId,
      dealId,
      shareWithTeam = false,
    }: {
      achievementId: string;
      dealId?: string;
      shareWithTeam?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if already earned
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId)
        .single();

      if (existing) return null;

      const { data, error } = await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: achievementId,
        deal_id: dealId || null,
      }).select(`
        *,
        achievements (*)
      `).single();

      if (error) throw error;
      return { ...data, shareWithTeam };
    },
    onSuccess: async (data) => {
      if (data) {
        const achievement = data.achievements as unknown as Achievement;
        
        // Award bonus points (silent)
        await awardPoints.mutateAsync({
          activityType: "achievement_bonus",
          points: achievement.points,
          referenceId: data.id,
          showToast: false,
        });

        // Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `+${achievement.points} points`,
          duration: 5000,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });
}

// ============ ACHIEVEMENT CHECKER ============

export function useCheckAchievements() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { data: achievements } = useAchievements();
  const { data: userAchievements } = useUserAchievements();
  const awardAchievement = useAwardAchievement();

  const checkAndAward = async () => {
    if (!user?.id || !achievements || !userAchievements) return;

    const earnedCodes = new Set(userAchievements.map((ua) => ua.achievement?.code));

    // Get user stats
    let dealsQuery = supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "closed");

    if (organization) {
      dealsQuery = dealsQuery.eq("organization_id", organization.id);
    }

    const { count: dealsCount } = await dealsQuery;

    const { data: offersData } = await supabase
      .from("offers")
      .select("id")
      .eq("created_by", user.id);

    const { data: outreachData } = await supabase
      .from("outreach_log")
      .select("id")
      .eq("user_id", user.id);

    const totalDeals = dealsCount || 0;
    const totalOffers = offersData?.length || 0;
    const totalContacts = outreachData?.length || 0;

    // Check deal milestones
    const dealMilestones = [
      { code: "first_deal", threshold: 1 },
      { code: "5_deals", threshold: 5 },
      { code: "10_deals", threshold: 10 },
      { code: "25_deals", threshold: 25 },
      { code: "100_deals", threshold: 100 },
    ];

    for (const dm of dealMilestones) {
      if (totalDeals >= dm.threshold && !earnedCodes.has(dm.code)) {
        const achievement = achievements.find((a) => a.code === dm.code);
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

// Point values export for backward compatibility
export const POINT_VALUES = DEFAULT_POINT_VALUES;
