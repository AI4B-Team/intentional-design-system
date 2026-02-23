// ─── Signature Template Types ───────────────────────────────

export type TemplateCategory =
  | "purchase"
  | "assignment"
  | "disclosure"
  | "addendum"
  | "financing"
  | "lease"
  | "other";

export type VariableType = "text" | "number" | "currency" | "date" | "email" | "phone" | "address" | "percentage";

export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  required: boolean;
  defaultValue?: string;
  /** Source for auto-fill: "deal", "contact", "property", "user", "manual" */
  source?: "deal" | "contact" | "property" | "user" | "manual";
  /** Which field in the source entity maps to this variable */
  sourceField?: string;
  placeholder?: string;
}

export interface ConditionalBlock {
  id: string;
  label: string;
  condition: string; // e.g. "deal_type === 'assignment'"
  content: string;
}

export interface Clause {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface SignatureTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  variables: TemplateVariable[];
  conditionalBlocks: ConditionalBlock[];
  clauseIds: string[];
  body: string;
  isActive: boolean;
  isSystem: boolean;
  useCount: number;
  avgCompletionTime?: number; // hours
  completionRate?: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

// ─── Category config ────────────────────────────────────────

export const categoryConfig: Record<TemplateCategory, { label: string; color: string }> = {
  purchase: { label: "Purchase Agreement", color: "bg-brand/10 text-brand border-brand/20" },
  assignment: { label: "Assignment", color: "bg-purple-100 text-purple-700 border-purple-200" },
  disclosure: { label: "Disclosure", color: "bg-amber-100 text-amber-700 border-amber-200" },
  addendum: { label: "Addendum", color: "bg-blue-100 text-blue-700 border-blue-200" },
  financing: { label: "Financing", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  lease: { label: "Lease", color: "bg-rose-100 text-rose-700 border-rose-200" },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
};

// ─── Common variables ───────────────────────────────────────

export const commonVariables: TemplateVariable[] = [
  { key: "seller_name", label: "Seller Name", type: "text", required: true, source: "contact", sourceField: "name", placeholder: "John Smith" },
  { key: "seller_email", label: "Seller Email", type: "email", required: false, source: "contact", sourceField: "email", placeholder: "seller@email.com" },
  { key: "seller_phone", label: "Seller Phone", type: "phone", required: false, source: "contact", sourceField: "phone", placeholder: "(555) 123-4567" },
  { key: "buyer_name", label: "Buyer Name", type: "text", required: true, source: "user", sourceField: "name", placeholder: "Your Company LLC" },
  { key: "buyer_email", label: "Buyer Email", type: "email", required: false, source: "user", sourceField: "email", placeholder: "buyer@email.com" },
  { key: "property_address", label: "Property Address", type: "address", required: true, source: "property", sourceField: "address", placeholder: "123 Main St, City, ST 12345" },
  { key: "purchase_price", label: "Purchase Price", type: "currency", required: true, source: "deal", sourceField: "asking_price", placeholder: "$150,000" },
  { key: "earnest_money", label: "Earnest Money Deposit", type: "currency", required: false, source: "deal", sourceField: "earnest_money", placeholder: "$1,000" },
  { key: "close_date", label: "Closing Date", type: "date", required: true, source: "deal", sourceField: "close_date", placeholder: "MM/DD/YYYY" },
  { key: "inspection_days", label: "Inspection Period (Days)", type: "number", required: false, placeholder: "10" },
];

// ─── Mock templates ─────────────────────────────────────────

export const mockTemplates: SignatureTemplate[] = [
  {
    id: "tpl-1",
    name: "Standard Purchase Agreement",
    description: "One-to-one real estate purchase contract with standard terms and contingencies.",
    category: "purchase",
    variables: [
      ...commonVariables,
      { key: "financing_type", label: "Financing Type", type: "text", required: false, placeholder: "Cash / Conventional / FHA" },
      { key: "closing_timeline", label: "Closing Timeline", type: "text", required: false, placeholder: "30 days" },
    ],
    conditionalBlocks: [
      { id: "cb-1", label: "Financing Contingency", condition: "financing_type !== 'Cash'", content: "This agreement is contingent upon Buyer obtaining financing..." },
    ],
    clauseIds: ["cl-1", "cl-2"],
    body: "PURCHASE AND SALE AGREEMENT\n\nThis Purchase and Sale Agreement (\"Agreement\") is entered into as of {{close_date}}...",
    isActive: true,
    isSystem: true,
    useCount: 47,
    avgCompletionTime: 18,
    completionRate: 89,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-15"),
  },
  {
    id: "tpl-2",
    name: "Assignment of Contract",
    description: "Wholesale assignment contract for transferring purchase rights to an end buyer.",
    category: "assignment",
    variables: [
      ...commonVariables,
      { key: "assignment_fee", label: "Assignment Fee", type: "currency", required: true, source: "deal", sourceField: "assignment_fee", placeholder: "$10,000" },
      { key: "end_buyer_name", label: "End Buyer Name", type: "text", required: true, placeholder: "End Buyer LLC" },
      { key: "original_contract_date", label: "Original Contract Date", type: "date", required: true, placeholder: "MM/DD/YYYY" },
    ],
    conditionalBlocks: [],
    clauseIds: ["cl-3"],
    body: "ASSIGNMENT OF REAL ESTATE PURCHASE AND SALE AGREEMENT\n\nThis Assignment (\"Assignment\") is made on {{close_date}}...",
    isActive: true,
    isSystem: true,
    useCount: 31,
    avgCompletionTime: 8,
    completionRate: 94,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-05-10"),
  },
  {
    id: "tpl-3",
    name: "Lead-Based Paint Disclosure",
    description: "Required federal disclosure for properties built before 1978.",
    category: "disclosure",
    variables: [
      { key: "seller_name", label: "Seller Name", type: "text", required: true, source: "contact", sourceField: "name", placeholder: "John Smith" },
      { key: "buyer_name", label: "Buyer Name", type: "text", required: true, source: "user", sourceField: "name", placeholder: "Your Company LLC" },
      { key: "property_address", label: "Property Address", type: "address", required: true, source: "property", sourceField: "address", placeholder: "123 Main St" },
      { key: "year_built", label: "Year Built", type: "number", required: true, source: "property", sourceField: "year_built", placeholder: "1965" },
      { key: "known_lead_paint", label: "Known Lead Paint", type: "text", required: true, placeholder: "Yes / No / Unknown" },
    ],
    conditionalBlocks: [],
    clauseIds: [],
    body: "DISCLOSURE OF INFORMATION ON LEAD-BASED PAINT AND/OR LEAD-BASED PAINT HAZARDS...",
    isActive: true,
    isSystem: true,
    useCount: 22,
    avgCompletionTime: 4,
    completionRate: 97,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "tpl-4",
    name: "Seller Financing Addendum",
    description: "Addendum for seller-financed (sub-to or owner financing) deal terms.",
    category: "financing",
    variables: [
      ...commonVariables,
      { key: "loan_amount", label: "Loan Amount", type: "currency", required: true, placeholder: "$120,000" },
      { key: "interest_rate", label: "Interest Rate", type: "percentage", required: true, placeholder: "5.5%" },
      { key: "loan_term", label: "Loan Term (Months)", type: "number", required: true, placeholder: "360" },
      { key: "monthly_payment", label: "Monthly Payment", type: "currency", required: true, placeholder: "$681.00" },
      { key: "balloon_date", label: "Balloon Payment Date", type: "date", required: false, placeholder: "MM/DD/YYYY" },
    ],
    conditionalBlocks: [
      { id: "cb-2", label: "Balloon Payment", condition: "balloon_date", content: "A balloon payment of the remaining balance shall be due on {{balloon_date}}..." },
    ],
    clauseIds: ["cl-4"],
    body: "SELLER FINANCING ADDENDUM\n\nThis Addendum modifies and supplements the Purchase Agreement...",
    isActive: true,
    isSystem: true,
    useCount: 12,
    avgCompletionTime: 24,
    completionRate: 78,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-07-01"),
  },
  {
    id: "tpl-5",
    name: "Inspection Addendum",
    description: "Property inspection contingency addendum with repair requests.",
    category: "addendum",
    variables: [
      { key: "property_address", label: "Property Address", type: "address", required: true, source: "property", sourceField: "address", placeholder: "123 Main St" },
      { key: "inspection_date", label: "Inspection Date", type: "date", required: true, placeholder: "MM/DD/YYYY" },
      { key: "repair_items", label: "Repair Items", type: "text", required: false, placeholder: "List of items requiring repair" },
      { key: "repair_credit", label: "Repair Credit", type: "currency", required: false, placeholder: "$5,000" },
      { key: "response_deadline", label: "Response Deadline", type: "date", required: true, placeholder: "MM/DD/YYYY" },
    ],
    conditionalBlocks: [],
    clauseIds: [],
    body: "INSPECTION ADDENDUM\n\nThis Addendum pertains to the inspection of the property located at {{property_address}}...",
    isActive: true,
    isSystem: false,
    useCount: 8,
    avgCompletionTime: 12,
    completionRate: 85,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-08-01"),
  },
];

// ─── Mock clauses ───────────────────────────────────────────

export const mockClauses: Clause[] = [
  {
    id: "cl-1",
    name: "As-Is Condition",
    category: "purchase",
    content: "Buyer acknowledges and agrees that the Property is being sold in its present \"AS-IS\" condition, with all faults, defects, and deficiencies, whether known or unknown, disclosed or undisclosed.",
    version: 3,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
    tags: ["investor", "wholesale", "as-is"],
  },
  {
    id: "cl-2",
    name: "Assignability Clause",
    category: "purchase",
    content: "This Agreement and/or Buyer's rights hereunder may be assigned by Buyer to any person, entity, or trust without the prior written consent of Seller.",
    version: 2,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-04-15"),
    tags: ["wholesale", "assignment"],
  },
  {
    id: "cl-3",
    name: "Assignment Fee Disclosure",
    category: "assignment",
    content: "Assignor shall receive an assignment fee of {{assignment_fee}} from the End Buyer at closing. This fee is in addition to the original purchase price stated in the underlying contract.",
    version: 1,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    tags: ["wholesale", "fee"],
  },
  {
    id: "cl-4",
    name: "Due-on-Sale Protection",
    category: "financing",
    content: "Buyer acknowledges that the existing mortgage contains a due-on-sale clause and that the lender may exercise its right to accelerate the loan upon transfer of the Property.",
    version: 2,
    isActive: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-05-01"),
    tags: ["sub-to", "financing", "risk"],
  },
  {
    id: "cl-5",
    name: "Inspection Contingency",
    category: "addendum",
    content: "This Agreement is contingent upon Buyer's satisfactory inspection of the Property within {{inspection_days}} days of the Effective Date. Buyer may terminate this Agreement within such period if the inspection reveals material defects.",
    version: 4,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-07-01"),
    tags: ["inspection", "contingency"],
  },
  {
    id: "cl-6",
    name: "Earnest Money Terms",
    category: "purchase",
    content: "Buyer shall deposit {{earnest_money}} as earnest money within 3 business days of the Effective Date, to be held in escrow by the closing agent.",
    version: 2,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-01"),
    tags: ["earnest money", "escrow"],
  },
];
