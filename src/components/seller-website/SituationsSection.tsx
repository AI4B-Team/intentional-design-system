import {
  Clock, Home, Users, Briefcase, DollarSign, Building, FileWarning,
  Zap, Bug, ArrowDownCircle, Warehouse,
  type LucideIcon,
} from "lucide-react";

interface Situation {
  icon: string;
  label: string;
}

interface SituationsSectionProps {
  situations?: Situation[];
  primaryColor: string;
  headline?: string;
  subheadline?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  clock: Clock,
  home: Home,
  users: Users,
  briefcase: Briefcase,
  dollar: DollarSign,
  building: Building,
  warning: FileWarning,
  zap: Zap,
  bug: Bug,
  arrow_down: ArrowDownCircle,
  warehouse: Warehouse,
};

const DEFAULT_SITUATIONS: Situation[] = [
  { icon: "clock", label: "Foreclosure" },
  { icon: "home", label: "Inherited Property" },
  { icon: "users", label: "Divorce" },
  { icon: "briefcase", label: "Relocating" },
  { icon: "dollar", label: "Behind on Payments" },
  { icon: "building", label: "Vacant Property" },
  { icon: "warning", label: "Tax Liens" },
  { icon: "zap", label: "Code Violations" },
  { icon: "bug", label: "Fire / Storm Damage" },
  { icon: "users", label: "Problem Tenants" },
  { icon: "arrow_down", label: "Downsizing" },
  { icon: "warehouse", label: "Hoarder Property" },
];

export function SituationsSection({ situations, primaryColor, headline, subheadline }: SituationsSectionProps) {
  const displaySituations = situations && situations.length > 0 ? situations : DEFAULT_SITUATIONS;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          {headline || "We Buy Houses In Any Situation"}
        </h2>
        <p className="text-gray-500 text-center mb-10">
          {subheadline || "Whatever you're going through, we've helped someone just like you"}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {displaySituations.map((situation, index) => {
            const Icon = ICON_MAP[situation.icon] || Home;
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-center"
              >
                <Icon className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-700 font-medium">{situation.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
