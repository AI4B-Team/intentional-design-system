export type UserRole = 'investor' | 'scout' | 'admin';

export type LeadStatus = 
  | 'pending_review'
  | 'under_review'
  | 'qualified'
  | 'contacted_owner'
  | 'offer_made'
  | 'under_contract'
  | 'closed'
  | 'disqualified'
  | 'archived';

export type LeadSource = 
  | 'manual_entry'
  | 'driving_for_dollars'
  | 'ai_scout'
  | 'import'
  | 'api';

export interface BuyBox {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  visibleToScouts: string[]; // Scout user IDs who can see this buy box
  
  // Property Criteria
  criteria: {
    // Location
    states?: string[];
    cities?: string[];
    zipCodes?: string[];
    neighborhoods?: string[];
    
    // Property Type
    propertyTypes?: ('single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial')[];
    
    // Price Range
    minPrice?: number;
    maxPrice?: number;
    
    // Property Details
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minSquareFeet?: number;
    maxSquareFeet?: number;
    minLotSize?: number;
    maxLotSize?: number;
    minYearBuilt?: number;
    maxYearBuilt?: number;
    
    // Financial
    maxARV?: number; // After Repair Value
    minARV?: number;
    maxRepairCost?: number;
    minEquity?: number;
    
    // Condition
    conditions?: ('excellent' | 'good' | 'fair' | 'poor' | 'distressed')[];
    
    // Deal Structure
    dealTypes?: ('wholesale' | 'fix_flip' | 'buy_hold' | 'creative_finance')[];
    
    // Custom Fields
    customCriteria?: Record<string, any>;
  };
  
  // Required Fields for Submission
  requiredFields: {
    address: boolean;
    propertyType: boolean;
    estimatedValue: boolean;
    condition: boolean;
    photos: { required: boolean; minimum?: number };
    ownerInfo: boolean;
    motivationLevel: boolean;
    notes: boolean;
    customFields?: string[];
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface PropertyLead {
  id: string;
  
  // Scout Info
  scoutId: string;
  scoutName: string;
  scoutEmail: string;
  scoutPhone?: string;
  
  // Investor/Owner Info
  investorId: string;
  buyBoxId?: string;
  buyBoxMatches: boolean;
  matchScore?: number; // 0-100
  
  // Property Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial';
  
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSize?: number;
    yearBuilt?: number;
    parking?: string;
    pool?: boolean;
    stories?: number;
  };
  
  // Valuation
  estimatedValue?: number;
  estimatedARV?: number;
  estimatedRepairCost?: number;
  estimatedEquity?: number;
  
  // Condition
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'distressed';
  conditionNotes?: string;
  
  // Owner Information
  ownerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    mailingAddress?: string;
    ownerOccupied?: boolean;
    motivationLevel?: 'high' | 'medium' | 'low' | 'unknown';
    motivationReason?: string;
  };
  
  // Media
  photos: {
    url: string;
    caption?: string;
    uploadedAt: string;
  }[];
  videos?: {
    url: string;
    caption?: string;
    uploadedAt: string;
  }[];
  
  // AI Analysis
  aiAnalysis?: {
    dealScore: number;
    insights: string[];
    estimatedRepairCost: number;
    marketAnalysis: string;
    analyzedAt: string;
  };
  
  // Notes & Communication
  scoutNotes?: string;
  investorNotes?: string;
  
  // Tracking
  status: LeadStatus;
  source: LeadSource;
  submittedAt: string;
  lastStatusChange?: string;
  lastScoutNotification?: string;
  
  // D4D Specific
  drivingForDollars?: {
    route?: string;
    capturedAt: string;
    deviceLocation: {
      lat: number;
      lng: number;
    };
  };
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ScoutProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  
  // Assignment
  assignedInvestors: string[];
  visibleBuyBoxes: string[];
  
  // Stats
  stats: {
    totalSubmissions: number;
    qualifiedLeads: number;
    dealsUnderContract: number;
    dealsClosed: number;
    totalEarnings: number;
  };
  
  // Settings
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    statusUpdates: boolean;
  };
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusUpdateNotification {
  leadId: string;
  fromStatus: LeadStatus;
  toStatus: LeadStatus;
  message?: string;
  scoutId: string;
  scoutEmail: string;
  investorId: string;
  timestamp: string;
}

// Legacy types for backward compatibility
export interface D4DProperty {
  id: string;
  coordinates: { lat: number; lng: number };
  address: string;
  photos: string[];
  notes: string;
  timestamp: string;
  aiAnalysis?: {
    condition: string;
    estimatedValue: number;
    insights: string[];
  };
}

export interface D4DRoute {
  id: string;
  name: string;
  points: { lat: number; lng: number }[];
  distance: number; // miles
  duration: number; // minutes
  properties: D4DProperty[];
  createdAt: string;
}
