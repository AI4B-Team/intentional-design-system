export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string | null
          assigned_to: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          outcome: string | null
          property_id: string
          scheduled_time: string
          status: string | null
        }
        Insert: {
          appointment_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          property_id: string
          scheduled_time: string
          status?: string | null
        }
        Update: {
          appointment_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          outcome?: string | null
          property_id?: string
          scheduled_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          avg_close_days: number | null
          buy_box: Json | null
          company: string | null
          created_at: string | null
          deals_closed: number | null
          deals_viewed: number | null
          email: string | null
          id: string
          last_activity: string | null
          name: string
          notes: string | null
          phone: string | null
          pof_verified: boolean | null
          preferred_contact: string | null
          reliability_score: number | null
          total_volume: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_close_days?: number | null
          buy_box?: Json | null
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_viewed?: number | null
          email?: string | null
          id?: string
          last_activity?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          pof_verified?: boolean | null
          preferred_contact?: string | null
          reliability_score?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_close_days?: number | null
          buy_box?: Json | null
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_viewed?: number | null
          email?: string | null
          id?: string
          last_activity?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          pof_verified?: boolean | null
          preferred_contact?: string | null
          reliability_score?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comps: {
        Row: {
          adjusted_value: number | null
          adjustments: Json | null
          baths: number | null
          beds: number | null
          comp_address: string
          created_at: string | null
          distance_miles: number | null
          id: string
          property_id: string
          rating: string | null
          sale_date: string | null
          sale_price: number | null
          sqft: number | null
        }
        Insert: {
          adjusted_value?: number | null
          adjustments?: Json | null
          baths?: number | null
          beds?: number | null
          comp_address: string
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          property_id: string
          rating?: string | null
          sale_date?: string | null
          sale_price?: number | null
          sqft?: number | null
        }
        Update: {
          adjusted_value?: number | null
          adjustments?: Json | null
          baths?: number | null
          beds?: number | null
          comp_address?: string
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          property_id?: string
          rating?: string | null
          sale_date?: string | null
          sale_price?: number | null
          sqft?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comps_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_sources: {
        Row: {
          company: string | null
          created_at: string | null
          deals_closed: number | null
          deals_sent: number | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          last_contact_date: string | null
          lending_criteria: Json | null
          linkedin: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          total_profit: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_sent?: number | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          lending_criteria?: Json | null
          linkedin?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          total_profit?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_sent?: number | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          lending_criteria?: Json | null
          linkedin?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          total_profit?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lender_loans: {
        Row: {
          created_at: string
          funding_date: string
          id: string
          interest_rate: number
          lender_id: string
          loan_amount: number
          ltv_at_funding: number | null
          maturity_date: string
          notes: string | null
          payoff_amount: number | null
          payoff_date: string | null
          points: number | null
          property_id: string
          status: string
          term_months: number
          total_interest_paid: number | null
          total_payments_made: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          funding_date: string
          id?: string
          interest_rate: number
          lender_id: string
          loan_amount: number
          ltv_at_funding?: number | null
          maturity_date: string
          notes?: string | null
          payoff_amount?: number | null
          payoff_date?: string | null
          points?: number | null
          property_id: string
          status?: string
          term_months: number
          total_interest_paid?: number | null
          total_payments_made?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          funding_date?: string
          id?: string
          interest_rate?: number
          lender_id?: string
          loan_amount?: number
          ltv_at_funding?: number | null
          maturity_date?: string
          notes?: string | null
          payoff_amount?: number | null
          payoff_date?: string | null
          points?: number | null
          property_id?: string
          status?: string
          term_months?: number
          total_interest_paid?: number | null
          total_payments_made?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lender_loans_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lender_loans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          counter_amount: number | null
          created_at: string | null
          id: string
          notes: string | null
          offer_amount: number
          offer_type: string | null
          property_id: string
          response: string | null
          sent_date: string | null
          sent_via: string | null
        }
        Insert: {
          counter_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          offer_amount: number
          offer_type?: string | null
          property_id: string
          response?: string | null
          sent_date?: string | null
          sent_via?: string | null
        }
        Update: {
          counter_amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          offer_amount?: number
          offer_type?: string | null
          property_id?: string
          response?: string | null
          sent_date?: string | null
          sent_via?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_log: {
        Row: {
          channel: string
          content: string | null
          created_at: string | null
          direction: string | null
          id: string
          opted_in: boolean | null
          response_content: string | null
          status: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          channel: string
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          opted_in?: boolean | null
          response_content?: string | null
          status?: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          opted_in?: boolean | null
          response_content?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          arv: number | null
          arv_confidence: string | null
          baths: number | null
          beds: number | null
          city: string | null
          county: string | null
          created_at: string | null
          distress_signals: Json | null
          equity_percent: number | null
          estimated_value: number | null
          id: string
          liens_total: number | null
          lot_size: number | null
          mao_aggressive: number | null
          mao_conservative: number | null
          mao_standard: number | null
          mortgage_balance: number | null
          mortgage_payment: number | null
          mortgage_rate: number | null
          motivation_score: number | null
          notes: string | null
          owner_email: string | null
          owner_mailing_address: string | null
          owner_name: string | null
          owner_phone: string | null
          property_type: string | null
          repair_details: Json | null
          repair_estimate: number | null
          source: string | null
          source_id: string | null
          sqft: number | null
          state: string | null
          status: string | null
          title_status: string | null
          updated_at: string | null
          user_id: string
          velocity_score: number | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          arv?: number | null
          arv_confidence?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          distress_signals?: Json | null
          equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          liens_total?: number | null
          lot_size?: number | null
          mao_aggressive?: number | null
          mao_conservative?: number | null
          mao_standard?: number | null
          mortgage_balance?: number | null
          mortgage_payment?: number | null
          mortgage_rate?: number | null
          motivation_score?: number | null
          notes?: string | null
          owner_email?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          property_type?: string | null
          repair_details?: Json | null
          repair_estimate?: number | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          title_status?: string | null
          updated_at?: string | null
          user_id: string
          velocity_score?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          arv?: number | null
          arv_confidence?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          distress_signals?: Json | null
          equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          liens_total?: number | null
          lot_size?: number | null
          mao_aggressive?: number | null
          mao_conservative?: number | null
          mao_standard?: number | null
          mortgage_balance?: number | null
          mortgage_payment?: number | null
          mortgage_rate?: number | null
          motivation_score?: number | null
          notes?: string | null
          owner_email?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          property_type?: string | null
          repair_details?: Json | null
          repair_estimate?: number | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          title_status?: string | null
          updated_at?: string | null
          user_id?: string
          velocity_score?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
