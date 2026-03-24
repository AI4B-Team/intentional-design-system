import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authErr } = await sb.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const userId = claims.claims.sub as string;

    const FIRECRAWL_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, sources, jobId } = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for inserts
    const sbAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user's org
    const { data: membership } = await sbAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const orgId = membership?.organization_id;

    // Build search terms - map source names to site: filters
    const siteMap: Record<string, string> = {
      craigslist: 'craigslist.org',
      facebook: 'facebook.com/marketplace',
      zillow: 'zillow.com',
      realtor: 'realtor.com',
      offerup: 'offerup.com',
      forsalebyowner: 'forsalebyowner.com',
    };

    let searchTerms: string[];
    const filteredSources = (sources || []).filter((s: string) => s !== 'all_web');
    const includesAllWeb = !sources?.length || sources.includes('all_web');

    if (includesAllWeb && filteredSources.length === 0) {
      // Search the entire web with no site restriction
      searchTerms = [query];
    } else {
      searchTerms = [];
      // Add site-specific searches
      for (const s of filteredSources) {
        const site = siteMap[s];
        if (site) {
          searchTerms.push(`site:${site} ${query}`);
        }
      }
      // Add a general web search if "All Web" is also selected
      if (includesAllWeb) {
        searchTerms.push(query);
      }
    }

    let allLeads: any[] = [];

    for (const searchQuery of searchTerms) {
      console.log('Searching:', searchQuery);

      const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20,
          scrapeOptions: { formats: ['markdown'] },
        }),
      });

      if (!searchRes.ok) {
        console.error('Firecrawl search error:', await searchRes.text());
        continue;
      }

      const searchData = await searchRes.json();
      const results = searchData.data || searchData.results || [];

      for (const result of results) {
        // Extract listing data from markdown content
        const markdown = result.markdown || result.content || '';
        const title = result.title || '';
        const url = result.url || '';

        // Try to extract price
        const priceMatch = markdown.match(/\$[\d,]+(?:\.\d{2})?/) || title.match(/\$[\d,]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(/[$,]/g, '')) : null;

        // Try to extract address-like patterns
        const addressMatch = markdown.match(/\d+\s+[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Ct|Way|Pl|Cir)[.,]?\s*(?:[\w\s]+,\s*[A-Z]{2}\s*\d{5})?/i);

        // Try to extract beds/baths
        const bedsMatch = markdown.match(/(\d+)\s*(?:bed|br|bedroom)/i);
        const bathsMatch = markdown.match(/(\d+(?:\.\d)?)\s*(?:bath|ba|bathroom)/i);
        const sqftMatch = markdown.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);

        // Detect source
        let sourceName = 'web';
        if (url.includes('craigslist')) sourceName = 'craigslist';
        else if (url.includes('facebook')) sourceName = 'facebook';
        else if (url.includes('zillow')) sourceName = 'zillow';
        else if (url.includes('realtor')) sourceName = 'realtor';

        allLeads.push({
          user_id: userId,
          organization_id: orgId,
          scrape_job_id: jobId || null,
          source_url: url,
          source_name: sourceName,
          title: title.substring(0, 500),
          address: addressMatch?.[0]?.substring(0, 200) || null,
          price,
          description: markdown.substring(0, 2000),
          bedrooms: bedsMatch ? parseInt(bedsMatch[1]) : null,
          bathrooms: bathsMatch ? parseFloat(bathsMatch[1]) : null,
          sqft: sqftMatch ? parseInt(sqftMatch[1].replace(',', '')) : null,
          property_type: query.toLowerCase().includes('mobile') ? 'mobile_home' : null,
          status: 'new',
        });
      }
    }

    // Insert leads (skip duplicates by URL)
    let inserted = 0;
    for (const lead of allLeads) {
      if (lead.source_url) {
        const { count } = await sbAdmin
          .from('scraped_leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('source_url', lead.source_url);
        if (count && count > 0) continue;
      }

      const { error } = await sbAdmin.from('scraped_leads').insert(lead);
      if (!error) inserted++;
    }

    // Update job stats if applicable
    if (jobId) {
      await sbAdmin.from('scrape_jobs').update({
        last_run_at: new Date().toISOString(),
        last_run_results: inserted,
        total_leads_found: inserted, // Will be incremented properly via SQL later
        updated_at: new Date().toISOString(),
      }).eq('id', jobId);
    }

    return new Response(
      JSON.stringify({ success: true, leads_found: inserted, total_results: allLeads.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
