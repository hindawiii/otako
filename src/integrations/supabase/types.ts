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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          archived: boolean
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          conversation_id?: string
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
          last_message_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
        }
        Relationships: []
      }
      daily_gift_claims: {
        Row: {
          last_claim_at: string
          user_id: string
        }
        Insert: {
          last_claim_at?: string
          user_id: string
        }
        Update: {
          last_claim_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      gift_catalog: {
        Row: {
          arc: Database["public"]["Enums"]["gift_arc"]
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_free_daily: boolean
          name: string
          price_points: number
          rarity: Database["public"]["Enums"]["gift_rarity"]
          vfx_key: string | null
        }
        Insert: {
          arc: Database["public"]["Enums"]["gift_arc"]
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_free_daily?: boolean
          name: string
          price_points?: number
          rarity?: Database["public"]["Enums"]["gift_rarity"]
          vfx_key?: string | null
        }
        Update: {
          arc?: Database["public"]["Enums"]["gift_arc"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_free_daily?: boolean
          name?: string
          price_points?: number
          rarity?: Database["public"]["Enums"]["gift_rarity"]
          vfx_key?: string | null
        }
        Relationships: []
      }
      gift_transactions: {
        Row: {
          conversation_id: string
          created_at: string
          gift_id: string
          id: string
          message_id: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          gift_id: string
          id?: string
          message_id?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          gift_id?: string
          id?: string
          message_id?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_transactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_transactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          gift_id: string | null
          id: string
          is_read: boolean
          kind: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          gift_id?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          gift_id?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          sender_id?: string
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
            foreignKeyName: "messages_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          audio_url: string | null
          content: string | null
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content_text: string | null
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string | null
          updated_at: string
          visible_duration: Database["public"]["Enums"]["post_duration"]
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          updated_at?: string
          visible_duration?: Database["public"]["Enums"]["post_duration"]
        }
        Update: {
          content_text?: string | null
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          updated_at?: string
          visible_duration?: Database["public"]["Enums"]["post_duration"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          favorites: string[]
          id: string
          nickname: string | null
          points: number
          updated_at: string
          username: string | null
          watch_history: string[]
          watchlist: string[]
          years_watching: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          favorites?: string[]
          id: string
          nickname?: string | null
          points?: number
          updated_at?: string
          username?: string | null
          watch_history?: string[]
          watchlist?: string[]
          years_watching?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          favorites?: string[]
          id?: string
          nickname?: string | null
          points?: number
          updated_at?: string
          username?: string | null
          watch_history?: string[]
          watchlist?: string[]
          years_watching?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          difficulty: string
          id: string
          questions_json: Json
          reward_points: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          questions_json?: Json
          reward_points?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          questions_json?: Json
          reward_points?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description_ar: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reason_ar: string
          reported_profile_id: string | null
          reporter_id: string
          resource_id: string
          resource_type: Database["public"]["Enums"]["report_resource"]
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reason_ar: string
          reported_profile_id?: string | null
          reporter_id: string
          resource_id: string
          resource_type: Database["public"]["Enums"]["report_resource"]
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reason_ar?: string
          reported_profile_id?: string | null
          reporter_id?: string
          resource_id?: string
          resource_type?: Database["public"]["Enums"]["report_resource"]
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string
          id: string
          kept_in_profile: boolean
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at?: string
          id?: string
          kept_in_profile?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: string
          kept_in_profile?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gifts: {
        Row: {
          gift_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          gift_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          gift_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_points: { Args: { _amount: number }; Returns: number }
      claim_daily_gifts: {
        Args: never
        Returns: {
          gift_id: string
          quantity: number
        }[]
      }
      cleanup_expired_content: { Args: never; Returns: undefined }
      get_or_create_conversation: {
        Args: { _other_user: string }
        Returns: string
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_socially_connected: {
        Args: { _a: string; _b: string }
        Returns: boolean
      }
      purchase_gift: { Args: { _gift_id: string }; Returns: number }
      send_gift: {
        Args: { _conversation_id: string; _gift_id: string }
        Returns: string
      }
    }
    Enums: {
      gift_arc: "pirates" | "shinobi" | "dragons" | "luxury" | "attacks"
      gift_rarity: "common" | "rare" | "epic" | "legendary" | "mythic"
      media_type: "none" | "image" | "video" | "video_link"
      post_duration: "day" | "week" | "month" | "forever"
      report_reason: "abuse" | "inappropriate" | "spam" | "other"
      report_resource: "post" | "comment" | "voice_comment" | "audio_room"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
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
      gift_arc: ["pirates", "shinobi", "dragons", "luxury", "attacks"],
      gift_rarity: ["common", "rare", "epic", "legendary", "mythic"],
      media_type: ["none", "image", "video", "video_link"],
      post_duration: ["day", "week", "month", "forever"],
      report_reason: ["abuse", "inappropriate", "spam", "other"],
      report_resource: ["post", "comment", "voice_comment", "audio_room"],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
    },
  },
} as const
