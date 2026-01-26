import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ChevronDown,
  Phone,
  Calendar,
  Pencil,
  MoreHorizontal,
  Archive,
  Trash2,
  Share,
  Flame,
} from "lucide-react";

interface PropertyHeroProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  arv?: number;
  score: number;
  onStatusChange?: (status: string) => void;
  onMakeOffer?: () => void;
  onLogContact?: () => void;
  onSchedule?: () => void;
  onEdit?: () => void;
}

const statuses = [
  "New",
  "Hot Lead",
  "Warm",
  "In Review",
  "Negotiating",
  "Under Contract",
  "On Hold",
  "Closed",
  "Dead",
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Hot Lead":
      return "success";
    case "Warm":
      return "warning";
    case "In Review":
    case "Negotiating":
      return "info";
    case "On Hold":
    case "Dead":
      return "error";
    case "Closed":
    case "Under Contract":
      return "default";
    default:
      return "secondary";
  }
}

function getScoreColor(score: number): string {
  if (score >= 800) return "text-score-hot";
  if (score >= 600) return "text-score-warm";
  if (score >= 400) return "text-score-moderate";
  if (score >= 200) return "text-score-cool";
  return "text-score-cold";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PropertyHero({
  address,
  city,
  state,
  zipCode,
  status,
  beds,
  baths,
  sqft,
  yearBuilt,
  arv,
  score,
  onStatusChange,
  onMakeOffer,
  onLogContact,
  onSchedule,
  onEdit,
}: PropertyHeroProps) {
  const navigate = useNavigate();
  const isHot = score >= 800;

  const stats = [
    { label: "Beds", value: beds },
    { label: "Baths", value: baths },
    { label: "Sq Ft", value: sqft.toLocaleString() },
    { label: "Year Built", value: yearBuilt || "—" },
    { label: "ARV", value: arv ? formatCurrency(arv) : "—" },
  ];

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary/80 to-surface-tertiary/50" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-lg py-md">
        {/* Top Row: Back + Status */}
        <div className="flex items-center justify-between mb-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/properties")}
            icon={<ArrowLeft />}
          >
            Properties
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 focus:outline-none">
                <Badge variant={getStatusVariant(status) as any} size="md">
                  {status}
                </Badge>
                <ChevronDown className="h-3.5 w-3.5 text-content-secondary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              {statuses.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatusChange?.(s)}
                  className={cn(s === status && "bg-surface-secondary font-medium")}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hero Address */}
        <h1 className="text-display font-semibold text-content mb-1">{address}</h1>
        <p className="text-body text-content-secondary mb-lg">
          {city}, {state} {zipCode}
        </p>

        {/* Stats Bar */}
        <div className="flex items-center gap-0 mb-lg bg-white/60 backdrop-blur-sm rounded-medium border border-border-subtle p-1">
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-tiny uppercase tracking-wide text-content-tertiary mb-0.5">
                  {stat.label}
                </div>
                <div className="text-h3 font-semibold text-content tabular-nums">
                  {stat.value}
                </div>
              </div>
              {index < stats.length - 1 && (
                <div className="w-px h-8 bg-border-subtle" />
              )}
            </React.Fragment>
          ))}
          {/* Motivation Score */}
          <div className="w-px h-8 bg-border-subtle" />
          <div className="flex-1 px-4 py-2 text-center">
            <div className="text-tiny uppercase tracking-wide text-content-tertiary mb-0.5">
              Score
            </div>
            <div className={cn("text-h3 font-semibold tabular-nums flex items-center justify-center gap-1", getScoreColor(score))}>
              {isHot && <Flame className="h-4 w-4" />}
              {score}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" icon={<Phone />} onClick={onLogContact}>
            Log Contact
          </Button>
          <Button variant="secondary" size="sm" icon={<Calendar />} onClick={onSchedule}>
            Schedule
          </Button>
          <Button variant="secondary" size="sm" icon={<Pencil />} onClick={onEdit}>
            Edit
          </Button>
          <Button variant="primary" size="sm" onClick={onMakeOffer}>
            Make Offer
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
