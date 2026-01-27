import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Pricing - what we charge users
const SKIP_TRACE_PRICE = 0.35;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const { firstName, lastName, address, city, state, zip, propertyId } =
      await req.json();

    // Validate required fields
    if (!address || !city || !state || !zip) {
      return new Response(
        JSON.stringify({
          error: "Address, city, state, and zip are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check user has sufficient credits
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      return new Response(
        JSON.stringify({ error: "Could not fetch user credits" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no credits record exists, create one with 0 balance
    if (!credits) {
      await supabase.from("user_credits").insert({ user_id: user.id, balance: 0 });
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          required: SKIP_TRACE_PRICE,
          balance: 0,
          code: "INSUFFICIENT_CREDITS",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (credits.balance < SKIP_TRACE_PRICE) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          required: SKIP_TRACE_PRICE,
          balance: credits.balance,
          code: "INSUFFICIENT_CREDITS",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call BatchData API
    const BATCHDATA_API_KEY = Deno.env.get("BATCHDATA_API_KEY");

    if (!BATCHDATA_API_KEY) {
      console.error("BATCHDATA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Skip trace service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const batchResponse = await fetch(
      "https://api.batchdata.com/api/v1/property/skip-trace",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BATCHDATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              firstName: firstName || "",
              lastName: lastName || "",
              address: {
                street: address,
                city: city,
                state: state,
                zip: zip,
              },
            },
          ],
        }),
      }
    );

    const batchData = await batchResponse.json();

    // Check if API call was successful
    if (!batchResponse.ok) {
      console.error("BatchData API error:", batchData);
      return new Response(
        JSON.stringify({
          error: "Skip trace service error",
          details: batchData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process results
    const result = batchData.results?.[0];
    const persons = result?.persons || [];

    // Extract best phone (prefer mobile, highest score, not DNC)
    let allPhones: any[] = [];
    let allEmails: any[] = [];
    let relatives: any[] = [];
    let deceased = false;
    let bankruptcy = false;

    persons.forEach((person: any) => {
      if (person.phones) {
        allPhones = [
          ...allPhones,
          ...person.phones.map((p: any) => ({
            number: p.phone,
            type: p.phoneType || "unknown",
            score: p.score || 0,
            dnc: p.dnc || false,
            carrier: p.carrier || null,
          })),
        ];
      }
      if (person.emails) {
        allEmails = [
          ...allEmails,
          ...person.emails.map((e: any) => ({
            address: e.email,
            score: e.score || 0,
          })),
        ];
      }
      if (person.relatives) {
        relatives = [...relatives, ...person.relatives];
      }
      if (person.deceased) deceased = true;
      if (person.bankruptcy) bankruptcy = true;
    });

    // Sort phones: mobile first, then by score, exclude DNC
    const sortedPhones = allPhones.sort((a, b) => {
      if (a.type === "mobile" && b.type !== "mobile") return -1;
      if (b.type === "mobile" && a.type !== "mobile") return 1;
      if (!a.dnc && b.dnc) return -1;
      if (a.dnc && !b.dnc) return 1;
      return b.score - a.score;
    });

    const sortedEmails = allEmails.sort((a, b) => b.score - a.score);

    const primaryPhone = sortedPhones[0] || null;
    const primaryEmail = sortedEmails[0] || null;

    // Deduct credits
    const { data: deductResult } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: SKIP_TRACE_PRICE,
      p_description: `Skip trace: ${address}, ${city}, ${state}`,
      p_service: "skip_trace",
      p_reference_id: propertyId || null,
    });

    if (!deductResult?.success) {
      return new Response(
        JSON.stringify({
          error: "Failed to deduct credits",
          details: deductResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's organization_id
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    // Save skip trace results
    const { data: skipTraceRecord, error: insertError } = await supabase
      .from("skip_trace_results")
      .insert({
        user_id: user.id,
        organization_id: orgMember?.organization_id || null,
        property_id: propertyId || null,
        input_first_name: firstName,
        input_last_name: lastName,
        input_address: address,
        input_city: city,
        input_state: state,
        input_zip: zip,
        primary_phone: primaryPhone?.number || null,
        primary_phone_type: primaryPhone?.type || null,
        primary_phone_score: primaryPhone?.score || null,
        primary_phone_dnc: primaryPhone?.dnc || false,
        primary_email: primaryEmail?.address || null,
        primary_email_score: primaryEmail?.score || null,
        all_phones: sortedPhones,
        all_emails: sortedEmails,
        relatives: relatives,
        deceased: deceased,
        bankruptcy: bankruptcy,
        credit_cost: SKIP_TRACE_PRICE,
        status:
          allPhones.length > 0 || allEmails.length > 0
            ? "completed"
            : "no_results",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving skip trace:", insertError);
    }

    // Update property if propertyId provided
    if (propertyId && primaryPhone) {
      await supabase
        .from("properties")
        .update({
          owner_phone: primaryPhone.number,
          owner_email: primaryEmail?.address || null,
          skip_traced: true,
          skip_traced_at: new Date().toISOString(),
          skip_trace_id: skipTraceRecord?.id,
          phone_dnc: primaryPhone.dnc,
        })
        .eq("id", propertyId);
    }

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        skipTraceId: skipTraceRecord?.id,
        creditsUsed: SKIP_TRACE_PRICE,
        newBalance: deductResult.new_balance,
        results: {
          primaryPhone: primaryPhone,
          primaryEmail: primaryEmail,
          allPhones: sortedPhones,
          allEmails: sortedEmails,
          relatives: relatives,
          flags: {
            deceased,
            bankruptcy,
          },
          totalPhonesFound: allPhones.length,
          totalEmailsFound: allEmails.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Skip trace error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
