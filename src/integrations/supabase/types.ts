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
      chatbot_qa_pairs: {
        Row: {
          answer: string
          chatbot_id: string
          created_at: string
          id: string
          is_active: boolean
          match_type: string
          priority: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          chatbot_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          match_type?: string
          priority?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          chatbot_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          match_type?: string
          priority?: number
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_qa_pairs_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          position: string | null
          system_prompt: string
          theme: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          position?: string | null
          system_prompt?: string
          theme?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          position?: string | null
          system_prompt?: string
          theme?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          chatbot_id: string
          created_at: string
          id: string
          messages: Json
          session_id: string
          updated_at: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          id?: string
          messages?: Json
          session_id: string
          updated_at?: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          id?: string
          messages?: Json
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      organization_settings: {
        Row: {
          ai_provider: Database["public"]["Enums"]["ai_provider"]
          api_key_encrypted: string | null
          created_at: string
          id: string
          model_preference: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          ai_provider?: Database["public"]["Enums"]["ai_provider"]
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          model_preference?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          ai_provider?: Database["public"]["Enums"]["ai_provider"]
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          model_preference?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle_start: string | null
          created_at: string
          id: string
          messages_used: number
          monthly_message_limit: number
          name: string
          owner_id: string
          slug: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          billing_cycle_start?: string | null
          created_at?: string
          id?: string
          messages_used?: number
          monthly_message_limit?: number
          name: string
          owner_id: string
          slug: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          billing_cycle_start?: string | null
          created_at?: string
          id?: string
          messages_used?: number
          monthly_message_limit?: number
          name?: string
          owner_id?: string
          slug?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          chatbot_id: string
          created_at: string
          id: string
          message_count: number
          organization_id: string
          tokens_used: number | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          id?: string
          message_count?: number
          organization_id: string
          tokens_used?: number | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          id?: string
          message_count?: number
          organization_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ai_provider: "openai" | "anthropic" | "google" | "lovable"
      app_role: "admin" | "member"
      subscription_tier: "free" | "starter" | "pro" | "enterprise"
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
      ai_provider: ["openai", "anthropic", "google", "lovable"],
      app_role: ["admin", "member"],
      subscription_tier: ["free", "starter", "pro", "enterprise"],
    },
  },
} as const
