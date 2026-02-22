import * as React from "react";
import { Link } from "react-router-dom";
import { Building2, TrendingUp, Shield, Zap, Users } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: TrendingUp,
    title: "Deal Analysis",
    description: "Analyze deals in seconds with AI-powered insights",
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description: "State-specific compliance checks built-in",
  },
  {
    icon: Users,
    title: "Buyer Network",
    description: "Access to verified cash buyers nationwide",
  },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">RealElite</span>
        </div>

        {/* Main Content */}
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Powered By AI
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Real Estate
            <br />
            <span className="text-brand">Investment Suite</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10">
            The all-in-one platform for real estate investors. Find deals, analyze properties, 
            manage buyers, and close faster with AI-powered tools.
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700"
              >
                <feature.icon className="h-4 w-4 text-brand" />
                {feature.title}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex gap-8 text-slate-600">
          <div>
            <div className="text-2xl font-bold text-slate-900">10K+</div>
            <div className="text-sm">Active Investors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">$2B+</div>
            <div className="text-sm">Deal Volume</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">50+</div>
            <div className="text-sm">Markets</div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col bg-white">
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
