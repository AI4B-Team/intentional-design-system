import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export type LoiType = "cash" | "creative" | "hybrid";
export type MessageDirection = "inbound" | "outbound";

export interface LoiTemplate {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  loi_type: LoiType;
  description: string | null;
  offer_percentage: number | null;
  earnest_money_percentage: number | null;
  closing_days: number | null;
  down_payment_percentage: number | null;
  interest_rate: number | null;
  term_months: number | null;
  balloon_months: number | null;
  monthly_payment_formula: string | null;
  subject_line: string | null;
  body_html: string | null;
  body_text: string | null;
  is_default: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface InboxMessage {
  id: string;
  user_id: string;
  organization_id: string | null;
  property_id: string | null;
  offer_id: string | null;
  campaign_id: string | null;
  campaign_property_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  direction: MessageDirection;
  channel: string;
  subject: string | null;
  body: string | null;
  body_html: string | null;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  external_id: string | null;
  thread_id: string | null;
  in_reply_to: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  properties?: { address: string; city: string | null; state: string | null } | null;
  offers?: { offer_amount: number } | null;
}

export interface OfferBatch {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string | null;
  loi_template_id: string | null;
  loi_type: LoiType;
  offer_percentage: number | null;
  earnest_money: number | null;
  closing_days: number | null;
  down_payment_percentage: number | null;
  interest_rate: number | null;
  term_months: number | null;
  status: string;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_properties: number;
  offers_sent: number;
  offers_opened: number;
  offers_responded: number;
  delivery_channels: string[];
  daily_limit: number;
  created_at: string;
  updated_at: string;
}

export interface BatchOfferItem {
  id: string;
  batch_id: string;
  property_id: string | null;
  property_address: string;
  property_city: string | null;
  property_state: string | null;
  property_zip: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  list_price: number | null;
  offer_amount: number | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  responded_at: string | null;
  response_type: string | null;
  response_notes: string | null;
  error_message: string | null;
  offer_id: string | null;
  created_at: string;
  updated_at: string;
}

// Default LOI templates
export const DEFAULT_LOI_TEMPLATES: Omit<LoiTemplate, "id" | "user_id" | "organization_id" | "created_at" | "updated_at" | "use_count">[] = [
  {
    name: "Standard Cash Offer",
    loi_type: "cash",
    description: "Quick cash close with minimal contingencies",
    offer_percentage: 70,
    earnest_money_percentage: 1,
    closing_days: 14,
    down_payment_percentage: null,
    interest_rate: null,
    term_months: null,
    balloon_months: null,
    monthly_payment_formula: null,
    subject_line: "Cash Offer for {{property_address}}",
    body_html: `<p>Dear {{contact_name}},</p>
<p>I am pleased to submit this Letter of Intent for the property located at <strong>{{property_address}}</strong>.</p>
<h3>Offer Terms:</h3>
<ul>
<li>Purchase Price: <strong>{{offer_amount}}</strong></li>
<li>Earnest Money Deposit: <strong>{{earnest_money}}</strong></li>
<li>Closing Timeline: <strong>{{closing_days}} days</strong></li>
<li>Financing: <strong>All Cash - No Contingencies</strong></li>
</ul>
<p>This is a firm offer subject only to a brief inspection period. We are prepared to close quickly at your convenience.</p>
<p>Best regards,<br>{{sender_name}}<br>{{sender_company}}<br>{{sender_phone}}</p>`,
    body_text: null,
    is_default: true,
  },
  {
    name: "Seller Financing",
    loi_type: "creative",
    description: "Owner financing with monthly payments",
    offer_percentage: 85,
    earnest_money_percentage: 2,
    closing_days: 30,
    down_payment_percentage: 10,
    interest_rate: 6,
    term_months: 360,
    balloon_months: 60,
    monthly_payment_formula: null,
    subject_line: "Creative Offer for {{property_address}}",
    body_html: `<p>Dear {{contact_name}},</p>
<p>I am submitting this Letter of Intent for <strong>{{property_address}}</strong> with seller financing terms.</p>
<h3>Proposed Terms:</h3>
<ul>
<li>Purchase Price: <strong>{{offer_amount}}</strong></li>
<li>Down Payment: <strong>{{down_payment}}</strong></li>
<li>Monthly Payment: <strong>{{monthly_payment}}</strong></li>
<li>Interest Rate: <strong>{{interest_rate}}%</strong></li>
<li>Term: <strong>{{term_months}} months</strong></li>
</ul>
<p>This structure provides you with monthly cash flow while allowing us to acquire the property with minimal upfront capital.</p>
<p>Best regards,<br>{{sender_name}}</p>`,
    body_text: null,
    is_default: false,
  },
  {
    name: "Hybrid Cash + Terms",
    loi_type: "hybrid",
    description: "Part cash at closing, balance over time",
    offer_percentage: 75,
    earnest_money_percentage: 1.5,
    closing_days: 21,
    down_payment_percentage: 30,
    interest_rate: 5,
    term_months: 120,
    balloon_months: 36,
    monthly_payment_formula: null,
    subject_line: "Hybrid Offer for {{property_address}}",
    body_html: `<p>Dear {{contact_name}},</p>
<p>I am proposing a hybrid purchase structure for <strong>{{property_address}}</strong>.</p>
<h3>Hybrid Terms:</h3>
<ul>
<li>Purchase Price: <strong>{{offer_amount}}</strong></li>
<li>Cash at Closing: <strong>{{cash_portion}}</strong></li>
<li>Seller Carry: <strong>{{seller_carry}}</strong></li>
<li>Monthly Payment: <strong>{{monthly_payment}}</strong></li>
<li>Term: <strong>{{term_months}} months</strong></li>
</ul>
<p>This gives you significant cash now plus ongoing income.</p>
<p>Best regards,<br>{{sender_name}}</p>`,
    body_text: null,
    is_default: false,
  },
];

// ============= LOI Templates =============

export function useLoiTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["loi-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loi_templates")
        .select("*")
        .order("is_default", { ascending: false })
        .order("use_count", { ascending: false });

