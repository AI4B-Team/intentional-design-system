"""
run.py — Main scraper runner.

Usage:
  # Run all daily counties
  python run.py

  # Run a specific county
  python run.py --county harris --state TX

  # Run a specific state
  python run.py --state TX

  # Run specific signal types only
  python run.py --signals foreclosure,delinquent_tax

  # Dry run (no Supabase writes)
  python run.py --dry-run

Environment variables required:
  SUPABASE_URL              — e.g. https://xyz.supabase.co
  SUPABASE_SERVICE_ROLE_KEY — service role key (NOT anon key)
  ORGANIZATION_ID           — your Real Elite org ID (optional if only one org)
"""

import argparse
import importlib
import os
import sys
import time
import traceback
from datetime import datetime
from typing import Optional

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.table import Table

from counties.registry import (
    ALL_COUNTIES,
    COUNTIES,
    CountyConfig,
    TOTAL_COUNTIES,
    TOTAL_IMPLEMENTED,
    get_counties_by_cadence,
    get_county,
    get_counties_by_state,
)
from supabase_client import (
    ScrapedLead,
    complete_scan_job,
    insert_scan_job,
    push_leads,
    upsert_scraper_health,
)

console = Console()


def load_scraper_class(config: CountyConfig):
    """Dynamically load a scraper class from its module path."""
    try:
        module = importlib.import_module(config.scraper_module)
        return getattr(module, config.scraper_class)
    except (ImportError, AttributeError) as e:
        console.print(f"[red]Could not load {config.scraper_class}: {e}[/red]")
        return None


def run_county(
    config: CountyConfig,
    org_id: str,
    signal_types: Optional[list[str]] = None,
    dry_run: bool = False,
) -> dict:
    """Run all scrapers for a single county. Returns stats."""
    start = time.time()
    stats = {
        "county": config.county,
        "state": config.state,
        "leads_found": 0,
        "leads_pushed": 0,
        "errors": 0,
        "duration_sec": 0,
        "status": "healthy",
    }

    ScraperClass = load_scraper_class(config)
    if not ScraperClass:
        stats["status"] = "down"
        stats["errors"] = 1
        return stats

    job_id = None
    if not dry_run:
        job_id = insert_scan_job(
            org_id,
            signal_types or config.signal_types,
            config.county,
            config.state,
        )

    try:
        scraper = ScraperClass(org_id=org_id)
        leads = scraper.run(signal_types=signal_types)
        stats["leads_found"] = len(leads)

        if leads and not dry_run:
            push_stats = push_leads(org_id, leads)
            stats["leads_pushed"] = push_stats["signals_added"]
            stats["errors"] += push_stats["errors"]

        elif leads and dry_run:
            console.print(f"  [dim][DRY RUN] Would push {len(leads)} leads[/dim]")
            for lead in leads[:3]:
                console.print(f"    • {lead.address}, {lead.city} {lead.state} — {lead.signal_type}")

        stats["status"] = "healthy"

    except Exception as e:
        stats["status"] = "degraded"
        stats["errors"] += 1
        stats["error_message"] = str(e)
        console.print(f"[red]  Error in {config.county}/{config.state}: {e}[/red]")
        traceback.print_exc()

    finally:
        stats["duration_sec"] = round(time.time() - start, 1)

        if not dry_run:
            upsert_scraper_health(
                org_id=org_id,
                source_name=f"{config.county.lower().replace(' ', '_')}_{config.state.lower()}",
                status=stats["status"],
                records_count=stats["leads_found"],
                failure_reason=stats.get("error_message"),
                metadata={
                    "county": config.county,
                    "state": config.state,
                    "fips": config.fips,
                    "duration_sec": stats["duration_sec"],
                },
            )
            if job_id:
                complete_scan_job(
                    job_id,
                    stats["leads_found"],
                    stats.get("error_message"),
                )

    return stats


