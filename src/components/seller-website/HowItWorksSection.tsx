interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  processSteps: ProcessStep[];
  primaryColor: string;
  accentColor: string;
}

export function HowItWorksSection({ processSteps, primaryColor, accentColor }: HowItWorksSectionProps) {
  if (!processSteps || processSteps.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={{ color: primaryColor }}
        >
          How It Works
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Selling your house to us is simple. Here's how it works:
        </p>

        {/* Desktop Timeline */}
        <div className="hidden md:flex items-start justify-center gap-8 lg:gap-16">
          {processSteps.map((step, index) => (
            <div key={step.step} className="flex flex-col items-center relative">
              {/* Connector Line */}
              {index < processSteps.length - 1 && (
                <div 
                  className="absolute top-8 left-1/2 w-full lg:w-[calc(100%+4rem)]"
                  style={{ height: '2px', backgroundColor: `${primaryColor}30` }}
                />
              )}
              
              {/* Step Circle */}
              <div
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {step.step}
              </div>
              
              {/* Content */}
              <div className="text-center max-w-[200px]">
                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden space-y-0">
          {processSteps.map((step, index) => (
            <div key={step.step} className="flex items-start gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {step.step}
                </div>
                {index < processSteps.length - 1 && (
                  <div 
                    className="w-0.5 h-20 mt-2"
                    style={{ backgroundColor: `${primaryColor}30` }}
                  />
                )}
              </div>
              
              {/* Content */}
              <div className="pb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
