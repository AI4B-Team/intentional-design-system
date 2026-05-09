import * as React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Map as MapIcon, Compass, Layers, ArrowRight } from "lucide-react";

const entries = [
  {
    to: "/d4d",
    title: "Driving for Dollars",
    desc: "Track your route, drop pins on properties as you drive a neighborhood.",
    icon: Compass,
  },
  {
    to: "/marketplace",
    title: "Marketplace Map",
    desc: "Explore active deals on the map, filter by price, beds, and equity.",
    icon: MapIcon,
  },
  {
    to: "/d4d/heat-map",
    title: "Coverage Heat Map",
    desc: "See where you've driven, find gaps, and plan the next route.",
    icon: Layers,
  },
];

export default function SearchMap() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick a map to open — your existing map views stay exactly the same.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {entries.map((e) => {
          const Icon = e.icon;
          return (
            <Link
              key={e.to}
              to={e.to}
              className="group block"
            >
              <Card className="p-5 h-full hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-lg bg-primary/10 text-primary p-2.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-semibold text-base mb-1">{e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
