/**
 * Inbound App Family event handlers.
 *
 * Satellite apps POST events to hub-events-ingest. Storing them is not enough —
 * these handlers project the meaningful ones onto real hub records so operators
 * see satellite activity inside Real Elite without extra sync jobs.
 *
 * Every handler is best-effort and never throws: ingest must still 200 so the
 * satellite does not retry forever on a projection bug.
 */

// deno-lint-ignore no-explicit-any
type Admin = any;

interface IncomingEvent {
  id?: string;
  event_type: string;
  payload?: Record<string, any>;
}

export interface HandlerResult {
  event_type: string;
  action: string;
}

/** Resolve a user to own rows created from satellite events (org owner first). */
async function resolveOwnerUserId(admin: Admin, orgId: string): Promise<string | null> {
  const { data } = await admin
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", orgId);
  if (!data?.length) return null;
  const byRole = (r: string) => data.find((m: any) => m.role === r)?.user_id;
  return byRole("owner") ?? byRole("admin") ?? data[0].user_id ?? null;
}

export async function applyIncomingEvents(
  admin: Admin,
  orgId: string,
  appSlug: string,
  events: IncomingEvent[],
): Promise<HandlerResult[]> {
  const results: HandlerResult[] = [];
  let ownerUserId: string | null | undefined;
  const owner = async () => {
    if (ownerUserId === undefined) ownerUserId = await resolveOwnerUserId(admin, orgId);
    return ownerUserId;
  };

  for (const evt of events) {
    try {
      const p = evt.payload ?? {};
      switch (evt.event_type) {
        case "leads.new": {
          const userId = await owner();
          if (!userId) {
            results.push({ event_type: evt.event_type, action: "skipped:no_owner" });
            break;
          }
          const leads: any[] = Array.isArray(p.leads) ? p.leads : [p];
          let created = 0;
          for (const lead of leads.slice(0, 100)) {
            const address = lead.property_address ?? lead.address;
            if (!address) continue;
            const phone = normalizePhone(lead.phone);

            if (phone) {
              const { data: dupe } = await admin
                .from("seller_leads")
                .select("id")
                .eq("organization_id", orgId)
                .eq("phone", phone)
                .maybeSingle();
              if (dupe) continue;
            }

            const { error } = await admin.from("seller_leads").insert({
              user_id: userId,
              organization_id: orgId,
              property_address: String(address).slice(0, 300),
              property_city: lead.city ?? lead.property_city ?? null,
              property_state: lead.state ?? lead.property_state ?? null,
              property_zip: lead.zip ?? lead.property_zip ?? null,
              full_name: lead.name ?? lead.full_name ?? null,
              first_name: lead.first_name ?? null,
              last_name: lead.last_name ?? null,
              phone,
              email: lead.email ?? null,
              notes: lead.notes ?? null,
              how_heard: `App Family: ${appSlug}`,
              source_url: lead.source_url ?? null,
              status: "new",
            });
            if (!error) created++;
          }
          results.push({ event_type: evt.event_type, action: `seller_leads:+${created}` });
          break;
        }

        case "lead.flagged_dnc":
        case "lead.flagged_litigator": {
          const userId = await owner();
          const address = p.property_address ?? p.address;
          const phone = normalizePhone(p.phone ?? p.phone_number ?? p.contact_phone);
          if (!userId || (!address && !phone)) {
            results.push({ event_type: evt.event_type, action: "skipped:incomplete" });
            break;
          }
          const reason = evt.event_type === "lead.flagged_dnc" ? "dnc" : "litigator";
          const actions: string[] = [];

          if (address) {
            const normalized = String(address).trim().toLowerCase().replace(/\s+/g, " ");
            const hash = await sha256Hex(normalized);
            const { error } = await admin.from("suppression_list").upsert(
              {
                user_id: userId,
                organization_id: orgId,
                address: String(address).slice(0, 300),
                normalized_address: normalized,
                address_hash: hash,
                city: p.city ?? null,
                state: p.state ?? null,
                zip: p.zip ?? null,
                reason,
                reason_notes: p.notes ?? `Flagged by ${appSlug}`,
                source: appSlug,
                source_reference_id: evt.id ?? null,
              },
              { onConflict: "user_id,address_hash", ignoreDuplicates: true },
            );
            actions.push(error ? "suppression_error" : "suppression_list:+1");
          }

          if (phone) {
            // Stop the dialer from ever calling this number again.
            const { data: stopped } = await admin
              .from("call_queue_contacts")
              .update({
                status: "dnc",
                updated_at: new Date().toISOString(),
              })
              .eq("organization_id", orgId)
              .in("status", ["pending", "in_progress"])
              .or(`phone_number.eq.${phone},phone_number.eq.+1${phone}`)
              .select("id");
            actions.push(`queue_dnc:${stopped?.length ?? 0}`);

            const { data: flagged } = await admin
              .from("properties")
              .update({ phone_dnc: true })
              .eq("organization_id", orgId)
              .eq("owner_phone", phone)
              .select("id");
            actions.push(`properties_dnc:${flagged?.length ?? 0}`);
          }

          results.push({ event_type: evt.event_type, action: actions.join(" ") });
          break;
        }

        case "message.reply_received": {
          const userId = await owner();
          if (!userId) {
            results.push({ event_type: evt.event_type, action: "skipped:no_owner" });
            break;
          }
          const { error } = await admin.from("inbox_messages").insert({
            user_id: userId,
            organization_id: orgId,
            channel: String(p.channel ?? "sms").slice(0, 30),
            direction: "inbound",
            body: p.body ?? p.message ?? null,
            subject: p.subject ?? null,
            contact_name: p.contact_name ?? p.name ?? null,
            contact_phone: normalizePhone(p.contact_phone ?? p.phone),
            contact_email: p.contact_email ?? p.email ?? null,
            contact_type: p.contact_type ?? "seller",
            external_id: evt.id ?? null,
            thread_id: p.thread_id ?? null,
            metadata: { source_app: appSlug, ...(p.metadata ?? {}) },
          });
          results.push({
            event_type: evt.event_type,
            action: error ? "inbox_error" : "inbox_messages:+1",
          });
          break;
        }

        case "job.completed": {
          const label = p.job_type ?? p.type ?? "Background Job";
          const n = await notifyOrg(admin, orgId, {
            type: "app_family",
            title: `${titleCase(String(label))} Completed`,
            message: [p.summary ?? p.message, p.count != null ? `${p.count} records` : null]
              .filter(Boolean)
              .join(" · ") || `Finished in ${appSlug}.`,
            link: "/settings/app-family",
          });
          results.push({ event_type: evt.event_type, action: `notifications:+${n}` });
          break;
        }

        case "campaign.launched": {
          const n = await notifyOrg(admin, orgId, {
            type: "app_family",
            title: "Campaign Launched",
            message: [p.campaign_name ?? p.name, p.channel, p.recipient_count != null ? `${p.recipient_count} recipients` : null]
              .filter(Boolean)
              .join(" · ") || `A campaign went out from ${appSlug}.`,
            link: "/settings/app-family",
          });
          results.push({ event_type: evt.event_type, action: `notifications:+${n}` });
          break;
        }

        case "brand.approved": {
          const n = await notifyOrg(admin, orgId, {
            type: "app_family",
            title: "Brand Assets Approved",
            message: [p.brand_name ?? p.name, p.notes].filter(Boolean).join(" · ") ||
              `Brand assets were approved in ${appSlug}.`,
            link: "/settings/app-family",
          });
          results.push({ event_type: evt.event_type, action: `notifications:+${n}` });
          break;
        }

        case "credits.low": {
          const remaining = p.remaining ?? p.balance ?? p.credits;
          const n = await notifyOrg(admin, orgId, {
            type: "app_family",
            title: "Credits Running Low",
            message: remaining != null
              ? `${remaining} credits remaining in ${appSlug}.`
              : `Credit balance is low in ${appSlug}.`,
            link: "/settings/billing",
          });
          results.push({ event_type: evt.event_type, action: `notifications:+${n}` });
          break;
        }

        default:
          results.push({ event_type: evt.event_type, action: "stored" });
      }

    } catch (e) {
      console.error("[hub-handlers]", evt.event_type, e);
      results.push({ event_type: evt.event_type, action: "error" });
    }
  }

  return results;
}

function normalizePhone(value: unknown): string | null {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits.slice(0, 15);
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Fan a notification out to every member of the org. Returns rows created. */
async function notifyOrg(
  admin: Admin,
  orgId: string,
  notification: { type: string; title: string; message: string; link: string },
): Promise<number> {
  const { data: members } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId);
  if (!members?.length) return 0;
  const rows = members.map((m: any) => ({
    user_id: m.user_id,
    organization_id: orgId,
    type: notification.type,
    title: notification.title.slice(0, 200),
    message: notification.message.slice(0, 500),
    link: notification.link,
  }));
  const { error } = await admin.from("notifications").insert(rows);
  return error ? 0 : rows.length;
}


async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
