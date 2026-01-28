export interface PropertyLead {
  id?: string;
  scoutId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  source: 'driving_for_dollars' | 'manual' | 'import' | 'referral';
  drivingForDollars?: {
    capturedAt: string;
    deviceLocation: { lat: number; lng: number };
  };
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'distressed';
  estimatedValue?: number;
  scoutNotes?: string;
  photos?: {
    url: string;
    caption?: string;
    uploadedAt: string;
  }[];
  aiAnalysis?: {
    dealScore: number;
    insights: string[];
    estimatedRepairCost?: number;
    marketAnalysis?: string;
    analyzedAt: string;
  };
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted';
  createdAt?: string;
  updatedAt?: string;
}

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
