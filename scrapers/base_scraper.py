"""
base_scraper.py — Base class for all county scrapers.

Every county scraper inherits from BaseScraper and implements:
  - scrape_foreclosures()
  - scrape_tax_delinquent()
  - scrape_probate()
  - scrape_liens()         (optional)
  - scrape_code_violations() (optional)

Self-healing: if a scraper raises ScraperStructureChanged, the oversight
agent logs the failure and can trigger an AI re-write of the selector.
"""

import re
import time
import traceback
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, Optional

from playwright.sync_api import Browser, Page, Playwright, sync_playwright
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from config import (
    MAX_RETRIES,
    NAVIGATION_TIMEOUT_MS,
    PAGE_TIMEOUT_MS,
    PLAYWRIGHT_HEADLESS,
    PLAYWRIGHT_USER_AGENT,
    REQUEST_DELAY_SEC,
    Severity,
    SignalType,
)
from supabase_client import ScrapedLead


# ── Exceptions ───────────────────────────────────────────────────────────

class ScraperStructureChanged(Exception):
    """Raised when expected HTML elements/selectors no longer exist."""


class ScraperLoginRequired(Exception):
    """Raised when the county site requires authentication."""


class ScraperRateLimited(Exception):
    """Raised when the county site is blocking requests."""


# ── County metadata ──────────────────────────────────────────────────────

@dataclass
class CountyMeta:
    name: str        # e.g. "Harris"
    state: str       # e.g. "TX"
    fips: str        # 5-digit FIPS code, e.g. "48201"
    population: int  # rough population for prioritization
    scraper_class: str
    signal_types: list[str]
    notes: str = ""


# ── Base scraper ─────────────────────────────────────────────────────────

class BaseScraper(ABC):
    """
    Base class for all Real Elite county scrapers.

    Subclasses set:
        county: str     e.g. "Harris"
        state:  str     e.g. "TX"

    And implement scrape_*() methods that yield ScrapedLead objects.
    """

    county: str = ""
    state: str = ""
    fips: str = ""

    def __init__(self, org_id: str, headless: bool = PLAYWRIGHT_HEADLESS):
        self.org_id = org_id
        self.headless = headless
        self._pw: Optional[Playwright] = None
        self._browser: Optional[Browser] = None

    # ── Browser lifecycle ─────────────────────────────────────────────

    def _start_browser(self) -> Page:
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch(
            headless=self.headless,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
        )
        context = self._browser.new_context(
            user_agent=PLAYWRIGHT_USER_AGENT,
            viewport={"width": 1280, "height": 900},
            java_script_enabled=True,
        )
        page = context.new_page()
        page.set_default_timeout(PAGE_TIMEOUT_MS)
        page.set_default_navigation_timeout(NAVIGATION_TIMEOUT_MS)
        return page

    def _stop_browser(self) -> None:
        try:
            if self._browser:
                self._browser.close()
            if self._pw:
                self._pw.stop()
        except Exception:
            pass

    def _delay(self) -> None:
        time.sleep(REQUEST_DELAY_SEC)

    # ── Helpers ───────────────────────────────────────────────────────

    @staticmethod
    def clean_text(text: Optional[str]) -> str:
        if not text:
            return ""
        return re.sub(r"\s+", " ", text.strip())

    @staticmethod
    def parse_amount(text: str) -> Optional[float]:
        digits = re.sub(r"[^\d.]", "", text or "")
        try:
            return float(digits) if digits else None
        except ValueError:
            return None

    @staticmethod
    def parse_date(text: str) -> Optional[str]:
        """Convert various date formats to ISO YYYY-MM-DD."""
        if not text:
            return None
        text = text.strip()
        # MM/DD/YYYY
        m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", text)
        if m:
            return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
        # YYYY-MM-DD
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})", text)
        if m:
            return text[:10]
        return None

    def make_lead(
        self,
        address: str,
        city: str,
        state: Optional[str],
        zip_code: str,
        signal_type: SignalType,
        severity: Optional[Severity] = None,
        **kwargs,
    ) -> ScrapedLead:
        from config import SIGNAL_SEVERITY
        return ScrapedLead(
            address=self.clean_text(address),
            city=self.clean_text(city),
            state=state or self.state,
            zip_code=(zip_code or "")[:5],
            county=self.county,
            signal_type=signal_type.value,
            severity=(severity or SIGNAL_SEVERITY.get(signal_type, Severity.MEDIUM)).value,
            source="auto_detect",
            **kwargs,
        )

    # ── Abstract methods (each county implements these) ───────────────

    def scrape_foreclosures(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield foreclosure / notice of default leads."""
        return iter([])

    def scrape_tax_delinquent(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield tax delinquency leads."""
        return iter([])

    def scrape_probate(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield probate / estate filing leads."""
        return iter([])

    def scrape_liens(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield lien / judgment leads."""
        return iter([])

    def scrape_code_violations(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield code violation / enforcement leads."""
        return iter([])

    def scrape_divorces(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield divorce filing leads."""
        return iter([])

    def scrape_evictions(self, page: Page) -> Iterator[ScrapedLead]:
        """Yield eviction leads."""
        return iter([])

    # ── Main run ──────────────────────────────────────────────────────

    def run(self, signal_types: Optional[list[str]] = None) -> list[ScrapedLead]:
        """
        Run all available scrapers for this county.
        Returns list of ScrapedLead objects.
        """
        all_leads: list[ScrapedLead] = []
        page = self._start_browser()

        scraper_map = {
            "foreclosure":     self.scrape_foreclosures,
            "pre_foreclosure": self.scrape_foreclosures,
            "notice_of_default": self.scrape_foreclosures,
            "trustee_sale":    self.scrape_foreclosures,
            "tax_default":     self.scrape_tax_delinquent,
            "delinquent_tax":  self.scrape_tax_delinquent,
            "estate_filing":   self.scrape_probate,
            "probate":         self.scrape_probate,
            "lien":            self.scrape_liens,
            "judgment":        self.scrape_liens,
            "code_violation":  self.scrape_code_violations,
            "code_enforcement":self.scrape_code_violations,
            "divorce_filing":  self.scrape_divorces,
            "eviction":        self.scrape_evictions,
        }

        # Deduplicate which methods to call
        methods_to_run = set()
        if signal_types:
            for st in signal_types:
                fn = scraper_map.get(st)
                if fn:
                    methods_to_run.add(fn)
        else:
            methods_to_run = {
                self.scrape_foreclosures,
                self.scrape_tax_delinquent,
                self.scrape_probate,
                self.scrape_liens,
                self.scrape_code_violations,
            }

        for method in methods_to_run:
            try:
                for lead in method(page):
                    if lead and lead.address:
                        all_leads.append(lead)
                self._delay()
            except ScraperStructureChanged as e:
                print(f"[{self.county}/{self.state}] STRUCTURE CHANGED in {method.__name__}: {e}")
                # Log to oversight — the UI will show 'degraded' status
            except ScraperLoginRequired:
                print(f"[{self.county}/{self.state}] LOGIN REQUIRED for {method.__name__}")
            except Exception as e:
                print(f"[{self.county}/{self.state}] ERROR in {method.__name__}: {e}")
                traceback.print_exc()

        self._stop_browser()
        return all_leads
