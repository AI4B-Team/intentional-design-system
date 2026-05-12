import * as React from "react";
import { ArrowRight, Play, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import deal1 from "@/assets/landing/deal-1.jpg";
import deal2 from "@/assets/landing/deal-2.jpg";
import deal3 from "@/assets/landing/deal-3.jpg";

interface HeroSectionProps {
  goSignup: () => void;
  navigate: (path: string) => void;
}

interface DealCard {
  img: string;
  badge: string;
  badgeTone: "emerald" | "cyan" | "amber";
  price: string;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: string;
  profit: string;
  roi: string;
  arvPercent: number;
  rotate: string;
  translate: string;
  z: string;
  highlight?: boolean;
}

const deals: DealCard[] = [
  {
    img: deal1,
    badge: "Just Found",
    badgeTone: "emerald",
    price: "$37,900",
    address: "9120 Conner St,",
    city: "Cleveland, OH 44105",
    beds: 2,
    baths: 1,
    sqft: "896 sq ft",
    profit: "+$29,600",
    roi: "78.1%",
    arvPercent: 62,
    rotate: "-rotate-[6deg]",
    translate: "translate-y-6",
    z: "z-10",
  },
  {
    img: deal2,
    badge: "Top Deal",
    badgeTone: "cyan",
    price: "$68,000",
    address: "1234 Mitchell St,",
    city: "Detroit, MI 48206",
    beds: 3,
    baths: 1,
    sqft: "1,024 sq ft",
    profit: "+$46,000",
    roi: "67.6%",
    arvPercent: 70,
    rotate: "rotate-0",
    translate: "-translate-y-2",
    z: "z-20",
    highlight: true,
  },
  {
    img: deal3,
    badge: "Thin Margin",
    badgeTone: "amber",
    price: "$92,500",
    address: "2647 W North Ave,",
    city: "Baltimore, MD 21216",
    beds: 3,
    baths: 1,
    sqft: "1,112 sq ft",
    profit: "+$4,200",
    roi: "4.5%",
    arvPercent: 88,
    rotate: "rotate-[5deg]",
    translate: "translate-y-8",
    z: "z-10",
  },
];

const toneClasses: Record<DealCard["badgeTone"], string> = {
  emerald: "bg-emerald-500 text-white",
  cyan: "bg-cyan-500 text-white",
  amber: "bg-amber-500 text-white",
};

function DealMockCard({ deal }: { deal: DealCard }) {
  return (
    <div
      className={cn(
        "absolute w-[220px] sm:w-[240px] rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden transition-transform duration-500 hover:-translate-y-1",
        deal.rotate,
        deal.translate,
        deal.z,
        deal.highlight && "ring-2 ring-primary/30"
      )}
    >
      {deal.highlight && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
          ★ Top Deal
        </div>
      )}
      <div className="relative h-36 overflow-hidden">
        <img
          src={deal.img}
          alt={deal.address}
          className="w-full h-full object-cover"
          loading="lazy"
          width={768}
          height={576}
        />
        <span
          className={cn(
            "absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
            toneClasses[deal.badgeTone]
          )}
        >
          For Sale
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-2xl font-bold text-slate-900 tabular-nums">{deal.price}</div>
        <div className="text-sm text-slate-600 leading-tight">
          <div>{deal.address}</div>
          <div>{deal.city}</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>{deal.beds} bed</span>
          <span className="text-slate-300">|</span>
          <span>{deal.baths} bath</span>
          <span className="text-slate-300">|</span>
          <span>{deal.sqft}</span>
        </div>
        {/* ARV progress bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
            <span className="uppercase tracking-wider text-slate-500">ARV</span>
            <span className="tabular-nums text-slate-700">{deal.arvPercent}% of ARV</span>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                deal.arvPercent <= 65
                  ? "bg-emerald-500"
                  : deal.arvPercent <= 75
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{ width: `${deal.arvPercent}%` }}
            />
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Est. Profit
          </div>
          <div className="text-xl font-bold text-emerald-600 tabular-nums">{deal.profit}</div>
          <div className="text-[10px] text-emerald-600/80 tabular-nums">ROI {deal.roi}</div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ goSignup, navigate }: HeroSectionProps) {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.18em] mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span className="relative">
                Automated Real Estate Investing
                <svg
                  aria-hidden
                  viewBox="0 0 240 10"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 w-full h-2 text-primary/70"
                >
                  <path
                    d="M2 6 Q 60 1, 120 5 T 238 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>

            <h1
              className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900 mb-6 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <span className="whitespace-nowrap">Close More Deals.</span>
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-1 h-[55%] bg-emerald-200/70 -skew-y-1 rounded-sm -z-0" aria-hidden />
                <span className="relative">Work Less.</span>
              </span>
            </h1>

            <p
              className="text-lg text-slate-600 leading-relaxed mb-8 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              AI agents that find leads, call sellers, analyze deals, send offers, close contracts, and sell deals — while you focus on cashing checks.
              Replace 8+ tools with one platform built for serious investors.
            </p>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                size="lg"
                onClick={goSignup}
                className="bg-primary text-primary-foreground hover:bg-accent-hover text-base px-7 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.97]"
              >
                Start Your 30-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-7 py-6 rounded-xl border-slate-300 text-slate-900 hover:bg-slate-50"
                onClick={() => navigate("/login")}
              >
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>

            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-slate-500 animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                30-day free trial
              </div>
            </div>
          </div>

          {/* Right: Deal Card Stack */}
          <div className="relative h-[520px] lg:h-[560px] hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-[460px] mx-auto">
                <div className="absolute left-[10px] top-[22%]">
                  <DealMockCard deal={deals[0]} />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[6%]">
                  <DealMockCard deal={deals[1]} />
                </div>
                <div className="absolute right-[10px] top-[24%]">
                  <DealMockCard deal={deals[2]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
