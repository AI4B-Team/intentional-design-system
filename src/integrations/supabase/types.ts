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
      aiva_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          organization_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aiva_conversations_organization_id_fkey"
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
      auto_responders: {
        Row: {
          body: string
          created_at: string | null
          delay_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          subject: string | null
          type: string
          updated_at: string | null
          user_id: string | null
          website_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          subject?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
          website_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          subject?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_responders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_responders_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "seller_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_offer_items: {
        Row: {
          batch_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_type: string | null
          created_at: string | null
          error_message: string | null
          id: string
          list_price: number | null
          offer_amount: number | null
          offer_id: string | null
          opened_at: string | null
          property_address: string
          property_city: string | null
          property_id: string | null
          property_state: string | null
          property_zip: string | null
          responded_at: string | null
          response_notes: string | null
          response_type: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          list_price?: number | null
          offer_amount?: number | null
          offer_id?: string | null
          opened_at?: string | null
          property_address: string
          property_city?: string | null
          property_id?: string | null
          property_state?: string | null
          property_zip?: string | null
          responded_at?: string | null
          response_notes?: string | null
          response_type?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          list_price?: number | null
          offer_amount?: number | null
          offer_id?: string | null
          opened_at?: string | null
          property_address?: string
          property_city?: string | null
          property_id?: string | null
          property_state?: string | null
          property_zip?: string | null
          responded_at?: string | null
          response_notes?: string | null
          response_type?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_offer_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "offer_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_offer_items_property_id_fkey"
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
      buy_boxes: {
        Row: {
          created_at: string | null
          criteria: Json | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          max_daily_offers: number | null
          name: string
          offer_formula: string | null
          offer_percentage: number | null
          organization_id: string | null
          total_deals_closed: number | null
          total_offers_sent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_daily_offers?: number | null
          name: string
          offer_formula?: string | null
          offer_percentage?: number | null
          organization_id?: string | null
          total_deals_closed?: number | null
          total_offers_sent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_daily_offers?: number | null
          name?: string
          offer_formula?: string | null
          offer_percentage?: number | null
          organization_id?: string | null
          total_deals_closed?: number | null
          total_offers_sent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buy_boxes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_portal_sessions: {
        Row: {
          buyer_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_active_at: string | null
          magic_link_expires_at: string | null
          magic_link_token: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_portal_sessions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          address: string | null
          buyer_name: string
          city: string | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          pof_id: string | null
          profile_name: string
          state: string | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          buyer_name: string
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          pof_id?: string | null
          profile_name: string
          state?: string | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          buyer_name?: string
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          pof_id?: string | null
          profile_name?: string
          state?: string | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_profiles_pof_id_fkey"
            columns: ["pof_id"]
            isOneToOne: false
            referencedRelation: "proof_of_funds"
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
      call_dispositions: {
        Row: {
          adds_to_dnc: boolean | null
          category: string
          color: string | null
          created_at: string | null
          default_followup_days: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          keyboard_shortcut: string | null
          marks_as_success: boolean | null
          name: string
          organization_id: string | null
          removes_from_queue: boolean | null
          schedules_followup: boolean | null
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          adds_to_dnc?: boolean | null
          category: string
          color?: string | null
          created_at?: string | null
          default_followup_days?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          keyboard_shortcut?: string | null
          marks_as_success?: boolean | null
          name: string
          organization_id?: string | null
          removes_from_queue?: boolean | null
          schedules_followup?: boolean | null
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          adds_to_dnc?: boolean | null
          category?: string
          color?: string | null
          created_at?: string | null
          default_followup_days?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          keyboard_shortcut?: string | null
          marks_as_success?: boolean | null
          name?: string
          organization_id?: string | null
          removes_from_queue?: boolean | null
          schedules_followup?: boolean | null
          sort_order?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_dispositions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_queue_contacts: {
        Row: {
          alternate_phones: string[] | null
          attempt_count: number | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          last_attempt_at: string | null
          last_call_id: string | null
          last_disposition: string | null
          list_record_id: string | null
          next_attempt_after: string | null
          organization_id: string | null
          outcome: string | null
          outcome_notes: string | null
          phone_number: string
          phone_type: string | null
          position: number | null
          priority_boost: number | null
          priority_score: number | null
          property_address: string | null
          property_city: string | null
          property_id: string | null
          property_state: string | null
          queue_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alternate_phones?: string[] | null
          attempt_count?: number | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_attempt_at?: string | null
          last_call_id?: string | null
          last_disposition?: string | null
          list_record_id?: string | null
          next_attempt_after?: string | null
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          phone_number: string
          phone_type?: string | null
          position?: number | null
          priority_boost?: number | null
          priority_score?: number | null
          property_address?: string | null
          property_city?: string | null
          property_id?: string | null
          property_state?: string | null
          queue_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alternate_phones?: string[] | null
          attempt_count?: number | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_attempt_at?: string | null
          last_call_id?: string | null
          last_disposition?: string | null
          list_record_id?: string | null
          next_attempt_after?: string | null
          organization_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          phone_number?: string
          phone_type?: string | null
          position?: number | null
          priority_boost?: number | null
          priority_score?: number | null
          property_address?: string | null
          property_city?: string | null
          property_id?: string | null
          property_state?: string | null
          queue_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_queue_contacts_list_record_id_fkey"
            columns: ["list_record_id"]
            isOneToOne: false
            referencedRelation: "list_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_contacts_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "call_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      call_queues: {
        Row: {
          appointments_set: number | null
          call_script_id: string | null
          calling_days: string[] | null
          calling_hours_end: string | null
          calling_hours_start: string | null
          contacts_completed: number | null
          contacts_reached: number | null
          contacts_remaining: number | null
          created_at: string | null
          current_position: number | null
          days_between_attempts: number | null
          description: string | null
          id: string
          last_called_at: string | null
          max_attempts: number | null
          name: string
          organization_id: string | null
          priority: number | null
          respect_dnc: boolean | null
          source_filter: Json | null
          source_list_id: string | null
          source_type: string
          status: string | null
          timezone: string | null
          total_contacts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointments_set?: number | null
          call_script_id?: string | null
          calling_days?: string[] | null
          calling_hours_end?: string | null
          calling_hours_start?: string | null
          contacts_completed?: number | null
          contacts_reached?: number | null
          contacts_remaining?: number | null
          created_at?: string | null
          current_position?: number | null
          days_between_attempts?: number | null
          description?: string | null
          id?: string
          last_called_at?: string | null
          max_attempts?: number | null
          name: string
          organization_id?: string | null
          priority?: number | null
          respect_dnc?: boolean | null
          source_filter?: Json | null
          source_list_id?: string | null
          source_type: string
          status?: string | null
          timezone?: string | null
          total_contacts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointments_set?: number | null
          call_script_id?: string | null
          calling_days?: string[] | null
          calling_hours_end?: string | null
          calling_hours_start?: string | null
          contacts_completed?: number | null
          contacts_reached?: number | null
          contacts_remaining?: number | null
          created_at?: string | null
          current_position?: number | null
          days_between_attempts?: number | null
          description?: string | null
          id?: string
          last_called_at?: string | null
          max_attempts?: number | null
          name?: string
          organization_id?: string | null
          priority?: number | null
          respect_dnc?: boolean | null
          source_filter?: Json | null
          source_list_id?: string | null
          source_type?: string
          status?: string | null
          timezone?: string | null
          total_contacts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_queues_call_script_id_fkey"
            columns: ["call_script_id"]
            isOneToOne: false
            referencedRelation: "call_scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queues_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      call_scripts: {
        Row: {
          available_fields: string[] | null
          body: string | null
          category: string | null
          closing: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_system: boolean | null
          name: string
          objection_handlers: Json | null
          opening: string | null
          organization_id: string | null
          success_rate: number | null
          updated_at: string | null
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          available_fields?: string[] | null
          body?: string | null
          category?: string | null
          closing?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          objection_handlers?: Json | null
          opening?: string | null
          organization_id?: string | null
          success_rate?: number | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          available_fields?: string[] | null
          body?: string | null
          category?: string | null
          closing?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          objection_handlers?: Json | null
          opening?: string | null
          organization_id?: string | null
          success_rate?: number | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_scripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          answered_at: string | null
          contact_name: string | null
          created_at: string | null
          direction: string | null
          disposition: string | null
          disposition_category: string | null
          duration_seconds: number | null
          ended_at: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_time: string | null
          from_number: string | null
          id: string
          initiated_at: string | null
          is_dnc_violation: boolean | null
          notes: string | null
          organization_id: string | null
          phone_number: string
          property_id: string | null
          queue_contact_id: string | null
          queue_id: string | null
          recording_duration_seconds: number | null
          recording_status: string | null
          recording_url: string | null
          ring_time_seconds: number | null
          status: string | null
          talk_time_seconds: number | null
          to_number: string | null
          transcription: string | null
          twilio_call_sid: string | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          contact_name?: string | null
          created_at?: string | null
          direction?: string | null
          disposition?: string | null
          disposition_category?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_time?: string | null
          from_number?: string | null
          id?: string
          initiated_at?: string | null
          is_dnc_violation?: boolean | null
          notes?: string | null
          organization_id?: string | null
          phone_number: string
          property_id?: string | null
          queue_contact_id?: string | null
          queue_id?: string | null
          recording_duration_seconds?: number | null
          recording_status?: string | null
          recording_url?: string | null
          ring_time_seconds?: number | null
          status?: string | null
          talk_time_seconds?: number | null
          to_number?: string | null
          transcription?: string | null
          twilio_call_sid?: string | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          contact_name?: string | null
          created_at?: string | null
          direction?: string | null
          disposition?: string | null
          disposition_category?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_time?: string | null
          from_number?: string | null
          id?: string
          initiated_at?: string | null
          is_dnc_violation?: boolean | null
          notes?: string | null
          organization_id?: string | null
          phone_number?: string
          property_id?: string | null
          queue_contact_id?: string | null
          queue_id?: string | null
          recording_duration_seconds?: number | null
          recording_status?: string | null
          recording_url?: string | null
          ring_time_seconds?: number | null
          status?: string | null
          talk_time_seconds?: number | null
          to_number?: string | null
          transcription?: string | null
          twilio_call_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_queue_contact_id_fkey"
            columns: ["queue_contact_id"]
            isOneToOne: false
            referencedRelation: "call_queue_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "call_queues"
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
      cash_buyers: {
        Row: {
          buyer_rating: number | null
          buying_strategy: string[] | null
          can_close_days: number | null
          company_name: string | null
          condition_preference: string[] | null
          created_at: string | null
          deals_interested: number | null
          deals_purchased: number | null
          deals_viewed: number | null
          email: string
          email_opt_in: boolean | null
          first_name: string | null
          full_name: string | null
          funding_type: string | null
          id: string
          is_verified: boolean | null
          last_active_at: string | null
          last_name: string | null
          markets: string[] | null
          max_arv: number | null
          max_price: number | null
          min_arv: number | null
          min_equity_pct: number | null
          min_price: number | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          proof_of_funds_amount: number | null
          proof_of_funds_url: string | null
          proof_of_funds_verified: boolean | null
          property_types: string[] | null
          rating_notes: string | null
          referred_by: string | null
          sms_opt_in: boolean | null
          source: string | null
          source_detail: string | null
          status: string | null
          tags: string[] | null
          total_purchase_volume: number | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          zip_codes: string[] | null
        }
        Insert: {
          buyer_rating?: number | null
          buying_strategy?: string[] | null
          can_close_days?: number | null
          company_name?: string | null
          condition_preference?: string[] | null
          created_at?: string | null
          deals_interested?: number | null
          deals_purchased?: number | null
          deals_viewed?: number | null
          email: string
          email_opt_in?: boolean | null
          first_name?: string | null
          full_name?: string | null
          funding_type?: string | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          markets?: string[] | null
          max_arv?: number | null
          max_price?: number | null
          min_arv?: number | null
          min_equity_pct?: number | null
          min_price?: number | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          proof_of_funds_amount?: number | null
          proof_of_funds_url?: string | null
          proof_of_funds_verified?: boolean | null
          property_types?: string[] | null
          rating_notes?: string | null
          referred_by?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          source_detail?: string | null
          status?: string | null
          tags?: string[] | null
          total_purchase_volume?: number | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          zip_codes?: string[] | null
        }
        Update: {
          buyer_rating?: number | null
          buying_strategy?: string[] | null
          can_close_days?: number | null
          company_name?: string | null
          condition_preference?: string[] | null
          created_at?: string | null
          deals_interested?: number | null
          deals_purchased?: number | null
          deals_viewed?: number | null
          email?: string
          email_opt_in?: boolean | null
          first_name?: string | null
          full_name?: string | null
          funding_type?: string | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          markets?: string[] | null
          max_arv?: number | null
          max_price?: number | null
          min_arv?: number | null
          min_equity_pct?: number | null
          min_price?: number | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          proof_of_funds_amount?: number | null
          proof_of_funds_url?: string | null
          proof_of_funds_verified?: boolean | null
          property_types?: string[] | null
          rating_notes?: string | null
          referred_by?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          source_detail?: string | null
          status?: string | null
          tags?: string[] | null
          total_purchase_volume?: number | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          zip_codes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_buyers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_buyers_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
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
      comp_searches: {
        Row: {
          avg_price_per_sqft: number | null
          avg_sale_price: number | null
          comps_found: number | null
          created_at: string
          id: string
          organization_id: string | null
          search_params: Json | null
          subject_address: string
          subject_city: string | null
          subject_property_id: string | null
          subject_state: string | null
          subject_zip: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_price_per_sqft?: number | null
          avg_sale_price?: number | null
          comps_found?: number | null
          created_at?: string
          id?: string
          organization_id?: string | null
          search_params?: Json | null
          subject_address: string
          subject_city?: string | null
          subject_property_id?: string | null
          subject_state?: string | null
          subject_zip?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_price_per_sqft?: number | null
          avg_sale_price?: number | null
          comps_found?: number | null
          created_at?: string
          id?: string
          organization_id?: string | null
          search_params?: Json | null
          subject_address?: string
          subject_city?: string | null
          subject_property_id?: string | null
          subject_state?: string | null
          subject_zip?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_searches_subject_property_id_fkey"
            columns: ["subject_property_id"]
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
          address: string
          adjusted_price: number | null
          adjustments: Json | null
          analysis_id: string | null
          baths: number | null
          beds: number | null
          city: string | null
          condition: string | null
          condition_notes: string | null
          county: string | null
          created_at: string | null
          days_on_market: number | null
          distance_miles: number | null
          garage_spaces: number | null
          id: string
          is_selected: boolean | null
          latitude: number | null
          list_price: number | null
          longitude: number | null
          lot_sqft: number | null
          organization_id: string | null
          original_list_price: number | null
          photos: Json | null
          pool: boolean | null
          price_per_sqft: number | null
          property_type: string | null
          sale_date: string | null
          sale_price: number | null
          sale_type: string | null
          source: string | null
          source_id: string | null
          sqft: number | null
          state: string | null
          stories: number | null
          subject_property_id: string | null
          updated_at: string | null
          user_id: string
          weight: number | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          adjusted_price?: number | null
          adjustments?: Json | null
          analysis_id?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          condition?: string | null
          condition_notes?: string | null
          county?: string | null
          created_at?: string | null
          days_on_market?: number | null
          distance_miles?: number | null
          garage_spaces?: number | null
          id?: string
          is_selected?: boolean | null
          latitude?: number | null
          list_price?: number | null
          longitude?: number | null
          lot_sqft?: number | null
          organization_id?: string | null
          original_list_price?: number | null
          photos?: Json | null
          pool?: boolean | null
          price_per_sqft?: number | null
          property_type?: string | null
          sale_date?: string | null
          sale_price?: number | null
          sale_type?: string | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          stories?: number | null
          subject_property_id?: string | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          adjusted_price?: number | null
          adjustments?: Json | null
          analysis_id?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          condition?: string | null
          condition_notes?: string | null
          county?: string | null
          created_at?: string | null
          days_on_market?: number | null
          distance_miles?: number | null
          garage_spaces?: number | null
          id?: string
          is_selected?: boolean | null
          latitude?: number | null
          list_price?: number | null
          longitude?: number | null
          lot_sqft?: number | null
          organization_id?: string | null
          original_list_price?: number | null
          photos?: Json | null
          pool?: boolean | null
          price_per_sqft?: number | null
          property_type?: string | null
          sale_date?: string | null
          sale_price?: number | null
          sale_type?: string | null
          source?: string | null
          source_id?: string | null
          sqft?: number | null
          state?: string | null
          stories?: number | null
          subject_property_id?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comps_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comps_subject_property_id_fkey"
            columns: ["subject_property_id"]
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
      d4d_areas: {
        Row: {
          boundary_coordinates: Json | null
          center_lat: number | null
          center_lng: number | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          last_driven_at: string | null
          name: string
          organization_id: string | null
          polygon_geojson: Json | null
          properties_tagged: number | null
          times_driven: number | null
          total_miles_driven: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          boundary_coordinates?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          last_driven_at?: string | null
          name: string
          organization_id?: string | null
          polygon_geojson?: Json | null
          properties_tagged?: number | null
          times_driven?: number | null
          total_miles_driven?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          boundary_coordinates?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          last_driven_at?: string | null
          name?: string
          organization_id?: string | null
          polygon_geojson?: Json | null
          properties_tagged?: number | null
          times_driven?: number | null
          total_miles_driven?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "d4d_areas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      d4d_mileage_log: {
        Row: {
          calculated_miles: number | null
          created_at: string | null
          date: string
          deduction_amount: number | null
          description: string | null
          end_odometer: number | null
          final_miles: number | null
          id: string
          mileage_rate: number | null
          notes: string | null
          organization_id: string | null
          purpose: string | null
          session_id: string | null
          start_odometer: number | null
          user_id: string
        }
        Insert: {
          calculated_miles?: number | null
          created_at?: string | null
          date: string
          deduction_amount?: number | null
          description?: string | null
          end_odometer?: number | null
          final_miles?: number | null
          id?: string
          mileage_rate?: number | null
          notes?: string | null
          organization_id?: string | null
          purpose?: string | null
          session_id?: string | null
          start_odometer?: number | null
          user_id: string
        }
        Update: {
          calculated_miles?: number | null
          created_at?: string | null
          date?: string
          deduction_amount?: number | null
          description?: string | null
          end_odometer?: number | null
          final_miles?: number | null
          id?: string
          mileage_rate?: number | null
          notes?: string | null
          organization_id?: string | null
          purpose?: string | null
          session_id?: string | null
          start_odometer?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "d4d_mileage_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "d4d_mileage_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "driving_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      d4d_properties: {
        Row: {
          address: string | null
          city: string | null
          condition: string | null
          county: string | null
          created_at: string | null
          formatted_address: string | null
          has_abandoned_vehicles: boolean | null
          has_boarded_windows: boolean | null
          has_broken_windows: boolean | null
          has_code_violations: boolean | null
          has_for_sale_sign: boolean | null
          has_mail_pileup: boolean | null
          has_notice_on_door: boolean | null
          has_overgrown_lawn: boolean | null
          has_peeling_paint: boolean | null
          has_roof_damage: boolean | null
          id: string
          latitude: number
          longitude: number
          occupancy: string | null
          organization_id: string | null
          photos: Json | null
          priority: number | null
          property_type: string | null
          session_id: string | null
          state: string | null
          street_name: string | null
          street_number: string | null
          sync_status: string | null
          synced_at: string | null
          synced_to_property_id: string | null
          tagged_at: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          voice_note_transcript: string | null
          voice_note_url: string | null
          written_notes: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          condition?: string | null
          county?: string | null
          created_at?: string | null
          formatted_address?: string | null
          has_abandoned_vehicles?: boolean | null
          has_boarded_windows?: boolean | null
          has_broken_windows?: boolean | null
          has_code_violations?: boolean | null
          has_for_sale_sign?: boolean | null
          has_mail_pileup?: boolean | null
          has_notice_on_door?: boolean | null
          has_overgrown_lawn?: boolean | null
          has_peeling_paint?: boolean | null
          has_roof_damage?: boolean | null
          id?: string
          latitude: number
          longitude: number
          occupancy?: string | null
          organization_id?: string | null
          photos?: Json | null
          priority?: number | null
          property_type?: string | null
          session_id?: string | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          sync_status?: string | null
          synced_at?: string | null
          synced_to_property_id?: string | null
          tagged_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          voice_note_transcript?: string | null
          voice_note_url?: string | null
          written_notes?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          condition?: string | null
          county?: string | null
          created_at?: string | null
          formatted_address?: string | null
          has_abandoned_vehicles?: boolean | null
          has_boarded_windows?: boolean | null
          has_broken_windows?: boolean | null
          has_code_violations?: boolean | null
          has_for_sale_sign?: boolean | null
          has_mail_pileup?: boolean | null
          has_notice_on_door?: boolean | null
          has_overgrown_lawn?: boolean | null
          has_peeling_paint?: boolean | null
          has_roof_damage?: boolean | null
          id?: string
          latitude?: number
          longitude?: number
          occupancy?: string | null
          organization_id?: string | null
          photos?: Json | null
          priority?: number | null
          property_type?: string | null
          session_id?: string | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          sync_status?: string | null
          synced_at?: string | null
          synced_to_property_id?: string | null
          tagged_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          voice_note_transcript?: string | null
          voice_note_url?: string | null
          written_notes?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "d4d_properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "d4d_properties_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "driving_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "d4d_properties_synced_to_property_id_fkey"
            columns: ["synced_to_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      d4d_route_points: {
        Row: {
          accuracy: number | null
          altitude: number | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
          session_id: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
          session_id: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          session_id?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "d4d_route_points_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "driving_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_analyses: {
        Row: {
          address: string
          agent_commission_pct: number | null
          analysis_type: string | null
          annualized_roi: number | null
          arv: number | null
          arv_high: number | null
          arv_low: number | null
          arv_method: string | null
          arv_notes: string | null
          arv_price_per_sqft: number | null
          asking_price: number | null
          assignment_fee: number | null
          attachments: Json | null
          baths: number | null
          beds: number | null
          break_even_price: number | null
          buyer_agent_commission_pct: number | null
          cash_on_cash: number | null
          city: string | null
          created_at: string | null
          down_payment_amount: number | null
          down_payment_pct: number | null
          earnest_money: number | null
          end_buyer_name: string | null
          equity_capture: number | null
          financing_type: string | null
          gross_profit: number | null
          hoa_monthly: number | null
          holding_months: number | null
          id: string
          insurance_monthly: number | null
          interest_rate: number | null
          is_shared: boolean | null
          lawn_maintenance_monthly: number | null
          loan_amount: number | null
          loan_origination_fee: number | null
          loan_payment_monthly: number | null
          loan_points: number | null
          loan_term_months: number | null
          lot_sqft: number | null
          mao_70_pct: number | null
          mao_75_pct: number | null
          mao_80_pct: number | null
          mao_custom: number | null
          mao_custom_pct: number | null
          marketing_costs: number | null
          name: string
          net_profit: number | null
          notes: string | null
          organization_id: string | null
          other_holding_monthly: number | null
          photography_costs: number | null
          profit_per_month: number | null
          property_id: string | null
          property_taxes_monthly: number | null
          property_type: string | null
          purchase_closing_costs: number | null
          purchase_closing_pct: number | null
          purchase_price: number
          repair_breakdown: Json | null
          repair_contingency_pct: number | null
          repair_estimate: number | null
          repair_scope: string | null
          repair_timeline_weeks: number | null
          roi_percentage: number | null
          seller_closing_costs_pct: number | null
          seller_concessions: number | null
          shared_link_id: string | null
          spread: number | null
          sqft: number | null
          staging_costs: number | null
          state: string | null
          status: string | null
          total_financing_cost: number | null
          total_holding_cost: number | null
          total_project_cost: number | null
          total_purchase_cost: number | null
          total_repair_cost: number | null
          total_selling_cost: number | null
          updated_at: string | null
          user_id: string
          utilities_monthly: number | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          address: string
          agent_commission_pct?: number | null
          analysis_type?: string | null
          annualized_roi?: number | null
          arv?: number | null
          arv_high?: number | null
          arv_low?: number | null
          arv_method?: string | null
          arv_notes?: string | null
          arv_price_per_sqft?: number | null
          asking_price?: number | null
          assignment_fee?: number | null
          attachments?: Json | null
          baths?: number | null
          beds?: number | null
          break_even_price?: number | null
          buyer_agent_commission_pct?: number | null
          cash_on_cash?: number | null
          city?: string | null
          created_at?: string | null
          down_payment_amount?: number | null
          down_payment_pct?: number | null
          earnest_money?: number | null
          end_buyer_name?: string | null
          equity_capture?: number | null
          financing_type?: string | null
          gross_profit?: number | null
          hoa_monthly?: number | null
          holding_months?: number | null
          id?: string
          insurance_monthly?: number | null
          interest_rate?: number | null
          is_shared?: boolean | null
          lawn_maintenance_monthly?: number | null
          loan_amount?: number | null
          loan_origination_fee?: number | null
          loan_payment_monthly?: number | null
          loan_points?: number | null
          loan_term_months?: number | null
          lot_sqft?: number | null
          mao_70_pct?: number | null
          mao_75_pct?: number | null
          mao_80_pct?: number | null
          mao_custom?: number | null
          mao_custom_pct?: number | null
          marketing_costs?: number | null
          name: string
          net_profit?: number | null
          notes?: string | null
          organization_id?: string | null
          other_holding_monthly?: number | null
          photography_costs?: number | null
          profit_per_month?: number | null
          property_id?: string | null
          property_taxes_monthly?: number | null
          property_type?: string | null
          purchase_closing_costs?: number | null
          purchase_closing_pct?: number | null
          purchase_price: number
          repair_breakdown?: Json | null
          repair_contingency_pct?: number | null
          repair_estimate?: number | null
          repair_scope?: string | null
          repair_timeline_weeks?: number | null
          roi_percentage?: number | null
          seller_closing_costs_pct?: number | null
          seller_concessions?: number | null
          shared_link_id?: string | null
          spread?: number | null
          sqft?: number | null
          staging_costs?: number | null
          state?: string | null
          status?: string | null
          total_financing_cost?: number | null
          total_holding_cost?: number | null
          total_project_cost?: number | null
          total_purchase_cost?: number | null
          total_repair_cost?: number | null
          total_selling_cost?: number | null
          updated_at?: string | null
          user_id: string
          utilities_monthly?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          agent_commission_pct?: number | null
          analysis_type?: string | null
          annualized_roi?: number | null
          arv?: number | null
          arv_high?: number | null
          arv_low?: number | null
          arv_method?: string | null
          arv_notes?: string | null
          arv_price_per_sqft?: number | null
          asking_price?: number | null
          assignment_fee?: number | null
          attachments?: Json | null
          baths?: number | null
          beds?: number | null
          break_even_price?: number | null
          buyer_agent_commission_pct?: number | null
          cash_on_cash?: number | null
          city?: string | null
          created_at?: string | null
          down_payment_amount?: number | null
          down_payment_pct?: number | null
          earnest_money?: number | null
          end_buyer_name?: string | null
          equity_capture?: number | null
          financing_type?: string | null
          gross_profit?: number | null
          hoa_monthly?: number | null
          holding_months?: number | null
          id?: string
          insurance_monthly?: number | null
          interest_rate?: number | null
          is_shared?: boolean | null
          lawn_maintenance_monthly?: number | null
          loan_amount?: number | null
          loan_origination_fee?: number | null
          loan_payment_monthly?: number | null
          loan_points?: number | null
          loan_term_months?: number | null
          lot_sqft?: number | null
          mao_70_pct?: number | null
          mao_75_pct?: number | null
          mao_80_pct?: number | null
          mao_custom?: number | null
          mao_custom_pct?: number | null
          marketing_costs?: number | null
          name?: string
          net_profit?: number | null
          notes?: string | null
          organization_id?: string | null
          other_holding_monthly?: number | null
          photography_costs?: number | null
          profit_per_month?: number | null
          property_id?: string | null
          property_taxes_monthly?: number | null
          property_type?: string | null
          purchase_closing_costs?: number | null
          purchase_closing_pct?: number | null
          purchase_price?: number
          repair_breakdown?: Json | null
          repair_contingency_pct?: number | null
          repair_estimate?: number | null
          repair_scope?: string | null
          repair_timeline_weeks?: number | null
          roi_percentage?: number | null
          seller_closing_costs_pct?: number | null
          seller_concessions?: number | null
          shared_link_id?: string | null
          spread?: number | null
          sqft?: number | null
          staging_costs?: number | null
          state?: string | null
          status?: string | null
          total_financing_cost?: number | null
          total_holding_cost?: number | null
          total_project_cost?: number | null
          total_purchase_cost?: number | null
          total_repair_cost?: number | null
          total_selling_cost?: number | null
          updated_at?: string | null
          user_id?: string
          utilities_monthly?: number | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_campaigns: {
        Row: {
          click_rate: number | null
          created_at: string | null
          deal_id: string
          email_body: string | null
          emails_clicked: number | null
          emails_delivered: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          interests_generated: number | null
          name: string
          offers_received: number | null
          open_rate: number | null
          organization_id: string | null
          preview_text: string | null
          recipient_count: number | null
          recipient_filter: Json | null
          recipient_ids: string[] | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          unique_clicks: number | null
          unique_opens: number | null
          unsubscribes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          click_rate?: number | null
          created_at?: string | null
          deal_id: string
          email_body?: string | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          interests_generated?: number | null
          name: string
          offers_received?: number | null
          open_rate?: number | null
          organization_id?: string | null
          preview_text?: string | null
          recipient_count?: number | null
          recipient_filter?: Json | null
          recipient_ids?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          unique_clicks?: number | null
          unique_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          click_rate?: number | null
          created_at?: string | null
          deal_id?: string
          email_body?: string | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          interests_generated?: number | null
          name?: string
          offers_received?: number | null
          open_rate?: number | null
          organization_id?: string | null
          preview_text?: string | null
          recipient_count?: number | null
          recipient_filter?: Json | null
          recipient_ids?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          unique_clicks?: number | null
          unique_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_campaigns_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "dispo_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_interests: {
        Row: {
          buyer_id: string | null
          campaign_id: string | null
          created_at: string | null
          deal_id: string
          follow_up_notes: string | null
          follow_up_status: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          interest_type: string
          last_contacted_at: string | null
          message: string | null
          offer_amount: number | null
          offer_notes: string | null
          offer_submitted_at: string | null
          organization_id: string | null
          questions: string | null
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buyer_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          deal_id: string
          follow_up_notes?: string | null
          follow_up_status?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          interest_type: string
          last_contacted_at?: string | null
          message?: string | null
          offer_amount?: number | null
          offer_notes?: string | null
          offer_submitted_at?: string | null
          organization_id?: string | null
          questions?: string | null
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buyer_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          deal_id?: string
          follow_up_notes?: string | null
          follow_up_status?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          interest_type?: string
          last_contacted_at?: string | null
          message?: string | null
          offer_amount?: number | null
          offer_notes?: string | null
          offer_submitted_at?: string | null
          organization_id?: string | null
          questions?: string | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_interests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_interests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "dispo_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_interests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_sources: {
        Row: {
          address: string | null
          avg_close_days: number | null
          buy_box: Json | null
          city: string | null
          company: string | null
          created_at: string | null
          deals_closed: number | null
          deals_sent: number | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          insurance_verified: boolean | null
          jobs_completed: number | null
          last_contact_date: string | null
          lending_criteria: Json | null
          license_number: string | null
          license_verified: boolean | null
          linkedin: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          on_time_percentage: number | null
          organization_id: string | null
          phone: string | null
          pof_amount: number | null
          pof_verified: boolean | null
          rating: number | null
          reliability_score: number | null
          service_areas: string[] | null
          source: string | null
          source_entity_id: string | null
          source_origin: string | null
          specialty: string[] | null
          state: string | null
          status: string | null
          tags: string[] | null
          total_profit: number | null
          type: string
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          avg_close_days?: number | null
          buy_box?: Json | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_sent?: number | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          insurance_verified?: boolean | null
          jobs_completed?: number | null
          last_contact_date?: string | null
          lending_criteria?: Json | null
          license_number?: string | null
          license_verified?: boolean | null
          linkedin?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          on_time_percentage?: number | null
          organization_id?: string | null
          phone?: string | null
          pof_amount?: number | null
          pof_verified?: boolean | null
          rating?: number | null
          reliability_score?: number | null
          service_areas?: string[] | null
          source?: string | null
          source_entity_id?: string | null
          source_origin?: string | null
          specialty?: string[] | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          total_profit?: number | null
          type: string
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          avg_close_days?: number | null
          buy_box?: Json | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          deals_closed?: number | null
          deals_sent?: number | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          insurance_verified?: boolean | null
          jobs_completed?: number | null
          last_contact_date?: string | null
          lending_criteria?: Json | null
          license_number?: string | null
          license_verified?: boolean | null
          linkedin?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          on_time_percentage?: number | null
          organization_id?: string | null
          phone?: string | null
          pof_amount?: number | null
          pof_verified?: boolean | null
          rating?: number | null
          reliability_score?: number | null
          service_areas?: string[] | null
          source?: string | null
          source_entity_id?: string | null
          source_origin?: string | null
          specialty?: string[] | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          total_profit?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
          zip?: string | null
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
      deal_views: {
        Row: {
          buyer_id: string | null
          deal_id: string
          documents_accessed: boolean | null
          id: string
          ip_address: string | null
          photos_viewed: number | null
          referrer: string | null
          time_on_page_seconds: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewed_at: string | null
          visitor_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          deal_id: string
          documents_accessed?: boolean | null
          id?: string
          ip_address?: string | null
          photos_viewed?: number | null
          referrer?: string | null
          time_on_page_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          deal_id?: string
          documents_accessed?: boolean | null
          id?: string
          ip_address?: string | null
          photos_viewed?: number | null
          referrer?: string | null
          time_on_page_seconds?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewed_at?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_views_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_views_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "dispo_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_sessions: {
        Row: {
          appointments_set: number | null
          avg_call_duration_seconds: number | null
          calls_answered: number | null
          calls_made: number | null
          calls_per_hour: number | null
          contacts_reached: number | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          organization_id: string | null
          queue_id: string | null
          session_notes: string | null
          started_at: string | null
          total_talk_time_seconds: number | null
          user_id: string
        }
        Insert: {
          appointments_set?: number | null
          avg_call_duration_seconds?: number | null
          calls_answered?: number | null
          calls_made?: number | null
          calls_per_hour?: number | null
          contacts_reached?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          queue_id?: string | null
          session_notes?: string | null
          started_at?: string | null
          total_talk_time_seconds?: number | null
          user_id: string
        }
        Update: {
          appointments_set?: number | null
          avg_call_duration_seconds?: number | null
          calls_answered?: number | null
          calls_made?: number | null
          calls_per_hour?: number | null
          contacts_reached?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          queue_id?: string | null
          session_notes?: string | null
          started_at?: string | null
          total_talk_time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_sessions_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "call_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      dispo_campaign_recipients: {
        Row: {
          bounced_at: string | null
          buyer_id: string | null
          campaign_id: string
          clicked_at: string | null
          created_at: string
          email: string
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          buyer_id?: string | null
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          buyer_id?: string | null
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispo_campaign_recipients_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispo_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "dispo_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      dispo_campaigns: {
        Row: {
          body_html: string
          body_json: Json | null
          bounced_count: number | null
          clicked_count: number | null
          created_at: string
          deal_id: string | null
          id: string
          name: string
          opened_count: number | null
          organization_id: string | null
          preview_text: string | null
          recipient_count: number | null
          recipient_filter: Json | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          template_type: string | null
          unsubscribed_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_html?: string
          body_json?: Json | null
          bounced_count?: number | null
          clicked_count?: number | null
          created_at?: string
          deal_id?: string | null
          id?: string
          name: string
          opened_count?: number | null
          organization_id?: string | null
          preview_text?: string | null
          recipient_count?: number | null
          recipient_filter?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          template_type?: string | null
          unsubscribed_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_html?: string
          body_json?: Json | null
          bounced_count?: number | null
          clicked_count?: number | null
          created_at?: string
          deal_id?: string | null
          id?: string
          name?: string
          opened_count?: number | null
          organization_id?: string | null
          preview_text?: string | null
          recipient_count?: number | null
          recipient_filter?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          template_type?: string | null
          unsubscribed_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispo_campaigns_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "dispo_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispo_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dispo_deals: {
        Row: {
          access_password: string | null
          address: string
          arv: number | null
          asking_price: number
          assignment_fee: number | null
          assignment_or_double: boolean | null
          baths: number | null
          beds: number | null
          city: string
          closing_timeline: string | null
          comps_data: Json | null
          comps_summary: string | null
          contract_price: number | null
          county: string | null
          created_at: string | null
          description: string | null
          documents: Json | null
          earnest_money_required: number | null
          equity_amount: number | null
          equity_percentage: number | null
          expires_at: string | null
          final_sale_price: number | null
          financing_allowed: string[] | null
          garage: string | null
          id: string
          inquiry_count: number | null
          interest_count: number | null
          investment_highlights: string[] | null
          lot_sqft: number | null
          neighborhood: string | null
          notify_on_interest: boolean | null
          notify_on_view: boolean | null
          organization_id: string | null
          password_protected: boolean | null
          photos: Json | null
          pool: boolean | null
          price_per_sqft: number | null
          property_id: string | null
          property_type: string | null
          published_at: string | null
          repair_details: string | null
          repair_estimate: number | null
          show_assignment_fee: boolean | null
          slug: string
          sold_at: string | null
          sold_to_buyer_id: string | null
          sqft: number | null
          state: string
          status: string | null
          stories: number | null
          title: string
          under_contract_at: string | null
          unique_views: number | null
          updated_at: string | null
          user_id: string
          video_url: string | null
          view_count: number | null
          virtual_tour_url: string | null
          visibility: string | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          access_password?: string | null
          address: string
          arv?: number | null
          asking_price: number
          assignment_fee?: number | null
          assignment_or_double?: boolean | null
          baths?: number | null
          beds?: number | null
          city: string
          closing_timeline?: string | null
          comps_data?: Json | null
          comps_summary?: string | null
          contract_price?: number | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          earnest_money_required?: number | null
          equity_amount?: number | null
          equity_percentage?: number | null
          expires_at?: string | null
          final_sale_price?: number | null
          financing_allowed?: string[] | null
          garage?: string | null
          id?: string
          inquiry_count?: number | null
          interest_count?: number | null
          investment_highlights?: string[] | null
          lot_sqft?: number | null
          neighborhood?: string | null
          notify_on_interest?: boolean | null
          notify_on_view?: boolean | null
          organization_id?: string | null
          password_protected?: boolean | null
          photos?: Json | null
          pool?: boolean | null
          price_per_sqft?: number | null
          property_id?: string | null
          property_type?: string | null
          published_at?: string | null
          repair_details?: string | null
          repair_estimate?: number | null
          show_assignment_fee?: boolean | null
          slug: string
          sold_at?: string | null
          sold_to_buyer_id?: string | null
          sqft?: number | null
          state: string
          status?: string | null
          stories?: number | null
          title: string
          under_contract_at?: string | null
          unique_views?: number | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
          visibility?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          access_password?: string | null
          address?: string
          arv?: number | null
          asking_price?: number
          assignment_fee?: number | null
          assignment_or_double?: boolean | null
          baths?: number | null
          beds?: number | null
          city?: string
          closing_timeline?: string | null
          comps_data?: Json | null
          comps_summary?: string | null
          contract_price?: number | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          earnest_money_required?: number | null
          equity_amount?: number | null
          equity_percentage?: number | null
          expires_at?: string | null
          final_sale_price?: number | null
          financing_allowed?: string[] | null
          garage?: string | null
          id?: string
          inquiry_count?: number | null
          interest_count?: number | null
          investment_highlights?: string[] | null
          lot_sqft?: number | null
          neighborhood?: string | null
          notify_on_interest?: boolean | null
          notify_on_view?: boolean | null
          organization_id?: string | null
          password_protected?: boolean | null
          photos?: Json | null
          pool?: boolean | null
          price_per_sqft?: number | null
          property_id?: string | null
          property_type?: string | null
          published_at?: string | null
          repair_details?: string | null
          repair_estimate?: number | null
          show_assignment_fee?: boolean | null
          slug?: string
          sold_at?: string | null
          sold_to_buyer_id?: string | null
          sqft?: number | null
          state?: string
          status?: string | null
          stories?: number | null
          title?: string
          under_contract_at?: string | null
          unique_views?: number | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          view_count?: number | null
          virtual_tour_url?: string | null
          visibility?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispo_deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispo_deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispo_deals_sold_to_buyer_id_fkey"
            columns: ["sold_to_buyer_id"]
            isOneToOne: false
            referencedRelation: "cash_buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      dispo_settings: {
        Row: {
          accent_color: string | null
          auto_approve_buyers: boolean | null
          buyer_slug: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          default_closing_timeline: string | null
          default_earnest_money: number | null
          default_financing_allowed: string[] | null
          default_theme: string | null
          default_visibility: string | null
          disclaimer_text: string | null
          email_footer_text: string | null
          email_from_name: string | null
          email_reply_to: string | null
          email_signature: string | null
          email_unsubscribe_text: string | null
          id: string
          notification_email: string | null
          notification_phone: string | null
          notification_sms: string | null
          notify_deal_interest: boolean | null
          notify_deal_view: boolean | null
          notify_interest: boolean | null
          notify_new_buyer: boolean | null
          notify_offer: boolean | null
          organization_id: string | null
          primary_color: string | null
          privacy_url: string | null
          registration_fields: string[] | null
          require_email_verification: boolean | null
          require_proof_of_funds: boolean | null
          require_registration: boolean | null
          terms_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          auto_approve_buyers?: boolean | null
          buyer_slug?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          default_closing_timeline?: string | null
          default_earnest_money?: number | null
          default_financing_allowed?: string[] | null
          default_theme?: string | null
          default_visibility?: string | null
          disclaimer_text?: string | null
          email_footer_text?: string | null
          email_from_name?: string | null
          email_reply_to?: string | null
          email_signature?: string | null
          email_unsubscribe_text?: string | null
          id?: string
          notification_email?: string | null
          notification_phone?: string | null
          notification_sms?: string | null
          notify_deal_interest?: boolean | null
          notify_deal_view?: boolean | null
          notify_interest?: boolean | null
          notify_new_buyer?: boolean | null
          notify_offer?: boolean | null
          organization_id?: string | null
          primary_color?: string | null
          privacy_url?: string | null
          registration_fields?: string[] | null
          require_email_verification?: boolean | null
          require_proof_of_funds?: boolean | null
          require_registration?: boolean | null
          terms_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accent_color?: string | null
          auto_approve_buyers?: boolean | null
          buyer_slug?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          default_closing_timeline?: string | null
          default_earnest_money?: number | null
          default_financing_allowed?: string[] | null
          default_theme?: string | null
          default_visibility?: string | null
          disclaimer_text?: string | null
          email_footer_text?: string | null
          email_from_name?: string | null
          email_reply_to?: string | null
          email_signature?: string | null
          email_unsubscribe_text?: string | null
          id?: string
          notification_email?: string | null
          notification_phone?: string | null
          notification_sms?: string | null
          notify_deal_interest?: boolean | null
          notify_deal_view?: boolean | null
          notify_interest?: boolean | null
          notify_new_buyer?: boolean | null
          notify_offer?: boolean | null
          organization_id?: string | null
          primary_color?: string | null
          privacy_url?: string | null
          registration_fields?: string[] | null
          require_email_verification?: boolean | null
          require_proof_of_funds?: boolean | null
          require_registration?: boolean | null
          terms_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispo_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      driving_sessions: {
        Row: {
          active_duration_seconds: number | null
          bounds_east: number | null
          bounds_north: number | null
          bounds_south: number | null
          bounds_west: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          name: string | null
          notes_recorded: number | null
          organization_id: string | null
          photos_taken: number | null
          properties_tagged: number | null
          route_coordinates: Json | null
          route_polyline: string | null
          started_at: string | null
          status: string | null
          temperature_f: number | null
          total_duration_seconds: number | null
          total_miles: number | null
          updated_at: string | null
          user_id: string
          weather_conditions: string | null
        }
        Insert: {
          active_duration_seconds?: number | null
          bounds_east?: number | null
          bounds_north?: number | null
          bounds_south?: number | null
          bounds_west?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          name?: string | null
          notes_recorded?: number | null
          organization_id?: string | null
          photos_taken?: number | null
          properties_tagged?: number | null
          route_coordinates?: Json | null
          route_polyline?: string | null
          started_at?: string | null
          status?: string | null
          temperature_f?: number | null
          total_duration_seconds?: number | null
          total_miles?: number | null
          updated_at?: string | null
          user_id: string
          weather_conditions?: string | null
        }
        Update: {
          active_duration_seconds?: number | null
          bounds_east?: number | null
          bounds_north?: number | null
          bounds_south?: number | null
          bounds_west?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          name?: string | null
          notes_recorded?: number | null
          organization_id?: string | null
          photos_taken?: number | null
          properties_tagged?: number | null
          route_coordinates?: Json | null
          route_polyline?: string | null
          started_at?: string | null
          status?: string | null
          temperature_f?: number | null
          total_duration_seconds?: number | null
          total_miles?: number | null
          updated_at?: string | null
          user_id?: string
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driving_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          attachments: Json | null
          comment_count: number | null
          created_at: string
          description: string
          id: string
          organization_id: string | null
          severity: Database["public"]["Enums"]["bug_severity"] | null
          similarity_group: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at: string
          user_id: string
          vote_count: number | null
        }
        Insert: {
          attachments?: Json | null
          comment_count?: number | null
          created_at?: string
          description: string
          id?: string
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          similarity_group?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string
          user_id: string
          vote_count?: number | null
        }
        Update: {
          attachments?: Json | null
          comment_count?: number | null
          created_at?: string
          description?: string
          id?: string
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          similarity_group?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          title?: string
          type?: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          content: string
          created_at: string
          feedback_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_votes: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
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
      inbox_messages: {
        Row: {
          body: string | null
          body_html: string | null
          campaign_id: string | null
          campaign_property_id: string | null
          channel: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_type: string | null
          created_at: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          external_id: string | null
          id: string
          in_reply_to: string | null
          is_archived: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          metadata: Json | null
          offer_id: string | null
          organization_id: string | null
          property_id: string | null
          subject: string | null
          thread_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          body_html?: string | null
          campaign_id?: string | null
          campaign_property_id?: string | null
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type?: string | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          offer_id?: string | null
          organization_id?: string | null
          property_id?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          body_html?: string | null
          campaign_id?: string | null
          campaign_property_id?: string | null
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type?: string | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          offer_id?: string | null
          organization_id?: string | null
          property_id?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_campaign_property_id_fkey"
            columns: ["campaign_property_id"]
            isOneToOne: false
            referencedRelation: "campaign_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "inbox_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      loi_templates: {
        Row: {
          balloon_months: number | null
          body_html: string | null
          body_text: string | null
          closing_days: number | null
          created_at: string | null
          description: string | null
          down_payment_percentage: number | null
          earnest_money_percentage: number | null
          id: string
          interest_rate: number | null
          is_default: boolean | null
          loi_type: Database["public"]["Enums"]["loi_type"]
          monthly_payment_formula: string | null
          name: string
          offer_percentage: number | null
          organization_id: string | null
          subject_line: string | null
          term_months: number | null
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          balloon_months?: number | null
          body_html?: string | null
          body_text?: string | null
          closing_days?: number | null
          created_at?: string | null
          description?: string | null
          down_payment_percentage?: number | null
          earnest_money_percentage?: number | null
          id?: string
          interest_rate?: number | null
          is_default?: boolean | null
          loi_type?: Database["public"]["Enums"]["loi_type"]
          monthly_payment_formula?: string | null
          name: string
          offer_percentage?: number | null
          organization_id?: string | null
          subject_line?: string | null
          term_months?: number | null
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          balloon_months?: number | null
          body_html?: string | null
          body_text?: string | null
          closing_days?: number | null
          created_at?: string | null
          description?: string | null
          down_payment_percentage?: number | null
          earnest_money_percentage?: number | null
          id?: string
          interest_rate?: number | null
          is_default?: boolean | null
          loi_type?: Database["public"]["Enums"]["loi_type"]
          monthly_payment_formula?: string | null
          name?: string
          offer_percentage?: number | null
          organization_id?: string | null
          subject_line?: string | null
          term_months?: number | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loi_templates_organization_id_fkey"
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
      market_data: {
        Row: {
          active_listings: number | null
          avg_dom: number | null
          avg_rent: number | null
          avg_sale_price: number | null
          cap_rate_estimate: number | null
          city: string | null
          county: string | null
          created_at: string | null
          data_date: string | null
          data_source: string | null
          gross_yield_pct: number | null
          id: string
          list_to_sale_ratio: number | null
          location_type: string
          location_value: string
          median_dom: number | null
          median_price_per_sqft: number | null
          median_rent: number | null
          median_sale_price: number | null
          months_of_inventory: number | null
          new_listings: number | null
          organization_id: string | null
          pct_over_asking: number | null
          pending_sales: number | null
          price_change_1m_pct: number | null
          price_change_1y_pct: number | null
          price_change_3m_pct: number | null
          price_to_rent_ratio: number | null
          rent_per_sqft: number | null
          state: string | null
          total_sales: number | null
          user_id: string | null
          vacancy_rate: number | null
        }
        Insert: {
          active_listings?: number | null
          avg_dom?: number | null
          avg_rent?: number | null
          avg_sale_price?: number | null
          cap_rate_estimate?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          data_date?: string | null
          data_source?: string | null
          gross_yield_pct?: number | null
          id?: string
          list_to_sale_ratio?: number | null
          location_type: string
          location_value: string
          median_dom?: number | null
          median_price_per_sqft?: number | null
          median_rent?: number | null
          median_sale_price?: number | null
          months_of_inventory?: number | null
          new_listings?: number | null
          organization_id?: string | null
          pct_over_asking?: number | null
          pending_sales?: number | null
          price_change_1m_pct?: number | null
          price_change_1y_pct?: number | null
          price_change_3m_pct?: number | null
          price_to_rent_ratio?: number | null
          rent_per_sqft?: number | null
          state?: string | null
          total_sales?: number | null
          user_id?: string | null
          vacancy_rate?: number | null
        }
        Update: {
          active_listings?: number | null
          avg_dom?: number | null
          avg_rent?: number | null
          avg_sale_price?: number | null
          cap_rate_estimate?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          data_date?: string | null
          data_source?: string | null
          gross_yield_pct?: number | null
          id?: string
          list_to_sale_ratio?: number | null
          location_type?: string
          location_value?: string
          median_dom?: number | null
          median_price_per_sqft?: number | null
          median_rent?: number | null
          median_sale_price?: number | null
          months_of_inventory?: number | null
          new_listings?: number | null
          organization_id?: string | null
          pct_over_asking?: number | null
          pending_sales?: number | null
          price_change_1m_pct?: number | null
          price_change_1y_pct?: number | null
          price_change_3m_pct?: number | null
          price_to_rent_ratio?: number | null
          rent_per_sqft?: number | null
          state?: string | null
          total_sales?: number | null
          user_id?: string | null
          vacancy_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_organization_id_fkey"
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
      offer_batches: {
        Row: {
          closing_days: number | null
          completed_at: string | null
          created_at: string | null
          daily_limit: number | null
          delivery_channels: string[] | null
          down_payment_percentage: number | null
          earnest_money: number | null
          id: string
          interest_rate: number | null
          loi_template_id: string | null
          loi_type: Database["public"]["Enums"]["loi_type"]
          name: string | null
          offer_percentage: number | null
          offers_opened: number | null
          offers_responded: number | null
          offers_sent: number | null
          organization_id: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          term_months: number | null
          total_properties: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          closing_days?: number | null
          completed_at?: string | null
          created_at?: string | null
          daily_limit?: number | null
          delivery_channels?: string[] | null
          down_payment_percentage?: number | null
          earnest_money?: number | null
          id?: string
          interest_rate?: number | null
          loi_template_id?: string | null
          loi_type?: Database["public"]["Enums"]["loi_type"]
          name?: string | null
          offer_percentage?: number | null
          offers_opened?: number | null
          offers_responded?: number | null
          offers_sent?: number | null
          organization_id?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          term_months?: number | null
          total_properties?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          closing_days?: number | null
          completed_at?: string | null
          created_at?: string | null
          daily_limit?: number | null
          delivery_channels?: string[] | null
          down_payment_percentage?: number | null
          earnest_money?: number | null
          id?: string
          interest_rate?: number | null
          loi_template_id?: string | null
          loi_type?: Database["public"]["Enums"]["loi_type"]
          name?: string | null
          offer_percentage?: number | null
          offers_opened?: number | null
          offers_responded?: number | null
          offers_sent?: number | null
          organization_id?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          term_months?: number | null
          total_properties?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_batches_loi_template_id_fkey"
            columns: ["loi_template_id"]
            isOneToOne: false
            referencedRelation: "loi_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_batches_organization_id_fkey"
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
      offer_templates: {
        Row: {
          created_at: string
          description: string | null
          document_type: string | null
          email_body: string | null
          email_signature: string | null
          email_subject: string | null
          id: string
          include_pof: boolean | null
          is_active: boolean | null
          is_default: boolean | null
          loi_content: string | null
          market_type: string | null
          name: string
          offer_type: string
          organization_id: string | null
          sms_body: string | null
          terms: Json
          updated_at: string
          use_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          email_body?: string | null
          email_signature?: string | null
          email_subject?: string | null
          id?: string
          include_pof?: boolean | null
          is_active?: boolean | null
          is_default?: boolean | null
          loi_content?: string | null
          market_type?: string | null
          name: string
          offer_type: string
          organization_id?: string | null
          sms_body?: string | null
          terms?: Json
          updated_at?: string
          use_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string | null
          email_body?: string | null
          email_signature?: string | null
          email_subject?: string | null
          id?: string
          include_pof?: boolean | null
          is_active?: boolean | null
          is_default?: boolean | null
          loi_content?: string | null
          market_type?: string | null
          name?: string
          offer_type?: string
          organization_id?: string | null
          sms_body?: string | null
          terms?: Json
          updated_at?: string
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          automation_mode: string | null
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
          automation_mode?: string | null
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
          automation_mode?: string | null
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
      proof_of_funds: {
        Row: {
          amount: number
          created_at: string
          expiration_date: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean | null
          lender_contact: string | null
          lender_name: string | null
          notes: string | null
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expiration_date: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          lender_contact?: string | null
          lender_name?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expiration_date?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          lender_contact?: string | null
          lender_name?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_of_funds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      property_transactions: {
        Row: {
          accepted_offer: number | null
          accepted_offer_date: string | null
          appraiser_agent_recommended: boolean | null
          appraiser_contact_id: string | null
          appraiser_name: string | null
          appraiser_phone: string | null
          closing_documents_signed: boolean | null
          closing_escrow_wired: boolean | null
          closing_final_walkthrough: boolean | null
          closing_financing_finalized: boolean | null
          closing_keys_received: boolean | null
          created_at: string
          current_milestone: number
          escrow_confirmed: boolean | null
          escrow_contact_id: string | null
          escrow_email: string | null
          escrow_name: string | null
          escrow_phone: string | null
          id: string
          inspector_agent_recommended: boolean | null
          inspector_contact_id: string | null
          inspector_name: string | null
          inspector_phone: string | null
          insurance_carrier: string | null
          insurance_contact_id: string | null
          insurance_name: string | null
          insurance_phone: string | null
          investment_strategy:
            | Database["public"]["Enums"]["investment_strategy"]
            | null
          lender_confirmed: boolean | null
          lender_confirmed_at: string | null
          lender_contact_id: string | null
          lender_email: string | null
          lender_name: string | null
          lender_phone: string | null
          listing_price: number | null
          mao: number | null
          mao_vs_accepted_variance: number | null
          milestone_1_completed_at: string | null
          milestone_2_completed_at: string | null
          milestone_3_completed_at: string | null
          milestone_4_completed_at: string | null
          milestone_5_completed_at: string | null
          notes: string | null
          organization_id: string | null
          property_id: string | null
          realtor_confirmed: boolean | null
          realtor_confirmed_at: string | null
          realtor_contact_id: string | null
          realtor_email: string | null
          realtor_name: string | null
          realtor_phone: string | null
          status: string
          strategy_phase_buy: boolean | null
          strategy_phase_refinance: boolean | null
          strategy_phase_rehab: boolean | null
          strategy_phase_rent: boolean | null
          strategy_phase_repeat: boolean | null
          total_days_to_close: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_offer?: number | null
          accepted_offer_date?: string | null
          appraiser_agent_recommended?: boolean | null
          appraiser_contact_id?: string | null
          appraiser_name?: string | null
          appraiser_phone?: string | null
          closing_documents_signed?: boolean | null
          closing_escrow_wired?: boolean | null
          closing_final_walkthrough?: boolean | null
          closing_financing_finalized?: boolean | null
          closing_keys_received?: boolean | null
          created_at?: string
          current_milestone?: number
          escrow_confirmed?: boolean | null
          escrow_contact_id?: string | null
          escrow_email?: string | null
          escrow_name?: string | null
          escrow_phone?: string | null
          id?: string
          inspector_agent_recommended?: boolean | null
          inspector_contact_id?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          insurance_carrier?: string | null
          insurance_contact_id?: string | null
          insurance_name?: string | null
          insurance_phone?: string | null
          investment_strategy?:
            | Database["public"]["Enums"]["investment_strategy"]
            | null
          lender_confirmed?: boolean | null
          lender_confirmed_at?: string | null
          lender_contact_id?: string | null
          lender_email?: string | null
          lender_name?: string | null
          lender_phone?: string | null
          listing_price?: number | null
          mao?: number | null
          mao_vs_accepted_variance?: number | null
          milestone_1_completed_at?: string | null
          milestone_2_completed_at?: string | null
          milestone_3_completed_at?: string | null
          milestone_4_completed_at?: string | null
          milestone_5_completed_at?: string | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          realtor_confirmed?: boolean | null
          realtor_confirmed_at?: string | null
          realtor_contact_id?: string | null
          realtor_email?: string | null
          realtor_name?: string | null
          realtor_phone?: string | null
          status?: string
          strategy_phase_buy?: boolean | null
          strategy_phase_refinance?: boolean | null
          strategy_phase_rehab?: boolean | null
          strategy_phase_rent?: boolean | null
          strategy_phase_repeat?: boolean | null
          total_days_to_close?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_offer?: number | null
          accepted_offer_date?: string | null
          appraiser_agent_recommended?: boolean | null
          appraiser_contact_id?: string | null
          appraiser_name?: string | null
          appraiser_phone?: string | null
          closing_documents_signed?: boolean | null
          closing_escrow_wired?: boolean | null
          closing_final_walkthrough?: boolean | null
          closing_financing_finalized?: boolean | null
          closing_keys_received?: boolean | null
          created_at?: string
          current_milestone?: number
          escrow_confirmed?: boolean | null
          escrow_contact_id?: string | null
          escrow_email?: string | null
          escrow_name?: string | null
          escrow_phone?: string | null
          id?: string
          inspector_agent_recommended?: boolean | null
          inspector_contact_id?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          insurance_carrier?: string | null
          insurance_contact_id?: string | null
          insurance_name?: string | null
          insurance_phone?: string | null
          investment_strategy?:
            | Database["public"]["Enums"]["investment_strategy"]
            | null
          lender_confirmed?: boolean | null
          lender_confirmed_at?: string | null
          lender_contact_id?: string | null
          lender_email?: string | null
          lender_name?: string | null
          lender_phone?: string | null
          listing_price?: number | null
          mao?: number | null
          mao_vs_accepted_variance?: number | null
          milestone_1_completed_at?: string | null
          milestone_2_completed_at?: string | null
          milestone_3_completed_at?: string | null
          milestone_4_completed_at?: string | null
          milestone_5_completed_at?: string | null
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          realtor_confirmed?: boolean | null
          realtor_confirmed_at?: string | null
          realtor_contact_id?: string | null
          realtor_email?: string | null
          realtor_name?: string | null
          realtor_phone?: string | null
          status?: string
          strategy_phase_buy?: boolean | null
          strategy_phase_refinance?: boolean | null
          strategy_phase_rehab?: boolean | null
          strategy_phase_rent?: boolean | null
          strategy_phase_repeat?: boolean | null
          total_days_to_close?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transactions_appraiser_contact_id_fkey"
            columns: ["appraiser_contact_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_escrow_contact_id_fkey"
            columns: ["escrow_contact_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_inspector_contact_id_fkey"
            columns: ["inspector_contact_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_insurance_contact_id_fkey"
            columns: ["insurance_contact_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_lender_contact_id_fkey"
            columns: ["lender_contact_id"]
            isOneToOne: false
            referencedRelation: "deal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_realtor_contact_id_fkey"
            columns: ["realtor_contact_id"]
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
      rental_analyses: {
        Row: {
          address: string
          appreciation_rate_pct: number | null
          arv: number | null
          baths: number | null
          beds: number | null
          cap_rate: number | null
          capex_reserve_pct: number | null
          cash_left_in_deal: number | null
          cash_on_cash_return: number | null
          cash_out_amount: number | null
          city: string | null
          closing_costs: number | null
          created_at: string | null
          credit_loss_pct: number | null
          deal_analysis_id: string | null
          debt_coverage_ratio: number | null
          effective_gross_income: number | null
          gross_monthly_income: number | null
          gross_rent_multiplier: number | null
          hoa_monthly: number | null
          id: string
          initial_down_payment: number | null
          initial_down_payment_pct: number | null
          initial_financing_type: string | null
          initial_interest_rate: number | null
          initial_loan_amount: number | null
          initial_loan_term_years: number | null
          initial_monthly_pi: number | null
          initial_pmi: number | null
          insurance_yearly: number | null
          is_brrrr: boolean | null
          maintenance_pct: number | null
          monthly_cash_flow: number | null
          monthly_debt_service: number | null
          monthly_rent: number
          name: string
          noi: number | null
          notes: string | null
          one_pct_rule_met: boolean | null
          organization_id: string | null
          other_expenses_monthly: number | null
          other_monthly_income: number | null
          property_id: string | null
          property_management_pct: number | null
          property_taxes_yearly: number | null
          property_type: string | null
          purchase_price: number
          refinance_interest_rate: number | null
          refinance_loan_amount: number | null
          refinance_ltv_pct: number | null
          refinance_monthly_pi: number | null
          rehab_costs: number | null
          rent_growth_rate_pct: number | null
          sqft: number | null
          state: string | null
          status: string | null
          total_acquisition: number | null
          total_cash_invested: number | null
          total_monthly_expenses: number | null
          total_operating_expenses: number | null
          two_pct_rule_met: boolean | null
          units: number | null
          updated_at: string | null
          user_id: string
          utilities_monthly: number | null
          vacancy_rate_pct: number | null
          year_10_projection: Json | null
          year_5_projection: Json | null
          yearly_cash_flow: number | null
          zip: string | null
        }
        Insert: {
          address: string
          appreciation_rate_pct?: number | null
          arv?: number | null
          baths?: number | null
          beds?: number | null
          cap_rate?: number | null
          capex_reserve_pct?: number | null
          cash_left_in_deal?: number | null
          cash_on_cash_return?: number | null
          cash_out_amount?: number | null
          city?: string | null
          closing_costs?: number | null
          created_at?: string | null
          credit_loss_pct?: number | null
          deal_analysis_id?: string | null
          debt_coverage_ratio?: number | null
          effective_gross_income?: number | null
          gross_monthly_income?: number | null
          gross_rent_multiplier?: number | null
          hoa_monthly?: number | null
          id?: string
          initial_down_payment?: number | null
          initial_down_payment_pct?: number | null
          initial_financing_type?: string | null
          initial_interest_rate?: number | null
          initial_loan_amount?: number | null
          initial_loan_term_years?: number | null
          initial_monthly_pi?: number | null
          initial_pmi?: number | null
          insurance_yearly?: number | null
          is_brrrr?: boolean | null
          maintenance_pct?: number | null
          monthly_cash_flow?: number | null
          monthly_debt_service?: number | null
          monthly_rent: number
          name: string
          noi?: number | null
          notes?: string | null
          one_pct_rule_met?: boolean | null
          organization_id?: string | null
          other_expenses_monthly?: number | null
          other_monthly_income?: number | null
          property_id?: string | null
          property_management_pct?: number | null
          property_taxes_yearly?: number | null
          property_type?: string | null
          purchase_price: number
          refinance_interest_rate?: number | null
          refinance_loan_amount?: number | null
          refinance_ltv_pct?: number | null
          refinance_monthly_pi?: number | null
          rehab_costs?: number | null
          rent_growth_rate_pct?: number | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          total_acquisition?: number | null
          total_cash_invested?: number | null
          total_monthly_expenses?: number | null
          total_operating_expenses?: number | null
          two_pct_rule_met?: boolean | null
          units?: number | null
          updated_at?: string | null
          user_id: string
          utilities_monthly?: number | null
          vacancy_rate_pct?: number | null
          year_10_projection?: Json | null
          year_5_projection?: Json | null
          yearly_cash_flow?: number | null
          zip?: string | null
        }
        Update: {
          address?: string
          appreciation_rate_pct?: number | null
          arv?: number | null
          baths?: number | null
          beds?: number | null
          cap_rate?: number | null
          capex_reserve_pct?: number | null
          cash_left_in_deal?: number | null
          cash_on_cash_return?: number | null
          cash_out_amount?: number | null
          city?: string | null
          closing_costs?: number | null
          created_at?: string | null
          credit_loss_pct?: number | null
          deal_analysis_id?: string | null
          debt_coverage_ratio?: number | null
          effective_gross_income?: number | null
          gross_monthly_income?: number | null
          gross_rent_multiplier?: number | null
          hoa_monthly?: number | null
          id?: string
          initial_down_payment?: number | null
          initial_down_payment_pct?: number | null
          initial_financing_type?: string | null
          initial_interest_rate?: number | null
          initial_loan_amount?: number | null
          initial_loan_term_years?: number | null
          initial_monthly_pi?: number | null
          initial_pmi?: number | null
          insurance_yearly?: number | null
          is_brrrr?: boolean | null
          maintenance_pct?: number | null
          monthly_cash_flow?: number | null
          monthly_debt_service?: number | null
          monthly_rent?: number
          name?: string
          noi?: number | null
          notes?: string | null
          one_pct_rule_met?: boolean | null
          organization_id?: string | null
          other_expenses_monthly?: number | null
          other_monthly_income?: number | null
          property_id?: string | null
          property_management_pct?: number | null
          property_taxes_yearly?: number | null
          property_type?: string | null
          purchase_price?: number
          refinance_interest_rate?: number | null
          refinance_loan_amount?: number | null
          refinance_ltv_pct?: number | null
          refinance_monthly_pi?: number | null
          rehab_costs?: number | null
          rent_growth_rate_pct?: number | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          total_acquisition?: number | null
          total_cash_invested?: number | null
          total_monthly_expenses?: number | null
          total_operating_expenses?: number | null
          two_pct_rule_met?: boolean | null
          units?: number | null
          updated_at?: string | null
          user_id?: string
          utilities_monthly?: number | null
          vacancy_rate_pct?: number | null
          year_10_projection?: Json | null
          year_5_projection?: Json | null
          yearly_cash_flow?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_analyses_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_estimates: {
        Row: {
          address: string | null
          category_totals: Json | null
          contingency_amount: number | null
          contingency_pct: number | null
          created_at: string | null
          deal_analysis_id: string | null
          estimated_weeks: number | null
          id: string
          line_items: Json | null
          method: string | null
          name: string
          notes: string | null
          organization_id: string | null
          property_id: string | null
          quick_per_sqft: number | null
          quick_total: number | null
          scope: string | null
          sqft: number | null
          subtotal: number | null
          total_estimate: number | null
          total_labor: number | null
          total_materials: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          category_totals?: Json | null
          contingency_amount?: number | null
          contingency_pct?: number | null
          created_at?: string | null
          deal_analysis_id?: string | null
          estimated_weeks?: number | null
          id?: string
          line_items?: Json | null
          method?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          quick_per_sqft?: number | null
          quick_total?: number | null
          scope?: string | null
          sqft?: number | null
          subtotal?: number | null
          total_estimate?: number | null
          total_labor?: number | null
          total_materials?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          category_totals?: Json | null
          contingency_amount?: number | null
          contingency_pct?: number | null
          created_at?: string | null
          deal_analysis_id?: string | null
          estimated_weeks?: number | null
          id?: string
          line_items?: Json | null
          method?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          property_id?: string | null
          quick_per_sqft?: number | null
          quick_total?: number | null
          scope?: string | null
          sqft?: number | null
          subtotal?: number | null
          total_estimate?: number | null
          total_labor?: number | null
          total_materials?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_estimates_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_estimates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_estimates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_items_library: {
        Row: {
          category: string
          cost_high: number | null
          cost_low: number | null
          created_at: string | null
          default_cost: number
          description: string | null
          id: string
          includes_labor: boolean | null
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          cost_high?: number | null
          cost_low?: number | null
          created_at?: string | null
          default_cost: number
          description?: string | null
          id?: string
          includes_labor?: boolean | null
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          cost_high?: number | null
          cost_low?: number | null
          created_at?: string | null
          default_cost?: number
          description?: string | null
          id?: string
          includes_labor?: boolean | null
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_items_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_active: boolean | null
          last_notified_at: string | null
          name: string
          notification_frequency: string
          organization_id: string | null
          result_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          name: string
          notification_frequency?: string
          organization_id?: string | null
          result_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          name?: string
          notification_frequency?: string
          organization_id?: string | null
          result_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          created_at: string | null
          description: string | null
          filters: Json | null
          id: string
          is_active: boolean | null
          is_shared: boolean | null
          last_run_at: string | null
          last_run_results: number | null
          name: string
          organization_id: string | null
          query: string | null
          schedule_interval: string | null
          sources: string[] | null
          total_leads_found: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          last_run_at?: string | null
          last_run_results?: number | null
          name: string
          organization_id?: string | null
          query?: string | null
          schedule_interval?: string | null
          sources?: string[] | null
          total_leads_found?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          last_run_at?: string | null
          last_run_results?: number | null
          name?: string
          organization_id?: string | null
          query?: string | null
          schedule_interval?: string | null
          sources?: string[] | null
          total_leads_found?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_leads: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          enrichment_data: Json | null
          id: string
          images: string[] | null
          is_enriched: boolean | null
          is_imported: boolean | null
          organization_id: string | null
          price: number | null
          property_id: string | null
          property_type: string | null
          raw_data: Json | null
          scrape_job_id: string | null
          source_name: string | null
          source_url: string | null
          sqft: number | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          enrichment_data?: Json | null
          id?: string
          images?: string[] | null
          is_enriched?: boolean | null
          is_imported?: boolean | null
          organization_id?: string | null
          price?: number | null
          property_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          scrape_job_id?: string | null
          source_name?: string | null
          source_url?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          enrichment_data?: Json | null
          id?: string
          images?: string[] | null
          is_enriched?: boolean | null
          is_imported?: boolean | null
          organization_id?: string | null
          price?: number | null
          property_id?: string | null
          property_type?: string | null
          raw_data?: Json | null
          scrape_job_id?: string | null
          source_name?: string | null
          source_url?: string | null
          sqft?: number | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_leads_scrape_job_id_fkey"
            columns: ["scrape_job_id"]
            isOneToOne: false
            referencedRelation: "scrape_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_leads: {
        Row: {
          asking_price: number | null
          auto_email_sent: boolean | null
          auto_score: number | null
          auto_sms_sent: boolean | null
          baths: number | null
          beds: number | null
          converted_at: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          followup_notes: string | null
          full_name: string | null
          has_mortgage: boolean | null
          how_heard: string | null
          id: string
          ip_address: string | null
          is_listed: boolean | null
          is_owner: boolean | null
          last_contacted_at: string | null
          last_name: string | null
          lot_size: string | null
          mortgage_balance: number | null
          motivation_indicators: string[] | null
          next_followup_at: string | null
          notes: string | null
          organization_id: string | null
          owner_notified: boolean | null
          phone: string | null
          property_address: string
          property_city: string | null
          property_condition: string | null
          property_id: string | null
          property_state: string | null
          property_type: string | null
          property_zip: string | null
          reason_selling: string | null
          sell_timeline: string | null
          source_url: string | null
          sqft: number | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          website_id: string | null
          year_built: number | null
        }
        Insert: {
          asking_price?: number | null
          auto_email_sent?: boolean | null
          auto_score?: number | null
          auto_sms_sent?: boolean | null
          baths?: number | null
          beds?: number | null
          converted_at?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          followup_notes?: string | null
          full_name?: string | null
          has_mortgage?: boolean | null
          how_heard?: string | null
          id?: string
          ip_address?: string | null
          is_listed?: boolean | null
          is_owner?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          lot_size?: string | null
          mortgage_balance?: number | null
          motivation_indicators?: string[] | null
          next_followup_at?: string | null
          notes?: string | null
          organization_id?: string | null
          owner_notified?: boolean | null
          phone?: string | null
          property_address: string
          property_city?: string | null
          property_condition?: string | null
          property_id?: string | null
          property_state?: string | null
          property_type?: string | null
          property_zip?: string | null
          reason_selling?: string | null
          sell_timeline?: string | null
          source_url?: string | null
          sqft?: number | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          website_id?: string | null
          year_built?: number | null
        }
        Update: {
          asking_price?: number | null
          auto_email_sent?: boolean | null
          auto_score?: number | null
          auto_sms_sent?: boolean | null
          baths?: number | null
          beds?: number | null
          converted_at?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          followup_notes?: string | null
          full_name?: string | null
          has_mortgage?: boolean | null
          how_heard?: string | null
          id?: string
          ip_address?: string | null
          is_listed?: boolean | null
          is_owner?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          lot_size?: string | null
          mortgage_balance?: number | null
          motivation_indicators?: string[] | null
          next_followup_at?: string | null
          notes?: string | null
          organization_id?: string | null
          owner_notified?: boolean | null
          phone?: string | null
          property_address?: string
          property_city?: string | null
          property_condition?: string | null
          property_id?: string | null
          property_state?: string | null
          property_type?: string | null
          property_zip?: string | null
          reason_selling?: string | null
          sell_timeline?: string | null
          source_url?: string | null
          sqft?: number | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          website_id?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_leads_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "seller_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_websites: {
        Row: {
          about_content: string | null
          about_headline: string | null
          about_image_url: string | null
          accent_color: string | null
          auto_respond_email: boolean | null
          auto_respond_sms: boolean | null
          background_color: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          created_at: string | null
          custom_domain: string | null
          custom_form_fields: Json | null
          domain_ssl_enabled: boolean | null
          domain_verified: boolean | null
          facebook_pixel_id: string | null
          faqs: Json | null
          favicon_url: string | null
          footer_text: string | null
          form_fields: Json | null
          form_headline: string | null
          form_subheadline: string | null
          form_submit_text: string | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          hero_headline: string | null
          hero_image_url: string | null
          hero_subheadline: string | null
          hero_video_url: string | null
          id: string
          lead_notification_email: string | null
          lead_notification_sms: string | null
          logo_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          name: string
          og_image_url: string | null
          organization_id: string | null
          primary_color: string | null
          process_steps: Json | null
          published_at: string | null
          secondary_color: string | null
          site_type: string | null
          slug: string
          social_links: Json | null
          status: string | null
          team_members: Json | null
          testimonials: Json | null
          text_color: string | null
          total_submissions: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
          value_props: Json | null
        }
        Insert: {
          about_content?: string | null
          about_headline?: string | null
          about_image_url?: string | null
          accent_color?: string | null
          auto_respond_email?: boolean | null
          auto_respond_sms?: boolean | null
          background_color?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          custom_form_fields?: Json | null
          domain_ssl_enabled?: boolean | null
          domain_verified?: boolean | null
          facebook_pixel_id?: string | null
          faqs?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          form_fields?: Json | null
          form_headline?: string | null
          form_subheadline?: string | null
          form_submit_text?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          hero_video_url?: string | null
          id?: string
          lead_notification_email?: string | null
          lead_notification_sms?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name: string
          og_image_url?: string | null
          organization_id?: string | null
          primary_color?: string | null
          process_steps?: Json | null
          published_at?: string | null
          secondary_color?: string | null
          site_type?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          team_members?: Json | null
          testimonials?: Json | null
          text_color?: string | null
          total_submissions?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
          value_props?: Json | null
        }
        Update: {
          about_content?: string | null
          about_headline?: string | null
          about_image_url?: string | null
          accent_color?: string | null
          auto_respond_email?: boolean | null
          auto_respond_sms?: boolean | null
          background_color?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          created_at?: string | null
          custom_domain?: string | null
          custom_form_fields?: Json | null
          domain_ssl_enabled?: boolean | null
          domain_verified?: boolean | null
          facebook_pixel_id?: string | null
          faqs?: Json | null
          favicon_url?: string | null
          footer_text?: string | null
          form_fields?: Json | null
          form_headline?: string | null
          form_subheadline?: string | null
          form_submit_text?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          hero_headline?: string | null
          hero_image_url?: string | null
          hero_subheadline?: string | null
          hero_video_url?: string | null
          id?: string
          lead_notification_email?: string | null
          lead_notification_sms?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          name?: string
          og_image_url?: string | null
          organization_id?: string | null
          primary_color?: string | null
          process_steps?: Json | null
          published_at?: string | null
          secondary_color?: string | null
          site_type?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          team_members?: Json | null
          testimonials?: Json | null
          text_color?: string | null
          total_submissions?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
          value_props?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_websites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      transaction_checklist: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          deal_id: string
          id: string
          item_key: string
          organization_id: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deal_id: string
          id?: string
          item_key: string
          organization_id?: string | null
          stage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deal_id?: string
          id?: string
          item_key?: string
          organization_id?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_checklist_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_stage_notes: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          notes: string
          organization_id: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          notes?: string
          organization_id?: string | null
          stage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          notes?: string
          organization_id?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_stage_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_actions: {
        Row: {
          channel: string | null
          completed_at: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string
          description: string | null
          due_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          meta: Json | null
          organization_id: string | null
          owner_mode: string
          priority: string
          property_address: string | null
          property_id: string | null
          snoozed_until: string | null
          source: string
          source_ref: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          completed_at?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          meta?: Json | null
          organization_id?: string | null
          owner_mode?: string
          priority?: string
          property_address?: string | null
          property_id?: string | null
          snoozed_until?: string | null
          source?: string
          source_ref?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string | null
          completed_at?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          meta?: Json | null
          organization_id?: string | null
          owner_mode?: string
          priority?: string
          property_address?: string | null
          property_id?: string | null
          snoozed_until?: string | null
          source?: string
          source_ref?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_actions_property_id_fkey"
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
      voice_agent_calls: {
        Row: {
          actions_taken: Json | null
          appointment_scheduled: boolean | null
          appointment_time: string | null
          call_id: string | null
          contact_name: string | null
          created_at: string
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_score: number | null
          motivation_level: string | null
          organization_id: string
          outcome: string | null
          phone_number: string
          property_address: string | null
          property_id: string | null
          sentiment: string | null
          started_at: string | null
          summary: string | null
          tasks_created: string[] | null
          transcript: string | null
          transferred_at: string | null
          transferred_to: string | null
          updated_at: string
          user_id: string
          vapi_assistant_id: string | null
          vapi_call_id: string | null
        }
        Insert: {
          actions_taken?: Json | null
          appointment_scheduled?: boolean | null
          appointment_time?: string | null
          call_id?: string | null
          contact_name?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_score?: number | null
          motivation_level?: string | null
          organization_id: string
          outcome?: string | null
          phone_number: string
          property_address?: string | null
          property_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          summary?: string | null
          tasks_created?: string[] | null
          transcript?: string | null
          transferred_at?: string | null
          transferred_to?: string | null
          updated_at?: string
          user_id: string
          vapi_assistant_id?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          actions_taken?: Json | null
          appointment_scheduled?: boolean | null
          appointment_time?: string | null
          call_id?: string | null
          contact_name?: string | null
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_score?: number | null
          motivation_level?: string | null
          organization_id?: string
          outcome?: string | null
          phone_number?: string
          property_address?: string | null
          property_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          summary?: string | null
          tasks_created?: string[] | null
          transcript?: string | null
          transferred_at?: string | null
          transferred_to?: string | null
          updated_at?: string
          user_id?: string
          vapi_assistant_id?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_agent_calls_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_agent_calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_agent_calls_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_agent_config: {
        Row: {
          agent_name: string
          agent_prompt: string | null
          agent_voice: string
          created_at: string
          first_message: string | null
          followup_enabled: boolean
          followup_interval_hours: number
          followup_max_attempts: number
          hot_lead_transfer_enabled: boolean
          id: string
          inbound_enabled: boolean
          is_active: boolean
          organization_id: string
          speed_to_lead_delay_seconds: number
          speed_to_lead_enabled: boolean
          timezone: string | null
          transfer_phone_number: string | null
          transfer_threshold: string
          updated_at: string
          user_id: string
          vapi_assistant_id: string | null
          vapi_phone_number_id: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          agent_name?: string
          agent_prompt?: string | null
          agent_voice?: string
          created_at?: string
          first_message?: string | null
          followup_enabled?: boolean
          followup_interval_hours?: number
          followup_max_attempts?: number
          hot_lead_transfer_enabled?: boolean
          id?: string
          inbound_enabled?: boolean
          is_active?: boolean
          organization_id: string
          speed_to_lead_delay_seconds?: number
          speed_to_lead_enabled?: boolean
          timezone?: string | null
          transfer_phone_number?: string | null
          transfer_threshold?: string
          updated_at?: string
          user_id: string
          vapi_assistant_id?: string | null
          vapi_phone_number_id?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          agent_name?: string
          agent_prompt?: string | null
          agent_voice?: string
          created_at?: string
          first_message?: string | null
          followup_enabled?: boolean
          followup_interval_hours?: number
          followup_max_attempts?: number
          hot_lead_transfer_enabled?: boolean
          id?: string
          inbound_enabled?: boolean
          is_active?: boolean
          organization_id?: string
          speed_to_lead_delay_seconds?: number
          speed_to_lead_enabled?: boolean
          timezone?: string | null
          transfer_phone_number?: string | null
          transfer_threshold?: string
          updated_at?: string
          user_id?: string
          vapi_assistant_id?: string | null
          vapi_phone_number_id?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_agent_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      website_analytics: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          os: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
          website_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
          website_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_analytics_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "seller_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          nav_order: number | null
          organization_id: string | null
          show_form: boolean | null
          show_in_nav: boolean | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          website_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          nav_order?: number | null
          organization_id?: string | null
          show_form?: boolean | null
          show_in_nav?: boolean | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          website_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          nav_order?: number | null
          organization_id?: string | null
          show_form?: boolean | null
          show_in_nav?: boolean | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "seller_websites"
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
      bulk_sync_contacts: { Args: { p_user_id: string }; Returns: Json }
      calculate_distance_miles: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      calculate_lead_score: {
        Args: {
          p_condition: string
          p_has_mortgage: boolean
          p_is_listed: boolean
          p_reason: string
          p_timeline: string
        }
        Returns: number
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
      generate_deal_slug: {
        Args: { deal_address: string; deal_city: string; deal_user_id: string }
        Returns: string
      }
      get_expiring_pofs: {
        Args: { days_ahead?: number }
        Returns: {
          amount: number
          days_until_expiry: number
          expiration_date: string
          file_name: string
          id: string
          lender_name: string
          organization_id: string
          user_id: string
        }[]
      }
      get_next_queue_contact: {
        Args: { p_queue_id: string; p_user_id: string }
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
      update_queue_stats: { Args: { p_queue_id: string }; Returns: undefined }
      upsert_contact_from_source: {
        Args: {
          p_address?: string
          p_city?: string
          p_company?: string
          p_email?: string
          p_name: string
          p_notes?: string
          p_org_id: string
          p_phone?: string
          p_source_entity_id?: string
          p_source_origin?: string
          p_state?: string
          p_tags?: string[]
          p_type?: string
          p_user_id: string
          p_zip?: string
        }
        Returns: string
      }
      user_has_role: { Args: { required_role: string }; Returns: boolean }
    }
    Enums: {
      bug_severity: "low" | "medium" | "high"
      feedback_status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "planned"
        | "completed"
      feedback_type: "general" | "bug" | "feature"
      investment_strategy:
        | "brrrr"
        | "flip"
        | "buy_and_hold"
        | "wholesale"
        | "str"
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
      loi_type: "cash" | "creative" | "hybrid"
      message_direction: "inbound" | "outbound"
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
      bug_severity: ["low", "medium", "high"],
      feedback_status: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "planned",
        "completed",
      ],
      feedback_type: ["general", "bug", "feature"],
      investment_strategy: [
        "brrrr",
        "flip",
        "buy_and_hold",
        "wholesale",
        "str",
      ],
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
      loi_type: ["cash", "creative", "hybrid"],
      message_direction: ["inbound", "outbound"],
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
