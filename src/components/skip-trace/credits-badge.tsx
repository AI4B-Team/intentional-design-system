import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Plus, History } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditsBadge() {
  const navigate = useNavigate();
  const { balance, loading } = useCredits();

  if (loading) {
    return <Skeleton className="h-9 w-20" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 font-medium"
        >
          <Wallet className="h-4 w-4 text-brand-accent" />
          <span className="tabular-nums">${balance.toFixed(2)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Current Balance</span>
            <span className="font-bold tabular-nums">${balance.toFixed(2)}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings/billing")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Credits
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings/credits")}>
          <History className="h-4 w-4 mr-2" />
          View History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
