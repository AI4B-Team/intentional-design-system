export type RentalMode = "standard" | "brrrr";

export interface RentalInputs {
  // Property
  address: string;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  units: number;

  // Acquisition
  purchasePrice: number;
  closingCosts: number;
  rehabCosts: number;

  // Financing
  financingType: string;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  pmi: number;

  // BRRRR Refinance
  arv: number;
  refiLTV: number;
  refiRate: number;

  // Income
  monthlyRent: number;
  otherIncome: number;
  vacancyRate: number;
  creditLossRate: number;

  // Expenses
  propertyTaxesMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  propertyManagementPercent: number;
  maintenancePercent: number;
  capexPercent: number;
  utilitiesMonthly: number;
  otherExpenses: number;
}

export interface RentalResults {
  // Acquisition
  downPayment: number;
  loanAmount: number;
  totalAcquisitionCost: number;
  totalCashInvested: number;

  // Financing
  monthlyPI: number;
  monthlyPMI: number;
  totalMonthlyDebtService: number;

  // BRRRR
  newLoanAmount: number;
  newMonthlyPI: number;
  cashOut: number;
  cashLeftInDeal: number;

  // Income
  grossMonthlyIncome: number;
  vacancyLoss: number;
  creditLoss: number;
  effectiveGrossIncome: number;

  // Expenses
  propertyManagement: number;
  maintenance: number;
  capex: number;
  totalMonthlyExpenses: number;

  // Cash Flow
  monthlyNOI: number;
  annualNOI: number;
  monthlyCashFlow: number;
  annualCashFlow: number;

  // Metrics
  capRate: number;
  cashOnCash: number;
  dscr: number;
  grm: number;
  onePercentRule: boolean;
  twoPercentRule: boolean;
  fiftyPercentRule: boolean;
  dealScore: number;
}

export interface ProjectionYear {
  year: number;
  propertyValue: number;
  monthlyRent: number;
  annualCashFlow: number;
  equity: number;
  totalReturn: number;
}

export interface ScenarioData {
  label: string;
  downPaymentPercent: number;
  cashInvested: number;
  monthlyCashFlow: number;
  cashOnCash: number;
}

export interface MetricTarget {
  value: number;
  target: string;
  targetValue: number;
  passes: boolean;
  format: "percentage" | "number" | "currency";
}

export const DEFAULT_RENTAL_INPUTS: RentalInputs = {
  address: "",
  propertyType: "sfh",
  beds: 3,
  baths: 2,
  sqft: 1850,
  units: 1,

  purchasePrice: 185000,
  closingCosts: 4000,
  rehabCosts: 25000,

  financingType: "conventional",
  downPaymentPercent: 20,
  interestRate: 7,
  loanTermYears: 30,
  pmi: 0,

  arv: 240000,
  refiLTV: 75,
  refiRate: 7.25,

  monthlyRent: 1850,
  otherIncome: 0,
  vacancyRate: 8,
  creditLossRate: 2,

  propertyTaxesMonthly: 350,
  insuranceMonthly: 125,
  hoaMonthly: 0,
  propertyManagementPercent: 10,
  maintenancePercent: 5,
  capexPercent: 5,
  utilitiesMonthly: 0,
  otherExpenses: 0,
};
