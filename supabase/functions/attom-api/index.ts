import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ATTOM_API_KEY = Deno.env.get("ATTOM_API_KEY");
const BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

interface AttomRequestBody {
  action: "property" | "avm" | "test";
  address1?: string;
  address2?: string;
  propertyId?: string;
}

function mapAttomToProperty(data: any) {
  const prop = data.property?.[0] || data;
  const identifier = prop.identifier || {};
  const location = prop.location || {};
  const summary = prop.summary || {};
  const building = prop.building || {};
  const lot = prop.lot || {};
  const assessment = prop.assessment || {};
  const sale = prop.sale || {};
  const owner = prop.owner || {};

  // Calculate baths
  const bathsFull = building.rooms?.bathsFull || 0;
  const bathsHalf = building.rooms?.bathsHalf || 0;
  const totalBaths = bathsFull + (bathsHalf * 0.5);

  return {
    attom_id: identifier.attomId,
    apn: identifier.apn,
    fips: identifier.fips,
    latitude: location.latitude ? parseFloat(location.latitude) : null,
    longitude: location.longitude ? parseFloat(location.longitude) : null,
    property_type: summary.propType || "SFH",
    beds: building.rooms?.beds || null,
    baths: totalBaths || null,
    sqft: building.size?.livingSize || building.size?.bldgSize || null,
    lot_size: lot.lotSize1 || null,
    year_built: summary.yearBuilt || null,
    owner_name: [owner.owner1?.firstNameAndMi, owner.owner1?.lastName].filter(Boolean).join(" ") || null,
    owner_mailing_address: owner.mailingAddressOneLine || null,
    last_sale_date: sale.saleTransDate || null,
    last_sale_price: sale.amount?.saleAmt || null,
    assessed_value: assessment.assessed?.assdTotalValue || null,
    tax_amount: assessment.tax?.taxAmt || null,
    last_data_pull: new Date().toISOString(),
  };
}

async function fetchPropertyByAddress(address1: string, address2: string) {
  const url = `${BASE_URL}/property/expandedprofile?address1=${encodeURIComponent(address1)}&address2=${encodeURIComponent(address2)}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "apikey": ATTOM_API_KEY || "",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("ATTOM API error:", response.status, text);
    throw new Error(`Property not found: ${response.status}`);
  }

  return await response.json();
}

async function fetchAVM(address1: string, address2: string) {
  const url = `${BASE_URL}/valuation/homeequity?address1=${encodeURIComponent(address1)}&address2=${encodeURIComponent(address2)}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "apikey": ATTOM_API_KEY || "",
    },
  });

  if (!response.ok) {
    console.error("ATTOM AVM error:", response.status);
    return null;
  }

  const data = await response.json();
  const avm = data.property?.[0]?.avm;
  
  if (!avm) return null;

  return {
    value: avm.amount?.value || null,
    high: avm.amount?.high || null,
    low: avm.amount?.low || null,
    confidence: avm.amount?.valueRange || null,
  };
}

async function testConnection() {
  // Test with a known address
  const url = `${BASE_URL}/property/address?postalcode=90210&maxrecords=1`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "apikey": ATTOM_API_KEY || "",
    },
  });

  return response.ok;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for API key
    if (!ATTOM_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ATTOM API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AttomRequestBody = await req.json();

    if (body.action === "test") {
      const success = await testConnection();
      return new Response(
        JSON.stringify({ success, message: success ? "Connection successful" : "Connection failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "property") {
      if (!body.address1 || !body.address2) {
        return new Response(
          JSON.stringify({ error: "address1 and address2 are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawData = await fetchPropertyByAddress(body.address1, body.address2);
      const mapped = mapAttomToProperty(rawData);

      return new Response(
        JSON.stringify({ success: true, data: mapped, raw: rawData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "avm") {
      if (!body.address1 || !body.address2) {
        return new Response(
          JSON.stringify({ error: "address1 and address2 are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const avm = await fetchAVM(body.address1, body.address2);

      if (!avm) {
        return new Response(
          JSON.stringify({ success: false, error: "AVM not available for this property" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: avm }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
