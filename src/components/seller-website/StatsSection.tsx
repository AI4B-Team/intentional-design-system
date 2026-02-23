import { Star } from "lucide-react";

interface Stat {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats?: Stat[];
  primaryColor: string;
}

const DEFAULT_STATS: Stat[] = [
  { value: "2,400+", label: "Homes Purchased" },
  { value: "$480M+", label: "Paid to Homeowners" },
  { value: "4.9★", label: "Google Rating" },
  { value: "6", label: "Avg. Days to Close" },
];

export function StatsSection({ stats, primaryColor }: StatsSectionProps) {
  const displayStats = stats && stats.length > 0 ? stats : DEFAULT_STATS;

  return (
    <section className="py-12 border-t border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {displayStats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-1">
                {stat.value.includes("★") ? (
                  <>
                    {stat.value.replace("★", "")}
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 inline" />
                  </>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
