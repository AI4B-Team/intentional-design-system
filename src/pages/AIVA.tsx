import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Sparkles, Bot, Brain, MessageSquare, Zap, TrendingUp } from "lucide-react";
import { AIVAChat } from "@/components/aiva/AIVAChat";

export default function AIVA() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(var(--app-viewport-height)-8rem)]">
        {/* Chat Panel - Main Focus */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AIVA</h1>
              <p className="text-muted-foreground text-sm">AI Virtual Assistant</p>
            </div>
          </div>
          
          {/* Chat Component */}
          <AIVAChat className="flex-1 min-h-0" />
        </div>

        {/* Capabilities Sidebar */}
        <div className="lg:w-80 flex-shrink-0 space-y-4">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">What AIVA Can Do</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Search your property database
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Research market conditions online
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Analyze deals and calculate ARV
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Score and prioritize leads
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Draft outreach messages
              </li>
            </ul>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center mb-2">
                <Brain className="h-4 w-4 text-info" />
              </div>
              <h4 className="font-medium text-xs mb-1">Lead Scoring</h4>
              <p className="text-[10px] text-muted-foreground">Auto-qualify leads</p>
            </Card>

            <Card className="p-3">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                <MessageSquare className="h-4 w-4 text-success" />
              </div>
              <h4 className="font-medium text-xs mb-1">Outreach</h4>
              <p className="text-[10px] text-muted-foreground">Draft messages</p>
            </Card>

            <Card className="p-3">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center mb-2">
                <Zap className="h-4 w-4 text-warning" />
              </div>
              <h4 className="font-medium text-xs mb-1">Deal Analysis</h4>
              <p className="text-[10px] text-muted-foreground">Calculate profits</p>
            </Card>

            <Card className="p-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <h4 className="font-medium text-xs mb-1">Market Intel</h4>
              <p className="text-[10px] text-muted-foreground">Research trends</p>
            </Card>
          </div>

          <Card className="p-4 border-dashed">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs">AIVA is online and ready to help</span>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
