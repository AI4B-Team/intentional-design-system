import * as React from "react";
import type { RentalInputs, RentalResults, ProjectionYear, ScenarioData, RentalMode } from "./types";

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

export function useRentalCalculations(inputs: RentalInputs, mode: RentalMode) {
  const results: RentalResults = React.useMemo(() => {
    // Acquisition
    const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
    const loanAmount = inputs.purchasePrice - downPayment;
    const totalAcquisitionCost = inputs.purchasePrice + inputs.closingCosts + inputs.rehabCosts;
    const totalCashInvested = downPayment + inputs.closingCosts + inputs.rehabCosts;

    // Financing
    const monthlyPI = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
    const monthlyPMI = inputs.pmi;
    const totalMonthlyDebtService = monthlyPI + monthlyPMI;

    // BRRRR Refinance
    const newLoanAmount = inputs.arv * (inputs.refiLTV / 100);
    const newMonthlyPI = calculateMonthlyPayment(newLoanAmount, inputs.refiRate, inputs.loanTermYears);
    const cashOut = newLoanAmount - loanAmount;
    const cashLeftInDeal = totalCashInvested - cashOut;

    // Use BRRRR figures if in BRRRR mode
    const effectiveMonthlyDebt = mode === "brrrr" ? newMonthlyPI : totalMonthlyDebtService;
    const effectiveCashInvested = mode === "brrrr" ? Math.max(0, cashLeftInDeal) : totalCashInvested;

    // Income
    const grossMonthlyIncome = inputs.monthlyRent + inputs.otherIncome;
    const vacancyLoss = grossMonthlyIncome * (inputs.vacancyRate / 100);
    const creditLoss = grossMonthlyIncome * (inputs.creditLossRate / 100);
    const effectiveGrossIncome = grossMonthlyIncome - vacancyLoss - creditLoss;

    // Expenses
    const propertyManagement = inputs.monthlyRent * (inputs.propertyManagementPercent / 100);
    const maintenance = inputs.monthlyRent * (inputs.maintenancePercent / 100);
    const capex = inputs.monthlyRent * (inputs.capexPercent / 100);

    const totalMonthlyExpenses =
      inputs.propertyTaxesMonthly +
      inputs.insuranceMonthly +
      inputs.hoaMonthly +
      propertyManagement +
      maintenance +
      capex +
      inputs.utilitiesMonthly +
      inputs.otherExpenses;

    // Cash Flow
    const monthlyNOI = effectiveGrossIncome - totalMonthlyExpenses;
    const annualNOI = monthlyNOI * 12;
    const monthlyCashFlow = monthlyNOI - effectiveMonthlyDebt;
    const annualCashFlow = monthlyCashFlow * 12;

    // Metrics
    const capRate = (annualNOI / inputs.purchasePrice) * 100;
    const cashOnCash = effectiveCashInvested > 0 ? (annualCashFlow / effectiveCashInvested) * 100 : 0;
    const annualDebtService = effectiveMonthlyDebt * 12;
    const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : 0;
    const annualGrossRent = inputs.monthlyRent * 12;
    const grm = annualGrossRent > 0 ? inputs.purchasePrice / annualGrossRent : 0;

    // Rules
    const onePercentRule = inputs.monthlyRent >= inputs.purchasePrice * 0.01;
    const twoPercentRule = inputs.monthlyRent >= inputs.purchasePrice * 0.02;
    const fiftyPercentRule = totalMonthlyExpenses <= grossMonthlyIncome * 0.5;

    // Deal score
    let dealScore = 50;
    if (cashOnCash >= 10) dealScore += 20;
    else if (cashOnCash >= 8) dealScore += 15;
    else if (cashOnCash >= 5) dealScore += 10;
    if (capRate >= 8) dealScore += 15;
    else if (capRate >= 6) dealScore += 10;
    if (dscr >= 1.25) dealScore += 10;
    if (onePercentRule) dealScore += 5;
    dealScore = Math.min(100, dealScore);

    return {
      downPayment,
      loanAmount,
      totalAcquisitionCost,
      totalCashInvested,
      monthlyPI,
      monthlyPMI,
      totalMonthlyDebtService,
      newLoanAmount,
      newMonthlyPI,
      cashOut,
      cashLeftInDeal,
      grossMonthlyIncome,
      vacancyLoss,
      creditLoss,
      effectiveGrossIncome,
      propertyManagement,
      maintenance,
      capex,
      totalMonthlyExpenses,
      monthlyNOI,
      annualNOI,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      cashOnCash,
      dscr,
      grm,
      onePercentRule,
      twoPercentRule,
      fiftyPercentRule,
      dealScore,
    };
  }, [inputs, mode]);

  return results;
}

