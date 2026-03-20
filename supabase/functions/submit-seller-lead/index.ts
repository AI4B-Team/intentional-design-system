import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface LeadSubmission {
  websiteId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  propertyAddress: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyCondition?: string;
  sellTimeline?: string;
  reasonSelling?: string;
  notes?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
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

    const body: LeadSubmission = await req.json()
    const {
      websiteId,
      firstName,
      lastName,
      fullName,
      email,
      phone,
      propertyAddress,
      propertyCity,
      propertyState,
      propertyZip,
      propertyCondition,
      sellTimeline,
      reasonSelling,
      notes,
      sourceUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    } = body

    // Validate required fields
    if (!websiteId || !propertyAddress) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Sanitize and validate inputs
    const sanitizedAddress = propertyAddress.trim().slice(0, 500)
    const sanitizedEmail = email?.trim().toLowerCase().slice(0, 255)
    const sanitizedPhone = phone?.replace(/[^\d+\-() ]/g, '').slice(0, 20)

    // Validate email format if provided
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get website info
    const { data: website, error: websiteError } = await supabase
      .from('seller_websites')
      .select('*')
      .eq('id', websiteId)
      .maybeSingle()

    if (websiteError || !website) {
      console.error('Website lookup error:', websiteError)
      return new Response(JSON.stringify({ error: 'Website not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate motivation score
    let autoScore = 500
    if (sellTimeline === 'asap') autoScore += 200
    else if (sellTimeline === '30_days') autoScore += 150
    else if (sellTimeline === '60_days') autoScore += 100
    else if (sellTimeline === '90_days') autoScore += 50
    
    if (propertyCondition === 'poor') autoScore += 150
    else if (propertyCondition === 'needs_work') autoScore += 100
    else if (propertyCondition === 'fair') autoScore += 50
    
    if (['behind_on_payments', 'foreclosure', 'divorce', 'inherited', 'tax_issues'].includes(reasonSelling || '')) {
      autoScore += 100
    }
    
    autoScore = Math.min(autoScore, 1000)

    // Determine motivation indicators
    const motivationIndicators: string[] = []
    if (sellTimeline === 'asap') motivationIndicators.push('urgent_timeline')
    if (sellTimeline === '30_days') motivationIndicators.push('quick_timeline')
    if (['poor', 'needs_work'].includes(propertyCondition || '')) {
      motivationIndicators.push('distressed_property')
    }
    if (['behind_on_payments', 'foreclosure', 'divorce', 'inherited'].includes(reasonSelling || '')) {
      motivationIndicators.push('motivated_seller')
    }

    // Format phone number
    const formattedPhone = formatPhone(sanitizedPhone)

    // Create lead record
    const { data: lead, error: leadError } = await supabase
      .from('seller_leads')
      .insert({
        website_id: websiteId,
        user_id: website.user_id,
        organization_id: website.organization_id,
        first_name: firstName?.trim().slice(0, 100),
        last_name: lastName?.trim().slice(0, 100),
        full_name: fullName?.trim() || `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim() || null,
        email: sanitizedEmail,
        phone: formattedPhone,
        property_address: sanitizedAddress,
        property_city: propertyCity?.trim().slice(0, 100),
        property_state: propertyState?.trim().slice(0, 2).toUpperCase(),
        property_zip: propertyZip?.trim().slice(0, 10),
        property_condition: propertyCondition,
        sell_timeline: sellTimeline,
        reason_selling: reasonSelling,
        notes: notes?.trim().slice(0, 2000),
        source_url: sourceUrl?.slice(0, 500),
        utm_source: utmSource?.slice(0, 100),
        utm_medium: utmMedium?.slice(0, 100),
        utm_campaign: utmCampaign?.slice(0, 100),
        utm_content: utmContent?.slice(0, 100),
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        user_agent: req.headers.get('user-agent')?.slice(0, 500),
        motivation_indicators: motivationIndicators,
        auto_score: autoScore,
        status: 'new'
      })
      .select()
      .single()

    if (leadError) {
      console.error('Lead insert error:', leadError)
      throw leadError
    }

    console.log('Lead created:', lead.id)

    // Update website submission count
    await supabase
      .from('seller_websites')
      .update({ 
        total_submissions: (website.total_submissions || 0) + 1
      })
      .eq('id', websiteId)

    // Track conversion event
    await supabase.from('website_analytics').insert({
      website_id: websiteId,
      event_type: 'form_submit',
      page_url: sourceUrl,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      user_agent: req.headers.get('user-agent')
    })

    // Send auto-response email to lead
    if (website.auto_respond_email && sanitizedEmail) {
      try {
        await sendAutoEmail(website, lead)
        await supabase.from('seller_leads').update({ auto_email_sent: true }).eq('id', lead.id)
        console.log('Auto email sent to lead')
      } catch (emailError) {
        console.error('Failed to send auto email:', emailError)
      }
    }

    // Send auto-response SMS to lead
    if (website.auto_respond_sms && formattedPhone) {
      try {
        await sendAutoSMS(website, lead)
        await supabase.from('seller_leads').update({ auto_sms_sent: true }).eq('id', lead.id)
        console.log('Auto SMS sent to lead')
      } catch (smsError) {
        console.error('Failed to send auto SMS:', smsError)
      }
    }

    // Notify website owner
    if (website.lead_notification_email) {
      try {
        await sendOwnerNotification(website, lead)
        await supabase.from('seller_leads').update({ owner_notified: true }).eq('id', lead.id)
        console.log('Owner notification sent')
      } catch (notifyError) {
        console.error('Failed to send owner notification:', notifyError)
      }
    }

    // Trigger Speed-to-Lead AI call if phone is available
    if (formattedPhone && website.organization_id) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        
        // Check if AI agent is configured and speed-to-lead is enabled
        const { data: agentConfig } = await supabase
          .from('voice_agent_config')
          .select('is_active, speed_to_lead_enabled, speed_to_lead_delay_seconds')
          .eq('organization_id', website.organization_id)
          .single()

        if (agentConfig?.is_active && agentConfig?.speed_to_lead_enabled) {
          const delayMs = (agentConfig.speed_to_lead_delay_seconds || 60) * 1000
          
          // Trigger the speed-to-lead call after the configured delay
          setTimeout(async () => {
            try {
              await fetch(`${supabaseUrl}/functions/v1/speed-to-lead`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${serviceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phone_number: formattedPhone,
                  contact_name: lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
                  property_address: sanitizedAddress,
                  organization_id: website.organization_id,
                  user_id: website.user_id,
                }),
              })
              console.log('Speed-to-lead AI call triggered')
            } catch (stlError) {
              console.error('Speed-to-lead trigger failed:', stlError)
            }
          }, delayMs)
        }
      } catch (stlCheckError) {
        console.error('Speed-to-lead config check failed:', stlCheckError)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      leadId: lead.id,
      message: 'Thank you! We have received your information and will contact you soon.',
      companyPhone: website.company_phone
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('Lead submission error:', error)
    return new Response(JSON.stringify({ 
      error: 'Submission failed. Please try again or call us directly.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper functions
function formatPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) return `+1${cleaned}`
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`
  return phone
}

async function sendAutoEmail(website: any, lead: any) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping auto email')
    return
  }

  const firstName = lead.first_name || 'there'
  const subject = 'We Received Your Property Information!'
  const body = `Hi ${firstName},

Thank you for reaching out about your property at ${lead.property_address}!

We've received your information and one of our team members will be in touch within 24 hours to discuss your situation and provide you with a no-obligation cash offer.

${website.company_phone ? `If you have any questions in the meantime, feel free to call us at ${website.company_phone}.` : ''}

Thank you,
${website.company_name}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${website.primary_color || '#2563EB'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .property { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${website.accent_color || '#10B981'}; }
    .cta { display: inline-block; background: ${website.accent_color || '#10B981'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You!</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>We've received your information about your property:</p>
      <div class="property">
        <strong>${lead.property_address}</strong><br>
        ${lead.property_city ? `${lead.property_city}, ` : ''}${lead.property_state || ''} ${lead.property_zip || ''}
      </div>
      <p>One of our team members will contact you <strong>within 24 hours</strong> to discuss your situation and provide you with a no-obligation cash offer.</p>
      ${website.company_phone ? `
      <p>Have questions? Call us anytime:</p>
      <a href="tel:${website.company_phone}" class="cta">📞 ${website.company_phone}</a>
      ` : ''}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${website.company_name}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: website.company_email ? `${website.company_name} <${website.company_email}>` : `${website.company_name} <noreply@resend.dev>`,
      to: [lead.email],
      subject,
      text: body,
      html
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return response.json()
}

async function sendAutoSMS(website: any, lead: any) {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  const TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER')
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
    console.log('Twilio credentials not configured, skipping auto SMS')
    return
  }

  if (!lead.phone) return

  const firstName = lead.first_name || 'there'
  const message = `Hi ${firstName}! Thanks for reaching out about ${lead.property_address}. We'll call you within 24 hours with a cash offer. - ${website.company_name}${website.company_phone ? ` (${website.company_phone})` : ''}`

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, 
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: lead.phone,
        From: TWILIO_PHONE,
        Body: message
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio API error: ${error}`)
  }

  return response.json()
}

async function sendOwnerNotification(website: any, lead: any) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping owner notification')
    return
  }

  const scoreEmoji = lead.auto_score >= 800 ? '🔥' : lead.auto_score >= 600 ? '⭐' : '📋'
  
  const timelineLabels: Record<string, string> = {
    'asap': '🚨 ASAP - Urgent',
    '30_days': '⏰ Within 30 days',
    '60_days': '📅 Within 60 days',
    '90_days': '📆 Within 90 days',
    'not_sure': '❓ Exploring options'
  }
  const timelineLabel = timelineLabels[lead.sell_timeline as string] || 'Not specified'

  const conditionLabels: Record<string, string> = {
    'excellent': '✨ Excellent',
    'good': '👍 Good',
    'fair': '😐 Fair',
    'needs_work': '🔧 Needs Work',
    'poor': '⚠️ Poor / Major Repairs'
  }
  const conditionLabel = conditionLabels[lead.property_condition as string] || 'Not specified'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 25px; text-align: center; }
    .score-badge { display: inline-block; background: white; color: #2563EB; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
    .content { padding: 25px; background: #f9fafb; }
    .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
    .contact-grid { display: grid; gap: 10px; }
    .contact-item { display: flex; align-items: center; gap: 10px; }
    .contact-item a { color: #2563EB; text-decoration: none; font-weight: 500; }
    .property-address { font-size: 18px; font-weight: bold; color: #111; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { font-weight: 500; }
    .cta-button { display: block; background: #10B981; color: white; text-align: center; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .notes { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🏠 New Lead!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${website.name}</p>
      <div class="score-badge">${scoreEmoji} Score: ${lead.auto_score}/1000</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="contact-grid">
          <div class="contact-item">
            👤 <strong>${lead.full_name || lead.first_name || 'Not provided'}</strong>
          </div>
          ${lead.phone ? `<div class="contact-item">📞 <a href="tel:${lead.phone}">${lead.phone}</a></div>` : ''}
          ${lead.email ? `<div class="contact-item">✉️ <a href="mailto:${lead.email}">${lead.email}</a></div>` : ''}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Property Details</div>
        <div class="property-address">${lead.property_address}</div>
        <div style="color: #6b7280; margin-top: 5px;">
          ${[lead.property_city, lead.property_state, lead.property_zip].filter(Boolean).join(', ')}
        </div>
        <div style="margin-top: 15px;">
          <div class="detail-row">
            <span class="detail-label">Condition</span>
            <span class="detail-value">${conditionLabel}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timeline</span>
            <span class="detail-value">${timelineLabel}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">${lead.reason_selling || 'Not specified'}</span>
          </div>
        </div>
      </div>

      ${lead.notes ? `
      <div class="notes">
        <div class="section-title">📝 Notes from Seller</div>
        <p style="margin: 0;">${lead.notes}</p>
      </div>
      ` : ''}

      ${lead.phone ? `
      <a href="tel:${lead.phone}" class="cta-button">📞 Call Now: ${lead.phone}</a>
      ` : ''}
    </div>
  </div>
</body>
</html>`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `Lead Alerts <noreply@resend.dev>`,
      to: [website.lead_notification_email],
      subject: `${scoreEmoji} New Lead: ${lead.property_address}`,
      html
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return response.json()
}
