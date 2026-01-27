import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

interface MailRecipient {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Lob API key from lob_connections table
    const { data: lobConnection, error: connError } = await supabaseClient
      .from("lob_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { action, ...params } = await req.json();

    // For test connection, use the provided API key
    let apiKey = params.apiKey;
    
    if (action !== "test_connection" && action !== "webhook") {
      if (!lobConnection?.api_key_encrypted) {
        return new Response(JSON.stringify({ error: "Lob API key not configured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      apiKey = lobConnection.api_key_encrypted;
    }

    const lobBaseUrl = "https://api.lob.com/v1";
    const authHeader = `Basic ${btoa(`${apiKey}:`)}`;

    switch (action) {
      case "test_connection": {
        // Test the API key by fetching account info
        const response = await fetch(`${lobBaseUrl}/accounts`, {
          headers: { Authorization: authHeader },
        });
        
        if (!response.ok) {
          const error = await response.json();
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.error?.message || "Invalid API key" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const accountData = await response.json();
        return new Response(JSON.stringify({ 
          success: true, 
          account: accountData 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "verify_address": {
        const address: AddressInput = params.address;
        
        const response = await fetch(`${lobBaseUrl}/us_verifications`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            primary_line: address.line1,
            secondary_line: address.line2 || "",
            city: address.city,
            state: address.state,
            zip_code: address.zip,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          return new Response(JSON.stringify({ 
            valid: false, 
            error: result.error?.message || "Verification failed" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          valid: result.deliverability !== "undeliverable",
          deliverable: result.deliverability === "deliverable" || result.deliverability === "deliverable_missing_unit",
          deliverability: result.deliverability,
          normalized: {
            line1: result.primary_line,
            line2: result.secondary_line,
            city: result.components?.city,
            state: result.components?.state,
            zip: result.components?.zip_code,
          },
          components: result.components,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "send_postcard": {
        const { to, from, front_html, back_html, size, mail_type, merge_variables } = params;
        
        const response = await fetch(`${lobBaseUrl}/postcards`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: {
              name: to.name,
              address_line1: to.address_line1,
              address_line2: to.address_line2 || undefined,
              address_city: to.address_city,
              address_state: to.address_state,
              address_zip: to.address_zip,
            },
            from: {
              name: from.name,
              address_line1: from.address_line1,
              address_line2: from.address_line2 || undefined,
              address_city: from.address_city,
              address_state: from.address_state,
              address_zip: from.address_zip,
            },
            front: front_html,
            back: back_html,
            size: size || "6x9",
            mail_type: mail_type || "usps_first_class",
            merge_variables: merge_variables || {},
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          return new Response(JSON.stringify({ 
            error: result.error?.message || "Failed to send postcard" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          id: result.id,
          url: result.url,
          expected_delivery_date: result.expected_delivery_date,
          status: result.status,
          send_date: result.send_date,
          thumbnails: result.thumbnails,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "send_letter": {
        const { to, from, file, color, mail_type, merge_variables } = params;
        
        const response = await fetch(`${lobBaseUrl}/letters`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: {
              name: to.name,
              address_line1: to.address_line1,
              address_line2: to.address_line2 || undefined,
              address_city: to.address_city,
              address_state: to.address_state,
              address_zip: to.address_zip,
            },
            from: {
              name: from.name,
              address_line1: from.address_line1,
              address_line2: from.address_line2 || undefined,
              address_city: from.address_city,
              address_state: from.address_state,
              address_zip: from.address_zip,
            },
            file: file,
            color: color !== false,
            mail_type: mail_type || "usps_first_class",
            merge_variables: merge_variables || {},
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          return new Response(JSON.stringify({ 
            error: result.error?.message || "Failed to send letter" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          id: result.id,
          url: result.url,
          expected_delivery_date: result.expected_delivery_date,
          status: result.status,
          send_date: result.send_date,
          thumbnails: result.thumbnails,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_status": {
        const { id, type } = params;
        const endpoint = type === "letter" ? "letters" : "postcards";
        
        const response = await fetch(`${lobBaseUrl}/${endpoint}/${id}`, {
          headers: { Authorization: authHeader },
        });

        const result = await response.json();
        
        if (!response.ok) {
          return new Response(JSON.stringify({ 
            error: result.error?.message || "Failed to get status" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          id: result.id,
          status: result.status,
          tracking_events: result.tracking_events || [],
          expected_delivery_date: result.expected_delivery_date,
          send_date: result.send_date,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Lob API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
