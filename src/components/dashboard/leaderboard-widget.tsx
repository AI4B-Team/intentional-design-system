import * as React from "react";
import { Link } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Trophy, Crown, ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface LeaderboardWidgetProps {
  className?: string;
}

export function LeaderboardWidget({ className }: LeaderboardWidgetProps) {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard("week");

  const top3 = leaderboard?.slice(0, 3) || [];
  const userEntry = leaderboard?.find((e) => e.user_id === user?.id);
  const userRank = userEntry?.rank;

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-6">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          <h3 className="text-h4 font-semibold text-content">This Week's Leaders</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/leaderboard" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {top3.length === 0 ? (
        <div className="text-center py-6">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-content-tertiary opacity-50" />
          <p className="text-small text-content-tertiary">No activity this week</p>
        </div>
      ) : (
        <div className="space-y-2">
          {top3.map((entry, idx) => {
            const isCurrentUser = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-medium",
                  isCurrentUser && "bg-brand-accent/10",
                  idx === 0 && "bg-warning/5"
                )}
              >
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {idx === 0 ? (
                    <Crown className="h-4 w-4 text-warning" />
                  ) : (
                    <span className="text-tiny font-semibold text-content-secondary">{idx + 1}</span>
                  )}
                </div>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-tiny">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  "flex-1 text-small font-medium truncate",
                  isCurrentUser && "text-brand-accent"
                )}>
                  {isCurrentUser ? "You" : entry.name.split(" ")[0]}
                </span>
                <div className="flex items-center gap-2">
                  {entry.streak > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-warning" />
                      <span className="text-tiny text-content-tertiary">{entry.streak}</span>
                    </div>
                  )}
                  <Badge variant={idx === 0 ? "warning" : "secondary"} size="sm">
                    {entry.totalPoints.toLocaleString()}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userRank && userRank > 3 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-small">
            <span className="text-content-secondary">Your rank</span>
            <span className="font-semibold text-content">
              #{userRank} of {leaderboard?.length}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
