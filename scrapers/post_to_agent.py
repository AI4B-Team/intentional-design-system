"""
post_to_agent.py — Posts scraped leads to the agent-detect edge function.

Used by the Python scrapers as the final step after collecting leads.
This replaces direct Supabase REST calls with the edge function webhook,
which handles deduplication, signal insertion, and triggers grading.

Environment variables:
  SUPABASE_URL              — e.g. https://xyz.supabase.co
  SCRAPER_SECRET            — matches SCRAPER_SECRET in edge function env
  ORGANIZATION_ID           — your Real Elite org ID
"""

import os
from typing import Optional
import httpx
from supabase_client import ScrapedLead

SUPABASE_URL   = os.environ["SUPABASE_URL"].rstrip("/")
SCRAPER_SECRET = os.environ["SCRAPER_SECRET"]
ORG_ID         = os.environ.get("ORGANIZATION_ID", "")
EDGE_FN_URL    = f"{SUPABASE_URL}/functions/v1/agent-detect"


def post_leads_to_agent(
    leads: list[ScrapedLead],
    county: str,
    state: str,
    source_name: Optional[str] = None,
    org_id: Optional[str] = None,
) -> dict:
    """
    Post a batch of scraped leads to the agent-detect edge function.
    Returns the response from the edge function.
    """
    org = org_id or ORG_ID
    if not org:
        raise ValueError("ORGANIZATION_ID not set")

    # Convert ScrapedLead dataclasses to dicts
    leads_payload = []
    for lead in leads:
        leads_payload.append({
            "address":          lead.address,
            "city":             lead.city,
            "state":            lead.state,
            "zip_code":         lead.zip_code,
            "county":           lead.county,
            "signal_type":      lead.signal_type,
            "severity":         lead.severity,
            "confidence":       lead.confidence,
            "source_url":       lead.source_url,
            "detected_at":      lead.detected_at,
            "owner_name":       lead.owner_name,
            "mailing_address":  lead.mailing_address,
            "beds":             lead.beds,
            "baths":            lead.baths,
            "sqft":             lead.sqft,
            "year_built":       lead.year_built,
            "asset_class":      lead.asset_class,
            "estimated_value":  lead.estimated_value,
            "estimated_equity": lead.estimated_equity,
            "doc_number":       lead.doc_number,
            "filed_date":       lead.filed_date,
            "amount":           lead.amount,
            "extra":            lead.extra,
        })

    payload = {
        "organization_id": org,
        "leads":           leads_payload,
        "county":          county,
        "state":           state,
        "source_name":     source_name or f"{county.lower().replace(' ', '_')}_{state.lower()}",
    }

    with httpx.Client(timeout=60) as client:
        resp = client.post(
            EDGE_FN_URL,
            headers={
                "Content-Type": "application/json",
                "x-scraper-token": SCRAPER_SECRET,
            },
            json=payload,
        )

    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"agent-detect returned {resp.status_code}: {resp.text[:300]}"
        )

    return resp.json()


def report_scraper_health(
    county: str,
    state: str,
    status: str,  # "healthy" | "degraded" | "down"
    error: Optional[str] = None,
    org_id: Optional[str] = None,
) -> None:
    """Report scraper health without sending leads."""
    org = org_id or ORG_ID
    payload = {
        "organization_id": org,
        "county":          county,
        "state":           state,
        "status":          status,
        "source_name":     f"{county.lower().replace(' ', '_')}_{state.lower()}",
        "error":           error,
    }
    try:
        with httpx.Client(timeout=15) as client:
            client.post(
                EDGE_FN_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-scraper-token": SCRAPER_SECRET,
                },
                json=payload,
            )
    except Exception:
        pass  # Health reporting is non-critical
