# Real Elite — County Scraper System

Automated daily scraping of public county records for motivated seller leads.
Integrates directly with Real Elite's lead engine via the `agent-detect` edge function.

## Architecture

```
GitHub Actions (cron 3am daily)
    └── Python + Playwright scrapers
         └── POST to agent-detect edge function
              └── leads_properties + leads_signals tables
                   └── agent-grade scores them
                        └── auto-campaign-trigger fires outreach
                             └── Leads > Today tab (Real Elite UI)
```

## Supported Counties (44 total)

| State | Counties |
|-------|----------|
| TX | Harris (Houston), Dallas, Tarrant (FW), Bexar (SA), Travis (Austin), Collin, Denton |
| AZ | Maricopa (Phoenix), Pima (Tucson) |
| FL | Miami-Dade, Broward, Palm Beach, Hillsborough (Tampa), Orange (Orlando), Duval (Jacksonville), Pinellas |
| IL | Cook (Chicago) |
| CA | Los Angeles, San Diego, Riverside, San Bernardino, Sacramento |
| GA | Fulton (Atlanta), Gwinnett, Cobb |
| NC | Mecklenburg (Charlotte), Wake (Raleigh) |
| NV | Clark (Las Vegas) |
| OH | Cuyahoga (Cleveland), Franklin (Columbus), Hamilton (Cincinnati), Summit, Montgomery |
| TN | Shelby (Memphis), Davidson (Nashville) |
| MI | Wayne (Detroit), Oakland |
| PA | Philadelphia, Allegheny (Pittsburgh) |
| WA | King (Seattle) |
| CO | Denver, El Paso (Colorado Springs) |
| IN | Marion (Indianapolis) |
| MN | Hennepin (Minneapolis) |
| VA | Fairfax |

## Signal Types Scraped

| Signal | Cadence | Source |
|--------|---------|--------|
| Foreclosure / Trustee Sale | Daily | County District Clerk |
| Lis Pendens | Daily | County Clerk |
| Notice of Default | Daily | County Recorder |
| Tax Delinquency | Daily | County Tax Office |
| Probate / Estate Filing | Weekly | Probate Court |
| Liens & Judgments | Weekly | County Recorder |
| Code Violations | Weekly | City Open Data API |
| Vacancy / Abandoned | Weekly | City Open Data API |
| Divorce Filings | Weekly | County Clerk |

## Setup

### 1. Add GitHub Secrets

In your GitHub repo → Settings → Secrets → Actions:

```
SUPABASE_URL              = https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
ORGANIZATION_ID           = your_real_elite_org_uuid
SCRAPER_SECRET            = any_random_secret_string_32chars
```

### 2. Deploy Updated agent-detect Edge Function

```bash
# Copy the updated function
cp scrapers/agent-detect-updated/index.ts supabase/functions/agent-detect/index.ts

# Deploy
supabase functions deploy agent-detect
```

### 3. Add SCRAPER_SECRET to Supabase Edge Function Secrets

In Supabase Dashboard → Edge Functions → agent-detect → Secrets:
```
SCRAPER_SECRET = same_value_as_github_secret
```

### 4. Test Locally

```bash
cd scrapers
pip install -r requirements.txt
python -m playwright install chromium

# Dry run (no Supabase writes)
python run.py --county harris --state TX --dry-run

# List all supported counties
python run.py --list-counties

# Run specific state
python run.py --state TX --dry-run

# Run everything (priority 1-2)
python run.py --priority 2 --dry-run
```

### 5. Enable GitHub Actions

The workflows are in `.github/workflows/`:
- `scrape-daily.yml` — runs 3am CDT, priority 1-2 counties
- `scrape-weekly.yml` — runs Sunday 2am CDT, all counties

Push to GitHub and they'll activate automatically.

You can also trigger manually:
1. GitHub repo → Actions → "Scrape County Records — Daily"
2. Click "Run workflow"
3. Optionally specify state/county

## Adding a New County

1. Find the county's public records website
2. Create `scrapers/counties/{state}/{county_name}.py`
3. Inherit from `BaseScraper`
4. Implement `scrape_foreclosures()`, `scrape_tax_delinquent()`, etc.
5. Add a `CountyConfig` entry to `counties/registry.py`

### Template

```python
from base_scraper import BaseScraper
from config import SignalType, Severity
from supabase_client import ScrapedLead
from playwright.sync_api import Page
from typing import Iterator

class YourCountyScraper(BaseScraper):
    county = "YourCounty"
    state  = "XX"
    fips   = "XXXXX"

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        page.goto("https://your-county-clerk-website.gov/foreclosures")
        page.wait_for_load_state("networkidle")
        
        rows = page.locator("table tr").all()
        for row in rows[1:]:
            # Parse each row
            address = # extract from row
            yield self.make_lead(
                address=address,
                city="YourCity",
                state="XX",
                zip_code="XXXXX",
                signal_type=SignalType.FORECLOSURE,
                severity=Severity.CRITICAL,
            )
```

## How It Connects to Real Elite

When leads are scraped:
1. `agent-detect` upserts them into `leads_properties` + `leads_signals`
2. `agent-grade` scores them (runs automatically after detect)
3. Hot leads (score > 80) trigger `auto-campaign-trigger` if enabled
4. Leads appear in **Leads > Today** tab immediately via Supabase Realtime

The scraper system replaces the synthetic data in the original `agent-detect`
while maintaining full compatibility with the scoring, enrichment, and campaign
trigger pipeline already deployed.

## Oversight + Self-Healing

When a county site's HTML structure changes:
1. Scraper raises `ScraperStructureChanged` exception
2. `agent-detect` records status as `degraded` in `leads_scraper_health`
3. Real Elite UI shows orange status badge in Sources tab
4. TODO: Wire `agent-oversight` to call Claude API to rewrite the selector

The `leads_scraper_health` table is updated after every run, so the
Sources tab in Real Elite always shows accurate health status.
