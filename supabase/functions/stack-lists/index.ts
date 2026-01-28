import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { 
      name,
      description,
      sourceListIds,
      stackCriteria,
      includeSuppressed = false,
      boostMotivation = true
    } = await req.json()

    if (!sourceListIds || sourceListIds.length < 2) {
      return new Response(JSON.stringify({ error: 'At least 2 lists required for stacking' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Create the stacked list record
    const { data: stackedList, error: listError } = await supabase
      .from('lists')
      .insert({
        user_id: user.id,
        name: name || `Stacked List (${sourceListIds.length} lists)`,
        description,
        list_type: 'stacked',
        status: 'building',
        stacked_from: sourceListIds,
        stack_criteria: String(stackCriteria)
      })
      .select()
      .single()

    if (listError) throw listError

    // Get all records from source lists
    const { data: sourceRecords, error: recordsError } = await supabase
      .from('list_records')
      .select('*')
      .in('list_id', sourceListIds)
      .eq('status', 'active')

    if (recordsError) throw recordsError

    // Group records by address hash
    const addressGroups = new Map<string, any[]>()
    
    for (const record of sourceRecords || []) {
      const hash = record.address_hash
      if (!hash) continue
      if (!addressGroups.has(hash)) {
        addressGroups.set(hash, [])
      }
      addressGroups.get(hash)!.push(record)
    }

    // Get suppression list if needed
    let suppressionHashes = new Set<string>()
    if (!includeSuppressed) {
      const { data: suppressions } = await supabase
        .from('suppression_list')
        .select('address_hash')
        .eq('user_id', user.id)
      
      suppressionHashes = new Set(suppressions?.map(s => s.address_hash) || [])
    }

    // Determine minimum matches required
    let minMatches = 1
    if (stackCriteria === 'all') {
      minMatches = sourceListIds.length
    } else if (stackCriteria === 'any') {
      minMatches = 1
    } else if (typeof stackCriteria === 'number' || !isNaN(parseInt(stackCriteria))) {
      minMatches = parseInt(stackCriteria)
    }

    // Build stacked records
    let stackedRecords: any[] = []
    let totalRecords = 0
    let uniqueRecords = 0
    let highMotivationCount = 0
    const matchCounts: Record<number, number> = {}

    for (const [hash, records] of addressGroups) {
      // Count unique lists this address appears in
      const uniqueListIds = new Set(records.map(r => r.list_id))
      const matchCount = uniqueListIds.size

      // Check if meets criteria
      if (matchCount < minMatches) continue

      // Check suppression
      if (suppressionHashes.has(hash)) continue

      totalRecords++
      matchCounts[matchCount] = (matchCounts[matchCount] || 0) + 1

      // Merge data from all matching records (prefer most complete)
      const mergedRecord = mergeRecords(records)
      
      // Boost motivation score based on match count
      let motivationScore = mergedRecord.motivation_score || 500
      if (boostMotivation) {
        motivationScore += (matchCount - 1) * 100
        motivationScore = Math.min(motivationScore, 1000)
      }

      if (motivationScore >= 700) highMotivationCount++

      // Collect all distress indicators from all records
      const allDistressIndicators = new Set<string>()
      records.forEach(r => {
        (r.distress_indicators || []).forEach((d: string) => allDistressIndicators.add(d))
      })

      stackedRecords.push({
        list_id: stackedList.id,
        user_id: user.id,
        address: mergedRecord.address,
        street_number: mergedRecord.street_number,
        street_name: mergedRecord.street_name,
        city: mergedRecord.city,
        state: mergedRecord.state,
        zip: mergedRecord.zip,
        county: mergedRecord.county,
        normalized_address: mergedRecord.normalized_address,
        address_hash: hash,
        owner_name: mergedRecord.owner_name,
        owner_first_name: mergedRecord.owner_first_name,
        owner_last_name: mergedRecord.owner_last_name,
        owner_type: mergedRecord.owner_type,
        mailing_address: mergedRecord.mailing_address,
        mailing_city: mergedRecord.mailing_city,
        mailing_state: mergedRecord.mailing_state,
        mailing_zip: mergedRecord.mailing_zip,
        is_absentee: mergedRecord.is_absentee,
        phone: mergedRecord.phone,
        email: mergedRecord.email,
        property_type: mergedRecord.property_type,
        beds: mergedRecord.beds,
        baths: mergedRecord.baths,
        sqft: mergedRecord.sqft,
        year_built: mergedRecord.year_built,
        estimated_value: mergedRecord.estimated_value,
        estimated_equity_percent: mergedRecord.estimated_equity_percent,
        distress_indicators: Array.from(allDistressIndicators),
        motivation_score: motivationScore,
        list_match_count: matchCount,
        source_lists: Array.from(uniqueListIds),
        property_id: mergedRecord.property_id,
        status: 'active',
        is_valid: true
      })

      uniqueRecords++

      // Batch insert
      if (stackedRecords.length >= 500) {
        await supabase.from('list_records').insert(stackedRecords)
        stackedRecords = []
      }
    }

    // Insert remaining records
    if (stackedRecords.length > 0) {
      await supabase.from('list_records').insert(stackedRecords)
    }

    // Calculate average motivation score
    const { data: avgScore } = await supabase
      .from('list_records')
      .select('motivation_score')
      .eq('list_id', stackedList.id)
    
    const avgMotivation = avgScore?.length 
      ? avgScore.reduce((sum, r) => sum + (r.motivation_score || 0), 0) / avgScore.length 
      : 0

    // Update stacked list stats
    await supabase
      .from('lists')
      .update({
        status: 'active',
        total_records: totalRecords,
        unique_records: uniqueRecords,
        high_motivation_count: highMotivationCount,
        avg_motivation_score: Math.round(avgMotivation),
        built_at: new Date().toISOString()
      })
      .eq('id', stackedList.id)

    return new Response(JSON.stringify({
      success: true,
      listId: stackedList.id,
      stats: {
        totalRecords,
        uniqueRecords,
        highMotivationCount,
        avgMotivationScore: Math.round(avgMotivation),
        sourceListCount: sourceListIds.length,
        minMatchesRequired: minMatches,
        matchCounts
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Stack lists error:', error)
    return new Response(JSON.stringify({ error: 'Stacking failed' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})

// Merge multiple records, preferring non-null values
function mergeRecords(records: any[]): any {
  const merged: any = {}
  const fields = [
    'address', 'street_number', 'street_name', 'city', 'state', 'zip', 'county',
    'normalized_address', 'owner_name', 'owner_first_name', 'owner_last_name',
    'owner_type', 'mailing_address', 'mailing_city', 'mailing_state', 'mailing_zip',
    'is_absentee', 'phone', 'email', 'property_type', 'beds', 'baths', 'sqft',
    'year_built', 'estimated_value', 'estimated_equity_percent', 'motivation_score',
    'property_id'
  ]

  for (const field of fields) {
    for (const record of records) {
      if (record[field] !== null && record[field] !== undefined && record[field] !== '') {
        merged[field] = record[field]
        break
      }
    }
  }

  return merged
}
