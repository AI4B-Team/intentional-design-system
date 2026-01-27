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
      bids: {
        Row: {
          bid_amount: number | null
          contractor_id: string
          created_at: string | null
          id: string
          notes: string | null
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
        Relationships: []
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
          preferred_role?: string | null
          profile_type?: string
          target_areas?: string[] | null
          target_deal_types?: string[] | null
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
          arv: number | null
          arv_confidence: string | null
          baths: number | null
          beds: number | null
          city: string | null
          county: string | null
          created_at: string | null
          distress_signals: Json | null
          equity_percent: number | null
          estimated_rent: number | null
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
          rent_confidence: string | null
          rent_data_source: string | null
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
          estimated_rent?: number | null
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
          rent_confidence?: string | null
          rent_data_source?: string | null
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
          estimated_rent?: number | null
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
          rent_confidence?: string | null
          rent_data_source?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    },
  },
} as const
