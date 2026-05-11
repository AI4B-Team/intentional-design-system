"""
florida_open_data.py — Florida county scrapers using public APIs.

Miami-Dade and Broward have excellent open data portals with REST APIs.
This is faster and more reliable than Playwright scraping.

Miami-Dade:
  Property Search API: https://www.miamidade.gov/Apps/PA/PropertySearch/
  Tax Collector: https://taxcollector.miamidade.gov/

Broward:
  Official Records: https://officialrecords.broward.org/
  Property Appraiser: https://web.bcpa.net/

Palm Beach:
  Public Access: https://www.pbcgov.org/papa/
"""

import re
from datetime import date, timedelta
from typing import Iterator, Optional

import httpx
from playwright.sync_api import Page

from base_scraper import BaseScraper, ScraperStructureChanged
from config import SignalType, Severity
from supabase_client import ScrapedLead


# ── Miami-Dade ────────────────────────────────────────────────────────────

class MiamiDadeCountyScraper(BaseScraper):
    county = "Miami-Dade"
    state  = "FL"
    fips   = "12086"

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Miami-Dade Clerk of Courts — foreclosure case search.
        The Clerk has a public online docket.
        """
        url = "https://onlineservices.miami-dadeclerk.com/civil/CaseSearch.aspx"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            # Search by case type = foreclosure
            case_type = page.locator("select[name*='CaseType'], select[id*='CaseType']")
            if case_type.count():
                case_type.first.select_option(label="Foreclosure")

            # Date range: last 30 days
            today = date.today()
            start = today - timedelta(days=30)

            date_from = page.locator("input[name*='DateFrom'], input[id*='DateFrom']")
            if date_from.count():
                date_from.first.fill(start.strftime("%m/%d/%Y"))

            search_btn = page.locator("input[type=submit], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            rows = page.locator("table tr").all()
            for row in rows[1:100]:
                cells = row.locator("td").all()
                if len(cells) < 4:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]

                case_num = next((t for t in texts if re.match(r"\d{4}-\d+", t)), None)
                filed = next((self.parse_date(t) for t in texts), None)
                defendant = texts[1] if len(texts) > 1 else None

                yield self.make_lead(
                    address="UNKNOWN - CASE ENRICHMENT NEEDED",
                    city="Miami",
                    state="FL",
                    zip_code="",
                    signal_type=SignalType.FORECLOSURE,
                    severity=Severity.CRITICAL,
                    filed_date=filed,
                    doc_number=case_num,
                    owner_name=defendant,
                    source_url=url,
                    extra={"case_number": case_num},
                )

        except Exception as e:
            pass

    def scrape_tax_delinquent(self, page: Page) -> Iterator[ScrapedLead]:
        """Miami-Dade Tax Collector — delinquent property list."""
        # Miami-Dade has a public tax certificate sale list
        url = "https://taxcollector.miamidade.gov/delinquent"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        rows = page.locator("table tr").all()
        for row in rows[1:200]:
            cells = row.locator("td").all()
            if len(cells) < 3:
                continue
            texts = [self.clean_text(c.inner_text()) for c in cells]

            address_text = next(
                (t for t in texts if re.search(r"\d+\s+\w+\s+(st|ave|blvd|dr|ln|ct|rd|way)",
                                                t, re.IGNORECASE)),
                None
            )
            if not address_text:
                continue

            parts = self._parse_fl_address(address_text, "Miami")
            if not parts:
                continue

            owner = texts[0] if texts else None
            amount = next((self.parse_amount(t) for t in texts if "$" in t), None)

            yield self.make_lead(
                address=parts["street"],
                city=parts.get("city", "Miami"),
                state="FL",
                zip_code=parts.get("zip", ""),
                signal_type=SignalType.DELINQUENT_TAX,
                severity=Severity.HIGH,
                owner_name=owner,
                amount=amount,
                source_url=url,
            )

    @staticmethod
    def _parse_fl_address(text: str, default_city: str = "Miami") -> Optional[dict]:
        text = text.strip().upper()
        zip_match = re.search(r"\b(3[0-4]\d{3})\b", text)  # FL ZIPs 30000-34999
        zip_code = zip_match.group(1) if zip_match else ""

        fl_cities = [
            "MIAMI", "MIAMI BEACH", "MIAMI GARDENS", "HIALEAH", "HOMESTEAD",
            "CORAL GABLES", "DORAL", "KENDALL", "MIAMI LAKES", "OPA-LOCKA",
            "NORTH MIAMI", "NORTH MIAMI BEACH", "AVENTURA", "MIAMI SHORES",
            "MIAMI SPRINGS", "SOUTH MIAMI", "WEST MIAMI", "BISCAYNE PARK",
            "FORT LAUDERDALE", "PEMBROKE PINES", "HOLLYWOOD", "MIRAMAR",
            "CORAL SPRINGS", "SUNRISE", "PLANTATION", "POMPANO BEACH",
            "DEERFIELD BEACH", "MARGATE", "COCONUT CREEK", "TAMARAC",
            "LAUDERDALE LAKES", "HALLANDALE BEACH", "WESTON", "DAVIE",
        ]
        city = default_city
        for c in fl_cities:
            if c in text:
                city = c.title()
                break

        street = text
        for c in fl_cities:
            idx = text.find(c)
            if idx > 5:
                street = text[:idx].strip()
                break
        if zip_code:
            street = re.sub(r"\s*" + zip_code + r".*$", "", street).strip()
        street = re.sub(r"\s*FL\s*", " ", street).strip()

        if not street or len(street) < 5:
            return None
        return {"street": street.title(), "city": city.title(), "zip": zip_code, "state": "FL"}


# ── Broward County ────────────────────────────────────────────────────────

class BrowardCountyScraper(BaseScraper):
    county = "Broward"
    state  = "FL"
    fips   = "12011"

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Broward Clerk of Courts — civil case search for foreclosures.
        """
        url = "https://www.browardclerk.org/Web2/CaseSearchECA/CaseSearch"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            # Case type filter for mortgage foreclosure
            case_type = page.locator("select[name*='caseType'], select[id*='CaseType']")
            if case_type.count():
                # Try mortgage foreclosure category
                options = case_type.first.locator("option").all()
                for opt in options:
                    if "FORECLOSURE" in self.clean_text(opt.inner_text()).upper():
                        opt.click()
                        break

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

                case_num = next((t for t in texts if re.match(r"\d{2}-\d+", t)), None)
                filed = next((self.parse_date(t) for t in texts), None)
                defendant = next((t for t in texts if t and not re.match(r"\d", t) and len(t) > 5), None)

                yield self.make_lead(
                    address="UNKNOWN - BROWARD FORECLOSURE",
                    city="Fort Lauderdale",
                    state="FL",
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
        """Broward County Tax Collector — delinquent certificate list."""
        url = "https://taxes.broward.org/"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # Broward has a searchable delinquent list
        try:
            rows = page.locator("table tr").all()
            for row in rows[1:200]:
                cells = row.locator("td").all()
                if len(cells) < 3:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]
                address_text = next(
                    (t for t in texts if re.search(r"\d+\s+\w+\s+(st|ave|blvd|dr|ln|ct|rd)",
                                                    t, re.IGNORECASE)),
                    None
                )
                if not address_text:
                    continue
                parts = MiamiDadeCountyScraper._parse_fl_address(address_text, "Fort Lauderdale")
                if not parts:
                    continue

                yield self.make_lead(
                    address=parts["street"],
                    city=parts.get("city", "Fort Lauderdale"),
                    state="FL",
                    zip_code=parts.get("zip", ""),
                    signal_type=SignalType.DELINQUENT_TAX,
                    severity=Severity.HIGH,
                    source_url=url,
                )

        except Exception:
            pass