      if (error) throw error;
      return data as unknown as LoiTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateLoiTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<LoiTemplate, "id" | "user_id" | "organization_id" | "created_at" | "updated_at" | "use_count">) => {
      const { data, error } = await supabase
        .from("loi_templates")
        .insert({ ...template, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as LoiTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loi-templates"] });
      toast.success("Template created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
    },
  });
}

export function useUpdateLoiTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LoiTemplate> }) => {
      const { data, error } = await supabase
        .from("loi_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as LoiTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loi-templates"] });
      toast.success("Template updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
    },
  });
}

export function useDeleteLoiTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loi_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loi-templates"] });
      toast.success("Template deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });
}

// ============= Inbox Messages =============

export function useInboxMessages(options?: { 
  isRead?: boolean; 
  isStarred?: boolean; 
  isArchived?: boolean;
  propertyId?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["inbox-messages", options],
    queryFn: async () => {
      let query = supabase
        .from("inbox_messages")
        .select(`
          *,
          properties:property_id (address, city, state),
          offers:offer_id (offer_amount)
        `)
        .order("created_at", { ascending: false });

      if (options?.isRead !== undefined) {
        query = query.eq("is_read", options.isRead);
      }
      if (options?.isStarred !== undefined) {
        query = query.eq("is_starred", options.isStarred);
      }
      if (options?.isArchived !== undefined) {
        query = query.eq("is_archived", options.isArchived);
      }
      if (options?.propertyId) {
        query = query.eq("property_id", options.propertyId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as unknown as InboxMessage[];
    },
    enabled: !!user,
  });
}

export function useInboxStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["inbox-stats"],
    queryFn: async () => {
      const { count: unread, error: unreadError } = await supabase
        .from("inbox_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("is_archived", false);

      if (unreadError) throw unreadError;

      const { count: starred, error: starredError } = await supabase
        .from("inbox_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_starred", true);

      if (starredError) throw starredError;

      const { count: total, error: totalError } = await supabase
        .from("inbox_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_archived", false);

      if (totalError) throw totalError;

      return { unread: unread || 0, starred: starred || 0, total: total || 0 };
    },
    enabled: !!user,
  });
}

export function useUpdateInboxMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<InboxMessage, 'metadata' | 'properties' | 'offers'>> }) => {
      const { data, error } = await supabase
        .from("inbox_messages")
        .update(updates as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as InboxMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update message");
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("inbox_messages")
        .update({ is_read: true })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-stats"] });
    },
  });
}

// ============= Offer Batches =============

export function useOfferBatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["offer-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as OfferBatch[];
    },
    enabled: !!user,
  });
}

export function useOfferBatch(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["offer-batch", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_batches")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as unknown as OfferBatch;
    },
    enabled: !!id && !!user,
  });
}

export function useBatchOfferItems(batchId: string | undefined) {
  return useQuery({
    queryKey: ["batch-offer-items", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batch_offer_items")
        .select("*")
        .eq("batch_id", batchId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as BatchOfferItem[];
    },
    enabled: !!batchId,
  });
}

export function useCreateOfferBatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { 
      name?: string;
      loi_type: LoiType;
      loi_template_id?: string;
      offer_percentage: number;
      earnest_money: number;
      closing_days: number;
      down_payment_percentage?: number;
      interest_rate?: number;
      term_months?: number;
      delivery_channels: string[];
      daily_limit: number;
      properties: Omit<BatchOfferItem, "id" | "batch_id" | "created_at" | "updated_at" | "status" | "sent_at" | "opened_at" | "responded_at" | "response_type" | "response_notes" | "error_message" | "offer_id">[];
    }) => {
      const { properties, ...batchData } = data;

      // Create batch
      const { data: batch, error: batchError } = await supabase
        .from("offer_batches")
        .insert({
          ...batchData,
          user_id: user!.id,
          total_properties: properties.length,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Add items
      if (properties.length > 0) {
        const items = properties.map((p) => ({
          ...p,
          batch_id: batch.id,
        }));

        const { error: itemsError } = await supabase
          .from("batch_offer_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return batch as unknown as OfferBatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-batches"] });
      toast.success("Offer batch created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create batch");
    },
  });
}

export function useUpdateOfferBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OfferBatch> }) => {
      const { data, error } = await supabase
        .from("offer_batches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as OfferBatch;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offer-batches"] });
      queryClient.invalidateQueries({ queryKey: ["offer-batch", data.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update batch");
    },
  });
}

export function useDeleteOfferBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offer_batches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-batches"] });
      toast.success("Batch deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete batch");
    },
  });
}

// ============= Offer Calculations =============

export function calculateOfferAmount(listPrice: number, percentage: number): number {
  return Math.round(listPrice * (percentage / 100));
}

export function calculateEarnestMoney(offerAmount: number, percentage: number): number {
  return Math.round(offerAmount * (percentage / 100));
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) return Math.round(principal / termMonths);
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }
  return result;
}
