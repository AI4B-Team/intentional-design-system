# Search + Leads — Phased Build Plan

You picked the full build. This spec is large (8 tables, 4 background agents, automation cadence, settings panel, engine health). I'll deliver it across phases so each step is reviewable and reversible. Existing D4D map (`/d4d`) and Marketplace map UIs will not be touched — SEARCH > Map will only link into them.

## What stays as-is
- Existing `harvest/*` pages (Overview, All Leads, Focus, Active Buyers, Outreach) — they become the LEADS section, just renamed/rerouted.
- D4D map at `/d4d` and Marketplace map — unchanged.
- Global top-nav search bar — keep current behavior, add deep-link to SEARCH > Lookup.

## Phase 1 — Database (one migration)
Create the unified data layer:
- `leads_properties` (canonical record, `source` = auto_detect | manual | d4d_pin | manual_scan)
- `leads_signals` (distress signals, type + detected_at + confidence)
- `leads_enrichment` (owner data, phones, emails)
- `leads_scores` (opportunity_score 0–100, computed by Grade agent)
- `leads_outreach_log` (campaign sends; sms/mail/call/email; queued/sent/delivered/failed)
- `leads_scan_jobs` (manual + scheduled scans, status + results)
- `leads_scraper_health` (per-source status for Engine Health admin view)
- `leads_pins` (D4D map pins from Search)
- `automation_settings` (per-org switches: auto_campaigns, auto_enrich_hot, daily_cap, etc.)

All organization-scoped, RLS-policied via `get_user_organization()` and `user_has_role()`. Indexes on (organization_id, created_at), source, score.

## Phase 2 — Routing + nav split
- New top-level routes: `/search` and `/leads` (LEADS replaces `/harvest`, with redirect from `/harvest/*`).
- `/search` tabs: Lookup, Map, AI Scan.
  - Lookup → existing PropertyDetail flow (address search → analysis).
  - Map → entry cards that route to `/d4d` and `/marketplace` (no map redesign).
  - AI Scan → form to launch a scan job; writes to `leads_scan_jobs`.
- `/leads` tabs: Today (default), Prospects. Prospects has Focus List + Active Buyers sub-views.
- Sidebar gets two clean entries: "Search" and "Leads". `/harvest` removed from sidebar but kept routable via redirect.

## Phase 3 — Hooks + data wiring (mock-fallback)
- `useLeadsToday`, `useLeadsProspects`, `useLeadsScores`, `useLeadOutreach`, `useScanJobs`, `useScraperHealth`, `useAutomationSettings`.
- Each hook reads real Supabase tables; if empty, falls back to existing harvest mock so UI never looks dead before agents run.

## Phase 4 — Background agents (edge functions)
- `agent-detect` — pulls/synthesizes signals, writes `leads_signals` + upserts `leads_properties`.
- `agent-validate` — runs enrichment via existing `skip-trace` + ATTOM where possible.
- `agent-grade` — computes `opportunity_score` (deterministic formula from spec) → `leads_scores`.
- `agent-oversight` — pings each scraper, writes `leads_scraper_health`.
- `auto-campaign-trigger` — when score ≥ threshold and `automation_settings.auto_campaigns` is on, creates `leads_outreach_log` row and dispatches via existing `lob-send-campaign` / Twilio.
- pg_cron schedule per spec cadence (every 2h / daily / weekly).

## Phase 5 — Settings
- `/settings/automation` — toggles: auto-detect, auto-enrich hot leads, auto-campaigns, daily cap, score threshold, suppression rules.
- `/settings/engine-health` (admin only) — already scaffolded; wire to `leads_scraper_health`.

## Phase 6 — Polish
- LeadDetailModal upgraded to show signals, score, enrichment, outreach history.
- Manual lead-add form writing `source='manual'`.
- Delivery: per-phase commits so you can stop after any phase.

---

## Technical notes (skip if not relevant)
- Score formula (from spec): weighted blend of signal severity, equity, days-since-detected decay, enrichment completeness — clamped 0–100. HOT > 80, Warm 60–80, Cold < 60.
- Auto-campaign quality gates: score ≥ threshold, valid contact data present, not in `suppression_list`, daily cap not hit, lead not already contacted within cooldown.
- Cadence (cron):
  ```text
  detect (pre-foreclosure, tax, code)  every 2h
  detect (probate, divorce, eviction)  daily 03:00
  validate (enrich hot leads)          every 30m
  grade                                after each detect/validate run
  oversight                            every 15m
  ```
- All edge functions use Lovable AI Gateway where AI is needed (no extra keys).
- Existing tables (`properties`, `cash_buyers`, `unified_actions`, `suppression_list`) will be referenced, not duplicated. `leads_properties` links to `properties` via `property_id` when a property already exists.

---

## What I'll do next if you approve
Start with **Phase 1 (migration)**. After it's applied I'll continue straight into Phase 2 (routing) in the same loop. Phases 4+ will be follow-up messages so each agent can be reviewed independently.

Reply with anything you want changed — otherwise I'll kick off Phase 1.