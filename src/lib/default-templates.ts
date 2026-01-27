// Pre-built default mail templates
export interface DefaultTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  front_html: string;
  back_html: string | null;
  is_default: boolean;
  category: "postcard" | "letter" | "yellow_letter";
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    id: "default-yellow-letter",
    name: "Yellow Letter - Handwritten",
    type: "yellow_letter",
    description: "Classic handwritten-style letter on yellow background",
    category: "yellow_letter",
    is_default: true,
    front_html: `<div style="background: #FFF9C4; padding: 40px; font-family: 'Caveat', cursive; min-height: 100%;">
  <p style="font-size: 24px; line-height: 2; color: #1565C0; margin: 0;">
    Dear {owner_name},
  </p>
  <p style="font-size: 22px; line-height: 2; color: #1565C0; margin-top: 20px;">
    I'm writing to you because I'm interested in buying your house at {property_address}. I buy houses in the area and came across your property.
  </p>
  <p style="font-size: 22px; line-height: 2; color: #1565C0; margin-top: 20px;">
    If you're thinking about selling - even if the house needs work - I'd love to chat. I can close quickly and pay cash, so there's no hassle with banks or repairs.
  </p>
  <p style="font-size: 22px; line-height: 2; color: #1565C0; margin-top: 20px;">
    Give me a call when you have a chance!
  </p>
  <p style="font-size: 24px; line-height: 2; color: #1565C0; margin-top: 40px;">
    Thanks,<br/>
    {your_name}<br/>
    {your_phone}
  </p>
</div>`,
    back_html: null,
  },
  {
    id: "default-professional-letter",
    name: "Professional Cash Offer Letter",
    type: "letter",
    description: "Clean, professional letter with formal offer language",
    category: "letter",
    is_default: true,
    front_html: `<div style="font-family: 'Georgia', serif; padding: 60px; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 24px; color: #1f2937; margin: 0;">{your_company}</h1>
    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">{your_phone}</p>
  </div>
  
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">{current_date}</p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151;">
    Dear {owner_name},
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    I am writing to express my sincere interest in purchasing your property located at:
  </p>
  
  <p style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 20px 0; padding: 15px; background: #f3f4f6; border-left: 4px solid #2563eb;">
    {property_address}<br/>
    {property_city}, {property_state} {property_zip}
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151;">
    As a local real estate investor, I am prepared to make you a fair, all-cash offer with a closing timeline that works for your schedule. My offer comes with these benefits:
  </p>
  
  <ul style="font-size: 16px; line-height: 2; color: #374151; padding-left: 20px;">
    <li>No real estate agent commissions</li>
    <li>No repairs or cleaning required</li>
    <li>No financing contingencies</li>
    <li>Flexible closing date</li>
    <li>We cover all closing costs</li>
  </ul>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    I would appreciate the opportunity to discuss this with you at your earliest convenience. Please feel free to contact me directly.
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 30px;">
    Sincerely,<br/><br/>
    <strong>{your_name}</strong><br/>
    {your_company}<br/>
    {your_phone}
  </p>
</div>`,
    back_html: null,
  },
  {
    id: "default-we-buy-houses-4x6",
    name: "We Buy Houses Postcard",
    type: "postcard_4x6",
    description: "Bold, attention-grabbing cash buyer postcard",
    category: "postcard",
    is_default: true,
    front_html: `<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; height: 100%; box-sizing: border-box;">
  <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
    WE BUY HOUSES<br/>CASH! 💰
  </h1>
  <div style="background: #fbbf24; color: #1f2937; padding: 15px; margin: 20px 0; border-radius: 8px;">
    <p style="font-size: 14px; font-weight: bold; margin: 0;">
      ✓ Any Condition &nbsp; ✓ Fast Closing &nbsp; ✓ No Fees
    </p>
  </div>
  <p style="color: #ffffff; font-size: 16px; margin: 0;">
    Facing foreclosure? Behind on payments?<br/>
    Need to sell fast? We can help!
  </p>
</div>`,
    back_html: `<div style="padding: 25px; font-family: Arial, sans-serif;">
  <div style="text-align: center; margin-bottom: 20px;">
    <p style="font-size: 28px; font-weight: bold; color: #1e40af; margin: 0;">
      CALL NOW!
    </p>
    <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 5px 0;">
      {your_phone}
    </p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; padding-top: 15px;">
    <p style="font-size: 14px; color: #374151; margin: 0 0 10px 0;">
      <strong>Dear {owner_name},</strong>
    </p>
    <p style="font-size: 13px; color: #374151; line-height: 1.5; margin: 0;">
      We're interested in your property at {property_address}. Get a no-obligation cash offer within 24 hours!
    </p>
  </div>
  
  <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px; text-align: center;">
    <p style="font-size: 12px; color: #6b7280; margin: 0;">
      {your_company}
    </p>
  </div>
</div>`,
  },
  {
    id: "default-distressed-6x9",
    name: "Distressed Property Postcard",
    type: "postcard_6x9",
    description: "Empathetic messaging for distressed property owners",
    category: "postcard",
    is_default: true,
    front_html: `<div style="background: #fef3c7; padding: 40px; height: 100%; box-sizing: border-box;">
  <h1 style="color: #92400e; font-size: 36px; font-weight: bold; margin: 0 0 20px 0;">
    Behind on Payments?
  </h1>
  <p style="color: #78350f; font-size: 20px; line-height: 1.6; margin: 0;">
    You're not alone. We understand tough times happen, and we're here to help—not judge.
  </p>
  <div style="background: #ffffff; padding: 20px; border-radius: 12px; margin-top: 25px; border: 2px solid #f59e0b;">
    <p style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 0; text-align: center;">
      We can stop foreclosure and give you a fresh start
    </p>
  </div>
</div>`,
    back_html: `<div style="padding: 30px; font-family: Arial, sans-serif;">
  <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 20px 0;">
    Dear {owner_name},
  </p>
  <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 15px 0;">
    I noticed your property at <strong>{property_address}</strong> may be in a difficult situation. I want you to know there are options—even if you think there aren't.
  </p>
  <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 20px 0;">
    We buy houses in any condition and can often close within days. This could help you avoid foreclosure, get cash in hand, and move on with peace of mind.
  </p>
  
  <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
    <p style="font-size: 16px; font-weight: bold; color: #166534; margin: 0;">
      Call for a confidential conversation:
    </p>
    <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 5px 0 0 0;">
      {your_phone}
    </p>
  </div>
  
  <p style="font-size: 13px; color: #6b7280; margin-top: 15px;">
    {your_name} | {your_company}
  </p>
</div>`,
  },
  {
    id: "default-probate-letter",
    name: "Probate/Inherited Property Letter",
    type: "letter",
    description: "Sensitive, respectful letter for inherited properties",
    category: "letter",
    is_default: true,
    front_html: `<div style="font-family: 'Georgia', serif; padding: 60px; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 1px solid #d1d5db; padding-bottom: 20px; margin-bottom: 30px;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">{current_date}</p>
  </div>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151;">
    Dear {owner_name},
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    First and foremost, I want to express my sincere condolences for your loss. I understand this is a difficult time, and I hope you're finding the support you need.
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    I'm reaching out regarding the property at <strong>{property_address}</strong>. If managing an inherited property has become a burden during this time, I may be able to help ease that stress.
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    As a local real estate investor, I purchase properties in any condition. I can handle all the details, allowing you to focus on what matters most. There are:
  </p>
  
  <ul style="font-size: 16px; line-height: 2; color: #374151; padding-left: 20px;">
    <li>No need to clean out or repair the property</li>
    <li>No real estate commissions or hidden fees</li>
    <li>A straightforward, compassionate process</li>
    <li>A timeline that works for your family</li>
  </ul>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    There is absolutely no pressure or obligation. If you'd ever like to have a conversation about your options, I'm here to listen.
  </p>
  
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 30px;">
    With warm regards,<br/><br/>
    {your_name}<br/>
    {your_phone}
  </p>
</div>`,
    back_html: null,
  },
  {
    id: "default-followup-4x6",
    name: "Follow-Up Postcard",
    type: "postcard_4x6",
    description: "Re-engage prospects with urgency",
    category: "postcard",
    is_default: true,
    front_html: `<div style="background: #dc2626; padding: 30px; text-align: center; height: 100%; box-sizing: border-box;">
  <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0;">
    We're Still Interested! 🏠
  </h1>
  <p style="color: #fecaca; font-size: 16px; margin: 15px 0;">
    You may have received our letter about your property.
  </p>
  <div style="background: #ffffff; color: #dc2626; padding: 15px 25px; display: inline-block; border-radius: 8px; margin-top: 10px;">
    <p style="font-size: 16px; font-weight: bold; margin: 0;">
      Our offer is still available!
    </p>
  </div>
</div>`,
    back_html: `<div style="padding: 25px; font-family: Arial, sans-serif;">
  <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
    Hi {owner_name},
  </p>
  <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
    We reached out a few weeks ago about your property at {property_address}. I wanted to follow up and let you know our cash offer is still available.
  </p>
  <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
    If your situation has changed, or if you're now considering selling, I'd love to chat. No pressure, just options.
  </p>
  
  <div style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #dc2626;">
    <p style="font-size: 14px; color: #7f1d1d; margin: 0 0 5px 0; font-weight: bold;">
      ⏰ Time-Sensitive Offer
    </p>
    <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0;">
      {your_phone}
    </p>
  </div>
  
  <p style="font-size: 12px; color: #6b7280; margin-top: 15px; text-align: center;">
    {your_company}
  </p>
</div>`,
  },
];

