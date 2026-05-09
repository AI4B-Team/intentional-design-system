# HARVEST — Autonomous Lead Engine

A new top-level section in the Real Elite sidebar (between Pipeline and Mail) that scrapes public distress records every 2 hours, scores leads, and triggers outreach. The spec is 21 pages with 4+ pages, 4 Supabase tables, an agent pipeline, auto-trigger logic, and an oversight agent.

Because this is large, I'll build it in two phases. Phase 1 is the **full UI scaffolding with mock data** so you can click through every screen immediately. Phase 2 wires up the backend.

## Phase 1 — UI Scaffolding (this round)

### Navigation
- Add **HARVEST** sidebar entry between Pipeline and Mail with sub-tabs: Overview · Leads · Outreach
- Leads tab has nested tabs: All Leads · Focus List · Active Buyers
- Outreach tab has nested tabs: Enrich · Mail · Sync
- **Engine Health** lives only under Account/Settings (Feed Health · Deal Map · Agent Pipeline · Data Quality)

### Pages built
1. `/harvest` → **Overview Dashboard** — greeting bar, primary "new leads" stat with CTA, 6 pipeline counters, 8 signal-type pills, 30-day trend chart (recharts), 4 quick-stat cards, integration status grid, live ticker
2. `/harvest/leads` → **All Leads** table with collapsible filter bar, score badges (Hot/Warm/Watch/Archive), distress bar, lead detail slide-over modal with Property/Owner/Score/Signals tabs
3. `/harvest/leads/focus` → **Focus List** (top-ranked, daily resort)
4. `/harvest/leads/buyers` → **Active Buyers** sub-view
5. `/harvest/outreach` → **Outreach** with Enrich/Mail/Sync sub-tabs and sync log
6. `/settings/engine-health` → **Engine Health** oversight page (Feed Health · Deal Map · Agent Pipeline · Data Quality)

### Naming (strict — no borrowed terms)
- HARVEST (not "Lead Forge"), Opportunity Score (0–100), Focus List, Confidence Score, Detect/Validate/Grade pipeline stages, Deal Map, Feed Health, Active Buyers, Outreach, Enrich, Sync, Engine Health
- 8 signal types: Notice of Default · Estate Filing · Dissolution Record · Debt Recording · Tax Default · Property Citation · Vacancy Signal · Stale Listing
- Score tiers: Hot 80–100 (red) · Warm 60–79 (orange) · Watch 40–59 (yellow) · Archive 0–39 (gray)

### Design
- Lighter than competitor: single hero stat, filters collapsed by default, score = badge + number (no inline bar charts), small muted pills for signals, modal for detail (not full-page nav)
- Stick to existing **emerald + warm white** semantic tokens — no navy/cyan overhaul
- Mobile: collapse to priority columns

### Files (Phase 1)
```
src/types/harvest.ts                          // SignalType, Lead, FocusItem, OverviewStats types
src/hooks/useHarvestStats.ts                  // returns mock data for now
src/hooks/useHarvestLeads.ts                  // mock list + filters
src/pages/harvest/HarvestLayout.tsx           // sub-tab shell
src/pages/harvest/HarvestOverview.tsx
src/pages/harvest/HarvestLeads.tsx            // wraps All / Focus / Buyers
src/pages/harvest/HarvestOutreach.tsx         // Enrich / Mail / Sync sub-tabs
src/pages/settings/EngineHealth.tsx
src/components/harvest/ScoreBadge.tsx
src/components/harvest/SignalPill.tsx
src/components/harvest/LeadDetailModal.tsx
src/components/harvest/LiveFeedTicker.tsx
src/components/harvest/IntegrationStatusGrid.tsx
```
- Routes added in `src/App.tsx` (lazy-loaded)
- Sidebar entry added with the existing nav pattern

## Phase 2 — Backend (next round, after you approve Phase 1)

- Supabase migrations: `harvest_properties`, `harvest_signals`, `harvest_enrichment`, `harvest_scores`, `harvest_integrations`, `harvest_runs` with RLS scoped to org
- Edge functions: `harvest-detect` (scrape), `harvest-validate`, `harvest-grade`, `harvest-auto-trigger` (new lead → instant action), `harvest-engine-health`
- Cron: every 2 hours
- Replace mock hooks with real Supabase queries
- Auto-trigger logic per spec §11 (Hot lead → enrich → mail/sync → daily-cap queue)

## Out of scope for this round
- Real scraper scripts and county adapters (Phase 2)
- Telegram broadcast (marked "future" in spec)
- Self-healing scraper repair loop (Phase 2)

After Phase 1 you'll be able to click through every HARVEST screen with realistic mock data. Approve and I'll ship it.
