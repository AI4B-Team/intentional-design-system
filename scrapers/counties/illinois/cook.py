"""
cook_il.py — Cook County, Illinois (Chicago metro)

Chicago has one of the best open data portals in the country.
We use REST APIs — no Playwright needed for most signals.

APIs used:
  Code Violations: https://data.cityofchicago.org/resource/22u3-xenr.json
  Building Complaints: https://data.cityofchicago.org/resource/v6vf-nfxy.json
  Vacant Buildings: https://data.cityofchicago.org/resource/7nii-7srd.json
  Foreclosure data: Cook County Recorder API

Population: ~5.2M | FIPS: 17031
"""

import re
from datetime import date, timedelta
from typing import Iterator, Optional

import httpx
from playwright.sync_api import Page

from base_scraper import BaseScraper
from config import SignalType, Severity
from supabase_client import ScrapedLead


CHICAGO_OPEN_DATA_BASE = "https://data.cityofchicago.org/resource"
APP_TOKEN = ""  # Optional Socrata app token for higher rate limits


class CookCountyScraper(BaseScraper):
    county = "Cook"
    state  = "IL"
    fips   = "17031"

    def scrape_code_violations(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Chicago Open Data — Building Code Violations API.
        This is a REST API, no Playwright needed.
        Yields properties with active code violations.
        """
        # Building violations - last 30 days
        since = (date.today() - timedelta(days=30)).isoformat()
        url = f"{CHICAGO_OPEN_DATA_BASE}/22u3-xenr.json"
        params = {
            "$where": f"violation_date >= '{since}'",
            "$limit": 1000,
            "$order": "violation_date DESC",
            "$select": "address,violation_code,violation_description,violation_date,violation_status,latitude,longitude",
        }
        if APP_TOKEN:
            params["$$app_token"] = APP_TOKEN

        try:
            with httpx.Client(timeout=30) as client:
                resp = client.get(url, params=params)
                if resp.status_code != 200:
                    return

                records = resp.json()
                for record in records:
                    address = record.get("address", "").strip()
                    if not address:
                        continue

                    parts = self._parse_chicago_address(address)
                    if not parts:
                        continue

                    desc = record.get("violation_description", "")
                    vdate = record.get("violation_date", "")[:10] if record.get("violation_date") else None

                    yield self.make_lead(
                        address=parts["street"],
                        city="Chicago",
                        state="IL",
                        zip_code=parts.get("zip", ""),
                        signal_type=SignalType.CODE_VIOLATION,
                        severity=Severity.MEDIUM,
                        filed_date=vdate,
                        source_url=url,
                        extra={
                            "violation_code": record.get("violation_code", ""),
                            "description": desc,
                            "status": record.get("violation_status", ""),
                        },
                    )

        except Exception as e:
            print(f"[Cook/IL] code violations API error: {e}")

    def scrape_vacancies(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Chicago Open Data — Vacant and Abandoned Building Register.
        """
        url = f"{CHICAGO_OPEN_DATA_BASE}/7nii-7srd.json"
        params = {
            "$limit": 500,
            "$order": "date_service_request_was_received DESC",
            "$select": "address,zip_code,type_of_service_request,date_service_request_was_received",
        }

        try:
            with httpx.Client(timeout=30) as client:
                resp = client.get(url, params=params)
                if resp.status_code != 200:
                    return

                records = resp.json()
                for record in records:
                    address = record.get("address", "").strip()
                    if not address:
                        continue
                    zip_code = record.get("zip_code", "")
                    req_date = record.get("date_service_request_was_received", "")[:10]

                    yield self.make_lead(
                        address=address.title(),
                        city="Chicago",
                        state="IL",
                        zip_code=zip_code,
                        signal_type=SignalType.VACANCY,
                        severity=Severity.LOW,
                        filed_date=req_date,
                        source_url=url,
                        extra={"service_type": record.get("type_of_service_request", "")},
                    )

        except Exception as e:
            print(f"[Cook/IL] vacancy API error: {e}")

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Cook County Recorder of Deeds — lis pendens / foreclosure filings.
        Uses the public search portal.
        """
        url = "https://www.cookcountyclerkofcourt.org/newsite/onlinesearch/case_search.php"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            # Search for Lis Pendens cases
            case_type = page.locator("select[name*='case_type'], select[id*='case_type']")
            if case_type.count():
                options = case_type.first.locator("option").all()
                for opt in options:
                    if "FORECLOSURE" in self.clean_text(opt.inner_text()).upper():
                        opt.click()
                        break

            # Set date range
            today = date.today()
            start = today - timedelta(days=30)
            date_input = page.locator("input[name*='from_date'], input[id*='from_date']")
            if date_input.count():
                date_input.first.fill(start.strftime("%m/%d/%Y"))

            search_btn = page.locator("input[type=submit], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            rows = page.locator("table tr").all()
            for row in rows[1:100]:
                cells = row.locator("td").all()
                if len(cells) < 3:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]

                case_num = next((t for t in texts if re.match(r"\d{2}CH\d+", t)), None)
                filed = next((self.parse_date(t) for t in texts), None)
                defendant = None
                for t in texts:
                    if t and not re.match(r"^\d", t) and len(t) > 5 and t not in ("Foreclosure", ""):
                        defendant = t
                        break

                yield self.make_lead(
                    address="UNKNOWN - COOK COUNTY FORECLOSURE",
                    city="Chicago",
                    state="IL",
                    zip_code="",
                    signal_type=SignalType.FORECLOSURE,
                    severity=Severity.CRITICAL,
                    filed_date=filed,
                    doc_number=case_num,
                    owner_name=defendant,
                    source_url=url,
                )

        except Exception:
            pass

    def scrape_tax_delinquent(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Cook County Treasurer — tax sale eligible properties.
        The annual delinquent tax list is publicly available.
        """
        url = "https://www.cookcountytreasurer.com/TaxDelinquency/"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            rows = page.locator("table tr").all()
            for row in rows[1:500]:
                cells = row.locator("td").all()
                if len(cells) < 4:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]

                address_text = next(
                    (t for t in texts if re.search(r"\d+\s+\w+", t) and len(t) > 8),
                    None
                )
                if not address_text:
                    continue

                parts = self._parse_chicago_address(address_text)
                if not parts:
                    continue

                owner = texts[0] if texts else None
                amount = next((self.parse_amount(t) for t in texts if "$" in t), None)

                yield self.make_lead(
                    address=parts["street"],
                    city="Chicago",
                    state="IL",
                    zip_code=parts.get("zip", ""),
                    signal_type=SignalType.DELINQUENT_TAX,
                    severity=Severity.HIGH,
                    owner_name=owner,
                    amount=amount,
                    source_url=url,
                )

        except Exception:
            pass

    @staticmethod
    def _parse_chicago_address(text: str) -> Optional[dict]:
        text = text.strip().upper()
        zip_match = re.search(r"\b(606\d{2})\b", text)  # Chicago ZIPs: 606xx
        zip_code = zip_match.group(1) if zip_match else ""

        street = text
        if zip_code:
            street = re.sub(r"\s*" + zip_code + r".*$", "", street).strip()
        street = re.sub(r"\s*IL\s*", " ", street).strip()
        street = re.sub(r"\s*CHICAGO\s*", " ", street).strip()

        if not street or len(street) < 5:
            return None
        return {"street": street.title(), "city": "Chicago", "zip": zip_code, "state": "IL"}
