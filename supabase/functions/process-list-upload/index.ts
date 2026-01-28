import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper functions
function normalizeAddress(address: string, city: string, state: string, zip: string): string {
  let normalized = `${address} ${city} ${state} ${zip}`.toLowerCase();
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  normalized = normalized.replace(/\bstreet\b/g, 'st');
  normalized = normalized.replace(/\bavenue\b/g, 'ave');
  normalized = normalized.replace(/\broad\b/g, 'rd');
  normalized = normalized.replace(/\bdrive\b/g, 'dr');
  normalized = normalized.replace(/\blane\b/g, 'ln');
  normalized = normalized.replace(/\bcourt\b/g, 'ct');
  normalized = normalized.replace(/\bcircle\b/g, 'cir');
  normalized = normalized.replace(/\bboulevard\b/g, 'blvd');
  normalized = normalized.replace(/\bapartment\b/g, 'apt');
  normalized = normalized.replace(/\bsuite\b/g, 'ste');
  normalized = normalized.replace(/\bnorth\b/g, 'n');
  normalized = normalized.replace(/\bsouth\b/g, 's');
  normalized = normalized.replace(/\beast\b/g, 'e');
  normalized = normalized.replace(/\bwest\b/g, 'w');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function isSameAddress(addr1: string, addr2: string): boolean {
  const n1 = normalizeAddress(addr1, '', '', '');
  const n2 = normalizeAddress(addr2, '', '', '');
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
  const rows = lines.slice(1).map(line => parseCSVLine(line).map(v => v.replace(/"/g, '').trim()));
  
  return { headers, rows };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { listId, fileUrl, columnMapping, organizationId } = await req.json();

    console.log(`Processing list ${listId} for user ${user.id}`);

    // Update list status to processing
    await supabase
      .from('lists')
      .update({ status: 'processing' })
      .eq('id', listId);

    // Fetch the CSV file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }
    const csvText = await fileResponse.text();

    // Parse CSV
    const { headers, rows } = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows with headers: ${headers.join(', ')}`);

    // Get user's suppression list hashes for quick lookup
    const { data: suppressions } = await supabase
      .from('suppression_list')
      .select('address_hash')
      .eq('user_id', user.id);
    
    const suppressionHashes = new Set(suppressions?.map(s => s.address_hash) || []);
    console.log(`Found ${suppressionHashes.size} suppression hashes`);

    // Get existing address hashes for deduplication
    const { data: existingRecords } = await supabase
      .from('list_records')
      .select('address_hash')
      .eq('user_id', user.id);
    
    const existingHashes = new Set(existingRecords?.map(r => r.address_hash).filter(Boolean) || []);
    console.log(`Found ${existingHashes.size} existing address hashes`);

    // Process records
    let recordsToInsert: any[] = [];
    let totalRecords = 0;
    let uniqueRecords = 0;
    let skippedDuplicates = 0;
    let skippedSuppressed = 0;
    let invalidRecords = 0;

    for (const row of rows) {
      totalRecords++;
      
      // Map columns to fields
      const record: any = {
        list_id: listId,
        user_id: user.id,
        organization_id: organizationId || null,
        raw_data: {},
        status: 'new'
      };

      // Apply column mapping
      for (const [csvColumn, ourField] of Object.entries(columnMapping)) {
        const columnIndex = headers.indexOf(csvColumn as string);
        if (columnIndex !== -1 && row[columnIndex]) {
          record.raw_data[csvColumn] = row[columnIndex];
          
          // Map to our fields
          switch (ourField) {
            case 'address':
              record.address = row[columnIndex];
              break;
            case 'city':
              record.city = row[columnIndex];
              break;
            case 'state':
              record.state = row[columnIndex];
              break;
            case 'zip':
              record.zip = row[columnIndex];
              break;
            case 'county':
              record.county = row[columnIndex];
              break;
            case 'owner_name':
              record.owner_name = row[columnIndex];
              // Try to split first/last
              const nameParts = row[columnIndex].split(' ');
              if (nameParts.length >= 2) {
                record.owner_first_name = nameParts[0];
                record.owner_last_name = nameParts.slice(1).join(' ');
              }
              break;
            case 'owner_first_name':
              record.owner_first_name = row[columnIndex];
              break;
            case 'owner_last_name':
              record.owner_last_name = row[columnIndex];
              break;
            case 'mailing_address':
              record.mailing_address = row[columnIndex];
              break;
            case 'mailing_city':
              record.mailing_city = row[columnIndex];
              break;
            case 'mailing_state':
              record.mailing_state = row[columnIndex];
              break;
            case 'mailing_zip':
              record.mailing_zip = row[columnIndex];
              break;
            case 'phone':
              record.phone = row[columnIndex];
              break;
            case 'email':
              record.email = row[columnIndex];
              break;
            case 'estimated_value':
              record.estimated_value = parseFloat(row[columnIndex]?.replace(/[^0-9.]/g, '')) || null;
              break;
            case 'assessed_value':
              record.assessed_value = parseFloat(row[columnIndex]?.replace(/[^0-9.]/g, '')) || null;
              break;
            case 'beds':
              record.beds = parseInt(row[columnIndex]) || null;
              break;
            case 'baths':
              record.baths = parseFloat(row[columnIndex]) || null;
              break;
            case 'sqft':
              record.sqft = parseInt(row[columnIndex]?.replace(/[^0-9]/g, '')) || null;
              break;
            case 'lot_size':
              record.lot_size = parseInt(row[columnIndex]?.replace(/[^0-9]/g, '')) || null;
              break;
            case 'year_built':
              record.year_built = parseInt(row[columnIndex]) || null;
              break;
            case 'property_type':
              record.property_type = row[columnIndex];
              break;
            case 'owner_type':
              record.owner_type = row[columnIndex];
              break;
            case 'last_sale_date':
              record.last_sale_date = row[columnIndex] || null;
              break;
            case 'last_sale_price':
              record.last_sale_price = parseFloat(row[columnIndex]?.replace(/[^0-9.]/g, '')) || null;
              break;
            case 'mortgage_balance':
              record.mortgage_balance = parseFloat(row[columnIndex]?.replace(/[^0-9.]/g, '')) || null;
              break;
            case 'equity_percent':
              record.estimated_equity_percent = parseFloat(row[columnIndex]?.replace(/[^0-9.]/g, '')) || null;
              break;
          }
        }
      }

      // Validate required fields
      if (!record.address) {
        invalidRecords++;
        continue;
      }

      // Normalize address and generate hash
      const normalizedAddress = normalizeAddress(
        record.address,
        record.city || '',
        record.state || '',
        record.zip || ''
      );
      record.normalized_address = normalizedAddress;
      record.address_hash = simpleHash(normalizedAddress);

      // Check suppression list
      if (suppressionHashes.has(record.address_hash)) {
        skippedSuppressed++;
        continue;
      }

      // Check for duplicates
      if (existingHashes.has(record.address_hash)) {
        skippedDuplicates++;
        continue;
      }

      // Determine if absentee owner
      if (record.mailing_address && record.address) {
        record.is_absentee = !isSameAddress(record.address, record.mailing_address);
      }

      // Mark as valid
      record.is_valid = true;

      // Add to batch
      recordsToInsert.push(record);
      existingHashes.add(record.address_hash); // Prevent duplicates within this file
      uniqueRecords++;

      // Batch insert every 500 records
      if (recordsToInsert.length >= 500) {
        const { error: insertError } = await supabase.from('list_records').insert(recordsToInsert);
        if (insertError) {
          console.error('Batch insert error:', insertError);
        }
        recordsToInsert = [];
      }
    }

    // Insert remaining records
    if (recordsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('list_records').insert(recordsToInsert);
      if (insertError) {
        console.error('Final batch insert error:', insertError);
      }
    }

    // Update list stats
    const { error: updateError } = await supabase
      .from('lists')
      .update({
        status: 'active',
        total_records: totalRecords,
        unique_records: uniqueRecords,
        skipped_duplicates: skippedDuplicates + skippedSuppressed,
        invalid_records: invalidRecords,
        built_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', listId);

    if (updateError) {
      console.error('Update list error:', updateError);
    }

    console.log(`Processing complete: ${uniqueRecords} unique of ${totalRecords} total`);

    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalRecords,
        uniqueRecords,
        skippedDuplicates,
        skippedSuppressed,
        invalidRecords
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('List processing error:', error);
    return new Response(JSON.stringify({ error: 'Processing failed', details: String(error) }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
