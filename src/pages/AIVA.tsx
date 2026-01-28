import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Zap, Brain, MessageSquare } from "lucide-react";

export default function AIVA() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AIVA</h1>
                <p className="text-muted-foreground">AI Virtual Assistant</p>
              </div>
            </div>
          </div>
          <Button variant="primary" disabled>
            <Zap className="h-4 w-4 mr-2" />
            Coming Soon
          </Button>
        </div>

        {/* Hero Card */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <Bot className="h-12 w-12 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Your AI-Powered Deal Flow Assistant
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                AIVA is your intelligent assistant that automates lead qualification, 
                generates personalized outreach, analyzes deals, and manages your pipeline 
                24/7. Let AI handle the heavy lifting while you focus on closing deals.
              </p>
            </div>
          </div>
        </Card>

        {/* Features Grid - fills remaining space */}
        <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center mb-4">
              <Brain className="h-5 w-5 text-info" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Smart Lead Scoring</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Automatically analyze and score leads based on motivation, property condition, 
              and deal potential.
            </p>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Automated Outreach</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Generate personalized emails, texts, and follow-ups that sound human 
              and convert at higher rates.
            </p>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Deal Analysis</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Instantly analyze ARV, repair costs, and profit potential using 
              market data and AI predictions.
            </p>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Pipeline Management</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Keep track of every deal from first contact to closing with AI-powered 
              insights and reminders.
            </p>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Market Intelligence</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Get real-time market data and predictive analytics to find the best 
              opportunities in your area.
            </p>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5 text-chart-4" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Negotiation Coach</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Get AI-powered coaching to help you negotiate better deals and 
              close more transactions.
            </p>
          </Card>
        </div>

        {/* Status Card */}
        <Card className="p-6 border-dashed">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm">AIVA is currently in development. Stay tuned for updates!</span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
