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
      admin_conversations: {
        Row: {
          assigned_admin_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_text: string | null
          status: string | null
          subject: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          status?: string | null
          subject?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          status?: string | null
          subject?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_template: boolean | null
          sender_type: string
          text: string
          user_id: string
        }
        Insert: {
          admin_id: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_template?: boolean | null
          sender_type: string
          text: string
          user_id: string
        }
        Update: {
          admin_id?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_template?: boolean | null
          sender_type?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          note: string | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          note?: string | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          note?: string | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      coin_packages: {
        Row: {
          coins_amount: number
          created_at: string | null
          etb_price: number
          id: string
          is_active: boolean | null
          sort_order: number | null
        }
        Insert: {
          coins_amount: number
          created_at?: string | null
          etb_price: number
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Update: {
          coins_amount?: number
          created_at?: string | null
          etb_price?: number
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_archived: boolean
          is_muted: boolean
          is_pinned: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_archived?: boolean
          is_muted?: boolean
          is_pinned?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_archived?: boolean
          is_muted?: boolean
          is_pinned?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          created_at: string | null
          gifts_earning_coins: number | null
          gifts_earning_etb: number | null
          id: string
          net_earning_etb: number | null
          period_end: string
          period_start: string
          platform_commission_etb: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          views_count: number | null
          views_earning_etb: number | null
        }
        Insert: {
          created_at?: string | null
          gifts_earning_coins?: number | null
          gifts_earning_etb?: number | null
          id?: string
          net_earning_etb?: number | null
          period_end: string
          period_start: string
          platform_commission_etb?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
          views_earning_etb?: number | null
        }
        Update: {
          created_at?: string | null
          gifts_earning_coins?: number | null
          gifts_earning_etb?: number | null
          id?: string
          net_earning_etb?: number | null
          period_end?: string
          period_start?: string
          platform_commission_etb?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
          views_earning_etb?: number | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          key: string
          label: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key: string
          label: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key?: string
          label?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      follow_requests: {
        Row: {
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          created_at: string | null
          details: string | null
          flag_type: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          flag_type: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          flag_type?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_cooldowns: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          gifts_in_window: number
          id: string
          is_blocked: boolean | null
          last_gift_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          gifts_in_window?: number
          id?: string
          is_blocked?: boolean | null
          last_gift_at?: string
          user_id: string
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          gifts_in_window?: number
          id?: string
          is_blocked?: boolean | null
          last_gift_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      gift_highlights: {
        Row: {
          badge_emoji: string | null
          created_at: string | null
          expires_at: string
          gift_amount: number
          glow_color: string
          id: string
          is_vip: boolean | null
          target_user_id: string
          tier_id: string | null
          user_id: string
          username_color: string
        }
        Insert: {
          badge_emoji?: string | null
          created_at?: string | null
          expires_at: string
          gift_amount?: number
          glow_color?: string
          id?: string
          is_vip?: boolean | null
          target_user_id: string
          tier_id?: string | null
          user_id: string
          username_color?: string
        }
        Update: {
          badge_emoji?: string | null
          created_at?: string | null
          expires_at?: string
          gift_amount?: number
          glow_color?: string
          id?: string
          is_vip?: boolean | null
          target_user_id?: string
          tier_id?: string | null
          user_id?: string
          username_color?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_highlights_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "gift_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_tiers: {
        Row: {
          badge_emoji: string | null
          badge_label: string | null
          created_at: string | null
          glow_color: string
          highlight_duration_minutes: number
          id: string
          is_vip: boolean | null
          max_coins: number
          min_coins: number
          name: string
          sort_order: number | null
          username_color: string
        }
        Insert: {
          badge_emoji?: string | null
          badge_label?: string | null
          created_at?: string | null
          glow_color?: string
          highlight_duration_minutes?: number
          id?: string
          is_vip?: boolean | null
          max_coins?: number
          min_coins?: number
          name: string
          sort_order?: number | null
          username_color?: string
        }
        Update: {
          badge_emoji?: string | null
          badge_label?: string | null
          created_at?: string | null
          glow_color?: string
          highlight_duration_minutes?: number
          id?: string
          is_vip?: boolean | null
          max_coins?: number
          min_coins?: number
          name?: string
          sort_order?: number | null
          username_color?: string
        }
        Relationships: []
      }
      gifter_leaderboard: {
        Row: {
          gift_count: number
          id: string
          last_gift_at: string | null
          target_user_id: string
          total_coins: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          gift_count?: number
          id?: string
          last_gift_at?: string | null
          target_user_id: string
          total_coins?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          gift_count?: number
          id?: string
          last_gift_at?: string | null
          target_user_id?: string
          total_coins?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chats: {
        Row: {
          created_at: string
          gift_amount: number | null
          gift_emoji: string | null
          gift_name: string | null
          id: string
          is_gift: boolean
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_amount?: number | null
          gift_emoji?: string | null
          gift_name?: string | null
          id?: string
          is_gift?: boolean
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          gift_amount?: number | null
          gift_emoji?: string | null
          gift_name?: string | null
          id?: string
          is_gift?: boolean
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_viewers: {
        Row: {
          id: string
          joined_at: string
          last_seen_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_seen_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_seen_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_viewers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          reply_to_id: string | null
          sender_id: string
          status: string
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          reply_to_id?: string | null
          sender_id: string
          status?: string
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          reply_to_id?: string | null
          sender_id?: string
          status?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      monetization_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string | null
          updated_by: string | null
          value: number
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          label?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: number
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      page_followers: {
        Row: {
          created_at: string
          id: string
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_followers_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          avatar_url: string | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          followers_count: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name: string
          owner_id: string
          posts_count: number | null
          updated_at: string
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name: string
          owner_id: string
          posts_count?: number | null
          updated_at?: string
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name?: string
          owner_id?: string
          posts_count?: number | null
          updated_at?: string
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          label: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          label: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      post_views: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          is_valid: boolean | null
          post_id: string
          user_id: string
          watch_duration_seconds: number | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          is_valid?: boolean | null
          post_id: string
          user_id: string
          watch_duration_seconds?: number | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          is_valid?: boolean | null
          post_id?: string
          user_id?: string
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          allow_duet: boolean
          audience: string
          caption: string | null
          category_id: string | null
          comments_count: number | null
          comments_disabled: boolean
          created_at: string | null
          duet_layout: string | null
          duet_of_post_id: string | null
          gift_count: number | null
          id: string
          is_draft: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          ppv_price: number | null
          saves_count: number | null
          scheduled_at: string | null
          shares_count: number | null
          thumbnail_url: string | null
          type: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          allow_duet?: boolean
          audience?: string
          caption?: string | null
          category_id?: string | null
          comments_count?: number | null
          comments_disabled?: boolean
          created_at?: string | null
          duet_layout?: string | null
          duet_of_post_id?: string | null
          gift_count?: number | null
          id?: string
          is_draft?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          ppv_price?: number | null
          saves_count?: number | null
          scheduled_at?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          allow_duet?: boolean
          audience?: string
          caption?: string | null
          category_id?: string | null
          comments_count?: number | null
          comments_disabled?: boolean
          created_at?: string | null
          duet_layout?: string | null
          duet_of_post_id?: string | null
          gift_count?: number | null
          id?: string
          is_draft?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          ppv_price?: number | null
          saves_count?: number | null
          scheduled_at?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_duet_of_post_id_fkey"
            columns: ["duet_of_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      ppv_unlocks: {
        Row: {
          amount_coins: number
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          amount_coins?: number
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          amount_coins?: number
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ppv_unlocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_links: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          action_buttons: Json | null
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string
          followers_count: number | null
          following_count: number | null
          gender: string | null
          id: string
          is_banned: boolean | null
          is_monetized: boolean | null
          is_professional: boolean | null
          is_restricted: boolean | null
          is_suspended: boolean | null
          is_wallet_frozen: boolean | null
          leads_enabled: boolean | null
          likes_count: number | null
          monetization_enabled_at: string | null
          online_at: string | null
          posts_count: number | null
          profession_category: string | null
          profession_title: string | null
          professional_approved: boolean | null
          suspended_until: string | null
          updated_at: string | null
          user_id: string
          user_type: string | null
          username: string
          verification_type: string | null
          views_count: number | null
          website: string | null
        }
        Insert: {
          action_buttons?: Json | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string
          followers_count?: number | null
          following_count?: number | null
          gender?: string | null
          id?: string
          is_banned?: boolean | null
          is_monetized?: boolean | null
          is_professional?: boolean | null
          is_restricted?: boolean | null
          is_suspended?: boolean | null
          is_wallet_frozen?: boolean | null
          leads_enabled?: boolean | null
          likes_count?: number | null
          monetization_enabled_at?: string | null
          online_at?: string | null
          posts_count?: number | null
          profession_category?: string | null
          profession_title?: string | null
          professional_approved?: boolean | null
          suspended_until?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
          username: string
          verification_type?: string | null
          views_count?: number | null
          website?: string | null
        }
        Update: {
          action_buttons?: Json | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string
          followers_count?: number | null
          following_count?: number | null
          gender?: string | null
          id?: string
          is_banned?: boolean | null
          is_monetized?: boolean | null
          is_professional?: boolean | null
          is_restricted?: boolean | null
          is_suspended?: boolean | null
          is_wallet_frozen?: boolean | null
          leads_enabled?: boolean | null
          likes_count?: number | null
          monetization_enabled_at?: string | null
          online_at?: string | null
          posts_count?: number | null
          profession_category?: string | null
          profession_title?: string | null
          professional_approved?: boolean | null
          suspended_until?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
          username?: string
          verification_type?: string | null
          views_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string | null
          created_at: string
          device_token: string | null
          endpoint: string | null
          id: string
          is_active: boolean
          p256dh: string | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key?: string | null
          created_at?: string
          device_token?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean
          p256dh?: string | null
          platform?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string | null
          created_at?: string
          device_token?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean
          p256dh?: string | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      share_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_codes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audience: string
          caption: string | null
          content: string | null
          created_at: string
          expires_at: string
          id: string
          is_archived: boolean
          media_url: string | null
          sticker_overlays: Json | null
          text_overlays: Json | null
          type: string
          user_id: string
          views_count: number
        }
        Insert: {
          audience?: string
          caption?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_archived?: boolean
          media_url?: string | null
          sticker_overlays?: Json | null
          text_overlays?: Json | null
          type?: string
          user_id: string
          views_count?: number
        }
        Update: {
          audience?: string
          caption?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_archived?: boolean
          media_url?: string | null
          sticker_overlays?: Json | null
          text_overlays?: Json | null
          type?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      story_highlight_items: {
        Row: {
          created_at: string
          highlight_id: string
          id: string
          sort_order: number | null
          story_id: string
        }
        Insert: {
          created_at?: string
          highlight_id: string
          id?: string
          sort_order?: number | null
          story_id: string
        }
        Update: {
          created_at?: string
          highlight_id?: string
          id?: string
          sort_order?: number | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_highlight_items_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "story_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_highlight_items_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_highlights: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          receipt_url: string | null
          related_user_id: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          receipt_url?: string | null
          related_user_id?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          receipt_url?: string | null
          related_user_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          allow_comments: boolean
          allow_downloads: boolean
          allow_duet: boolean
          allow_mentions: boolean
          allow_messages: boolean
          allow_tagging: boolean
          created_at: string
          default_audience: string
          hide_like_count: boolean
          id: string
          notif_comments: boolean
          notif_follows: boolean
          notif_gifts: boolean
          notif_likes: boolean
          notif_mentions: boolean
          notif_messages: boolean
          private_account: boolean
          show_activity_status: boolean
          show_followers: string
          show_following: string
          show_online_status: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_comments?: boolean
          allow_downloads?: boolean
          allow_duet?: boolean
          allow_mentions?: boolean
          allow_messages?: boolean
          allow_tagging?: boolean
          created_at?: string
          default_audience?: string
          hide_like_count?: boolean
          id?: string
          notif_comments?: boolean
          notif_follows?: boolean
          notif_gifts?: boolean
          notif_likes?: boolean
          notif_mentions?: boolean
          notif_messages?: boolean
          private_account?: boolean
          show_activity_status?: boolean
          show_followers?: string
          show_following?: string
          show_online_status?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_comments?: boolean
          allow_downloads?: boolean
          allow_duet?: boolean
          allow_mentions?: boolean
          allow_messages?: boolean
          allow_tagging?: boolean
          created_at?: string
          default_audience?: string
          hide_like_count?: boolean
          id?: string
          notif_comments?: boolean
          notif_follows?: boolean
          notif_gifts?: boolean
          notif_likes?: boolean
          notif_mentions?: boolean
          notif_messages?: boolean
          private_account?: boolean
          show_activity_status?: boolean
          show_followers?: string
          show_following?: string
          show_online_status?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          duration_hours: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          reason_category: string | null
          reason_note: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason_category?: string | null
          reason_note?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason_category?: string | null
          reason_note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string | null
          file_url: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name?: string | null
          file_url: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string | null
          file_url?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_note: string | null
          badge_type: string
          created_at: string
          fee_paid: number | null
          id: string
          is_priority: boolean | null
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          badge_type?: string
          created_at?: string
          fee_paid?: number | null
          id?: string
          is_priority?: boolean | null
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          badge_type?: string
          created_at?: string
          fee_paid?: number | null
          id?: string
          is_priority?: boolean | null
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          earnings: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          earnings?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          earnings?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_info: string | null
          admin_note: string | null
          amount_coins: number | null
          amount_etb: number
          created_at: string | null
          id: string
          method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_info?: string | null
          admin_note?: string | null
          amount_coins?: number | null
          amount_etb: number
          created_at?: string | null
          id?: string
          method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_info?: string | null
          admin_note?: string | null
          amount_coins?: number | null
          amount_etb?: number
          created_at?: string | null
          id?: string
          method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_dm_conversation: {
        Args: { _other_user_id: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_follow_visibility: {
        Args: { _target_user_id: string }
        Returns: Json
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: {
        Args: { _blocked_id: string; _blocker_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      send_gift: {
        Args: {
          _gift_amount: number
          _gift_emoji: string
          _gift_name: string
          _post_id: string
          _receiver_id: string
        }
        Returns: Json
      }
      user_allows_messages: {
        Args: { _target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "finance_admin"
        | "support_admin"
        | "verification_admin"
        | "analytics_admin"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "finance_admin",
        "support_admin",
        "verification_admin",
        "analytics_admin",
      ],
    },
  },
} as const
