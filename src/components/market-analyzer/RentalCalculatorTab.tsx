import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { RentalCalculator } from "@/components/calculators";
import { useNavigate } from "react-router-dom";

export function RentalCalculatorTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3 font-semibold">Rental Property Calculator</h3>
          <p className="text-small text-muted-foreground">
            Analyze cash flow, cap rate, and ROI for rental properties
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/calculators?tab=rental")}>
          Open Full Calculator
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <RentalCalculator />
    </div>
  );
}
