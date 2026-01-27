import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GHLConnection {
  api_key: string;
  location_id: string;
  field_mappings: Record<string, string>;
  stage_mappings: Record<string, string>;
}

interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  motivation_score?: number;
  status?: string;
  source?: string;
  arv?: number;
  ghl_contact_id?: string;
}

interface Appointment {
  id: string;
  property_id: string;
  scheduled_time: string;
  appointment_type?: string;
  notes?: string;
  duration_minutes?: number;
}

// GHL API Base URL
const GHL_API_BASE = "https://rest.gohighlevel.com/v1";

// Helper to make GHL API requests
async function ghlRequest(
  apiKey: string,
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
): Promise<Response> {
  const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response;
}

// Create a contact in GHL
async function createGHLContact(
  connection: GHLConnection,
  property: Property
): Promise<{ ghl_id: string }> {
  const contactData: Record<string, unknown> = {
    locationId: connection.location_id,
    name: property.owner_name || "Unknown Owner",
    phone: property.owner_phone,
    email: property.owner_email,
    address1: property.address,
    city: property.city,
    state: property.state,
    postalCode: property.zip,
    tags: [property.status || "new", property.source || "dealflow"].filter(Boolean),
    customField: {
      property_address: property.address,
      motivation_score: property.motivation_score?.toString() || "0",
      arv: property.arv?.toString() || "",
      dealflow_id: property.id,
    },
  };

  const response = await ghlRequest(
    connection.api_key,
    "/contacts/",
    "POST",
    contactData
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create GHL contact: ${error}`);
  }

  const result = await response.json();
  return { ghl_id: result.contact?.id || result.id };
}

// Update an existing contact in GHL
async function updateGHLContact(
  connection: GHLConnection,
  property: Property,
  ghl_id: string
): Promise<void> {
  const contactData: Record<string, unknown> = {
    name: property.owner_name,
    phone: property.owner_phone,
    email: property.owner_email,
    address1: property.address,
    city: property.city,
    state: property.state,
    postalCode: property.zip,
    tags: [property.status || "new", property.source || "dealflow"].filter(Boolean),
    customField: {
      property_address: property.address,
      motivation_score: property.motivation_score?.toString() || "0",
      arv: property.arv?.toString() || "",
    },
  };

  const response = await ghlRequest(
    connection.api_key,
    `/contacts/${ghl_id}`,
    "PUT",
    contactData
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update GHL contact: ${error}`);
  }
}

// Sync to GHL pipeline stage
async function syncToGHLPipeline(
  connection: GHLConnection,
  property: Property,
  ghl_id: string
): Promise<void> {
  const dealflowStage = property.status || "new";
  const ghlStage = connection.stage_mappings[dealflowStage] || "new_lead";

  // GHL uses opportunities for pipeline stages
  const opportunityData = {
    locationId: connection.location_id,
    contactId: ghl_id,
    name: `Deal: ${property.address}`,
    status: ghlStage,
    monetaryValue: property.arv || 0,
  };

  // First try to find existing opportunity
  const searchResponse = await ghlRequest(
    connection.api_key,
    `/contacts/${ghl_id}/opportunities`
  );

  if (searchResponse.ok) {
    const opportunities = await searchResponse.json();
    if (opportunities.opportunities?.length > 0) {
      // Update existing
      const oppId = opportunities.opportunities[0].id;
      await ghlRequest(
        connection.api_key,
        `/opportunities/${oppId}`,
        "PUT",
        { status: ghlStage, monetaryValue: property.arv || 0 }
      );
      return;
    }
  }

  // Create new opportunity
  await ghlRequest(connection.api_key, "/opportunities/", "POST", opportunityData);
}

