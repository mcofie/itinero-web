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
    PostgrestVersion: "13.0.5"
  }
  itinero: {
    Tables: {
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          name: string
          symbol: string | null
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          name: string
          symbol?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          name?: string
          symbol?: string | null
        }
        Relationships: []
      }
      destination_history: {
        Row: {
          backdrop_image_attribution: string | null
          backdrop_image_url: string | null
          content: string
          created_at: string | null
          destination_id: string | null
          id: string
          payload: Json | null
          section: string | null
          sources: string[] | null
        }
        Insert: {
          backdrop_image_attribution?: string | null
          backdrop_image_url?: string | null
          content: string
          created_at?: string | null
          destination_id?: string | null
          id?: string
          payload?: Json | null
          section?: string | null
          sources?: string[] | null
        }
        Update: {
          backdrop_image_attribution?: string | null
          backdrop_image_url?: string | null
          content?: string
          created_at?: string | null
          destination_id?: string | null
          id?: string
          payload?: Json | null
          section?: string | null
          sources?: string[] | null
        }
        Relationships: []
      }
      destinations: {
        Row: {
          category: string | null
          country_code: string | null
          cover_url: string | null
          created_at: string | null
          current_history_id: string | null
          id: string
          image_attribution: string | null
          lat: number | null
          lng: number | null
          name: string
          popularity: number | null
          timezone: string | null
        }
        Insert: {
          category?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_history_id?: string | null
          id?: string
          image_attribution?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          popularity?: number | null
          timezone?: string | null
        }
        Update: {
          category?: string | null
          country_code?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_history_id?: string | null
          id?: string
          image_attribution?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          popularity?: number | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_current_history_fk"
            columns: ["current_history_id"]
            isOneToOne: false
            referencedRelation: "destination_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_current_history_fk"
            columns: ["current_history_id"]
            isOneToOne: false
            referencedRelation: "destinations_v"
            referencedColumns: ["current_history_id"]
          },
        ]
      }
      entitlements: {
        Row: {
          metadata: Json | null
          plus: boolean
          refreshed_at: string
          user_id: string
        }
        Insert: {
          metadata?: Json | null
          plus?: boolean
          refreshed_at?: string
          user_id: string
        }
        Update: {
          metadata?: Json | null
          plus?: boolean
          refreshed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base: string
          quote: string
          rate: number
          rate_date: string
        }
        Insert: {
          base: string
          quote: string
          rate: number
          rate_date: string
        }
        Update: {
          base?: string
          quote?: string
          rate?: number
          rate_date?: string
        }
        Relationships: []
      }
      export_jobs: {
        Row: {
          created_at: string
          download_url: string | null
          id: string
          status: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          id?: string
          status: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          id?: string
          status?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_prices: {
        Row: {
          cost: number
          feature: string
          notes: string | null
        }
        Insert: {
          cost: number
          feature: string
          notes?: string | null
        }
        Update: {
          cost?: number
          feature?: string
          notes?: string | null
        }
        Relationships: []
      }
      fx_snapshots: {
        Row: {
          as_of: string
          base_currency: string
          created_at: string
          id: string
          provider: string
          rates: Json
          raw: Json
        }
        Insert: {
          as_of: string
          base_currency: string
          created_at?: string
          id?: string
          provider?: string
          rates: Json
          raw: Json
        }
        Update: {
          as_of?: string
          base_currency?: string
          created_at?: string
          id?: string
          provider?: string
          rates?: Json
          raw?: Json
        }
        Relationships: []
      }
      interests: {
        Row: {
          key: string
          label: string
        }
        Insert: {
          key: string
          label: string
        }
        Update: {
          key?: string
          label?: string
        }
        Relationships: []
      }
      itinerary_item_alternatives: {
        Row: {
          alt_place_id: string | null
          created_at: string
          est_cost: number | null
          hint: Json | null
          id: string
          item_id: string
          name: string
        }
        Insert: {
          alt_place_id?: string | null
          created_at?: string
          est_cost?: number | null
          hint?: Json | null
          id?: string
          item_id: string
          name: string
        }
        Update: {
          alt_place_id?: string | null
          created_at?: string
          est_cost?: number | null
          hint?: Json | null
          id?: string
          item_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_item_alternatives_alt_place_id_fkey"
            columns: ["alt_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_item_alternatives_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itinerary_items"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          cost_currency: string | null
          created_at: string
          date: string | null
          day_index: number
          duration_min: number | null
          est_cost: number | null
          id: string
          notes: string | null
          order_index: number
          place_id: string | null
          title: string
          travel_min_from_prev: number | null
          trip_id: string
          when: string
        }
        Insert: {
          cost_currency?: string | null
          created_at?: string
          date?: string | null
          day_index: number
          duration_min?: number | null
          est_cost?: number | null
          id?: string
          notes?: string | null
          order_index: number
          place_id?: string | null
          title: string
          travel_min_from_prev?: number | null
          trip_id: string
          when: string
        }
        Update: {
          cost_currency?: string | null
          created_at?: string
          date?: string | null
          day_index?: number
          duration_min?: number | null
          est_cost?: number | null
          id?: string
          notes?: string | null
          order_index?: number
          place_id?: string | null
          title?: string
          travel_min_from_prev?: number | null
          trip_id?: string
          when?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt: string | null
          bucket_id: string
          content_type: string | null
          created_at: string
          height: number | null
          id: string
          is_cover: boolean
          path: string
          place_id: string
          source_url: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          bucket_id?: string
          content_type?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          path: string
          place_id: string
          source_url?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          bucket_id?: string
          content_type?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_cover?: boolean
          path?: string
          place_id?: string
          source_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_tips: {
        Row: {
          content: string
          created_at: string | null
          destination_id: string | null
          id: string
          month: number | null
          traveler_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          destination_id?: string | null
          id?: string
          month?: number | null
          traveler_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          destination_id?: string | null
          id?: string
          month?: number | null
          traveler_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packing_tips_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_exports: {
        Row: {
          byte_size: number
          created_at: string
          id: string
          itinerary_id: string
          path: string
          version: number
        }
        Insert: {
          byte_size: number
          created_at?: string
          id?: string
          itinerary_id: string
          path: string
          version?: number
        }
        Update: {
          byte_size?: number
          created_at?: string
          id?: string
          itinerary_id?: string
          path?: string
          version?: number
        }
        Relationships: []
      }
      place_hours: {
        Row: {
          close_time: string
          day_of_week: number
          open_time: string
          place_id: string
        }
        Insert: {
          close_time: string
          day_of_week: number
          open_time: string
          place_id: string
        }
        Update: {
          close_time?: string
          day_of_week?: number
          open_time?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          booking_url: string | null
          category: string | null
          cost_currency: string | null
          cost_typical: number | null
          created_at: string | null
          description: string | null
          destination_id: string | null
          id: string
          is_partner: boolean | null
          kind: string
          lat: number | null
          lng: number | null
          name: string
          popularity: number | null
          tags: string[] | null
          url: string | null
        }
        Insert: {
          booking_url?: string | null
          category?: string | null
          cost_currency?: string | null
          cost_typical?: number | null
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_partner?: boolean | null
          kind?: string
          lat?: number | null
          lng?: number | null
          name: string
          popularity?: number | null
          tags?: string[] | null
          url?: string | null
        }
        Update: {
          booking_url?: string | null
          category?: string | null
          cost_currency?: string | null
          cost_typical?: number | null
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_partner?: boolean | null
          kind?: string
          lat?: number | null
          lng?: number | null
          name?: string
          popularity?: number | null
          tags?: string[] | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          delta: number
          expires_at: string | null
          id: string
          meta: Json | null
          reason: string
          ref_id: string | null
          ref_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          expires_at?: string | null
          id?: string
          meta?: Json | null
          reason: string
          ref_id?: string | null
          ref_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          expires_at?: string | null
          id?: string
          meta?: Json | null
          reason?: string
          ref_id?: string | null
          ref_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      points_packages: {
        Row: {
          code: string
          currency: string | null
          metadata: Json | null
          name: string
          points: number
          price: number | null
        }
        Insert: {
          code: string
          currency?: string | null
          metadata?: Json | null
          name: string
          points: number
          price?: number | null
        }
        Update: {
          code?: string
          currency?: string | null
          metadata?: Json | null
          name?: string
          points?: number
          price?: number | null
        }
        Relationships: []
      }
      points_payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          fee_minor: number | null
          id: string
          provider: string
          provider_ref: string
          raw: Json | null
          status: string
          user_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          fee_minor?: number | null
          id?: string
          provider: string
          provider_ref: string
          raw?: Json | null
          status: string
          user_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          fee_minor?: number | null
          id?: string
          provider?: string
          provider_ref?: string
          raw?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      points_quotes: {
        Row: {
          amount_ghs: number
          amount_minor: number
          created_at: string
          currency: string
          expires_at: string
          id: string
          points: number
          status: string
          unit_price_ghs: number
          unit_price_minor: number
          user_id: string
        }
        Insert: {
          amount_ghs: number
          amount_minor: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          points: number
          status?: string
          unit_price_ghs: number
          unit_price_minor: number
          user_id: string
        }
        Update: {
          amount_ghs?: number
          amount_minor?: number
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          points?: number
          status?: string
          unit_price_ghs?: number
          unit_price_minor?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      points_topups: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          meta: Json
          points_credited: number
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          meta?: Json
          points_credited?: number
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          meta?: Json
          points_credited?: number
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_cache: {
        Row: {
          currency_code: string | null
          id: string
          observed_at: string | null
          place_id: string | null
          price_high: number | null
          price_low: number | null
          source: string | null
          source_url: string | null
        }
        Insert: {
          currency_code?: string | null
          id?: string
          observed_at?: string | null
          place_id?: string | null
          price_high?: number | null
          price_low?: number | null
          source?: string | null
          source_url?: string | null
        }
        Update: {
          currency_code?: string | null
          id?: string
          observed_at?: string | null
          place_id?: string | null
          price_high?: number | null
          price_low?: number | null
          source?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_cache_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "price_cache_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          passport_country: string | null
          points_balance: number | null
          preferred_currency: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          passport_country?: string | null
          points_balance?: number | null
          preferred_currency?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          passport_country?: string | null
          points_balance?: number | null
          preferred_currency?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean
          slug: string
          trip_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean
          slug: string
          trip_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean
          slug?: string
          trip_id?: string
        }
        Relationships: []
      }
      tour_guide_requests: {
        Row: {
          available_times: string
          city: string
          country: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_times: string
          city: string
          country: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_times?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_guide_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transport_speeds: {
        Row: {
          km_per_hour: number
          mode: string
        }
        Insert: {
          km_per_hour: number
          mode: string
        }
        Update: {
          km_per_hour?: number
          mode?: string
        }
        Relationships: []
      }
      trip_collaborators: {
        Row: {
          added_at: string | null
          role: string
          trip_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          role: string
          trip_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          role?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_url: string | null
          created_at: string
          currency: string | null
          destination_id: string | null
          end_date: string | null
          est_total_cost: number | null
          id: string
          inputs: Json | null
          is_public: boolean | null
          pdf_version: number
          public_id: string | null
          start_date: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          destination_id?: string | null
          end_date?: string | null
          est_total_cost?: number | null
          id?: string
          inputs?: Json | null
          is_public?: boolean | null
          pdf_version?: number
          public_id?: string | null
          start_date?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          destination_id?: string | null
          end_date?: string | null
          est_total_cost?: number | null
          id?: string
          inputs?: Json | null
          is_public?: boolean | null
          pdf_version?: number
          public_id?: string | null
          start_date?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_destination_fk"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          app_id: string
          created_at: string
          currency_preference: string | null
          full_name: string | null
          home_country: string | null
          id: string
          locale: string | null
          timezone: string | null
        }
        Insert: {
          app_id?: string
          created_at?: string
          currency_preference?: string | null
          full_name?: string | null
          home_country?: string | null
          id: string
          locale?: string | null
          timezone?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          currency_preference?: string | null
          full_name?: string | null
          home_country?: string | null
          id?: string
          locale?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_currency_preference_fkey"
            columns: ["currency_preference"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_balances"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      destinations_v: {
        Row: {
          backdrop_image_attribution: string | null
          backdrop_image_url: string | null
          content: string | null
          created_at: string | null
          current_history_id: string | null
          id: string | null
          payload: Json | null
          sources: string[] | null
        }
        Relationships: []
      }
      place_gallery: {
        Row: {
          alt: string | null
          content_type: string | null
          created_at: string | null
          height: number | null
          is_cover: boolean | null
          media_id: string | null
          path: string | null
          place_id: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          content_type?: string | null
          created_at?: string | null
          height?: number | null
          is_cover?: boolean | null
          media_id?: string | null
          path?: string | null
          place_id?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          content_type?: string | null
          created_at?: string | null
          height?: number | null
          is_cover?: boolean | null
          media_id?: string | null
          path?: string | null
          place_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      v_balances: {
        Row: {
          balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      balance_for: { Args: { p_uid: string }; Returns: number }
      build_legs_for_day:
        | {
            Args: { p_date: string; p_trip_id: string }
            Returns: {
              lat: number
              lng: number
              point_id: string
              polyline: string
              seq: number
            }[]
          }
        | {
            Args: { p_date: string; p_mode?: string; p_trip_id: string }
            Returns: {
              lat: number
              lng: number
              point_id: string
              polyline: string
              seq: number
            }[]
          }
      can_access: { Args: { p_feature_key: string }; Returns: boolean }
      consume_points_and_save_trip: {
        Args: { p_cost?: number; p_preview: Json; p_user_id: string }
        Returns: string
      }
      distance_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      find_places_near: {
        Args: {
          lat: number
          limit_count?: number
          lng: number
          q?: string
          radius_km?: number
          tags?: string[]
        }
        Returns: {
          distance_km: number
          id: string
          lat: number
          lng: number
          name: string
          tags: string[]
        }[]
      }
      fx_convert:
        | {
            Args: {
              p_amount: number
              p_date: string
              p_from: string
              p_to: string
            }
            Returns: number
          }
        | {
            Args: {
              p_amount: number
              p_base?: string
              p_from: string
              p_to: string
            }
            Returns: number
          }
      fx_latest_snapshot: { Args: { p_base?: string }; Returns: Json }
      fx_rate_on: {
        Args: { p_base: string; p_date: string; p_quote: string }
        Returns: number
      }
      get_points_balance: { Args: never; Returns: number }
      get_points_balance_for: { Args: { uid: string }; Returns: number }
      grant_points: {
        Args: {
          p_amt: number
          p_expires?: unknown
          p_reason: string
          p_ref_id: string
          p_ref_type: string
          p_uid: string
        }
        Returns: string
      }
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      is_open_for_slot: {
        Args: { dow: number; end_t: string; p_id: string; start_t: string }
        Returns: boolean
      }
      local_dow: {
        Args: { p_date: string; p_trip_id: string }
        Returns: number
      }
      normalize_mode: { Args: { mode_in: string }; Returns: string }
      places_in_bbox: {
        Args: {
          east: number
          north: number
          p_destination_id: string
          south: number
          west: number
        }
        Returns: {
          id: string
          kind: string
          lat: number
          lng: number
          name: string
          tags: string[]
        }[]
      }
      redeem_feature: {
        Args: { p_feature_key: string; p_trip?: string }
        Returns: {
          new_balance: number
          ok: boolean
        }[]
      }
      render_dest_history_content: { Args: { p: Json }; Returns: string }
      settle_points_quote: {
        Args: { p_quote_id: string; p_reference: string }
        Returns: undefined
      }
      slot_schedule: {
        Args: never
        Returns: {
          end_time: string
          slot: string
          start_time: string
        }[]
      }
      spend_points:
        | { Args: { p_cost: number }; Returns: boolean }
        | {
            Args: { p_cost: number; p_meta?: Json; p_reason?: string }
            Returns: number
          }
      suggest_itinerary_budget: {
        Args: { p_daily_budget: number; p_trip_id: string; p_tz?: string }
        Returns: {
          currency_code: string
          day_date: string
          est_cost: number
          kind: string
          notes: string
          place_id: string
          place_name: string
          slot: string
        }[]
      }
      suggest_itinerary_meal_budget: {
        Args: {
          p_daily_budget: number
          p_meal_cap: number
          p_trip_id: string
          p_tz?: string
        }
        Returns: {
          currency_code: string
          day_date: string
          est_cost: number
          kind: string
          note: string
          place_id: string
          place_name: string
          slot: string
        }[]
      }
      suggest_lodging_for_trip: {
        Args: { p_trip_id: string }
        Returns: {
          currency_code: string
          dist_km: number
          name: string
          place_id: string
          price_high: number
          price_low: number
        }[]
      }
      suggest_lodging_for_trip_scored:
        | {
            Args: {
              p_daily_budget?: number
              p_max_results?: number
              p_trip_id: string
              p_weight_distance?: number
              p_weight_price?: number
            }
            Returns: {
              booking_url: string
              dist_km: number
              is_partner: boolean
              name: string
              place_id: string
              price_in_trip: number
              price_mid: number
              score: number
              trip_currency: string
            }[]
          }
        | {
            Args: {
              p_daily_budget?: number
              p_max_km?: number
              p_max_results?: number
              p_trip_id: string
              p_weight_distance?: number
              p_weight_price?: number
            }
            Returns: {
              booking_url: string
              dist_km: number
              is_partner: boolean
              name: string
              place_id: string
              price_in_trip: number
              price_mid: number
              score: number
              trip_currency: string
            }[]
          }
      sum_points_for_user: { Args: { uid: string }; Returns: number }
      trip_tz: { Args: { p_trip_id: string }; Returns: string }
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
  itinero: {
    Enums: {},
  },
} as const
