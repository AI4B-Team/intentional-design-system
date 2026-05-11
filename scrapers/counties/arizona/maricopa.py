"""
maricopa_az.py — Maricopa County, Arizona (Phoenix metro)

Signal sources:
  Foreclosure / Trustee Sale:
    Maricopa County Recorder — trustee sale recordings
    https://recorder.maricopa.gov/recdocdata/GetDocData.aspx?param=TS

  Tax Delinquency:
    Maricopa County Treasurer delinquent list
    https://mctreasurer.maricopa.gov/

  Probate / Estate:
    Maricopa Superior Court public access
    https://www.superiorcourt.maricopa.gov/

Population: ~4.5M | FIPS: 04013
"""

import re
from typing import Iterator

from playwright.sync_api import Page

from base_scraper import BaseScraper, ScraperStructureChanged
from config import SignalType, Severity
from supabase_client import ScrapedLead


class MaricopaCountyScraper(BaseScraper):
    county = "Maricopa"
    state  = "AZ"
    fips   = "04013"

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Maricopa County Recorder — Trustee Sale recordings.
        Documents labeled 'TS' (trustee sale) are NODs/foreclosures.
        """
        # Maricopa Recorder public document search
        url = "https://recorder.maricopa.gov/recdocdata/GetDocData.aspx"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # Search for Trustee Sale documents filed in the last 30 days
        try:
            # Document type input
            doc_type_input = page.locator(
                "input[name*='DocType'], input[id*='DocType'], input[placeholder*='document type']"
            )
            if doc_type_input.count():
                doc_type_input.first.fill("TRUSTEE")

            search_btn = page.locator("input[type=submit], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            # Parse results
            rows = page.locator("table tr").all()
            for row in rows[1:100]:
                cells = row.locator("td").all()
                if len(cells) < 4:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]

                # Look for address in cells
                address_text = ""
                for t in texts:
                    if re.search(
                        r"\d+\s+\w+\s+(st|ave|blvd|dr|ln|ct|rd|pl|way|loop)",
                        t, re.IGNORECASE
                    ):
                        address_text = t
                        break

                if not address_text:
                    continue

                parts = self._parse_az_address(address_text)
                if not parts:
                    continue

                filed = next((self.parse_date(t) for t in texts), None)
                doc_num = next((t for t in texts if re.match(r"\d{4}-\d+", t)), None)
                amount = next((self.parse_amount(t) for t in texts if "$" in t), None)

                yield self.make_lead(
                    address=parts["street"],
                    city=parts.get("city", "Phoenix"),
                    state="AZ",
                    zip_code=parts.get("zip", ""),
                    signal_type=SignalType.TRUSTEE_SALE,
                    severity=Severity.CRITICAL,
                    filed_date=filed,
                    doc_number=doc_num,
                    amount=amount,
                    source_url=url,
                )

        except Exception as e:
            raise ScraperStructureChanged(f"Maricopa recorder: {e}")

    def scrape_tax_delinquent(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Maricopa County Treasurer — delinquent tax list.
        Public list of properties with overdue taxes.
        """
        url = "https://mctreasurer.maricopa.gov/DelinquentTaxSearch/Default.aspx"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            search_btn = page.locator("input[type=submit], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            rows = page.locator("table tr").all()
            for row in rows[1:200]:
                cells = row.locator("td").all()
                if len(cells) < 3:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]

                address_text = next(
                    (t for t in texts if re.search(r"\d+\s+\w+", t) and len(t) > 8),
                    None
                )
                if not address_text:
                    continue

                parts = self._parse_az_address(address_text)
                if not parts:
                    continue

                owner = texts[0] if texts else None
                amount = next(
                    (self.parse_amount(t) for t in texts if "$" in t or "." in t),
                    None
                )

                yield self.make_lead(
                    address=parts["street"],
                    city=parts.get("city", "Phoenix"),
                    state="AZ",
                    zip_code=parts.get("zip", ""),
                    signal_type=SignalType.DELINQUENT_TAX,
                    severity=Severity.HIGH,
                    owner_name=owner,
                    amount=amount,
                    source_url=url,
                )

        except Exception:
            pass

    def scrape_probate(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Maricopa Superior Court — probate case search.
        """
        url = "https://www.superiorcourt.maricopa.gov/docket/ProbateCourtCases/caseSearchByName.asp"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        try:
            # Search for recent estate cases — search with common surname or blank
            name_input = page.locator("input[name*='last'], input[id*='last'], input[name*='name']")
            if name_input.count():
                name_input.first.fill("ESTATE")

            search_btn = page.locator("input[type=submit], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            rows = page.locator("table tr").all()
            for row in rows[1:50]:
                cells = row.locator("td").all()
                if len(cells) < 3:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]
                case_name = texts[0] if texts else ""
                if not case_name:
                    continue

                filed = next((self.parse_date(t) for t in texts), None)
                case_num = next(
                    (t for t in texts if re.match(r"PB\d{4}", t) or re.match(r"\d{4}-\d+", t)),
                    None
                )

                yield self.make_lead(
                    address="UNKNOWN - PROBATE ENRICHMENT NEEDED",
                    city="Phoenix",
                    state="AZ",
                    zip_code="",
                    signal_type=SignalType.PROBATE,
                    severity=Severity.HIGH,
                    filed_date=filed,
                    doc_number=case_num,
                    source_url=url,
                    extra={"case_name": case_name},
                )

        except Exception:
            pass

    @staticmethod
    def _parse_az_address(text: str) -> Optional[dict]:
        text = text.strip().upper()
        zip_match = re.search(r"\b(8[5-6]\d{3})\b", text)  # AZ ZIPs: 85xxx, 86xxx
        zip_code = zip_match.group(1) if zip_match else ""

        az_cities = [
            "PHOENIX", "SCOTTSDALE", "TEMPE", "MESA", "CHANDLER", "GILBERT",
            "GLENDALE", "PEORIA", "SURPRISE", "GOODYEAR", "AVONDALE",
            "BUCKEYE", "MARICOPA", "QUEEN CREEK", "SAN TAN VALLEY",
            "PARADISE VALLEY", "FOUNTAIN HILLS", "CAVE CREEK", "CAREFREE",
            "TOLLESON", "EL MIRAGE", "YOUNGTOWN", "SUN CITY", "SUN CITY WEST",
        ]
        city = "PHOENIX"
        for c in az_cities:
            if c in text:
                city = c.title()
                break

        street = text
        for c in az_cities:
            idx = text.find(c)
            if idx > 5:
                street = text[:idx].strip()
                break
        if zip_code:
            street = re.sub(r"\s*" + zip_code + r".*$", "", street).strip()
        street = re.sub(r"\s*AZ\s*", " ", street).strip()

        if not street or len(street) < 5:
            return None

        return {"street": street.title(), "city": city.title(), "zip": zip_code, "state": "AZ"}


# Fix missing Optional import
from typing import Optional
