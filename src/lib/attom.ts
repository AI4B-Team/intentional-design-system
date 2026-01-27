import { supabase } from "@/integrations/supabase/client";

export interface AttomPropertyData {
  attom_id: number | null;
  apn: string | null;
  fips: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  owner_name: string | null;
  owner_mailing_address: string | null;
  last_sale_date: string | null;
  last_sale_price: number | null;
  assessed_value: number | null;
  tax_amount: number | null;
  last_data_pull: string;
}

export interface AVMData {
  value: number | null;
  high: number | null;
  low: number | null;
  confidence: string | null;
}

export interface AttomPropertyResponse {
  success: boolean;
  data?: AttomPropertyData;
  raw?: any;
  error?: string;
}

export interface AttomAVMResponse {
  success: boolean;
  data?: AVMData;
  error?: string;
}

/**
 * Fetch property data from ATTOM API via edge function
 */
export async function getPropertyByAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<AttomPropertyResponse> {
  try {
    const address2 = [city, state, zip].filter(Boolean).join(", ");

    const { data, error } = await supabase.functions.invoke("attom-api", {
      body: {
        action: "property",
        address1: address,
        address2,
      },
    });

    if (error) {
      console.error("ATTOM edge function error:", error);
      return { success: false, error: error.message };
    }

    return data as AttomPropertyResponse;
  } catch (error: any) {
    console.error("ATTOM API error:", error);
    return { success: false, error: error.message || "Failed to fetch property data" };
  }
}

/**
 * Fetch AVM (Automated Valuation Model) data from ATTOM API
 */
export async function getAVM(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<AttomAVMResponse> {
  try {
    const address2 = [city, state, zip].filter(Boolean).join(", ");

    const { data, error } = await supabase.functions.invoke("attom-api", {
      body: {
        action: "avm",
        address1: address,
        address2,
      },
    });

    if (error) {
      console.error("ATTOM AVM error:", error);
      return { success: false, error: error.message };
    }

    return data as AttomAVMResponse;
  } catch (error: any) {
    console.error("ATTOM AVM error:", error);
    return { success: false, error: error.message || "Failed to fetch AVM data" };
  }
}

/**
 * Test ATTOM API connection
 */
export async function testAttomConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("attom-api", {
      body: { action: "test" },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return data as { success: boolean; message: string };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection test failed" };
  }
}

/**
 * Map ATTOM property type to our property type
 */
export function mapPropertyType(attomType: string | null): string {
  if (!attomType) return "Single Family";
  
  const type = attomType.toLowerCase();
  
  if (type.includes("single") || type.includes("sfr")) return "Single Family";
  if (type.includes("multi") || type.includes("duplex") || type.includes("triplex")) return "Multi-Family";
  if (type.includes("condo")) return "Condo";
  if (type.includes("town")) return "Townhouse";
  if (type.includes("land") || type.includes("vacant")) return "Land";
  if (type.includes("commercial")) return "Commercial";
  
  return "Single Family";
}

/**
 * Format currency for display
 */
export function formatAttomCurrency(value: number | null): string {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get confidence badge variant based on ATTOM confidence level
 */
export function getConfidenceBadgeVariant(
  confidence: string | null
): "success" | "warning" | "error" | "secondary" {
  if (!confidence) return "secondary";
  
  const level = confidence.toLowerCase();
  if (level.includes("high") || level === "a") return "success";
  if (level.includes("medium") || level === "b") return "warning";
  if (level.includes("low") || level === "c" || level === "d") return "error";
  
  return "secondary";
}