// Create appointment in GHL
async function createGHLAppointment(
  connection: GHLConnection,
  appointment: Appointment,
  ghl_contact_id: string
): Promise<{ ghl_appointment_id: string }> {
  const startTime = new Date(appointment.scheduled_time);
  const endTime = new Date(
    startTime.getTime() + (appointment.duration_minutes || 30) * 60000
  );

  const appointmentData = {
    locationId: connection.location_id,
    contactId: ghl_contact_id,
    title: appointment.appointment_type || "Property Appointment",
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    notes: appointment.notes,
  };

  const response = await ghlRequest(
    connection.api_key,
    "/appointments/",
    "POST",
    appointmentData
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create GHL appointment: ${error}`);
  }

  const result = await response.json();
  return { ghl_appointment_id: result.appointment?.id || result.id };
}

// Trigger a GHL workflow
async function triggerGHLWorkflow(
  connection: GHLConnection,
  workflow_id: string,
  contact_id: string
): Promise<void> {
  const response = await ghlRequest(
    connection.api_key,
    `/contacts/${contact_id}/workflow/${workflow_id}`,
    "POST"
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to trigger GHL workflow: ${error}`);
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Get request body
    const body = await req.json();
    const { action, property_id, appointment_id, workflow_id, properties } = body;

    // Get GHL connection
    const { data: connection, error: connError } = await supabase
      .from("ghl_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "No active GHL connection" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ghlConnection: GHLConnection = {
      api_key: connection.api_key,
      location_id: connection.location_id,
      field_mappings: connection.field_mappings || {},
      stage_mappings: connection.stage_mappings || {},
    };

    let result: Record<string, unknown> = {};

    // Log helper
    async function logSync(
      syncType: string,
      direction: string,
      recordType: string,
      recordId: string | null,
      ghlId: string | null,
      status: string,
      errorMessage?: string
    ) {
      await supabase.from("ghl_sync_log").insert({
        user_id: userId,
        sync_type: syncType,
        direction,
        record_type: recordType,
        record_id: recordId,
        ghl_id: ghlId,
        status,
        error_message: errorMessage,
      });
    }

    switch (action) {
      case "sync_property": {
        // Get property
        const { data: property, error: propError } = await supabase
          .from("properties")
          .select("*")
          .eq("id", property_id)
          .eq("user_id", userId)
          .single();

        if (propError || !property) {
          return new Response(JSON.stringify({ error: "Property not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        try {
          let ghlId = property.ghl_contact_id;

          if (ghlId) {
            // Update existing
            await updateGHLContact(ghlConnection, property, ghlId);
          } else {
            // Create new
            const createResult = await createGHLContact(ghlConnection, property);
            ghlId = createResult.ghl_id;
          }

          // Update pipeline
          if (connection.sync_pipeline_enabled) {
            await syncToGHLPipeline(ghlConnection, property, ghlId);
          }

          // Update property with GHL ID
          await supabase
            .from("properties")
            .update({
              ghl_contact_id: ghlId,
              ghl_last_sync: new Date().toISOString(),
            })
            .eq("id", property_id);

          await logSync("contact", "to_ghl", "property", property_id, ghlId, "success");
          result = { success: true, ghl_id: ghlId };
        } catch (error) {
          await logSync(
            "contact",
            "to_ghl",
            "property",
            property_id,
            null,
            "failed",
            error instanceof Error ? error.message : String(error)
          );
          throw error;
        }
        break;
      }

      case "sync_appointment": {
        // Get appointment with property
        const { data: appointment, error: apptError } = await supabase
          .from("appointments")
          .select("*, properties(id, ghl_contact_id, user_id)")
          .eq("id", appointment_id)
          .single();

        if (apptError || !appointment) {
          return new Response(JSON.stringify({ error: "Appointment not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const property = appointment.properties;
        if (property.user_id !== userId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!property.ghl_contact_id) {
          return new Response(
            JSON.stringify({ error: "Property not synced to GHL yet" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        try {
          const apptResult = await createGHLAppointment(
            ghlConnection,
            appointment,
            property.ghl_contact_id
          );
          await logSync(
            "appointment",
            "to_ghl",
            "appointment",
            appointment_id,
            apptResult.ghl_appointment_id,
            "success"
          );
          result = { success: true, ghl_appointment_id: apptResult.ghl_appointment_id };
        } catch (error) {
          await logSync(
            "appointment",
            "to_ghl",
            "appointment",
            appointment_id,
            null,
            "failed",
            error instanceof Error ? error.message : String(error)
          );
          throw error;
        }
        break;
      }

      case "trigger_workflow": {
        // Get property for contact ID
        const { data: property, error: propError } = await supabase
          .from("properties")
          .select("ghl_contact_id")
          .eq("id", property_id)
          .eq("user_id", userId)
          .single();

        if (propError || !property?.ghl_contact_id) {
          return new Response(
            JSON.stringify({ error: "Property not synced to GHL" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        try {
          await triggerGHLWorkflow(ghlConnection, workflow_id, property.ghl_contact_id);
          result = { success: true };
        } catch (error) {
          throw error;
        }
        break;
      }

      case "bulk_sync": {
        // Get all unsynced or specified properties
        let query = supabase
          .from("properties")
          .select("*")
          .eq("user_id", userId);

        if (properties && properties.length > 0) {
          query = query.in("id", properties);
        } else {
          query = query.is("ghl_contact_id", null);
        }

        const { data: propsToSync, error: propsError } = await query.limit(500);

        if (propsError) {
          throw new Error("Failed to fetch properties");
        }

        let synced = 0;
        let failed = 0;
        const errors: Array<{ property_id: string; error: string }> = [];

        for (const property of propsToSync || []) {
          try {
            const createResult = await createGHLContact(ghlConnection, property);
            
            if (connection.sync_pipeline_enabled) {
              await syncToGHLPipeline(ghlConnection, property, createResult.ghl_id);
            }

            await supabase
              .from("properties")
              .update({
                ghl_contact_id: createResult.ghl_id,
                ghl_last_sync: new Date().toISOString(),
              })
              .eq("id", property.id);

            await logSync("contact", "to_ghl", "property", property.id, createResult.ghl_id, "success");
            synced++;
          } catch (error) {
            failed++;
            const errorMsg = error instanceof Error ? error.message : String(error);
            errors.push({ property_id: property.id, error: errorMsg });
            await logSync("contact", "to_ghl", "property", property.id, null, "failed", errorMsg);
          }
        }

        // Update last sync time on connection
        await supabase
          .from("ghl_connections")
          .update({ last_sync_at: new Date().toISOString() })
          .eq("user_id", userId);

        result = { success: true, synced, failed, errors, total: propsToSync?.length || 0 };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GHL Sync Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
