
# Leads v2.1 — Phased Build Plan

The spec is 22 pages and spans schema, edge functions, 3 tab UIs, automation, and team handoff. I'll deliver it in 5 reviewable phases so we can validate each before moving on. After each phase you'll see a working preview and can redirect.

---

## Phase 1 — Foundation (no UI risk)

**1A. Shared constants** — `src/lib/lead-constants.ts`
Single source for `STATUS_OPTIONS`, `TIER_THRESHOLDS` (hot >80, warm 60–80, cold <60), `SOURCE_OPTIONS`, `SCORE_BREAKDOWN_KEYS`, `SIGNAL_TYPES`, `CAMPAIGN_TYPES`. Replace duplicated copies in the 3 files currently holding their own.

**1B. Three remaining bugs** (section 03 of spec) — I'll read the spec's bug table next and patch in this same phase.

**Deliverable:** lower line counts, dedupe, bugs gone. No visual change beyond bug fixes.

---

## Phase 2 — Schema additions

Two new domains the spec calls out as "not yet in schema":

- **Sequences** (`lead_sequences`, `lead_sequence_steps`, `lead_sequence_enrollments`) — for Automation Studio
- **Team handoff** (`lead_assignments`, `lead_team_notifications`, plus a `team_member_capabilities` lookup) — for Human-in-the-Loop

All with `organization_id`, RLS via `is_org_member`, validation triggers (no CHECK on time-based rules per project rules).

Migration is presented for your approval before any UI is wired to it.

---

## Phase 3 — Today + Prospects + Sources tabs (UI rebuild)

Rebuilds against the **live** tables (`leads_properties`, `leads_signals`, `leads_scores`, `leads_enrichment`, `leads_outreach_log`, `leads_scraper_health`).

- **Today** (section 06): signal stream, lead cards with tier chip, bulk-action bar (Approve All / Skip / Enrich / Move to Pipeline), empty state, "Change action" mini-menu.
- **Prospects** (section 07): filters (status, tier, source, assigned-to, date), table with score + score-breakdown popover.
- **Sources** (section 08): 7 source health rows from `leads_scraper_health`, last-success timestamps, manual re-ping button → `agent-oversight`.
- **Lead Detail Sheet** (section 09): signals timeline, enrichment block, outreach history, "Open in Pipeline" when promoted.

Shared bits: tier helpers + score-breakdown component reused across tabs.

---

## Phase 4 — Automation surfaces

- **Automation Settings UI** (section 10) wired to existing `automation_settings` table — exposed in 3 places: header gear, Settings → Leads → Automation, SetupHub onboarding card. One save button, upsert on `organization_id`.
- **Automation Studio** (section 11): multi-step sequence builder reading the Phase-2 sequence tables. Drag-orderable steps (SMS / Mail / Call / Email / Wait / Human Task), enroll-from-tier rules.

---

## Phase 5 — Human-in-the-loop + edge functions

- **Team assignment + notifications** (section 12) — `lead_assignments` UI on Lead Detail Sheet + Prospects bulk action; in-app notifications via existing `notifications` table.
- **Two new edge functions:**
  - `sequence-runner` — advances enrollments through steps, queues `leads_outreach_log` entries.
  - `team-notify` — fan-out to `notifications` when a step needs a human.

---

## Technical notes

- All UI files cap at ~500 lines (per project memory) — Today/Prospects/Sources main views will extract sub-components.
- All colors via semantic tokens; tier chips: hot = `bg-destructive/10 text-destructive`, warm = `bg-amber-500/10 text-amber-700`, cold = `bg-muted text-muted-foreground`.
- Realtime: Today tab subscribes to `leads_signals` + `leads_scores` via existing supabase realtime channel pattern.
- No changes to `agent-grade`, `agent-validate`, `agent-oversight`, `auto-campaign-trigger` — they're already deployed and the UI binds to their outputs.

---

## What I need from you

1. **Approve this phased order**, or tell me to reorder / cut a phase.
2. After approval, I'll execute Phase 1 immediately (no DB changes — safe to ship). Phase 2 will pause for migration approval.

Sound good, or do you want to compress phases / change the order?
