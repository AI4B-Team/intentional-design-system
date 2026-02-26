import * as React from "react";
import { Link } from "react-router-dom";
import { Building2, TrendingUp, Shield, Zap, Users } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  { icon: TrendingUp, title: "Deal Analysis", description: "ARV, repairs, and profit in seconds" },
  { icon: Shield, title: "Compliance Ready", description: "State-specific checks built in" },
  { icon: Users, title: "Buyer Network", description: "Verified cash buyers nationwide" },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, hsl(222 47% 8%) 0%, hsl(220 43% 6%) 50%, hsl(225 50% 7%) 100%)" }}
      >
        {/* Ambient glow top-left */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(158 78% 36%) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}
        />
        {/* Ambient glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)", transform: "translate(30%, 30%)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            RealElite
          </span>
        </div>

        {/* Main Content */}
        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered Deal Intelligence
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Close More Deals.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Move Faster.
            </span>
          </h1>

          <p className="text-lg text-white/50 mb-10 leading-relaxed">
            The all-in-one platform for serious real estate investors.
            Find deals, analyze comps, manage buyers, and close with AI at your side.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-white/90 text-sm font-medium">{feature.title}</span>
                  <span className="text-white/40 text-sm"> — {feature.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative flex gap-8">
          <div>
            <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>10K+</div>
            <div className="text-sm text-white/40 mt-0.5">Active Investors</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>$2B+</div>
            <div className="text-sm text-white/40 mt-0.5">Deal Volume</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>50+</div>
            <div className="text-sm text-white/40 mt-0.5">Markets</div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">RealElite</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-brand hover:underline">
              Terms of Service
            </Link>
            {" "}&{" "}
            <Link to="/privacy" className="text-brand hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
