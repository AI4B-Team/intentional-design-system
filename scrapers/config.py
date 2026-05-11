"""
config.py — Signal types, severity weights, scraper constants.
All values match the leads_signals.signal_type + severity CHECK constraints
in the Supabase schema.
"""

from enum import Enum


# ── Signal Types (match leads_signals.signal_type) ────────────────────────
class SignalType(str, Enum):
    NOTICE_OF_DEFAULT   = "notice_of_default"
    PRE_FORECLOSURE     = "pre_foreclosure"
    TAX_DEFAULT         = "tax_default"
    ESTATE_FILING       = "estate_filing"
    CODE_VIOLATION      = "code_violation"
    VACANCY             = "vacancy"
    STALE_LISTING       = "stale_listing"
    DIVORCE_FILING      = "divorce_filing"
    LIS_PENDENS         = "lis_pendens"
    FORECLOSURE         = "foreclosure"
    PROBATE             = "probate"
    LIEN                = "lien"
    JUDGMENT            = "judgment"
    BANKRUPTCY          = "bankruptcy"
    EVICTION            = "eviction"
    DELINQUENT_TAX      = "delinquent_tax"
    CODE_ENFORCEMENT    = "code_enforcement"
    TRUSTEE_SALE        = "trustee_sale"
    HOA_DELINQUENCY     = "hoa_delinquency"
    UTILITY_SHUTOFF     = "utility_shutoff"


# ── Severity (match leads_signals.severity CHECK constraint) ──────────────
class Severity(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


# ── Default severity per signal type ─────────────────────────────────────
SIGNAL_SEVERITY: dict[SignalType, Severity] = {
    SignalType.NOTICE_OF_DEFAULT:  Severity.CRITICAL,
    SignalType.PRE_FORECLOSURE:    Severity.CRITICAL,
    SignalType.TRUSTEE_SALE:       Severity.CRITICAL,
    SignalType.FORECLOSURE:        Severity.CRITICAL,
    SignalType.BANKRUPTCY:         Severity.HIGH,
    SignalType.LIS_PENDENS:        Severity.HIGH,
    SignalType.TAX_DEFAULT:        Severity.HIGH,
    SignalType.DELINQUENT_TAX:     Severity.HIGH,
    SignalType.PROBATE:            Severity.HIGH,
    SignalType.ESTATE_FILING:      Severity.HIGH,
    SignalType.DIVORCE_FILING:     Severity.MEDIUM,
    SignalType.LIEN:               Severity.MEDIUM,
    SignalType.JUDGMENT:           Severity.MEDIUM,
    SignalType.EVICTION:           Severity.MEDIUM,
    SignalType.CODE_VIOLATION:     Severity.MEDIUM,
    SignalType.CODE_ENFORCEMENT:   Severity.MEDIUM,
    SignalType.HOA_DELINQUENCY:    Severity.MEDIUM,
    SignalType.VACANCY:            Severity.LOW,
    SignalType.STALE_LISTING:      Severity.LOW,
    SignalType.UTILITY_SHUTOFF:    Severity.LOW,
}

# ── Scraper cadence (seconds between requests to avoid hammering) ─────────
REQUEST_DELAY_SEC      = 1.5
MAX_RETRIES            = 3
PAGE_TIMEOUT_MS        = 30_000
NAVIGATION_TIMEOUT_MS  = 60_000

# ── Playwright browser config ─────────────────────────────────────────────
PLAYWRIGHT_HEADLESS    = True
PLAYWRIGHT_USER_AGENT  = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# ── Supabase REST batch size ──────────────────────────────────────────────
SUPABASE_BATCH_SIZE    = 50

# ── Scraper source categories (match leads_scraper_health.source_name) ────
SOURCE_FORECLOSURE     = "foreclosure_filings"
SOURCE_TAX             = "tax_assessor"
SOURCE_PROBATE         = "probate_court"
SOURCE_CODE            = "code_enforcement"
SOURCE_LIENS           = "lien_recordings"
SOURCE_DIVORCE         = "divorce_court"
SOURCE_BANKRUPTCY      = "bankruptcy_court"
SOURCE_EVICTION        = "eviction_court"
