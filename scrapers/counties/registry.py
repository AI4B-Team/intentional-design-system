"""
registry.py — Master registry of all supported counties.

Counties are ranked by real estate investment activity and data accessibility.
Each entry maps to a scraper class and defines which signal types it supports.

To add a new county: add a CountyConfig entry and create the corresponding
scraper class in counties/{state}/{county_name}.py
"""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class CountyConfig:
    state: str
    county: str
    fips: str
    population: int
    scraper_module: str          # e.g. "counties.texas.harris" or "" if not yet implemented
    scraper_class: str           # e.g. "HarrisCountyScraper" or ""
    signal_types: list[str]      # Which signals this scraper produces
    cadence_hours: int = 24      # How often to run (hours)
    priority: int = 1            # 1=highest, 5=lowest
    notes: str = ""
    court_system: str = ""       # e.g. "iCivil", "ACIS", "AZCourtConnect"
    state_name: str = ""

    @property
    def is_implemented(self) -> bool:
        return bool(self.scraper_module and self.scraper_class)


# ── Supported counties (top 50 by investment activity) ───────────────────

COUNTIES: list[CountyConfig] = [

    # ── TEXAS ─────────────────────────────────────────────────────────
    CountyConfig(
        state="TX", county="Harris", fips="48201", population=4_700_000,
        scraper_module="counties.texas.harris",
        scraper_class="HarrisCountyScraper",
        signal_types=["foreclosure", "trustee_sale", "lis_pendens",
                      "delinquent_tax", "probate"],
        cadence_hours=12, priority=1,
        notes="Houston metro. Highest volume in the country. HCAD + District Clerk.",
    ),
    CountyConfig(
        state="TX", county="Dallas", fips="48113", population=2_700_000,
        scraper_module="counties.texas.dallas",
        scraper_class="DallasCountyScraper",
        signal_types=["foreclosure", "lis_pendens", "delinquent_tax",
                      "probate", "lien"],
        cadence_hours=12, priority=1,
        notes="Dallas metro. DCAD + County Clerk.",
    ),
    CountyConfig(
        state="TX", county="Tarrant", fips="48439", population=2_200_000,
        scraper_module="counties.texas.tarrant",
        scraper_class="TarrantCountyScraper",
        signal_types=["foreclosure", "trustee_sale", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Fort Worth metro.",
    ),
    CountyConfig(
        state="TX", county="Bexar", fips="48029", population=2_100_000,
        scraper_module="counties.texas.bexar",
        scraper_class="BexarCountyScraper",
        signal_types=["foreclosure", "trustee_sale", "delinquent_tax", "probate"],
        cadence_hours=24, priority=2,
        notes="San Antonio metro.",
    ),
    CountyConfig(
        state="TX", county="Travis", fips="48453", population=1_300_000,
        scraper_module="counties.texas.travis",
        scraper_class="TravisCountyScraper",
        signal_types=["foreclosure", "lis_pendens", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Austin metro.",
    ),
    CountyConfig(
        state="TX", county="Collin", fips="48085", population=1_100_000,
        scraper_module="counties.texas.collin",
        scraper_class="CollinCountyScraper",
        signal_types=["foreclosure", "trustee_sale", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),
    CountyConfig(
        state="TX", county="Denton", fips="48121", population=950_000,
        scraper_module="counties.texas.denton",
        scraper_class="DentonCountyScraper",
        signal_types=["foreclosure", "trustee_sale", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),

    # ── ARIZONA ───────────────────────────────────────────────────────
    CountyConfig(
        state="AZ", county="Maricopa", fips="04013", population=4_500_000,
        scraper_module="counties.arizona.maricopa",
        scraper_class="MaricopaCountyScraper",
        signal_types=["trustee_sale", "delinquent_tax", "probate",
                      "lien", "lis_pendens"],
        cadence_hours=12, priority=1,
        notes="Phoenix metro. Recorder has public document search.",
    ),
    CountyConfig(
        state="AZ", county="Pima", fips="04019", population=1_100_000,
        scraper_module="counties.arizona.pima",
        scraper_class="PimaCountyScraper",
        signal_types=["trustee_sale", "delinquent_tax", "probate"],
        cadence_hours=24, priority=2,
        notes="Tucson metro.",
    ),

    # ── FLORIDA ───────────────────────────────────────────────────────
    CountyConfig(
        state="FL", county="Miami-Dade", fips="12086", population=2_800_000,
        scraper_module="counties.florida.florida_counties",
        scraper_class="MiamiDadeCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "lis_pendens"],
        cadence_hours=12, priority=1,
        notes="Miami metro. Clerk of Courts online docket.",
    ),
    CountyConfig(
        state="FL", county="Broward", fips="12011", population=1_950_000,
        scraper_module="counties.florida.florida_counties",
        scraper_class="BrowardCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=1,
        notes="Fort Lauderdale metro.",
    ),
    CountyConfig(
        state="FL", county="Palm Beach", fips="12099", population=1_500_000,
        scraper_module="counties.florida.palm_beach",
        scraper_class="PalmBeachCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "lis_pendens"],
        cadence_hours=24, priority=2,
    ),
    CountyConfig(
        state="FL", county="Hillsborough", fips="12057", population=1_500_000,
        scraper_module="counties.florida.hillsborough",
        scraper_class="HillsboroughCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate"],
        cadence_hours=24, priority=2,
        notes="Tampa metro.",
    ),
    CountyConfig(
        state="FL", county="Orange", fips="12095", population=1_400_000,
        scraper_module="counties.florida.orange",
        scraper_class="OrangeCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "lis_pendens"],
        cadence_hours=24, priority=2,
        notes="Orlando metro.",
    ),
    CountyConfig(
        state="FL", county="Duval", fips="12031", population=1_000_000,
        scraper_module="counties.florida.duval",
        scraper_class="DuvalCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Jacksonville.",
    ),
    CountyConfig(
        state="FL", county="Pinellas", fips="12103", population=980_000,
        scraper_module="counties.florida.pinellas",
        scraper_class="PinellasCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),

    # ── ILLINOIS ──────────────────────────────────────────────────────
    CountyConfig(
        state="IL", county="Cook", fips="17031", population=5_200_000,
        scraper_module="counties.illinois.cook",
        scraper_class="CookCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "code_violation",
                      "vacancy", "probate"],
        cadence_hours=12, priority=1,
        notes="Chicago metro. Excellent open data APIs. Chicago Data Portal.",
    ),

    # ── CALIFORNIA ────────────────────────────────────────────────────
    CountyConfig(
        state="CA", county="Los Angeles", fips="06037", population=10_000_000,
        scraper_module="counties.california.los_angeles",
        scraper_class="LosAngelesCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax",
                      "code_violation", "probate"],
        cadence_hours=12, priority=1,
        notes="LA County. NODs filed with County Recorder. Open data portal.",
    ),
    CountyConfig(
        state="CA", county="San Diego", fips="06073", population=3_300_000,
        scraper_module="counties.california.san_diego",
        scraper_class="SanDiegoCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=2,
    ),
    CountyConfig(
        state="CA", county="Riverside", fips="06065", population=2_500_000,
        scraper_module="counties.california.riverside",
        scraper_class="RiversideCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=2,
    ),
    CountyConfig(
        state="CA", county="San Bernardino", fips="06071", population=2_200_000,
        scraper_module="counties.california.san_bernardino",
        scraper_class="SanBernardinoCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=2,
    ),
    CountyConfig(
        state="CA", county="Sacramento", fips="06067", population=1_600_000,
        scraper_module="counties.california.sacramento",
        scraper_class="SacramentoCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),

    # ── GEORGIA ───────────────────────────────────────────────────────
    CountyConfig(
        state="GA", county="Fulton", fips="13121", population=1_100_000,
        scraper_module="counties.georgia.fulton",
        scraper_class="FultonCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate", "lien"],
        cadence_hours=24, priority=1,
        notes="Atlanta metro. Superior Court public access.",
    ),
    CountyConfig(
        state="GA", county="Gwinnett", fips="13135", population=1_000_000,
        scraper_module="counties.georgia.gwinnett",
        scraper_class="GwinnettCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=2,
    ),
    CountyConfig(
        state="GA", county="Cobb", fips="13067", population=800_000,
        scraper_module="counties.georgia.cobb",
        scraper_class="CobbCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),

    # ── NORTH CAROLINA ────────────────────────────────────────────────
    CountyConfig(
        state="NC", county="Mecklenburg", fips="37119", population=1_100_000,
        scraper_module="counties.north_carolina.mecklenburg",
        scraper_class="MecklenburgCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "lis_pendens"],
        cadence_hours=24, priority=2,
        notes="Charlotte metro.",
    ),
    CountyConfig(
        state="NC", county="Wake", fips="37183", population=1_100_000,
        scraper_module="counties.north_carolina.wake",
        scraper_class="WakeCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Raleigh metro.",
    ),

    # ── NEVADA ────────────────────────────────────────────────────────
    CountyConfig(
        state="NV", county="Clark", fips="32003", population=2_300_000,
        scraper_module="counties.nevada.clark",
        scraper_class="ClarkCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax",
                      "lis_pendens"],
        cadence_hours=12, priority=1,
        notes="Las Vegas metro. High foreclosure volume.",
    ),

    # ── OHIO ──────────────────────────────────────────────────────────
    CountyConfig(
        state="OH", county="Cuyahoga", fips="39035", population=1_200_000,
        scraper_module="counties.ohio.cuyahoga",
        scraper_class="CuyahogaCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate", "lien"],
        cadence_hours=24, priority=2,
        notes="Cleveland metro. Very active foreclosure market.",
    ),
    CountyConfig(
        state="OH", county="Franklin", fips="39049", population=1_300_000,
        scraper_module="counties.ohio.franklin",
        scraper_class="FranklinCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Columbus metro.",
    ),
    CountyConfig(
        state="OH", county="Hamilton", fips="39061", population=830_000,
        scraper_module="counties.ohio.hamilton",
        scraper_class="HamiltonCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate"],
        cadence_hours=24, priority=3,
        notes="Cincinnati metro.",
    ),
    CountyConfig(
        state="OH", county="Summit", fips="39153", population=540_000,
        scraper_module="counties.ohio.summit",
        scraper_class="SummitCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=48, priority=3,
        notes="Akron area.",
    ),
    CountyConfig(
        state="OH", county="Montgomery", fips="39113", population=535_000,
        scraper_module="counties.ohio.montgomery",
        scraper_class="MontgomeryCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=48, priority=3,
        notes="Dayton area.",
    ),

    # ── TENNESSEE ─────────────────────────────────────────────────────
    CountyConfig(
        state="TN", county="Shelby", fips="47157", population=935_000,
        scraper_module="counties.tennessee.shelby",
        scraper_class="ShelbyCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate"],
        cadence_hours=24, priority=2,
        notes="Memphis metro.",
    ),
    CountyConfig(
        state="TN", county="Davidson", fips="47037", population=715_000,
        scraper_module="counties.tennessee.davidson",
        scraper_class="DavidsonCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Nashville metro.",
    ),

    # ── MICHIGAN ──────────────────────────────────────────────────────
    CountyConfig(
        state="MI", county="Wayne", fips="26163", population=1_800_000,
        scraper_module="counties.michigan.wayne",
        scraper_class="WayneCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "code_violation"],
        cadence_hours=24, priority=2,
        notes="Detroit metro. Very high tax foreclosure volume.",
    ),
    CountyConfig(
        state="MI", county="Oakland", fips="26125", population=1_300_000,
        scraper_module="counties.michigan.oakland",
        scraper_class="OaklandCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=3,
    ),

    # ── PENNSYLVANIA ──────────────────────────────────────────────────
    CountyConfig(
        state="PA", county="Philadelphia", fips="42101", population=1_600_000,
        scraper_module="counties.pennsylvania.philadelphia",
        scraper_class="PhiladelphiaCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "code_violation",
                      "vacancy", "lien"],
        cadence_hours=24, priority=2,
        notes="Philadelphia. L&I violations open data available.",
    ),
    CountyConfig(
        state="PA", county="Allegheny", fips="42003", population=1_200_000,
        scraper_module="counties.pennsylvania.allegheny",
        scraper_class="AlleghenyCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=24, priority=3,
        notes="Pittsburgh metro.",
    ),

    # ── WASHINGTON ────────────────────────────────────────────────────
    CountyConfig(
        state="WA", county="King", fips="53033", population=2_300_000,
        scraper_module="counties.washington.king",
        scraper_class="KingCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Seattle metro.",
    ),

    # ── COLORADO ──────────────────────────────────────────────────────
    CountyConfig(
        state="CO", county="Denver", fips="08031", population=715_000,
        scraper_module="counties.colorado.denver",
        scraper_class="DenverCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=2,
        notes="Denver. Public trustee publishes weekly foreclosure list.",
    ),
    CountyConfig(
        state="CO", county="El Paso", fips="08041", population=735_000,
        scraper_module="counties.colorado.el_paso",
        scraper_class="ElPasoCountyScraper",
        signal_types=["foreclosure", "notice_of_default", "delinquent_tax"],
        cadence_hours=24, priority=3,
        notes="Colorado Springs.",
    ),

    # ── INDIANA ───────────────────────────────────────────────────────
    CountyConfig(
        state="IN", county="Marion", fips="18097", population=980_000,
        scraper_module="counties.indiana.marion",
        scraper_class="MarionCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "code_violation"],
        cadence_hours=24, priority=3,
        notes="Indianapolis metro.",
    ),

    # ── MINNESOTA ────────────────────────────────────────────────────
    CountyConfig(
        state="MN", county="Hennepin", fips="27053", population=1_300_000,
        scraper_module="counties.minnesota.hennepin",
        scraper_class="HennepinCountyScraper",
        signal_types=["foreclosure", "delinquent_tax", "probate"],
        cadence_hours=24, priority=3,
        notes="Minneapolis metro.",
    ),

    # ── VIRGINIA ──────────────────────────────────────────────────────
    CountyConfig(
        state="VA", county="Fairfax", fips="51059", population=1_100_000,
        scraper_module="counties.virginia.fairfax",
        scraper_class="FairfaxCountyScraper",
        signal_types=["foreclosure", "delinquent_tax"],
        cadence_hours=48, priority=3,
        notes="Northern Virginia / DC metro.",
    ),
]


