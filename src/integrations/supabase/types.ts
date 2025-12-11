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
  public: {
    Tables: {
      evaluations: {
        Row: {
          amazon_rating: string | null
          created_at: string
          critical_improvements: string[] | null
          i_vs_we_analysis: Json | null
          id: string
          interview_tip: string | null
          lp_labels: Json | null
          metrics_quality: Json | null
          must_have_checklist: Json | null
          red_flags: string[] | null
          rewrite_suggestions: Json | null
          scope_assessment: Json | null
          score_breakdown: Json | null
          senior_signals: Json | null
          star_scores: Json | null
          story_id: string
          summary: string | null
          target_level: string
          top_strengths: string[] | null
          total_score: number | null
          updated_at: string
        }
        Insert: {
          amazon_rating?: string | null
          created_at?: string
          critical_improvements?: string[] | null
          i_vs_we_analysis?: Json | null
          id?: string
          interview_tip?: string | null
          lp_labels?: Json | null
          metrics_quality?: Json | null
          must_have_checklist?: Json | null
          red_flags?: string[] | null
          rewrite_suggestions?: Json | null
          scope_assessment?: Json | null
          score_breakdown?: Json | null
          senior_signals?: Json | null
          star_scores?: Json | null
          story_id: string
          summary?: string | null
          target_level?: string
          top_strengths?: string[] | null
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          amazon_rating?: string | null
          created_at?: string
          critical_improvements?: string[] | null
          i_vs_we_analysis?: Json | null
          id?: string
          interview_tip?: string | null
          lp_labels?: Json | null
          metrics_quality?: Json | null
          must_have_checklist?: Json | null
          red_flags?: string[] | null
          rewrite_suggestions?: Json | null
          scope_assessment?: Json | null
          score_breakdown?: Json | null
          senior_signals?: Json | null
          star_scores?: Json | null
          story_id?: string
          summary?: string | null
          target_level?: string
          top_strengths?: string[] | null
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          action: string
          company: string | null
          created_at: string
          id: string
          metrics: string[] | null
          primary_lps: string[] | null
          questions_matched: string[] | null
          result: string
          role: string | null
          secondary_lps: string[] | null
          situation: string
          strength: number | null
          task: string
          title: string
          updated_at: string
        }
        Insert: {
          action: string
          company?: string | null
          created_at?: string
          id?: string
          metrics?: string[] | null
          primary_lps?: string[] | null
          questions_matched?: string[] | null
          result: string
          role?: string | null
          secondary_lps?: string[] | null
          situation: string
          strength?: number | null
          task: string
          title: string
          updated_at?: string
        }
        Update: {
          action?: string
          company?: string | null
          created_at?: string
          id?: string
          metrics?: string[] | null
          primary_lps?: string[] | null
          questions_matched?: string[] | null
          result?: string
          role?: string | null
          secondary_lps?: string[] | null
          situation?: string
          strength?: number | null
          task?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
