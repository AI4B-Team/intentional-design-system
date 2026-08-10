import { supabase } from "@/integrations/supabase/client";
import type { HubEventType } from "@/lib/hubEvents";
import { getActiveOrganizationId } from "@/lib/activeOrganization";

/**
 * Fire-and-forget outbound App Family event from the hub UI.
 * Never throws — event delivery must not block the user's action.
 */
export async function emitHubEvent(
  eventType: HubEventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("hub-emit-event", {
      body: { event_type: eventType, payload, organization_id: getActiveOrganizationId() },
    });
    if (error) console.warn("[hub-emit-event]", eventType, error.message);
  } catch (e) {
    console.warn("[hub-emit-event]", eventType, e);
  }
}