export function calculateProjections(
  inputs: RentalInputs,
  results: RentalResults,
  mode: RentalMode,
  years: number = 5,
  appreciationRate: number = 3,
  rentGrowthRate: number = 2
): { projections: ProjectionYear[]; breakEvenYear: number | null } {
  const projections: ProjectionYear[] = [];
  let breakEvenYear: number | null = null;

  const effectiveCashInvested = mode === "brrrr" 
    ? Math.max(0, results.cashLeftInDeal) 
    : results.totalCashInvested;

  for (let year = 1; year <= years; year++) {
    const propertyValue = inputs.purchasePrice * Math.pow(1 + appreciationRate / 100, year);
    const monthlyRent = inputs.monthlyRent * Math.pow(1 + rentGrowthRate / 100, year - 1);
    
    // Recalculate cash flow with higher rent
    const grossIncome = monthlyRent + inputs.otherIncome;
    const vacancyLoss = grossIncome * (inputs.vacancyRate / 100);
    const creditLoss = grossIncome * (inputs.creditLossRate / 100);
    const effectiveIncome = grossIncome - vacancyLoss - creditLoss;
    
    const propertyManagement = monthlyRent * (inputs.propertyManagementPercent / 100);
    const maintenance = monthlyRent * (inputs.maintenancePercent / 100);
    const capex = monthlyRent * (inputs.capexPercent / 100);
    
    const monthlyExpenses = 
      inputs.propertyTaxesMonthly +
      inputs.insuranceMonthly +
      inputs.hoaMonthly +
      propertyManagement +
      maintenance +
      capex +
      inputs.utilitiesMonthly +
      inputs.otherExpenses;
    
    const monthlyNOI = effectiveIncome - monthlyExpenses;
    const effectiveDebt = mode === "brrrr" ? results.newMonthlyPI : results.totalMonthlyDebtService;
    const monthlyCashFlow = monthlyNOI - effectiveDebt;
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate equity (property value - loan balance)
    // Simplified: assume principal paydown of ~$1k/month avg over time
    const equity = propertyValue - results.loanAmount + (year * 3000);

    // Total return = equity gain + cumulative cash flow
    const totalReturn = (propertyValue - inputs.purchasePrice) + (annualCashFlow * year);

    projections.push({
      year,
      propertyValue: Math.round(propertyValue),
      monthlyRent: Math.round(monthlyRent),
      annualCashFlow: Math.round(annualCashFlow),
      equity: Math.round(equity),
      totalReturn: Math.round(totalReturn),
    });

    if (breakEvenYear === null && annualCashFlow >= 0) {
      breakEvenYear = year;
    }
  }

  return { projections, breakEvenYear };
}

export function calculateScenarios(inputs: RentalInputs, mode: RentalMode): ScenarioData[] {
  const scenarios: ScenarioData[] = [];
  const downPayments = [20, 25, 100]; // 20%, 25%, Cash

  for (const dpPct of downPayments) {
    const downPayment = inputs.purchasePrice * (dpPct / 100);
    const loanAmount = inputs.purchasePrice - downPayment;
    const totalCash = downPayment + inputs.closingCosts + inputs.rehabCosts;

    const monthlyPI = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
    
    const grossIncome = inputs.monthlyRent + inputs.otherIncome;
    const vacancyLoss = grossIncome * (inputs.vacancyRate / 100);
    const creditLoss = grossIncome * (inputs.creditLossRate / 100);
    const effectiveIncome = grossIncome - vacancyLoss - creditLoss;

    const propertyManagement = inputs.monthlyRent * (inputs.propertyManagementPercent / 100);
    const maintenance = inputs.monthlyRent * (inputs.maintenancePercent / 100);
    const capex = inputs.monthlyRent * (inputs.capexPercent / 100);

    const monthlyExpenses = 
      inputs.propertyTaxesMonthly +
      inputs.insuranceMonthly +
      inputs.hoaMonthly +
      propertyManagement +
      maintenance +
      capex +
      inputs.utilitiesMonthly +
      inputs.otherExpenses;

    const monthlyNOI = effectiveIncome - monthlyExpenses;
    const monthlyCashFlow = monthlyNOI - monthlyPI;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = totalCash > 0 ? (annualCashFlow / totalCash) * 100 : 0;

    scenarios.push({
      label: dpPct === 100 ? "Cash" : `${dpPct}% Down`,
      downPaymentPercent: dpPct,
      cashInvested: Math.round(totalCash),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      cashOnCash: Math.round(cashOnCash * 10) / 10,
    });
  }

  return scenarios;
}
