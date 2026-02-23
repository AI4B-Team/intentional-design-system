// Niche-specific defaults for each website site type

export interface SiteTypeDefaults {
  heroHeadline: string;
  heroSubheadline: string;
  heroBenefitsLine: string;
  heroBenefitsSubline: string;
  trustBadgeText: string;
  formHeadline: string;
  formSubheadline: string;
  formSubmitText: string;
  stats: Array<{ value: string; label: string }>;
  processSteps: Array<{ step: number; title: string; description: string }>;
  comparisonHeadline: string;
  comparisonSubheadline: string;
  comparisonRows: Array<{ label: string; traditional: string; company: string }>;
  comparisonTraditionalLabel: string;
  comparisonCompanyLabel: string;
  situationsHeadline: string;
  situationsSubheadline: string;
  situations: Array<{ icon: string; label: string }>;
  testimonialsHeadline: string;
  testimonialsSubheadline: string;
  testimonialsTagline: string;
  ctaHeadline: string;
  ctaSubheadline: string;
  ctaButtonText: string;
  mobileStickyText: string;
  quickStats: Array<{ value: string; label: string }>;
  asSeenOn: string[];
  showComparison: boolean;
  showSituations: boolean;
  showStats: boolean;
  showHowItWorks: boolean;
}

export const SITE_TYPE_DEFAULTS: Record<string, SiteTypeDefaults> = {
  seller: {
    heroHeadline: "Sell Your Home Fast, Fair & Simple",
    heroSubheadline: "Get a free cash offer on your house regardless of location, condition, size, price & equity.",
    heroBenefitsLine: "NO Commissions! NO Repairs! NO Listing Fees! NO Hassles!",
    heroBenefitsSubline: "Simply our cash for your house in 3 days.",
    trustBadgeText: "Rated 4.9★ By 2,400+ Homeowners",
    formHeadline: "Get Your Free Cash Offer",
    formSubheadline: "No Obligation. No Pressure. Takes 7 Minutes.",
    formSubmitText: "Get My Cash Offer →",
    stats: [
      { value: "2,400+", label: "Homes Purchased" },
      { value: "$480M+", label: "Paid to Homeowners" },
      { value: "4.9★", label: "Google Rating" },
      { value: "6", label: "Avg. Days to Close" },
    ],
    processSteps: [
      { step: 1, title: "Submit Your Property", description: "Fill out our simple form or give us a call. We'll gather basic info about your property." },
      { step: 2, title: "Get Your Cash Offer", description: "We'll present a fair, no-obligation cash offer within 24 hours — no hidden fees." },
      { step: 3, title: "Close & Get Paid", description: "Pick your closing date. We handle all paperwork and you walk away with cash." },
    ],
    comparisonHeadline: "Why Sellers Choose {companyName}",
    comparisonSubheadline: "See how we compare to listing with an agent",
    comparisonTraditionalLabel: "Traditional Agent",
    comparisonCompanyLabel: "{companyName}",
    comparisonRows: [
      { label: "Commissions & Fees", traditional: "6% ($18,000+)", company: "$0" },
      { label: "Closing Costs", traditional: "Seller pays", company: "We pay" },
      { label: "Time to Close", traditional: "60–90 days", company: "3–14 days" },
      { label: "Repairs Required", traditional: "Yes", company: "None" },
      { label: "Showings & Open Houses", traditional: "Required", company: "None" },
      { label: "Certainty of Sale", traditional: "Uncertain", company: "Guaranteed" },
      { label: "Closing Date", traditional: "Buyer decides", company: "You choose" },
    ],
    situationsHeadline: "We Buy Houses In Any Situation",
    situationsSubheadline: "Whatever you're going through, we've helped someone just like you",
    situations: [
      { icon: "clock", label: "Foreclosure" },
      { icon: "home", label: "Inherited Property" },
      { icon: "users", label: "Divorce" },
      { icon: "briefcase", label: "Relocating" },
      { icon: "dollar", label: "Behind on Payments" },
      { icon: "building", label: "Vacant Property" },
      { icon: "warning", label: "Tax Liens" },
      { icon: "zap", label: "Code Violations" },
      { icon: "bug", label: "Fire / Storm Damage" },
      { icon: "users", label: "Problem Tenants" },
      { icon: "arrow_down", label: "Downsizing" },
      { icon: "warehouse", label: "Hoarder Property" },
    ],
    testimonialsHeadline: "Real Stories From Real Sellers",
    testimonialsSubheadline: "Don't Take Our Word For It — Take Theirs",
    testimonialsTagline: "Over 1,000 Homeowners Have Successfully Sold Their Home As-Is With Our Team Since 2005",
    ctaHeadline: "Ready To Sell Your House For Cash?",
    ctaSubheadline: "Get your free, no-obligation cash offer in under 2 minutes. We've helped thousands of homeowners just like you.",
    ctaButtonText: "Get My FREE Cash Offer →",
    mobileStickyText: "Get Your Cash Offer",
    quickStats: [
      { value: "$0", label: "Fees & Commissions" },
      { value: "3 Days", label: "Fastest Closing" },
      { value: "24hr", label: "Offer Turnaround" },
    ],
    asSeenOn: ["HGTV", "A&E", "DIY", "Tampa Bay Times"],
    showComparison: true,
    showSituations: true,
    showStats: true,
    showHowItWorks: true,
  },

  buyer: {
    heroHeadline: "Exclusive Off-Market Investment Deals",
    heroSubheadline: "Get first access to below-market properties before they hit the MLS. Vetted deals delivered to your inbox.",
    heroBenefitsLine: "NO Bidding Wars! NO Retail Prices! NO MLS Competition!",
    heroBenefitsSubline: "Direct-to-investor deals sent weekly.",
    trustBadgeText: "Trusted By 500+ Active Investors",
    formHeadline: "Join Our Buyers List",
    formSubheadline: "Get exclusive deals sent to your inbox. Free to join.",
    formSubmitText: "Join Buyers List →",
    stats: [
      { value: "500+", label: "Active Buyers" },
      { value: "150+", label: "Deals Closed" },
      { value: "30%", label: "Avg. Below Market" },
      { value: "48hr", label: "Deal Alert Speed" },
    ],
    processSteps: [
      { step: 1, title: "Join Our Buyers List", description: "Tell us your buy box — property types, locations, price range, and strategy." },
      { step: 2, title: "Receive Exclusive Deals", description: "Get vetted off-market properties sent directly to your inbox before anyone else." },
      { step: 3, title: "Close & Profit", description: "Make an offer, close fast, and start building your portfolio or flipping for profit." },
    ],
    comparisonHeadline: "Why Investors Choose {companyName}",
    comparisonSubheadline: "Compare our deals to traditional MLS listings",
    comparisonTraditionalLabel: "MLS Listings",
    comparisonCompanyLabel: "{companyName}",
    comparisonRows: [
      { label: "Competition", traditional: "Multiple offers", company: "Exclusive access" },
      { label: "Pricing", traditional: "At or above market", company: "20–40% below market" },
      { label: "Due Diligence Info", traditional: "Limited", company: "Full packages provided" },
      { label: "Speed to Close", traditional: "45–60 days", company: "7–21 days" },
      { label: "Deal Flow", traditional: "You search", company: "Deals sent to you" },
      { label: "Rehab Estimates", traditional: "Not included", company: "Included with deal" },
    ],
    situationsHeadline: "Deal Types We Source",
    situationsSubheadline: "We find opportunities across every real estate investment strategy",
    situations: [
      { icon: "home", label: "Fix & Flip" },
      { icon: "building", label: "Buy & Hold" },
      { icon: "warehouse", label: "Multi-Family" },
      { icon: "dollar", label: "Wholesale" },
      { icon: "zap", label: "BRRRR Strategy" },
      { icon: "briefcase", label: "Commercial" },
      { icon: "clock", label: "Pre-Foreclosure" },
      { icon: "arrow_down", label: "Short Sales" },
      { icon: "home", label: "Vacant Land" },
      { icon: "users", label: "Seller Finance" },
      { icon: "building", label: "Section 8" },
      { icon: "dollar", label: "Tax Lien Deals" },
    ],
    testimonialsHeadline: "What Our Investors Say",
    testimonialsSubheadline: "Hear from buyers who've built wealth with our deals",
    testimonialsTagline: "Over 500 investors trust us for consistent, profitable deal flow",
    ctaHeadline: "Ready To Find Your Next Deal?",
    ctaSubheadline: "Join hundreds of investors getting exclusive off-market deals delivered to their inbox weekly.",
    ctaButtonText: "Join Buyers List →",
    mobileStickyText: "Join Buyers List",
    quickStats: [
      { value: "30%+", label: "Below Market Value" },
      { value: "Weekly", label: "New Deals" },
      { value: "Free", label: "To Join" },
    ],
    asSeenOn: ["BiggerPockets", "Forbes", "Realtor.com", "Zillow"],
    showComparison: true,
    showSituations: true,
    showStats: true,
    showHowItWorks: true,
  },

  company: {
    heroHeadline: "Your Trusted Real Estate Partner",
    heroSubheadline: "We help homeowners sell fast and investors find great deals. Professional, transparent, and results-driven.",
    heroBenefitsLine: "Licensed! Insured! BBB Accredited! Locally Owned!",
    heroBenefitsSubline: "Serving our community for over 15 years.",
    trustBadgeText: "BBB A+ Rated | Locally Owned & Operated",
    formHeadline: "Get In Touch",
    formSubheadline: "Tell us about your situation. We'll reach out within 24 hours.",
    formSubmitText: "Contact Us →",
    stats: [
      { value: "15+", label: "Years in Business" },
      { value: "2,400+", label: "Deals Completed" },
      { value: "4.9★", label: "Google Rating" },
      { value: "$480M+", label: "Transaction Volume" },
    ],
    processSteps: [
      { step: 1, title: "Reach Out To Us", description: "Contact us by phone, email, or our simple online form. Tell us about your property or goals." },
      { step: 2, title: "We Evaluate & Advise", description: "Our experienced team evaluates your situation and presents tailored solutions — no pressure." },
      { step: 3, title: "Get Results", description: "Whether selling, buying, or investing — we deliver fast, fair, and transparent outcomes." },
    ],
    comparisonHeadline: "Our Services",
    comparisonSubheadline: "Comprehensive real estate solutions under one roof",
    comparisonTraditionalLabel: "Others",
    comparisonCompanyLabel: "{companyName}",
    comparisonRows: [
      { label: "Cash Home Buying", traditional: "Limited", company: "Any property, any condition" },
      { label: "Investment Consulting", traditional: "Generic advice", company: "Personalized strategy" },
      { label: "Property Management", traditional: "High fees", company: "Competitive rates" },
      { label: "Rehab & Renovation", traditional: "You coordinate", company: "Full-service" },
      { label: "Wholesale Deals", traditional: "Unreliable", company: "Consistent pipeline" },
      { label: "Closing Support", traditional: "Minimal", company: "End-to-end" },
    ],
    situationsHeadline: "How We Can Help",
    situationsSubheadline: "Whatever your real estate needs, we have a solution",
    situations: [
      { icon: "home", label: "Sell Your Home" },
      { icon: "dollar", label: "Cash Offers" },
      { icon: "building", label: "Investment Properties" },
      { icon: "users", label: "Property Management" },
      { icon: "briefcase", label: "Commercial RE" },
      { icon: "zap", label: "Quick Closings" },
      { icon: "warehouse", label: "Portfolio Sales" },
      { icon: "clock", label: "Probate Help" },
      { icon: "warning", label: "Foreclosure Assistance" },
      { icon: "arrow_down", label: "Downsizing Support" },
      { icon: "home", label: "Relocation Services" },
      { icon: "users", label: "1031 Exchange" },
    ],
    testimonialsHeadline: "What Our Clients Say",
    testimonialsSubheadline: "Real results from real people we've worked with",
    testimonialsTagline: "Thousands of satisfied clients across buying, selling, and investing",
    ctaHeadline: "Let's Work Together",
    ctaSubheadline: "Whether you're buying, selling, or investing — we're here to help you succeed.",
    ctaButtonText: "Contact Us Today →",
    mobileStickyText: "Contact Us",
    quickStats: [
      { value: "15+", label: "Years Experience" },
      { value: "A+", label: "BBB Rating" },
      { value: "24hr", label: "Response Time" },
    ],
    asSeenOn: ["BBB", "Chamber of Commerce", "REIA", "Local News"],
    showComparison: true,
    showSituations: true,
    showStats: true,
    showHowItWorks: true,
  },

  squeeze: {
    heroHeadline: "Get Your Free Cash Offer In 60 Seconds",
    heroSubheadline: "Enter your address below. No obligations. No strings attached. Just a fair cash offer.",
    heroBenefitsLine: "100% FREE! INSTANT! NO OBLIGATION!",
    heroBenefitsSubline: "Takes less than 60 seconds.",
    trustBadgeText: "Join 10,000+ Homeowners Who Got Their Free Offer",
    formHeadline: "What's Your Home Worth?",
    formSubheadline: "Enter your info for an instant cash offer.",
    formSubmitText: "Get My Offer Now →",
    stats: [],
    processSteps: [],
    comparisonHeadline: "",
    comparisonSubheadline: "",
    comparisonTraditionalLabel: "",
    comparisonCompanyLabel: "",
    comparisonRows: [],
    situationsHeadline: "",
    situationsSubheadline: "",
    situations: [],
    testimonialsHeadline: "Homeowners Love Us",
    testimonialsSubheadline: "See why thousands trust us",
    testimonialsTagline: "",
    ctaHeadline: "Don't Wait — Get Your Offer Now",
    ctaSubheadline: "Every day you wait could cost you money. Get a no-obligation cash offer in under 60 seconds.",
    ctaButtonText: "Get My Offer Now →",
    mobileStickyText: "Get My Offer",
    quickStats: [
      { value: "60s", label: "To Get Your Offer" },
      { value: "$0", label: "Cost To You" },
      { value: "100%", label: "No Obligation" },
    ],
    asSeenOn: [],
    showComparison: false,
    showSituations: false,
    showStats: false,
    showHowItWorks: false,
  },
};

export function getSiteTypeDefaults(siteType: string | null | undefined): SiteTypeDefaults {
  return SITE_TYPE_DEFAULTS[siteType || "seller"] || SITE_TYPE_DEFAULTS.seller;
}
