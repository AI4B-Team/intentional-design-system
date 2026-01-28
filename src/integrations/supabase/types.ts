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
      achievements: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          organization_id: string | null
          points: number
          threshold: number
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          name: string
          organization_id?: string | null
          points?: number
          threshold?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          organization_id?: string | null
          points?: number
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_points: {
        Row: {
          activity_type: string
          created_at: string | null
          entity_id: string | null
          id: string
          organization_id: string | null
          points: number
          reference_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          entity_id?: string | null
          id?: string
          organization_id?: string | null
          points?: number
          reference_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          entity_id?: string | null
          id?: string
          organization_id?: string | null
          points?: number
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_points_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_pricing: {
        Row: {
          cost_to_us: number
          id: string
          is_active: boolean | null
          price_to_user: number
          service: string
          updated_at: string | null
        }
        Insert: {
          cost_to_us: number
          id?: string
          is_active?: boolean | null
          price_to_user: number
          service: string
          updated_at?: string | null
        }
        Update: {
          cost_to_us?: number
          id?: string
          is_active?: boolean | null
          price_to_user?: number
          service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          organization_id: string | null
          outcome: string | null
          property_id: string
          scheduled_time: string
          status: string | null
          updated_by: string | null
        }
        Insert: {
          appointment_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          property_id: string
          scheduled_time: string
          status?: string | null
          updated_by?: string | null
        }
        Update: {
          appointment_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          property_id?: string
          scheduled_time?: string
          status?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_amount: number | null
          contractor_id: string
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          property_id: string
          received_at: string | null
          requested_at: string | null
          scope_items: Json | null
          scope_of_work: string | null
          status: string | null
          timeline_days: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          bid_amount?: number | null
          contractor_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          property_id: string
          received_at?: string | null
          requested_at?: string | null
          scope_items?: Json | null
          scope_of_work?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          bid_amount?: number | null
          contractor_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          property_id?: string
          received_at?: string | null
          requested_at?: string | null
          scope_items?: Json | null
          scope_of_work?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_property_id_fkey"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          pof_verified?: boolean | null
          preferred_contact?: string | null
          reliability_score?: number | null
          total_volume?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_properties: {
        Row: {
          address: string
          agent_email: string | null
          agent_name: string | null
          agent_phone: string | null
          brokerage: string | null
          campaign_id: string
          city: string | null
          created_at: string
          days_on_market: number | null
          followup_count: number | null
          id: string
          last_followup_at: string | null
          list_price: number | null
          notes: string | null
          offer_amount: number | null
          opened_at: string | null
          organization_id: string | null
          property_id: string | null
          responded_at: string | null
          response_content: string | null
          response_notes: string | null
          response_status: string | null
          response_type: string | null
          sent_at: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          address: string
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          brokerage?: string | null
          campaign_id: string
          city?: string | null
          created_at?: string
          days_on_market?: number | null
          followup_count?: number | null
          id?: string
          last_followup_at?: string | null
          list_price?: number | null
          notes?: string | null
          offer_amount?: number | null
          opened_at?: string | null
          organization_id?: string | null
          property_id?: string | null
          responded_at?: string | null
          response_content?: string | null
          response_notes?: string | null
          response_status?: string | null
          response_type?: string | null
          sent_at?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          brokerage?: string | null
          campaign_id?: string
          city?: string | null
          created_at?: string
          days_on_market?: number | null
          followup_count?: number | null
          id?: string
          last_followup_at?: string | null
          list_price?: number | null
          notes?: string | null
          offer_amount?: number | null
          opened_at?: string | null
          organization_id?: string | null
          property_id?: string | null
          responded_at?: string | null
          response_content?: string | null
          response_notes?: string | null
          response_status?: string | null
          response_type?: string | null
          sent_at?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_properties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          batch_size_per_day: number | null
          campaign_type: string
          closing_timeline: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          earnest_money: number | null
          email_body: string | null
          email_subject: string | null
          followup_enabled: boolean | null
          followup_sequences: Json | null
          id: string
          include_earnest_money: boolean | null
          name: string
          offer_fixed_discount: number | null
          offer_formula_type: string | null
          offer_percentage: number | null
          opened_count: number | null
          organization_id: string | null
          properties_count: number | null
          responded_count: number | null
          scheduled_start: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          target_criteria: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_size_per_day?: number | null
          campaign_type?: string
          closing_timeline?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          earnest_money?: number | null
          email_body?: string | null
          email_subject?: string | null
          followup_enabled?: boolean | null
          followup_sequences?: Json | null
          id?: string
          include_earnest_money?: boolean | null
          name: string
          offer_fixed_discount?: number | null
          offer_formula_type?: string | null
          offer_percentage?: number | null
          opened_count?: number | null
          organization_id?: string | null
          properties_count?: number | null
          responded_count?: number | null
          scheduled_start?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          target_criteria?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_size_per_day?: number | null
          campaign_type?: string
          closing_timeline?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          earnest_money?: number | null
          email_body?: string | null
          email_subject?: string | null
          followup_enabled?: boolean | null
          followup_sequences?: Json | null
          id?: string
          include_earnest_money?: boolean | null
          name?: string
          offer_fixed_discount?: number | null
          offer_formula_type?: string | null
          offer_percentage?: number | null
          opened_count?: number | null
          organization_id?: string | null
          properties_count?: number | null
          responded_count?: number | null
          scheduled_start?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          target_criteria?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      closebot_connections: {
        Row: {
          account_id: string | null
          account_name: string | null
          api_key: string | null
          bot_mappings: Json | null
          created_at: string | null
          field_mappings: Json | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          trigger_settings: Json | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          api_key?: string | null
          bot_mappings?: Json | null
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          trigger_settings?: Json | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          api_key?: string | null
          bot_mappings?: Json | null
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          trigger_settings?: Json | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "closebot_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      closebot_conversations: {
        Row: {
          appointment_set: boolean | null
          appointment_time: string | null
          bot_id: string | null
          bot_name: string | null
          collected_data: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          outcome: string | null
          property_id: string | null
          started_at: string | null
          status: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          appointment_set?: boolean | null
          appointment_time?: string | null
          bot_id?: string | null
          bot_name?: string | null
          collected_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          outcome?: string | null
          property_id?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          appointment_set?: boolean | null
          appointment_time?: string | null
          bot_id?: string | null
          bot_name?: string | null
          collected_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          outcome?: string | null
          property_id?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closebot_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closebot_conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_type: string
          created_at: string | null
          deal_terms: Json | null
          errors: string[] | null
          id: string
          organization_id: string | null
          passed: boolean | null
          property_id: string | null
          required_disclosures: string[] | null
          state: string
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          check_type: string
          created_at?: string | null
          deal_terms?: Json | null
          errors?: string[] | null
          id?: string
          organization_id?: string | null
          passed?: boolean | null
          property_id?: string | null
          required_disclosures?: string[] | null
          state: string
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          check_type?: string
          created_at?: string | null
          deal_terms?: Json | null
          errors?: string[] | null
          id?: string
          organization_id?: string | null
          passed?: boolean | null
          property_id?: string | null
          required_disclosures?: string[] | null
          state?: string
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          property_id?: string
          rating?: string | null
          sale_date?: string | null
          sale_price?: number | null
          sqft?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comps_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          avg_bid_accuracy: number | null
          communication_rating: number | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          insurance_verified: boolean | null
          jobs_completed: number | null
          license_number: string | null
          license_verified: boolean | null
          name: string
          notes: string | null
          on_time_percentage: number | null
          organization_id: string | null
          overall_rating: number | null
          phone: string | null
          quality_rating: number | null
          reliability_rating: number | null
          service_areas: string[] | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_bid_accuracy?: number | null
          communication_rating?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_verified?: boolean | null
          jobs_completed?: number | null
          license_number?: string | null
          license_verified?: boolean | null
          name: string
          notes?: string | null
          on_time_percentage?: number | null
          organization_id?: string | null
          overall_rating?: number | null
          phone?: string | null
          quality_rating?: number | null
          reliability_rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_bid_accuracy?: number | null
          communication_rating?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          insurance_verified?: boolean | null
          jobs_completed?: number | null
          license_number?: string | null
          license_verified?: boolean | null
          name?: string
          notes?: string | null
          on_time_percentage?: number | null
          organization_id?: string | null
          overall_rating?: number | null
          phone?: string | null
          quality_rating?: number | null
          reliability_rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          organization_id: string | null
          reference_id: string | null
          service: string | null
          stripe_payment_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          reference_id?: string | null
          service?: string | null
          stripe_payment_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          reference_id?: string | null
          service?: string | null
          stripe_payment_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          total_profit?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_submissions: {
        Row: {
          created_at: string
          deal_source_id: string | null
          id: string
          notes: string | null
          property_id: string | null
          referral_source: string | null
          response_sent: boolean | null
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          submitter_company: string | null
          submitter_email: string
          submitter_name: string
          submitter_phone: string
          submitter_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_source_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          referral_source?: string | null
          response_sent?: boolean | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          submitter_company?: string | null
          submitter_email: string
          submitter_name: string
          submitter_phone: string
          submitter_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_source_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          referral_source?: string | null
          response_sent?: boolean | null
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          submitter_company?: string | null
          submitter_email?: string
          submitter_name?: string
          submitter_phone?: string
          submitter_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_submissions_deal_source_id_fkey"
            columns: ["deal_source_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_submissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_requests: {
        Row: {
          arv: number | null
          created_at: string | null
          credit_score_range: string | null
          exit_strategy: string | null
          experience_level: string | null
          id: string
          loan_amount_requested: number | null
          notes: string | null
          organization_id: string | null
          property_id: string | null
          property_value: number | null
          purchase_price: number | null
          purpose: string | null
          rehab_budget: number | null
          request_type: string
          status: string | null
          timeline_needed: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arv?: number | null
          created_at?: string | null
          credit_score_range?: string | null
          exit_strategy?: string | null
          experience_level?: string | null
          id?: string
          loan_amount_requested?: number | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          property_value?: number | null
          purchase_price?: number | null
          purpose?: string | null
          rehab_budget?: number | null
          request_type: string
          status?: string | null
          timeline_needed?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arv?: number | null
          created_at?: string | null
          credit_score_range?: string | null
          exit_strategy?: string | null
          experience_level?: string | null
          id?: string
          loan_amount_requested?: number | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          property_value?: number | null
          purchase_price?: number | null
          purpose?: string | null
          rehab_budget?: number | null
          request_type?: string
          status?: string | null
          timeline_needed?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_submissions: {
        Row: {
          conditions: string | null
          created_at: string | null
          expiration_date: string | null
          funding_request_id: string
          id: string
          lender_id: string
          notes: string | null
          offered_amount: number | null
          offered_points: number | null
          offered_rate: number | null
          offered_term: number | null
          response_at: string | null
          selected: boolean | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string | null
          expiration_date?: string | null
          funding_request_id: string
          id?: string
          lender_id: string
          notes?: string | null
          offered_amount?: number | null
          offered_points?: number | null
          offered_rate?: number | null
          offered_term?: number | null
          response_at?: string | null
          selected?: boolean | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: string | null
          created_at?: string | null
          expiration_date?: string | null
          funding_request_id?: string
          id?: string
          lender_id?: string
          notes?: string | null
          offered_amount?: number | null
          offered_points?: number | null
          offered_rate?: number | null
          offered_term?: number | null
          response_at?: string | null
          selected?: boolean | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_submissions_funding_request_id_fkey"
            columns: ["funding_request_id"]
            isOneToOne: false
            referencedRelation: "funding_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_submissions_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "marketplace_lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          organization_id: string
          point_values: Json | null
          streak_requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          organization_id: string
          point_values?: Json | null
          streak_requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          organization_id?: string
          point_values?: Json | null
          streak_requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_connections: {
        Row: {
          access_token: string | null
          account_name: string | null
          api_key: string | null
          conflict_resolution: string | null
          created_at: string | null
          expires_at: string | null
          field_mappings: Json | null
          ghl_calendar_id: string | null
          ghl_pipeline_id: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          location_id: string | null
          organization_id: string | null
          refresh_token: string | null
          stage_mappings: Json | null
          sync_appointments_enabled: boolean | null
          sync_contacts_enabled: boolean | null
          sync_pipeline_enabled: boolean | null
          two_way_sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name?: string | null
          api_key?: string | null
          conflict_resolution?: string | null
          created_at?: string | null
          expires_at?: string | null
          field_mappings?: Json | null
          ghl_calendar_id?: string | null
          ghl_pipeline_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          location_id?: string | null
          organization_id?: string | null
          refresh_token?: string | null
          stage_mappings?: Json | null
          sync_appointments_enabled?: boolean | null
          sync_contacts_enabled?: boolean | null
          sync_pipeline_enabled?: boolean | null
          two_way_sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string | null
          api_key?: string | null
          conflict_resolution?: string | null
          created_at?: string | null
          expires_at?: string | null
          field_mappings?: Json | null
          ghl_calendar_id?: string | null
          ghl_pipeline_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          location_id?: string | null
          organization_id?: string | null
          refresh_token?: string | null
          stage_mappings?: Json | null
          sync_appointments_enabled?: boolean | null
          sync_contacts_enabled?: boolean | null
          sync_pipeline_enabled?: boolean | null
          two_way_sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghl_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_sync_log: {
        Row: {
          created_at: string | null
          direction: string
          error_message: string | null
          ghl_id: string | null
          id: string
          record_id: string | null
          record_type: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          error_message?: string | null
          ghl_id?: string | null
          id?: string
          record_id?: string | null
          record_type: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          error_message?: string | null
          ghl_id?: string | null
          id?: string
          record_id?: string | null
          record_type?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      jv_inquiries: {
        Row: {
          created_at: string | null
          id: string
          inquirer_user_id: string
          message: string | null
          opportunity_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquirer_user_id: string
          message?: string | null
          opportunity_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquirer_user_id?: string
          message?: string | null
          opportunity_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jv_inquiries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "jv_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      jv_opportunities: {
        Row: {
          capital_needed: number | null
          created_at: string | null
          deal_type: string | null
          description: string | null
          expires_at: string | null
          id: string
          location: string | null
          property_id: string | null
          proposed_split: string | null
          seeking: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: string | null
          your_contribution: string | null
        }
        Insert: {
          capital_needed?: number | null
          created_at?: string | null
          deal_type?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          location?: string | null
          property_id?: string | null
          proposed_split?: string | null
          seeking?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: string | null
          your_contribution?: string | null
        }
        Update: {
          capital_needed?: number | null
          created_at?: string | null
          deal_type?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          location?: string | null
          property_id?: string | null
          proposed_split?: string | null
          seeking?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
          your_contribution?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jv_opportunities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      jv_profiles: {
        Row: {
          available_capital: number | null
          bio: string | null
          created_at: string | null
          deals_completed: number | null
          experience_level: string | null
          id: string
          is_public: boolean | null
          organization_id: string | null
          preferred_role: string | null
          profile_type: string
          target_areas: string[] | null
          target_deal_types: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_capital?: number | null
          bio?: string | null
          created_at?: string | null
          deals_completed?: number | null
          experience_level?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          preferred_role?: string | null
          profile_type?: string
          target_areas?: string[] | null
          target_deal_types?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_capital?: number | null
          bio?: string | null
          created_at?: string | null
          deals_completed?: number | null
          experience_level?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          preferred_role?: string | null
          profile_type?: string
          target_areas?: string[] | null
          target_deal_types?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jv_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "lender_loans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      list_criteria_presets: {
        Row: {
          created_at: string | null
          criteria: Json
          description: string | null
          id: string
          is_favorite: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          criteria: Json
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_criteria_presets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      list_records: {
        Row: {
          address: string | null
          address_hash: string | null
          assessed_value: number | null
          baths: number | null
          beds: number | null
          city: string | null
          county: string | null
          created_at: string | null
          distress_details: Json | null
          distress_indicators: string[] | null
          email: string | null
          estimated_equity_amount: number | null
          estimated_equity_percent: number | null
          estimated_value: number | null
          id: string
          is_absentee: boolean | null
          is_valid: boolean | null
          last_sale_date: string | null
          last_sale_price: number | null
          list_id: string
          list_match_count: number | null
          lot_size: number | null
          mailing_address: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          mortgage_balance: number | null
          mortgage_date: string | null
          mortgage_lender: string | null
          motivation_score: number | null
          normalized_address: string | null
          organization_id: string | null
          owner_first_name: string | null
          owner_last_name: string | null
          owner_name: string | null
          owner_type: string | null
          phone: string | null
          property_id: string | null
          property_type: string | null
          raw_data: Json | null
          skip_reason: string | null
          source_lists: string[] | null
          sqft: number | null
          state: string | null
          status: string | null
          street_name: string | null
          street_number: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
          validation_errors: string[] | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          address_hash?: string | null
          assessed_value?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          distress_details?: Json | null
          distress_indicators?: string[] | null
          email?: string | null
          estimated_equity_amount?: number | null
          estimated_equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          is_absentee?: boolean | null
          is_valid?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          list_id: string
          list_match_count?: number | null
          lot_size?: number | null
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          mortgage_balance?: number | null
          mortgage_date?: string | null
          mortgage_lender?: string | null
          motivation_score?: number | null
          normalized_address?: string | null
          organization_id?: string | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_name?: string | null
          owner_type?: string | null
          phone?: string | null
          property_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          skip_reason?: string | null
          source_lists?: string[] | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          street_name?: string | null
          street_number?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
          validation_errors?: string[] | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          address_hash?: string | null
          assessed_value?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          distress_details?: Json | null
          distress_indicators?: string[] | null
          email?: string | null
          estimated_equity_amount?: number | null
          estimated_equity_percent?: number | null
          estimated_value?: number | null
          id?: string
          is_absentee?: boolean | null
          is_valid?: boolean | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          list_id?: string
          list_match_count?: number | null
          lot_size?: number | null
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          mortgage_balance?: number | null
          mortgage_date?: string | null
          mortgage_lender?: string | null
          motivation_score?: number | null
          normalized_address?: string | null
          organization_id?: string | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_name?: string | null
          owner_type?: string | null
          phone?: string | null
          property_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          skip_reason?: string | null
          source_lists?: string[] | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          street_name?: string | null
          street_number?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          validation_errors?: string[] | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_records_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_records_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          avg_motivation_score: number | null
          built_at: string | null
          column_mapping: Json | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          high_motivation_count: number | null
          id: string
          invalid_records: number | null
          last_exported_at: string | null
          last_mailed_at: string | null
          list_type: string
          matched_to_properties: number | null
          name: string
          organization_id: string | null
          skipped_duplicates: number | null
          source_file_name: string | null
          source_file_url: string | null
          stack_criteria: string | null
          stacked_from: Json | null
          status: string | null
          times_exported: number | null
          times_mailed: number | null
          total_records: number | null
          unique_records: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_motivation_score?: number | null
          built_at?: string | null
          column_mapping?: Json | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          high_motivation_count?: number | null
          id?: string
          invalid_records?: number | null
          last_exported_at?: string | null
          last_mailed_at?: string | null
          list_type: string
          matched_to_properties?: number | null
          name: string
          organization_id?: string | null
          skipped_duplicates?: number | null
          source_file_name?: string | null
          source_file_url?: string | null
          stack_criteria?: string | null
          stacked_from?: Json | null
          status?: string | null
          times_exported?: number | null
          times_mailed?: number | null
          total_records?: number | null
          unique_records?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_motivation_score?: number | null
          built_at?: string | null
          column_mapping?: Json | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          high_motivation_count?: number | null
          id?: string
          invalid_records?: number | null
          last_exported_at?: string | null
          last_mailed_at?: string | null
          list_type?: string
          matched_to_properties?: number | null
          name?: string
          organization_id?: string | null
          skipped_duplicates?: number | null
          source_file_name?: string | null
          source_file_url?: string | null
          stack_criteria?: string | null
          stacked_from?: Json | null
          status?: string | null
          times_exported?: number | null
          times_mailed?: number | null
          total_records?: number | null
          unique_records?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lob_connections: {
        Row: {
          account_name: string | null
          api_key_encrypted: string | null
          created_at: string
          default_mail_class: string | null
          default_postcard_size: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          return_address_line1: string | null
          return_address_line2: string | null
          return_city: string | null
          return_name: string | null
          return_state: string | null
          return_zip: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          api_key_encrypted?: string | null
          created_at?: string
          default_mail_class?: string | null
          default_postcard_size?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          return_address_line1?: string | null
          return_address_line2?: string | null
          return_city?: string | null
          return_name?: string | null
          return_state?: string | null
          return_zip?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          api_key_encrypted?: string | null
          created_at?: string
          default_mail_class?: string | null
          default_postcard_size?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          return_address_line1?: string | null
          return_address_line2?: string | null
          return_city?: string | null
          return_name?: string | null
          return_state?: string | null
          return_zip?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lob_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_campaigns: {
        Row: {
          cost_per_piece: number | null
          created_at: string
          description: string | null
          drip_settings: Json | null
          id: string
          is_drip: boolean | null
          list_filters: Json | null
          list_type: string | null
          name: string
          organization_id: string | null
          scheduled_date: string | null
          send_time: string | null
          status: string | null
          template_id: string | null
          total_cost: number | null
          total_delivered: number | null
          total_recipients: number | null
          total_responses: number | null
          total_returned: number | null
          total_sent: number | null
          tracking_phone: string | null
          tracking_url: string | null
          updated_at: string
          uploaded_list_id: string | null
          user_id: string
        }
        Insert: {
          cost_per_piece?: number | null
          created_at?: string
          description?: string | null
          drip_settings?: Json | null
          id?: string
          is_drip?: boolean | null
          list_filters?: Json | null
          list_type?: string | null
          name: string
          organization_id?: string | null
          scheduled_date?: string | null
          send_time?: string | null
          status?: string | null
          template_id?: string | null
          total_cost?: number | null
          total_delivered?: number | null
          total_recipients?: number | null
          total_responses?: number | null
          total_returned?: number | null
          total_sent?: number | null
          tracking_phone?: string | null
          tracking_url?: string | null
          updated_at?: string
          uploaded_list_id?: string | null
          user_id: string
        }
        Update: {
          cost_per_piece?: number | null
          created_at?: string
          description?: string | null
          drip_settings?: Json | null
          id?: string
          is_drip?: boolean | null
          list_filters?: Json | null
          list_type?: string | null
          name?: string
          organization_id?: string | null
          scheduled_date?: string | null
          send_time?: string | null
          status?: string | null
          template_id?: string | null
          total_cost?: number | null
          total_delivered?: number | null
          total_recipients?: number | null
          total_responses?: number | null
          total_returned?: number | null
          total_sent?: number | null
          tracking_phone?: string | null
          tracking_url?: string | null
          updated_at?: string
          uploaded_list_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mail_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mail_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_campaigns_uploaded_list_id_fkey"
            columns: ["uploaded_list_id"]
            isOneToOne: false
            referencedRelation: "mail_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_list_records: {
        Row: {
          created_at: string
          duplicate_of: string | null
          id: string
          is_duplicate: boolean | null
          is_valid: boolean | null
          list_id: string
          mailing_address: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          owner_name: string | null
          property_address: string | null
          property_city: string | null
          property_state: string | null
          property_zip: string | null
          validation_error: string | null
        }
        Insert: {
          created_at?: string
          duplicate_of?: string | null
          id?: string
          is_duplicate?: boolean | null
          is_valid?: boolean | null
          list_id: string
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          owner_name?: string | null
          property_address?: string | null
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          validation_error?: string | null
        }
        Update: {
          created_at?: string
          duplicate_of?: string | null
          id?: string
          is_duplicate?: boolean | null
          is_valid?: boolean | null
          list_id?: string
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          owner_name?: string | null
          property_address?: string | null
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          validation_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mail_list_records_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "mail_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_lists: {
        Row: {
          column_mapping: Json | null
          created_at: string
          duplicate_records: number | null
          file_name: string | null
          id: string
          invalid_records: number | null
          name: string
          organization_id: string | null
          status: string | null
          total_records: number | null
          user_id: string
          valid_records: number | null
        }
        Insert: {
          column_mapping?: Json | null
          created_at?: string
          duplicate_records?: number | null
          file_name?: string | null
          id?: string
          invalid_records?: number | null
          name: string
          organization_id?: string | null
          status?: string | null
          total_records?: number | null
          user_id: string
          valid_records?: number | null
        }
        Update: {
          column_mapping?: Json | null
          created_at?: string
          duplicate_records?: number | null
          file_name?: string | null
          id?: string
          invalid_records?: number | null
          name?: string
          organization_id?: string | null
          status?: string | null
          total_records?: number | null
          user_id?: string
          valid_records?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mail_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_pieces: {
        Row: {
          campaign_id: string
          cost: number | null
          created_at: string
          delivered_at: string | null
          id: string
          list_record_id: string | null
          lob_id: string | null
          property_id: string | null
          recipient_address: string | null
          recipient_city: string | null
          recipient_name: string | null
          recipient_state: string | null
          recipient_zip: string | null
          response_date: string | null
          response_received: boolean | null
          return_reason: string | null
          returned_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          list_record_id?: string | null
          lob_id?: string | null
          property_id?: string | null
          recipient_address?: string | null
          recipient_city?: string | null
          recipient_name?: string | null
          recipient_state?: string | null
          recipient_zip?: string | null
          response_date?: string | null
          response_received?: boolean | null
          return_reason?: string | null
          returned_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          list_record_id?: string | null
          lob_id?: string | null
          property_id?: string | null
          recipient_address?: string | null
          recipient_city?: string | null
          recipient_name?: string | null
          recipient_state?: string | null
          recipient_zip?: string | null
          response_date?: string | null
          response_received?: boolean | null
          return_reason?: string | null
          returned_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mail_pieces_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "mail_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_pieces_list_record_id_fkey"
            columns: ["list_record_id"]
            isOneToOne: false
            referencedRelation: "mail_list_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mail_pieces_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_suppression_list: {
        Row: {
          added_at: string
          address: string
          id: string
          reason: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          address: string
          id?: string
          reason?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          address?: string
          id?: string
          reason?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mail_templates: {
        Row: {
          back_html: string | null
          created_at: string
          description: string | null
          front_html: string | null
          id: string
          is_default: boolean | null
          merge_fields: string[] | null
          name: string
          organization_id: string | null
          thumbnail_url: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          back_html?: string | null
          created_at?: string
          description?: string | null
          front_html?: string | null
          id?: string
          is_default?: boolean | null
          merge_fields?: string[] | null
          name: string
          organization_id?: string | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          back_html?: string | null
          created_at?: string
          description?: string | null
          front_html?: string | null
          id?: string
          is_default?: boolean | null
          merge_fields?: string[] | null
          name?: string
          organization_id?: string | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mail_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_lenders: {
        Row: {
          application_url: string | null
          company: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lender_type: string
          loan_purposes: string[] | null
          logo_url: string | null
          max_arv_ltv: number | null
          max_loan_amount: number | null
          max_ltv: number | null
          min_credit_score: number | null
          min_loan_amount: number | null
          name: string
          points_range_max: number | null
          points_range_min: number | null
          prepayment_penalty: boolean | null
          property_types: string[] | null
          rate_range_max: number | null
          rate_range_min: number | null
          states_served: string[] | null
          typical_funding_days: number | null
        }
        Insert: {
          application_url?: string | null
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lender_type: string
          loan_purposes?: string[] | null
          logo_url?: string | null
          max_arv_ltv?: number | null
          max_loan_amount?: number | null
          max_ltv?: number | null
          min_credit_score?: number | null
          min_loan_amount?: number | null
          name: string
          points_range_max?: number | null
          points_range_min?: number | null
          prepayment_penalty?: boolean | null
          property_types?: string[] | null
          rate_range_max?: number | null
          rate_range_min?: number | null
          states_served?: string[] | null
          typical_funding_days?: number | null
        }
        Update: {
          application_url?: string | null
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lender_type?: string
          loan_purposes?: string[] | null
          logo_url?: string | null
          max_arv_ltv?: number | null
          max_loan_amount?: number | null
          max_ltv?: number | null
          min_credit_score?: number | null
          min_loan_amount?: number | null
          name?: string
          points_range_max?: number | null
          points_range_min?: number | null
          prepayment_penalty?: boolean | null
          property_types?: string[] | null
          rate_range_max?: number | null
          rate_range_min?: number | null
          states_served?: string[] | null
          typical_funding_days?: number | null
        }
        Relationships: []
      }
      material_library: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string | null
          id: string
          image_key: string | null
          image_url: string
          is_favorite: boolean | null
          material_description: string | null
          name: string
          organization_id: string | null
          price_per_unit: number | null
          product_name: string | null
          source_name: string | null
          source_url: string | null
          unit: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string | null
          id?: string
          image_key?: string | null
          image_url: string
          is_favorite?: boolean | null
          material_description?: string | null
          name: string
          organization_id?: string | null
          price_per_unit?: number | null
          product_name?: string | null
          source_name?: string | null
          source_url?: string | null
          unit?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string | null
          id?: string
          image_key?: string | null
          image_url?: string
          is_favorite?: boolean | null
          material_description?: string | null
          name?: string
          organization_id?: string | null
          price_per_unit?: number | null
          product_name?: string | null
          source_name?: string | null
          source_url?: string | null
          unit?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string | null
          organization_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          organization_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string | null
          organization_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_deliveries: {
        Row: {
          channel: string
          clicked_at: string | null
          content: Json | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          offer_id: string
          opened_at: string | null
          property_id: string
          recipient_address: string | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          tracking_id: string | null
          user_id: string
        }
        Insert: {
          channel: string
          clicked_at?: string | null
          content?: Json | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          offer_id: string
          opened_at?: string | null
          property_id: string
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          tracking_id?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          clicked_at?: string | null
          content?: Json | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          offer_id?: string
          opened_at?: string | null
          property_id?: string
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          tracking_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_deliveries_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_deliveries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_followups: {
        Row: {
          channel: string
          content: Json | null
          created_at: string
          id: string
          offer_id: string
          scheduled_for: string
          sent_at: string | null
          sequence_number: number
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          content?: Json | null
          created_at?: string
          id?: string
          offer_id: string
          scheduled_for: string
          sent_at?: string | null
          sequence_number: number
          status?: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: Json | null
          created_at?: string
          id?: string
          offer_id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_number?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_followups_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          counter_amount: number | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          offer_amount: number
          offer_type: string | null
          organization_id: string | null
          property_id: string
          response: string | null
          sent_date: string | null
          sent_via: string | null
          updated_by: string | null
        }
        Insert: {
          counter_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          offer_amount: number
          offer_type?: string | null
          organization_id?: string | null
          property_id: string
          response?: string | null
          sent_date?: string | null
          sent_via?: string | null
          updated_by?: string | null
        }
        Update: {
          counter_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          offer_amount?: number
          offer_type?: string | null
          organization_id?: string | null
          property_id?: string
          response?: string | null
          sent_date?: string | null
          sent_via?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          billing_email: string | null
          city: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          max_properties: number | null
          max_users: number | null
          name: string
          phone: string | null
          slug: string
          state: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_properties?: number | null
          max_users?: number | null
          name: string
          phone?: string | null
          slug: string
          state?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_properties?: number | null
          max_users?: number | null
          name?: string
          phone?: string | null
          slug?: string
          state?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      outreach_log: {
        Row: {
          channel: string
          content: string | null
          created_at: string | null
          created_by: string | null
          direction: string | null
          id: string
          opted_in: boolean | null
          organization_id: string | null
          response_content: string | null
          status: string | null
          target_id: string
          target_type: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          channel: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          id?: string
          opted_in?: boolean | null
          organization_id?: string | null
          response_content?: string | null
          status?: string | null
          target_id: string
          target_type: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          id?: string
          opted_in?: boolean | null
          organization_id?: string | null
          response_content?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_properties: {
        Row: {
          address: string
          baths: number | null
          beds: number | null
          city: string | null
          created_at: string | null
          id: string
          monthly_rent: number | null
          notes: string | null
          property_type: string | null
          sqft: number | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address: string
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          monthly_rent?: number | null
          notes?: string | null
          property_type?: string | null
          sqft?: number | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          monthly_rent?: number | null
          notes?: string | null
          property_type?: string | null
          sqft?: number | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          apn: string | null
          arv: number | null
          arv_confidence: string | null
          assessed_value: number | null
          assigned_to: string | null
          attom_id: number | null
          avm_confidence: string | null
          avm_high: number | null
          avm_low: number | null
          avm_value: number | null
          baths: number | null
          beds: number | null
          city: string | null
          county: string | null
          created_at: string | null
          created_by: string | null
          distress_signals: Json | null
          equity_percent: number | null
          estimated_rent: number | null
          estimated_value: number | null
          fips: string | null
          ghl_contact_id: string | null
          ghl_last_sync: string | null
          id: string
          last_data_pull: string | null
          last_sale_date: string | null
          last_sale_price: number | null
          latitude: number | null
          liens_total: number | null
          longitude: number | null
          lot_size: number | null
          mao_aggressive: number | null
          mao_conservative: number | null
          mao_standard: number | null
          mortgage_balance: number | null
          mortgage_payment: number | null
          mortgage_rate: number | null
          motivation_score: number | null
          notes: string | null
          organization_id: string | null
          owner_email: string | null
          owner_mailing_address: string | null
          owner_name: string | null
          owner_phone: string | null
          phone_dnc: boolean | null
          property_type: string | null
          rent_confidence: string | null
          rent_data_source: string | null
          repair_details: Json | null
          repair_estimate: number | null
          skip_trace_id: string | null
          skip_traced: boolean | null
          skip_traced_at: string | null
          source: string | null
          source_id: string | null
          sqft: number | null
          state: string | null
          status: string | null
          tax_amount: number | null
          title_status: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          velocity_score: number | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          apn?: string | null
          arv?: number | null
          arv_confidence?: string | null
          assessed_value?: number | null
          assigned_to?: string | null
          attom_id?: number | null
          avm_confidence?: string | null
          avm_high?: number | null
          avm_low?: number | null
          avm_value?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          distress_signals?: Json | null
          equity_percent?: number | null
          estimated_rent?: number | null
          estimated_value?: number | null
          fips?: string | null
          ghl_contact_id?: string | null
          ghl_last_sync?: string | null
          id?: string
          last_data_pull?: string | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          latitude?: number | null
          liens_total?: number | null
          longitude?: number | null
          lot_size?: number | null
          mao_aggressive?: number | null
          mao_conservative?: number | null
          mao_standard?: number | null
          mortgage_balance?: number | null
          mortgage_payment?: number | null
          mortgage_rate?: number | null
          motivation_score?: number | null
          notes?: string | null
          organization_id?: string | null
          owner_email?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone_dnc?: boolean | null
          property_type?: string | null
          rent_confidence?: string | null
          rent_data_source?: string | null
          repair_details?: Json | null
          repair_estimate?: number | null
          skip_trace_id?: string | null
          skip_traced?: boolean | null
          skip_traced_at?: string | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          tax_amount?: number | null
          title_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          velocity_score?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          apn?: string | null
          arv?: number | null
          arv_confidence?: string | null
          assessed_value?: number | null
          assigned_to?: string | null
          attom_id?: number | null
          avm_confidence?: string | null
          avm_high?: number | null
          avm_low?: number | null
          avm_value?: number | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          distress_signals?: Json | null
          equity_percent?: number | null
          estimated_rent?: number | null
          estimated_value?: number | null
          fips?: string | null
          ghl_contact_id?: string | null
          ghl_last_sync?: string | null
          id?: string
          last_data_pull?: string | null
          last_sale_date?: string | null
          last_sale_price?: number | null
          latitude?: number | null
          liens_total?: number | null
          longitude?: number | null
          lot_size?: number | null
          mao_aggressive?: number | null
          mao_conservative?: number | null
          mao_standard?: number | null
          mortgage_balance?: number | null
          mortgage_payment?: number | null
          mortgage_rate?: number | null
          motivation_score?: number | null
          notes?: string | null
          organization_id?: string | null
          owner_email?: string | null
          owner_mailing_address?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          phone_dnc?: boolean | null
          property_type?: string | null
          rent_confidence?: string | null
          rent_data_source?: string | null
          repair_details?: Json | null
          repair_estimate?: number | null
          skip_trace_id?: string | null
          skip_traced?: boolean | null
          skip_traced_at?: string | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          tax_amount?: number | null
          title_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          velocity_score?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_skip_trace_id_fkey"
            columns: ["skip_trace_id"]
            isOneToOne: false
            referencedRelation: "skip_trace_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      renovation_images: {
        Row: {
          area_label: string | null
          created_at: string | null
          generated_images: Json | null
          height: number | null
          id: string
          organization_id: string | null
          original_image_key: string | null
          original_image_url: string
          project_id: string
          room_type: string | null
          selected_after_id: string | null
          selected_after_url: string | null
          total_credits_used: number | null
          updated_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          area_label?: string | null
          created_at?: string | null
          generated_images?: Json | null
          height?: number | null
          id?: string
          organization_id?: string | null
          original_image_key?: string | null
          original_image_url: string
          project_id: string
          room_type?: string | null
          selected_after_id?: string | null
          selected_after_url?: string | null
          total_credits_used?: number | null
          updated_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          area_label?: string | null
          created_at?: string | null
          generated_images?: Json | null
          height?: number | null
          id?: string
          organization_id?: string | null
          original_image_key?: string | null
          original_image_url?: string
          project_id?: string
          room_type?: string | null
          selected_after_id?: string | null
          selected_after_url?: string | null
          total_credits_used?: number | null
          updated_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "renovation_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovation_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "renovation_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      renovation_presets: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          example_image_url: string | null
          id: string
          is_system: boolean | null
          name: string
          organization_id: string | null
          popularity: number | null
          room_types: string[] | null
          style_prompt: string
          suggested_materials: Json | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          example_image_url?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          popularity?: number | null
          room_types?: string[] | null
          style_prompt: string
          suggested_materials?: Json | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          example_image_url?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          popularity?: number | null
          room_types?: string[] | null
          style_prompt?: string
          suggested_materials?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renovation_presets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      renovation_projects: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          property_id: string | null
          status: string | null
          total_images: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          property_id?: string | null
          status?: string | null
          total_images?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          property_id?: string | null
          status?: string | null
          total_images?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "renovation_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovation_projects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_comps: {
        Row: {
          baths: number | null
          beds: number | null
          comp_address: string
          created_at: string | null
          distance_miles: number | null
          id: string
          listed_date: string | null
          property_id: string
          rent_amount: number | null
          source: string | null
          sqft: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          baths?: number | null
          beds?: number | null
          comp_address: string
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          listed_date?: string | null
          property_id: string
          rent_amount?: number | null
          source?: string | null
          sqft?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          baths?: number | null
          beds?: number | null
          comp_address?: string
          created_at?: string | null
          distance_miles?: number | null
          id?: string
          listed_date?: string | null
          property_id?: string
          rent_amount?: number | null
          source?: string | null
          sqft?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_comps_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      skip_trace_results: {
        Row: {
          all_addresses: Json | null
          all_emails: Json | null
          all_phones: Json | null
          bankruptcy: boolean | null
          created_at: string | null
          credit_cost: number
          deceased: boolean | null
          error_message: string | null
          id: string
          input_address: string | null
          input_city: string | null
          input_first_name: string | null
          input_last_name: string | null
          input_state: string | null
          input_zip: string | null
          organization_id: string | null
          primary_email: string | null
          primary_email_score: number | null
          primary_phone: string | null
          primary_phone_dnc: boolean | null
          primary_phone_score: number | null
          primary_phone_type: string | null
          primary_phone_verified: boolean | null
          property_id: string | null
          relatives: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          all_addresses?: Json | null
          all_emails?: Json | null
          all_phones?: Json | null
          bankruptcy?: boolean | null
          created_at?: string | null
          credit_cost: number
          deceased?: boolean | null
          error_message?: string | null
          id?: string
          input_address?: string | null
          input_city?: string | null
          input_first_name?: string | null
          input_last_name?: string | null
          input_state?: string | null
          input_zip?: string | null
          organization_id?: string | null
          primary_email?: string | null
          primary_email_score?: number | null
          primary_phone?: string | null
          primary_phone_dnc?: boolean | null
          primary_phone_score?: number | null
          primary_phone_type?: string | null
          primary_phone_verified?: boolean | null
          property_id?: string | null
          relatives?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          all_addresses?: Json | null
          all_emails?: Json | null
          all_phones?: Json | null
          bankruptcy?: boolean | null
          created_at?: string | null
          credit_cost?: number
          deceased?: boolean | null
          error_message?: string | null
          id?: string
          input_address?: string | null
          input_city?: string | null
          input_first_name?: string | null
          input_last_name?: string | null
          input_state?: string | null
          input_zip?: string | null
          organization_id?: string | null
          primary_email?: string | null
          primary_email_score?: number | null
          primary_phone?: string | null
          primary_phone_dnc?: boolean | null
          primary_phone_score?: number | null
          primary_phone_type?: string | null
          primary_phone_verified?: boolean | null
          property_id?: string | null
          relatives?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skip_trace_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skip_trace_results_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      state_regulations: {
        Row: {
          created_at: string | null
          foreclosure_type: string | null
          id: string
          land_contract_restrictions: string | null
          last_updated: string | null
          lease_option_restrictions: string | null
          licensing_requirements: string | null
          max_interest_rate: number | null
          notes: string | null
          redemption_period_days: number | null
          required_disclosures: string[] | null
          seller_financing_restrictions: string | null
          state_code: string
          state_name: string
          usury_exemptions: string | null
        }
        Insert: {
          created_at?: string | null
          foreclosure_type?: string | null
          id?: string
          land_contract_restrictions?: string | null
          last_updated?: string | null
          lease_option_restrictions?: string | null
          licensing_requirements?: string | null
          max_interest_rate?: number | null
          notes?: string | null
          redemption_period_days?: number | null
          required_disclosures?: string[] | null
          seller_financing_restrictions?: string | null
          state_code: string
          state_name: string
          usury_exemptions?: string | null
        }
        Update: {
          created_at?: string | null
          foreclosure_type?: string | null
          id?: string
          land_contract_restrictions?: string | null
          last_updated?: string | null
          lease_option_restrictions?: string | null
          licensing_requirements?: string | null
          max_interest_rate?: number | null
          notes?: string | null
          redemption_period_days?: number | null
          required_disclosures?: string[] | null
          seller_financing_restrictions?: string | null
          state_code?: string
          state_name?: string
          usury_exemptions?: string | null
        }
        Relationships: []
      }
      suppression_list: {
        Row: {
          added_at: string | null
          address: string | null
          address_hash: string
          city: string | null
          expires_at: string | null
          id: string
          normalized_address: string
          organization_id: string | null
          reason: string
          reason_notes: string | null
          source: string | null
          source_reference_id: string | null
          state: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          added_at?: string | null
          address?: string | null
          address_hash: string
          city?: string | null
          expires_at?: string | null
          id?: string
          normalized_address: string
          organization_id?: string | null
          reason: string
          reason_notes?: string | null
          source?: string | null
          source_reference_id?: string | null
          state?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          added_at?: string | null
          address?: string | null
          address_hash?: string
          city?: string | null
          expires_at?: string | null
          id?: string
          normalized_address?: string
          organization_id?: string | null
          reason?: string
          reason_notes?: string | null
          source?: string | null
          source_reference_id?: string | null
          state?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppression_list_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      title_reports: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          ordered_at: string | null
          property_id: string
          provider: string | null
          received_at: string | null
          report_type: string
          report_url: string | null
          status: string
          summary: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          ordered_at?: string | null
          property_id: string
          provider?: string | null
          received_at?: string | null
          report_type?: string
          report_url?: string | null
          status?: string
          summary?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          ordered_at?: string | null
          property_id?: string
          provider?: string | null
          received_at?: string | null
          report_type?: string
          report_url?: string | null
          status?: string
          summary?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          deal_id: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          deal_id?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          deal_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          lifetime_purchased: number | null
          lifetime_used: number | null
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_used?: number | null
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_used?: number | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_stripe_payment_id?: string
          p_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_service: string
          p_user_id: string
        }
        Returns: Json
      }
      generate_address_hash: {
        Args: { normalized_address: string }
        Returns: string
      }
      get_user_organization: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_suppressed: {
        Args: { p_address_hash: string; p_user_id: string }
        Returns: boolean
      }
      normalize_address: {
        Args: {
          p_address: string
          p_city?: string
          p_state?: string
          p_zip?: string
        }
        Returns: string
      }
      user_has_role: { Args: { required_role: string }; Returns: boolean }
    }
    Enums: {
      jv_experience_level:
        | "beginner"
        | "intermediate"
        | "experienced"
        | "expert"
      jv_inquiry_status: "pending" | "accepted" | "declined"
      jv_opportunity_status: "open" | "in_discussion" | "closed" | "cancelled"
      jv_preferred_role: "passive" | "active" | "either"
      jv_profile_type: "capital_partner" | "operating_partner" | "both"
      jv_visibility: "public" | "connections_only" | "private"
      org_role:
        | "owner"
        | "admin"
        | "manager"
        | "acquisitions"
        | "dispositions"
        | "caller"
        | "member"
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
    Enums: {
      jv_experience_level: [
        "beginner",
        "intermediate",
        "experienced",
        "expert",
      ],
      jv_inquiry_status: ["pending", "accepted", "declined"],
      jv_opportunity_status: ["open", "in_discussion", "closed", "cancelled"],
      jv_preferred_role: ["passive", "active", "either"],
      jv_profile_type: ["capital_partner", "operating_partner", "both"],
      jv_visibility: ["public", "connections_only", "private"],
      org_role: [
        "owner",
        "admin",
        "manager",
        "acquisitions",
        "dispositions",
        "caller",
        "member",
      ],
    },
  },
} as const
