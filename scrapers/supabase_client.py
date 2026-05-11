"""
supabase_client.py — Posts scraped leads directly to Real Elite's
Supabase tables via REST API. Matches the live schema from migration
20260509035937 exactly.

Tables written:
  leads_properties    — one row per unique address (upsert on address_hash)
  leads_signals       — one row per signal event
  leads_scraper_health— upsert per (organization_id, source_name)
"""

import hashlib
import os
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional

import httpx

SUPABASE_URL       = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY       = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ORGANIZATION_ID    = os.environ.get("ORGANIZATION_ID", "")   # optional override


# ── Data models ──────────────────────────────────────────────────────────

@dataclass
class ScrapedLead:
    address:           str
    city:              str
    state:             str
    zip_code:          str
    county:            str
    signal_type:       str
    severity:          str           # low | medium | high | critical
    confidence:        float = 0.85
    source:            str = "auto_detect"
    source_url:        Optional[str] = None
    detected_at:       Optional[str] = None   # ISO date string
    # Property detail (optional enrichment)
    owner_name:        Optional[str] = None
    mailing_address:   Optional[str] = None
    beds:              Optional[int] = None
    baths:             Optional[float] = None
    sqft:              Optional[int] = None
    year_built:        Optional[int] = None
    asset_class:       Optional[str] = None
    estimated_value:   Optional[float] = None
    estimated_equity:  Optional[float] = None
    # Raw document reference
    doc_number:        Optional[str] = None
    filed_date:        Optional[str] = None
    amount:            Optional[float] = None
    extra:             dict = field(default_factory=dict)


# ── Address normalization + hashing ──────────────────────────────────────

def normalize_address(address: str, city: str, state: str, zip_code: str) -> str:
    """Produces a canonical lowercase string for hashing."""
    parts = [address.strip().lower(), city.strip().lower(),
             state.strip().upper(), zip_code.strip()[:5]]
    clean = re.sub(r"\s+", " ", " ".join(p for p in parts if p))
    # Abbreviate common street suffixes for consistency
    replacements = {
        " street": " st", " avenue": " ave", " boulevard": " blvd",
        " drive": " dr", " court": " ct", " lane": " ln",
        " road": " rd", " place": " pl", " circle": " cir",
    }
    for long, short in replacements.items():
        clean = clean.replace(long, short)
    return clean


def address_hash(address: str, city: str, state: str, zip_code: str) -> str:
    canonical = normalize_address(address, city, state, zip_code)
    return hashlib.sha256(canonical.encode()).hexdigest()[:32]


# ── REST helpers ──────────────────────────────────────────────────────────

def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _url(table: str) -> str:
    return f"{SUPABASE_URL}/rest/v1/{table}"


# ── Core write operations ─────────────────────────────────────────────────

def upsert_lead_property(
    org_id: str,
    lead: ScrapedLead,
    ahash: str,
) -> Optional[str]:
    """
    Upsert a row in leads_properties. Returns the lead_property_id.
    Uses onConflict on (organization_id, address_hash).
    """
    payload = {
        "organization_id": org_id,
        "source": lead.source,
        "address": lead.address,
        "city": lead.city,
        "state": lead.state,
        "zip": lead.zip_code,
        "county": lead.county,
        "address_hash": ahash,
        "status": "new",
        "detected_at": lead.detected_at or datetime.utcnow().isoformat(),
    }
    # Add optional property fields if present
    for attr in ("beds", "baths", "sqft", "year_built", "asset_class",
                 "estimated_value", "estimated_equity"):
        v = getattr(lead, attr)
        if v is not None:
            payload[attr] = v

    with httpx.Client(timeout=15) as client:
        resp = client.post(
            _url("leads_properties"),
            headers={**_headers(), "Prefer": "resolution=merge-duplicates,return=representation"},
            params={"on_conflict": "organization_id,address_hash"},
            json=payload,
        )
        if resp.status_code not in (200, 201):
            print(f"[supabase] upsert_lead_property error {resp.status_code}: {resp.text[:200]}")
            return None
        rows = resp.json()
        return rows[0]["id"] if rows else None


