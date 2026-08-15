export function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

export function getDueSaleRisk(loanType: string): { level: string; color: string; description: string } {
  switch (loanType.toLowerCase()) {
    case "fha":
    case "va":
      return {
        level: "Higher",
        color: "text-warning",
        description: "FHA/VA loans have stricter due-on-sale enforcement. Consider LLC protection strategies."
      };
    case "conventional":
      return {
        level: "Moderate",
        color: "text-info",
        description: "Conventional loans have due-on-sale clauses but enforcement varies by lender and situation."
      };
    default:
      return {
        level: "Unknown",
        color: "text-content-secondary",
        description: "Verify loan documents for due-on-sale clause terms."
      };
  }
}
