"""
harris_tx.py — Harris County, Texas (Houston metro)

Signal sources:
  Foreclosure / Trustee Sale / Lis Pendens:
    Harris County District Clerk real property filings
    https://www.hcdistrictclerk.com/edocs/public/NoticeList.aspx

  Tax Delinquency:
    Harris County Tax Office delinquent list
    https://www.hctax.net/Property/DelinquentTax

  Probate:
    Harris County Probate Court filings
    https://www.harriscountytx.gov/departments/probate-courts

Population: ~4.7M | FIPS: 48201
Runs: daily (foreclosure), weekly (tax + probate)
"""

import re
from typing import Iterator

from playwright.sync_api import Page

from base_scraper import BaseScraper, ScraperStructureChanged
from config import SignalType, Severity
from supabase_client import ScrapedLead


class HarrisCountyScraper(BaseScraper):
    county = "Harris"
    state  = "TX"
    fips   = "48201"

    # ── Foreclosure / Lis Pendens ─────────────────────────────────────

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Harris County District Clerk — Real Property Notices.
        Lists Notice of Trustee Sale and Lis Pendens filings.
        """
        url = "https://www.hcdistrictclerk.com/edocs/public/NoticeList.aspx"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # The page has a dropdown to filter notice type — select foreclosure notices
        try:
            # Select "Notice of Trustee Sale" from the notice type dropdown
            notice_select = page.locator("select[name*='NoticeType'], select[id*='NoticeType']")
            if notice_select.count():
                notice_select.first.select_option(label="Notice of Trustee Sale")
                page.wait_for_load_state("networkidle")
                self._delay()
        except Exception:
            pass  # Try to scrape whatever is on the page

        # Look for the results table
        table = page.locator("table.GridView, table[id*='Grid'], table[id*='grd']")
        if not table.count():
            # Fallback: look for any data table
            table = page.locator("table").filter(has_text="Address")
            if not table.count():
                raise ScraperStructureChanged(
                    "Could not find results table on Harris County notice page"
                )

        rows = table.first.locator("tr").all()
        # Skip header row
        for row in rows[1:]:
            cells = row.locator("td").all()
            if len(cells) < 3:
                continue

            texts = [self.clean_text(c.inner_text()) for c in cells]

            # Try to extract address from cell text
            address_text = ""
            for t in texts:
                # Look for something that looks like a street address
                if re.search(r"\d+\s+\w+\s+(st|ave|blvd|dr|ln|ct|rd|pl|way|loop|pkwy|hwy)",
                             t, re.IGNORECASE):
                    address_text = t
                    break

            if not address_text:
                continue

            # Parse address parts
            parts = self._parse_texas_address(address_text)
            if not parts:
                continue

            # Determine signal type from notice type column
            notice_type = " ".join(texts[:2]).upper()
            if "TRUSTEE" in notice_type or "FORECLOSURE" in notice_type:
                signal = SignalType.TRUSTEE_SALE
                severity = Severity.CRITICAL
            else:
                signal = SignalType.LIS_PENDENS
                severity = Severity.HIGH

            # Extract filed date
            filed = None
            for t in texts:
                d = self.parse_date(t)
                if d:
                    filed = d
                    break

            # Extract doc number
            doc_num = None
            for t in texts:
                if re.match(r"\d{4}-\d+", t):
                    doc_num = t
                    break

            yield self.make_lead(
                address=parts["street"],
                city=parts.get("city", "Houston"),
                state="TX",
                zip_code=parts.get("zip", ""),
                signal_type=signal,
                severity=severity,
                filed_date=filed,
                doc_number=doc_num,
                source_url=url,
                extra={"raw_notice_type": notice_type},
            )

    # ── Tax Delinquency ───────────────────────────────────────────────

    def scrape_tax_delinquent(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Harris County Tax Office — delinquent property search.
        URL: https://www.hctax.net/Property/DelinquentTax
        This page allows searching delinquent properties by ZIP.
        We iterate through major Houston ZIP codes.
        """
        base_url = "https://www.hctax.net/Property/DelinquentTax"

        # Key Houston area ZIPs to cover
        houston_zips = [
            "77002", "77003", "77004", "77005", "77006", "77007", "77008",
            "77009", "77010", "77011", "77012", "77013", "77014", "77015",
            "77016", "77017", "77018", "77019", "77020", "77021", "77022",
            "77023", "77024", "77025", "77026", "77027", "77028", "77029",
            "77030", "77031", "77032", "77033", "77034", "77035", "77036",
            "77040", "77041", "77042", "77043", "77044", "77045", "77046",
            "77047", "77048", "77049", "77050", "77051", "77053", "77054",
            "77055", "77056", "77057", "77058", "77059", "77060", "77061",
            "77062", "77063", "77064", "77065", "77066", "77067", "77068",
            "77069", "77070", "77071", "77072", "77073", "77074", "77075",
            "77076", "77077", "77078", "77079", "77080", "77081", "77082",
            "77083", "77084", "77085", "77086", "77087", "77088", "77089",
            "77090", "77091", "77092", "77093", "77094", "77095", "77096",
            "77098", "77099",
        ]

        for zip_code in houston_zips[:20]:  # Limit per run to avoid timeouts
            try:
                page.goto(base_url)
                page.wait_for_load_state("networkidle")

                # Find the ZIP search input
                zip_input = page.locator(
                    "input[name*='zip'], input[id*='zip'], input[placeholder*='ZIP']"
                )
                if not zip_input.count():
                    break  # Form structure changed

                zip_input.first.fill(zip_code)
                zip_input.first.press("Enter")
                page.wait_for_load_state("networkidle")
                self._delay()

                # Parse results table
                rows = page.locator("table tr").all()
                for row in rows[1:]:
                    cells = row.locator("td").all()
                    if len(cells) < 4:
                        continue
                    texts = [self.clean_text(c.inner_text()) for c in cells]
                    address = next(
                        (t for t in texts if re.search(r"\d+\s+\w+", t) and len(t) > 8),
                        None,
                    )
                    if not address:
                        continue
                    amount = next(
                        (self.parse_amount(t) for t in texts if "$" in t or t.replace(",","").replace(".","").isdigit()),
                        None,
                    )
                    owner = texts[0] if texts else None

                    yield self.make_lead(
                        address=address,
                        city="Houston",
                        state="TX",
                        zip_code=zip_code,
                        signal_type=SignalType.DELINQUENT_TAX,
                        severity=Severity.HIGH,
                        owner_name=owner,
                        amount=amount,
                        source_url=base_url,
                    )

            except Exception:
                continue

    # ── Probate ───────────────────────────────────────────────────────

    def scrape_probate(self, page: Page) -> Iterator[ScrapedLead]:
        """
        Harris County Probate Court public records.
        Uses the iCivil court records system.
        """
        url = "https://www.hcdistrictclerk.com/edocs/public/SearchNoticeOfSale.aspx"
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # Alternative: use the Harris County courts search for probate cases
        # The key signal is estate/probate filing with real property involved
        probate_url = "https://www.hcdistrictclerk.com/edocs/public/SearchProbate.aspx"
        try:
            page.goto(probate_url)
            page.wait_for_load_state("networkidle")

            search_btn = page.locator("input[type=submit][value*='Search'], button:has-text('Search')")
            if search_btn.count():
                search_btn.first.click()
                page.wait_for_load_state("networkidle")
                self._delay()

            rows = page.locator("table tr").all()
            for row in rows[1:50]:  # Limit to 50 per run
                cells = row.locator("td").all()
                if len(cells) < 3:
                    continue
                texts = [self.clean_text(c.inner_text()) for c in cells]
                # Look for estate case names
                case_name = texts[0] if texts else ""
                if not case_name or "ESTATE" not in case_name.upper():
                    continue
                filed = next((self.parse_date(t) for t in texts), None)
                case_num = next((t for t in texts if re.match(r"\d{4}-\d+", t)), None)

                # Probate leads don't always have address — that comes from enrichment
                # We yield with minimal info so enrichment can fill in the address
                yield self.make_lead(
                    address="UNKNOWN - PROBATE LOOKUP NEEDED",
                    city="Houston",
                    state="TX",
                    zip_code="",
                    signal_type=SignalType.PROBATE,
                    severity=Severity.HIGH,
                    filed_date=filed,
                    doc_number=case_num,
                    source_url=probate_url,
                    extra={"case_name": case_name},
                )
        except Exception:
            pass

    # ── Address parser ────────────────────────────────────────────────

    @staticmethod
    def _parse_texas_address(text: str) -> Optional[dict]:
        """
        Parse a Texas address string into components.
        Handles formats like: "1234 MAIN ST HOUSTON TX 77002"
        """
        text = text.strip().upper()

        # Try to extract ZIP
        zip_match = re.search(r"\b(\d{5})(?:-\d{4})?\b", text)
        zip_code = zip_match.group(1) if zip_match else ""

        # Try to extract city (before ZIP, after state abbreviation match)
        # Texas cities
        tx_cities = [
            "HOUSTON", "PEARLAND", "PASADENA", "BAYTOWN", "GALVESTON",
            "FRIENDSWOOD", "LEAGUE CITY", "SUGAR LAND", "KATY", "CYPRESS",
            "TOMBALL", "SPRING", "HUMBLE", "KINGWOOD", "CONROE",
            "THE WOODLANDS", "STAFFORD", "MISSOURI CITY", "RICHMOND",
        ]
        city = "HOUSTON"
        for c in tx_cities:
            if c in text:
                city = c.title()
                break

        # Extract street (everything before the city)
        street = text
        for c in tx_cities:
            idx = text.find(c)
            if idx > 5:
                street = text[:idx].strip()
                break
        if zip_code:
            street = re.sub(r"\s*" + zip_code + r".*$", "", street).strip()

        street = re.sub(r"\s*TX\s*", " ", street).strip()

        if not street or len(street) < 5:
            return None

        return {"street": street.title(), "city": city.title(), "zip": zip_code, "state": "TX"}