def insert_signal(
    org_id: str,
    lead_property_id: str,
    lead: ScrapedLead,
) -> bool:
    """
    Insert a row in leads_signals. Skips if same signal_type + lead_property_id
    was already inserted today (idempotency check via REST filter).
    """
    today = date.today().isoformat()

    # Check for duplicate signal today
    with httpx.Client(timeout=10) as client:
        check = client.get(
            _url("leads_signals"),
            headers=_headers(),
            params={
                "organization_id": f"eq.{org_id}",
                "lead_property_id": f"eq.{lead_property_id}",
                "signal_type": f"eq.{lead.signal_type}",
                "detected_at": f"gte.{today}",
                "select": "id",
                "limit": 1,
            },
        )
        if check.status_code == 200 and check.json():
            return False  # Already logged today

    payload = {
        "organization_id": org_id,
        "lead_property_id": lead_property_id,
        "signal_type": lead.signal_type,
        "severity": lead.severity,
        "confidence": lead.confidence,
        "source": lead.source_url or lead.source,
        "payload": {
            "doc_number": lead.doc_number,
            "filed_date": lead.filed_date,
            "amount": lead.amount,
            "owner": lead.owner_name,
            **lead.extra,
        },
        "detected_at": lead.detected_at or datetime.utcnow().isoformat(),
    }

    with httpx.Client(timeout=10) as client:
        resp = client.post(_url("leads_signals"), headers=_headers(), json=payload)
        return resp.status_code in (200, 201)


def upsert_scraper_health(
    org_id: str,
    source_name: str,
    status: str,  # healthy | degraded | down
    records_count: int,
    failure_reason: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    now = datetime.utcnow().isoformat()
    payload = {
        "organization_id": org_id,
        "source_name": source_name,
        "status": status,
        "records_last_run": records_count,
        "failure_reason": failure_reason,
        "metadata": metadata or {},
    }
    if status == "healthy":
        payload["last_success_at"] = now
    else:
        payload["last_failure_at"] = now

    with httpx.Client(timeout=10) as client:
        client.post(
            _url("leads_scraper_health"),
            headers={**_headers(), "Prefer": "resolution=merge-duplicates"},
            params={"on_conflict": "organization_id,source_name"},
            json=payload,
        )


def insert_scan_job(
    org_id: str,
    signal_types: list[str],
    county: str,
    state: str,
) -> Optional[str]:
    """Create a scan job record so the UI can track this run."""
    payload = {
        "organization_id": org_id,
        "job_type": "scheduled",
        "signal_types": signal_types,
        "area": {"county": county, "state": state},
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
    }
    with httpx.Client(timeout=10) as client:
        resp = client.post(_url("leads_scan_jobs"), headers=_headers(), json=payload)
        if resp.status_code in (200, 201):
            rows = resp.json()
            return rows[0]["id"] if rows else None
    return None


def complete_scan_job(job_id: str, results_count: int, error: Optional[str] = None) -> None:
    payload = {
        "status": "failed" if error else "completed",
        "results_count": results_count,
        "completed_at": datetime.utcnow().isoformat(),
        "error_message": error,
    }
    with httpx.Client(timeout=10) as client:
        client.patch(
            f"{_url('leads_scan_jobs')}?id=eq.{job_id}",
            headers=_headers(),
            json=payload,
        )


# ── High-level batch write ────────────────────────────────────────────────

def push_leads(org_id: str, leads: list[ScrapedLead]) -> dict:
    """
    Push a list of ScrapedLeads to Supabase.
    Returns stats: {inserted, updated, signals_added, errors}
    """
    stats = {"inserted": 0, "updated": 0, "signals_added": 0, "errors": 0}

    for lead in leads:
        try:
            ahash = address_hash(lead.address, lead.city, lead.state, lead.zip_code)
            lead_property_id = upsert_lead_property(org_id, lead, ahash)
            if not lead_property_id:
                stats["errors"] += 1
                continue

            added = insert_signal(org_id, lead_property_id, lead)
            if added:
                stats["signals_added"] += 1
            stats["inserted"] += 1

        except Exception as e:
            print(f"[push_leads] error for {lead.address}: {e}")
            stats["errors"] += 1

    return stats
