import { FileText, DollarSign, KeyRound, type LucideIcon } from "lucide-react";

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

interface HowItWorksSectionProps {
  processSteps: ProcessStep[];
  primaryColor: string;
  accentColor: string;
}

const STEP_ICONS: Record<string, LucideIcon> = {
  form: FileText,
  dollar: DollarSign,
  key: KeyRound,
};

const DEFAULT_ICONS: LucideIcon[] = [FileText, DollarSign, KeyRound];

export function HowItWorksSection({ processSteps, primaryColor, accentColor }: HowItWorksSectionProps) {
  if (!processSteps || processSteps.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          How It Works
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Three simple steps — no surprises, no hidden costs
        </p>

        {/* Desktop Timeline */}
        <div className="hidden md:flex items-start justify-center gap-12 lg:gap-20 max-w-4xl mx-auto">
          {processSteps.map((step, index) => {
            const Icon = step.icon ? (STEP_ICONS[step.icon] || DEFAULT_ICONS[index] || FileText) : (DEFAULT_ICONS[index] || FileText);
            return (
              <div key={step.step} className="flex flex-col items-center relative flex-1">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div
                    className="absolute top-10 left-[60%] w-[calc(100%)]"
                    style={{ height: '2px', backgroundColor: '#e5e7eb' }}
                  />
                )}

                {/* Icon with Number Badge */}
                <div className="relative z-10 mb-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
                    style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}
                  >
                    <Icon className="h-8 w-8" style={{ color: accentColor }} />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    {String(step.step).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center max-w-[220px]">
                  <h3 className="font-bold text-base mb-2 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical */}
        <div className="md:hidden space-y-0">
          {processSteps.map((step, index) => {
            const Icon = DEFAULT_ICONS[index] || FileText;
            return (
              <div key={step.step} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center border-2"
                      style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: accentColor }} />
                    </div>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: accentColor }}
                    >
                      {String(step.step).padStart(2, '0')}
                    </div>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 h-12 mt-2 bg-gray-200" />
                  )}
                </div>
                <div className="pb-8 pt-1">
                  <h3 className="font-bold text-base text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