export const SAMPLE_DATA_SETS = [
  {
    id: "sample-1",
    label: "Sample 1",
    data: {
      "{owner_name}": "John Smith",
      "{owner_first_name}": "John",
      "{property_address}": "123 Main St",
      "{property_street}": "123 Main St",
      "{property_city}": "Anytown",
      "{property_state}": "CA",
      "{property_zip}": "90210",
      "{your_name}": "Your Name",
      "{your_company}": "ABC Investments",
      "{your_phone}": "(555) 123-4567",
      "{tracking_phone}": "(555) 987-6543",
      "{offer_amount}": "$185,000",
      "{current_date}": new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
  },
  {
    id: "sample-2",
    label: "Sample 2",
    data: {
      "{owner_name}": "Maria Garcia",
      "{owner_first_name}": "Maria",
      "{property_address}": "456 Oak Ave",
      "{property_street}": "456 Oak Ave",
      "{property_city}": "Springfield",
      "{property_state}": "TX",
      "{property_zip}": "75001",
      "{your_name}": "Your Name",
      "{your_company}": "ABC Investments",
      "{your_phone}": "(555) 123-4567",
      "{tracking_phone}": "(555) 987-6543",
      "{offer_amount}": "$142,500",
      "{current_date}": new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
  },
  {
    id: "sample-3",
    label: "Sample 3",
    data: {
      "{owner_name}": "Robert Johnson",
      "{owner_first_name}": "Robert",
      "{property_address}": "789 Pine Rd",
      "{property_street}": "789 Pine Rd",
      "{property_city}": "Lakewood",
      "{property_state}": "FL",
      "{property_zip}": "33101",
      "{your_name}": "Your Name",
      "{your_company}": "ABC Investments",
      "{your_phone}": "(555) 123-4567",
      "{tracking_phone}": "(555) 987-6543",
      "{offer_amount}": "$225,000",
      "{current_date}": new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
  },
];

export function replaceMergeFields(html: string, data: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(data)) {
    result = result.split(key).join(value);
  }
  return result;
}