# ── Registry lookup helpers ───────────────────────────────────────────────

def get_county(state: str, county: str) -> Optional[CountyConfig]:
    for c in COUNTIES:
        if c.state.upper() == state.upper() and c.county.lower() == county.lower():
            return c
    return None


def get_counties_by_state(state: str) -> list[CountyConfig]:
    return [c for c in COUNTIES if c.state.upper() == state.upper()]


def get_counties_by_priority(max_priority: int = 5) -> list[CountyConfig]:
    return sorted(
        [c for c in COUNTIES if c.priority <= max_priority],
        key=lambda c: c.priority,
    )


def get_counties_by_cadence(max_hours: int) -> list[CountyConfig]:
    """Return counties that should run within the given cadence window."""
    return [c for c in COUNTIES if c.cadence_hours <= max_hours]



# ── Full US registry (all parseable counties from the master PDF) ─────────
#
# COUNTIES above contains hand-tuned configs for counties with custom
# scrapers. The JSON file ships every county in the master registry with
# its court system, FIPS, signal types and priority — including those
# without a custom Python scraper yet. The runner uses court_system to
# dispatch to a generic court-system scraper as a fallback.

_REGISTRY_JSON = Path(__file__).parent / "registry_data.json"


def _load_full_registry() -> list[CountyConfig]:
    if not _REGISTRY_JSON.exists():
        return []
    raw = json.loads(_REGISTRY_JSON.read_text())
    # Index hand-tuned entries by FIPS to override JSON defaults
    custom_by_fips = {c.fips: c for c in COUNTIES if c.fips}
    out: list[CountyConfig] = []
    for row in raw:
        fips = row["fips"]
        if fips in custom_by_fips:
            cfg = custom_by_fips[fips]
            cfg.court_system = cfg.court_system or row.get("court_system", "")
            cfg.state_name = row.get("state_name", "")
            out.append(cfg)
        else:
            out.append(CountyConfig(
                state=row["state"],
                county=row["county"],
                fips=fips,
                population=row.get("population") or 0,
                scraper_module="",
                scraper_class="",
                signal_types=row.get("signal_types", []),
                cadence_hours=24 if row.get("priority", 5) <= 2 else 48,
                priority=row.get("priority", 5),
                notes="",
                court_system=row.get("court_system", ""),
                state_name=row.get("state_name", ""),
            ))
    # Append any custom entries not present in the JSON
    seen = {row["fips"] for row in raw}
    for c in COUNTIES:
        if c.fips and c.fips not in seen:
            out.append(c)
    return out


ALL_COUNTIES: list[CountyConfig] = _load_full_registry() or list(COUNTIES)


def get_all_counties(implemented_only: bool = False) -> list[CountyConfig]:
    if implemented_only:
        return [c for c in ALL_COUNTIES if c.is_implemented]
    return ALL_COUNTIES


def get_counties_by_court_system(system: str) -> list[CountyConfig]:
    return [c for c in ALL_COUNTIES if c.court_system.lower() == system.lower()]


# Total county counts
TOTAL_COUNTIES = len(ALL_COUNTIES)
TOTAL_IMPLEMENTED = sum(1 for c in ALL_COUNTIES if c.is_implemented)

