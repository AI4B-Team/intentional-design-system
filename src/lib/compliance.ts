// Compliance Engine for Creative Deal Guardrails

export interface StateRegulation {
  id: string;
  state_code: string;
  state_name: string;
  max_interest_rate: number | null;
  usury_exemptions: string | null;
  seller_financing_restrictions: string | null;
  lease_option_restrictions: string | null;
  land_contract_restrictions: string | null;
  required_disclosures: string[];
  licensing_requirements: string | null;
  foreclosure_type: string | null;
  redemption_period_days: number | null;
  notes: string | null;
  last_updated: string;
}

export interface ComplianceWarning {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface ComplianceError {
  code: string;
  message: string;
  regulation_reference: string;
  how_to_fix?: string;
}

export interface ComplianceResult {
  passed: boolean;
  warnings: ComplianceWarning[];
  errors: ComplianceError[];
  required_disclosures: string[];
  recommendations: string[];
  state_info: {
    usury_limit: number | null;
    foreclosure_type: string | null;
    redemption_period: number | null;
  };
}

export interface SellerFinanceTerms {
  interest_rate: number;
  loan_amount: number;
  balloon_payment?: boolean;
  balloon_months?: number;
  down_payment_percent?: number;
}

export interface LeaseOptionTerms {
  option_term_months: number;
  option_fee: number;
  monthly_rent: number;
  rent_credit_percent?: number;
  purchase_price: number;
}

export interface LandContractTerms {
  purchase_price: number;
  down_payment: number;
  interest_rate: number;
  term_months: number;
}

export interface SubjectToTerms {
  existing_loan_amount: number;
  existing_rate: number;
  existing_payment: number;
  due_on_sale_acknowledged: boolean;
}

export type DealTerms = SellerFinanceTerms | LeaseOptionTerms | LandContractTerms | SubjectToTerms;

export type DealType = "seller_finance" | "lease_option" | "land_contract" | "subject_to";

// ============ COMPLIANCE CHECK FUNCTIONS ============

export function checkCompliance(
  regulation: StateRegulation,
  dealType: DealType,
  terms: DealTerms
): ComplianceResult {
  const result: ComplianceResult = {
    passed: true,
    warnings: [],
    errors: [],
    required_disclosures: [...regulation.required_disclosures],
    recommendations: [],
    state_info: {
      usury_limit: regulation.max_interest_rate,
      foreclosure_type: regulation.foreclosure_type,
      redemption_period: regulation.redemption_period_days,
    },
  };

  switch (dealType) {
    case "seller_finance":
      checkSellerFinanceCompliance(regulation, terms as SellerFinanceTerms, result);
      break;
    case "lease_option":
      checkLeaseOptionCompliance(regulation, terms as LeaseOptionTerms, result);
      break;
    case "land_contract":
      checkLandContractCompliance(regulation, terms as LandContractTerms, result);
      break;
    case "subject_to":
      checkSubjectToCompliance(regulation, terms as SubjectToTerms, result);
      break;
  }

  // Add state-specific notes as recommendation
  if (regulation.notes) {
    result.recommendations.push(regulation.notes);
  }

  // Determine if passed based on errors
  result.passed = result.errors.length === 0;

  return result;
}

function checkSellerFinanceCompliance(
  regulation: StateRegulation,
  terms: SellerFinanceTerms,
  result: ComplianceResult
): void {
  // Check usury limit
  if (regulation.max_interest_rate !== null && terms.interest_rate > regulation.max_interest_rate) {
    // Check if exemptions might apply
    const hasExemption = regulation.usury_exemptions?.toLowerCase().includes("exempt") || 
                         regulation.usury_exemptions?.toLowerCase().includes("$250,000") && terms.loan_amount > 250000;
    
    if (hasExemption && terms.loan_amount > 250000) {
      result.warnings.push({
        code: "USURY_EXEMPTION_MAY_APPLY",
        message: `Your ${terms.interest_rate}% rate exceeds the ${regulation.max_interest_rate}% usury limit, but exemptions may apply for loans over $250,000.`,
        severity: "medium",
      });
    } else {
      result.errors.push({
        code: "USURY_VIOLATION",
        message: `Your proposed ${terms.interest_rate}% rate exceeds ${regulation.state_name}'s usury limit of ${regulation.max_interest_rate}%`,
        regulation_reference: `${regulation.state_name} Usury Law`,
        how_to_fix: `Consider: Reducing rate to ${regulation.max_interest_rate}% or below, structuring as commercial loan (often exempt), or using points instead of rate.`,
      });
    }
  }

  // Check licensing requirements
  if (regulation.licensing_requirements) {
    result.warnings.push({
      code: "LICENSING_CHECK",
      message: regulation.licensing_requirements,
      severity: "high",
    });
  }

  // Balloon payment warnings
  if (terms.balloon_payment && terms.balloon_months && terms.balloon_months < 60) {
    result.warnings.push({
      code: "SHORT_BALLOON",
      message: `Balloon payment due in ${terms.balloon_months} months. Some states restrict short balloon terms on owner-occupied residential. Verify with attorney.`,
      severity: "medium",
    });
  }

  // Add seller financing specific disclosures
  if (regulation.seller_financing_restrictions) {
    result.recommendations.push(regulation.seller_financing_restrictions);
  }

  // Dodd-Frank SAFE Act reminder
  result.warnings.push({
    code: "DODD_FRANK_SAFE",
    message: "If you complete 3+ seller-financed transactions per year, RMLO licensing is required under federal Dodd-Frank SAFE Act.",
    severity: "medium",
  });
}

function checkLeaseOptionCompliance(
  regulation: StateRegulation,
  terms: LeaseOptionTerms,
  result: ComplianceResult
): void {
  // Check long option terms
  if (terms.option_term_months > 36) {
    result.warnings.push({
      code: "LONG_OPTION_TERM",
      message: `Option term of ${terms.option_term_months} months is longer than typical. Some jurisdictions may treat long-term options as disguised sales.`,
      severity: "medium",
    });
  }

  // California specific - 5 year rule
  if (regulation.state_code === "CA" && terms.option_term_months > 60) {
    result.errors.push({
      code: "CA_OPTION_TERM_LIMIT",
      message: "Options exceeding 5 years in California may require subdivision compliance.",
      regulation_reference: "California Subdivision Map Act",
      how_to_fix: "Limit option term to 60 months or consult with California real estate attorney.",
    });
  }

  // Rent credit checks
  if (terms.rent_credit_percent && terms.rent_credit_percent > 50) {
    result.warnings.push({
      code: "HIGH_RENT_CREDIT",
      message: `Rent credit of ${terms.rent_credit_percent}% is higher than typical (10-25%). May be scrutinized as disguised financing.`,
      severity: "low",
    });
  }

  // Option fee as percentage of price
  const optionFeePercent = (terms.option_fee / terms.purchase_price) * 100;
  if (optionFeePercent > 5) {
    result.warnings.push({
      code: "HIGH_OPTION_FEE",
      message: `Option fee of ${optionFeePercent.toFixed(1)}% of purchase price is higher than typical (1-5%). Document that this is non-refundable consideration.`,
      severity: "low",
    });
  }

  // Add lease option specific restrictions
  if (regulation.lease_option_restrictions) {
    result.recommendations.push(regulation.lease_option_restrictions);
  }

  // Required disclosures for lease options
  result.required_disclosures.push("Option agreement terms and conditions");
  result.required_disclosures.push("Non-refundable nature of option fee");
  result.required_disclosures.push("Rent credit terms (if applicable)");
}

function checkLandContractCompliance(
  regulation: StateRegulation,
  terms: LandContractTerms,
  result: ComplianceResult
): void {
  // Check usury
  if (regulation.max_interest_rate !== null && terms.interest_rate > regulation.max_interest_rate) {
    const exemptionLikely = terms.purchase_price > 250000;
    
    if (exemptionLikely) {
      result.warnings.push({
        code: "USURY_CHECK_REQUIRED",
        message: `Rate of ${terms.interest_rate}% exceeds ${regulation.max_interest_rate}% limit, but purchase price over $250K may qualify for exemption.`,
        severity: "medium",
      });
    } else {
      result.errors.push({
        code: "USURY_VIOLATION",
        message: `Land contract rate of ${terms.interest_rate}% exceeds ${regulation.state_name}'s usury limit of ${regulation.max_interest_rate}%`,
        regulation_reference: `${regulation.state_name} Usury Law`,
        how_to_fix: `Reduce interest rate to ${regulation.max_interest_rate}% or structure as commercial transaction.`,
      });
    }
  }

  // Texas specific - executory contract rules
  if (regulation.state_code === "TX") {
    result.warnings.push({
      code: "TX_EXECUTORY_CONTRACT",
      message: "Texas heavily regulates executory contracts. Must provide annual accounting. Buyer can convert to deed after paying 40% or 48 months.",
      severity: "high",
    });
    result.required_disclosures.push("Annual accounting statement required");
    result.required_disclosures.push("Buyer conversion rights disclosure");
  }

  // Michigan specific
  if (regulation.state_code === "MI") {
    result.warnings.push({
      code: "MI_RECORDING",
      message: "Michigan land contracts must be recorded within 20 days. Forfeiture limited if 50% paid or 5 years of payments.",
      severity: "high",
    });
  }

  // Ohio specific
  if (regulation.state_code === "OH") {
    result.warnings.push({
      code: "OH_BUYER_PROTECTIONS",
      message: "Ohio land contracts: Forfeiture restricted if buyer has substantial equity. Foreclosure often required instead.",
      severity: "medium",
    });
  }

  // Low down payment warning
  const downPaymentPercent = (terms.down_payment / terms.purchase_price) * 100;
  if (downPaymentPercent < 5) {
    result.warnings.push({
      code: "LOW_DOWN_PAYMENT",
      message: `Down payment of ${downPaymentPercent.toFixed(1)}% is very low. Consider requiring at least 5-10% for buyer commitment.`,
      severity: "low",
    });
  }

  // Add land contract specific restrictions
  if (regulation.land_contract_restrictions) {
    result.recommendations.push(regulation.land_contract_restrictions);
  }

  // Recording requirement
  result.required_disclosures.push("Land contract recording requirements");
  result.required_disclosures.push("Buyer forfeiture rights and protections");
}

function checkSubjectToCompliance(
  regulation: StateRegulation,
  terms: SubjectToTerms,
  result: ComplianceResult
): void {
  // Due-on-sale acknowledgment
  if (!terms.due_on_sale_acknowledged) {
    result.errors.push({
      code: "DUE_ON_SALE_NOT_ACKNOWLEDGED",
      message: "Due-on-sale clause risk must be acknowledged and disclosed to all parties.",
      regulation_reference: "Garn-St. Germain Act / Loan Documents",
      how_to_fix: "Include due-on-sale disclosure in all agreements. Both buyer and seller must acknowledge the risk.",
    });
  }

  // Always warn about due-on-sale
  result.warnings.push({
    code: "DUE_ON_SALE_RISK",
    message: "Subject-to transactions carry due-on-sale risk. Lender may call the loan due if transfer is discovered. Have contingency plan.",
    severity: "high",
  });

  // Insurance requirements
  result.warnings.push({
    code: "INSURANCE_REQUIREMENTS",
    message: "Maintain proper insurance naming buyer as additional insured. Keep seller informed of insurance status to protect their credit.",
    severity: "high",
  });

  // Payment tracking
  result.warnings.push({
    code: "PAYMENT_TRACKING",
    message: "Consider using a servicing company or escrow for payments to protect both parties and maintain documentation.",
    severity: "medium",
  });

  // Required disclosures for subject-to
  result.required_disclosures.push("Due-on-sale clause acknowledgment");
  result.required_disclosures.push("Insurance requirements and verification");
  result.required_disclosures.push("Payment handling procedures");
  result.required_disclosures.push("Seller liability disclosure");

  // Add any state-specific notes
  if (regulation.notes) {
    result.recommendations.push(`State consideration: ${regulation.notes}`);
  }
}

// ============ UTILITY FUNCTIONS ============

export function getDealTypeLabel(dealType: DealType): string {
  switch (dealType) {
    case "seller_finance":
      return "Seller Financing";
    case "lease_option":
      return "Lease Option";
    case "land_contract":
      return "Land Contract";
    case "subject_to":
      return "Subject-To";
  }
}

export function getComplianceScore(result: ComplianceResult): number {
  let score = 100;
  
  // Deduct for errors
  score -= result.errors.length * 25;
  
  // Deduct for warnings based on severity
  result.warnings.forEach(w => {
    if (w.severity === "high") score -= 10;
    else if (w.severity === "medium") score -= 5;
    else score -= 2;
  });
  
  return Math.max(0, score);
}

export function getComplianceStatus(result: ComplianceResult): "pass" | "warning" | "fail" {
  if (result.errors.length > 0) return "fail";
  if (result.warnings.some(w => w.severity === "high")) return "warning";
  if (result.warnings.length > 3) return "warning";
  return "pass";
}
