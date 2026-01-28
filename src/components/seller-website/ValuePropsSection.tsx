import { 
  Clock, 
  DollarSign, 
  Wrench, 
  XCircle, 
  Home, 
  CheckCircle, 
  Shield,
  Zap,
  Heart,
  Star,
  Users,
  FileText,
  type LucideIcon
} from "lucide-react";

interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

interface ValuePropsSectionProps {
  valueProps: ValueProp[];
  primaryColor: string;
}

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  dollar: DollarSign,
  tool: Wrench,
  wrench: Wrench,
  x: XCircle,
  home: Home,
  check: CheckCircle,
  shield: Shield,
  zap: Zap,
  heart: Heart,
  star: Star,
  users: Users,
  file: FileText,
};

export function ValuePropsSection({ valueProps, primaryColor }: ValuePropsSectionProps) {
  if (!valueProps || valueProps.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: primaryColor }}>
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {valueProps.map((prop, index) => {
            const IconComponent = iconMap[prop.icon] || CheckCircle;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 md:p-8 text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <IconComponent 
                    className="h-8 w-8" 
                    style={{ color: primaryColor }} 
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {prop.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