def main():
    parser = argparse.ArgumentParser(description="Real Elite County Scraper")
    parser.add_argument("--county", help="Run a specific county (e.g. harris)")
    parser.add_argument("--state", help="Run all counties in a state (e.g. TX)")
    parser.add_argument("--priority", type=int, default=3,
                        help="Max priority to run (1=highest, 5=lowest). Default: 3")
    parser.add_argument("--cadence", type=int, default=24,
                        help="Run counties with cadence <= N hours. Default: 24")
    parser.add_argument("--signals", help="Comma-separated signal types to scrape")
    parser.add_argument("--org", help="Organization ID (overrides ORGANIZATION_ID env var)")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to Supabase")
    parser.add_argument("--list-counties", action="store_true",
                        help="List all supported counties and exit")
    args = parser.parse_args()

    # List counties mode
    if args.list_counties:
        table = Table(title=f"Supported Counties ({len(COUNTIES)} total)")
        table.add_column("State"); table.add_column("County")
        table.add_column("Priority"); table.add_column("Cadence")
        table.add_column("Signal Types")
        for c in sorted(COUNTIES, key=lambda x: (x.state, x.county)):
            table.add_row(
                c.state, c.county, str(c.priority),
                f"{c.cadence_hours}h",
                ", ".join(c.signal_types[:3]) + ("..." if len(c.signal_types) > 3 else ""),
            )
        console.print(table)
        return

    # Validate env
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not args.dry_run and (not supabase_url or not supabase_key):
        console.print("[red]ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.[/red]")
        console.print("Use --dry-run to test without Supabase credentials.")
        sys.exit(1)

    org_id = args.org or os.environ.get("ORGANIZATION_ID", "")
    if not args.dry_run and not org_id:
        console.print("[red]ERROR: ORGANIZATION_ID required (--org or env var).[/red]")
        sys.exit(1)

    signal_types = [s.strip() for s in args.signals.split(",")] if args.signals else None

    # Determine which counties to run
    if args.county and args.state:
        configs = [get_county(args.state, args.county)]
        configs = [c for c in configs if c]
    elif args.state:
        configs = get_counties_by_state(args.state)
    else:
        configs = get_counties_by_cadence(args.cadence)
        configs = [c for c in configs if c.priority <= args.priority]

    if not configs:
        console.print("[yellow]No counties matched the given filters.[/yellow]")
        return

    # Run
    console.print(f"\n[bold green]Real Elite County Scraper[/bold green]")
    console.print(f"[dim]{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}[/dim]")
    console.print(f"Running [bold]{len(configs)}[/bold] counties"
                  + (" [dim](DRY RUN)[/dim]" if args.dry_run else ""))
    console.print()

    all_stats = []
    total_leads = 0

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console,
    ) as progress:
        task = progress.add_task("Scraping counties...", total=len(configs))

        for config in configs:
            progress.update(task,
                            description=f"[cyan]{config.county}, {config.state}[/cyan]")
            stats = run_county(config, org_id, signal_types, args.dry_run)
            all_stats.append(stats)
            total_leads += stats["leads_found"]
            progress.advance(task)

    # Summary table
    console.print()
    summary = Table(title="Scrape Summary")
    summary.add_column("County"); summary.add_column("State")
    summary.add_column("Found"); summary.add_column("Pushed")
    summary.add_column("Duration"); summary.add_column("Status")

    for s in all_stats:
        status_color = "green" if s["status"] == "healthy" else "red"
        summary.add_row(
            s["county"], s["state"],
            str(s["leads_found"]), str(s["leads_pushed"]),
            f"{s['duration_sec']}s",
            f"[{status_color}]{s['status']}[/{status_color}]",
        )

    console.print(summary)
    console.print(f"\n[bold]Total leads found: {total_leads}[/bold]")
    console.print("[dim]Scores computed by agent-grade edge function after insert.[/dim]\n")


if __name__ == "__main__":
    main()
