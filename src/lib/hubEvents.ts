/**
 * Canonical App Family event catalog (mirrors HUB_EVENT_TYPES in
 * supabase/functions/_shared/hub.ts). Used for webhook subscriptions,
 * activity filters, and the integration guide.
 */
export const HUB_EVENT_CATALOG = [
  { type: "leads.new", label: "New Lead", description: "A new lead entered the hub or a satellite app." },
  { type: "lead.flagged_dnc", label: "Lead Flagged DNC", description: "A phone number was marked Do Not Call." },
  { type: "lead.flagged_litigator", label: "Lead Flagged Litigator", description: "A number was flagged as a known litigator." },
  { type: "job.completed", label: "Job Completed", description: "A background job (list upload, enrichment) finished." },
  { type: "campaign.launched", label: "Campaign Launched", description: "A direct mail or outreach campaign went out." },
  { type: "message.reply_received", label: "Reply Received", description: "An inbound reply arrived on a conversation." },
  { type: "brand.approved", label: "Brand Approved", description: "Brand assets were approved for use." },
  { type: "credits.low", label: "Credits Low", description: "The organization's credit balance is running low." },
  { type: "hub.test", label: "Test Event", description: "Manual test event sent from settings." },
] as const;

export type HubEventType = (typeof HUB_EVENT_CATALOG)[number]["type"];

export const HUB_EVENT_TYPES = HUB_EVENT_CATALOG.map((e) => e.type);

export function hubEventLabel(type: string): string {
  return HUB_EVENT_CATALOG.find((e) => e.type === type)?.label ?? type;
}
