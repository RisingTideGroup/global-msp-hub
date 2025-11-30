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
      ai_assistants: {
        Row: {
          assistant_type: string
          business_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          openai_assistant_id: string
          openai_thread_id: string
          updated_at: string
        }
        Insert: {
          assistant_type: string
          business_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          openai_assistant_id: string
          openai_thread_id: string
          updated_at?: string
        }
        Update: {
          assistant_type?: string
          business_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          openai_assistant_id?: string
          openai_thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistants_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_system_prompts: {
        Row: {
          created_at: string
          id: number
          prompts: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          prompts: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          prompts?: Json
          updated_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      business_classifications: {
        Row: {
          business_id: string
          classification_type: string
          classification_value: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          classification_type: string
          classification_value: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          classification_type?: string
          classification_value?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_classifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_visits: {
        Row: {
          business_id: string
          created_at: string
          id: string
          ip_address: string
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          ip_address: string
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          ip_address?: string
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_visits_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_wizard_progress: {
        Row: {
          business_id: string
          completed_steps: number[] | null
          created_at: string
          current_step: number | null
          id: string
          updated_at: string
          wizard_data: Json | null
        }
        Insert: {
          business_id: string
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          updated_at?: string
          wizard_data?: Json | null
        }
        Update: {
          business_id?: string
          completed_steps?: number[] | null
          created_at?: string
          current_step?: number | null
          id?: string
          updated_at?: string
          wizard_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "business_wizard_progress_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          benefits: string | null
          benefits_rich: string | null
          careers_page_url: string | null
          coaching_mode: boolean | null
          company_size: string | null
          created_at: string | null
          culture: string | null
          culture_rich: string | null
          description: string | null
          description_rich: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          mission: string | null
          mission_rich: string | null
          name: string
          owner_id: string
          status: Database["public"]["Enums"]["business_status"] | null
          updated_at: string | null
          values: string[] | null
          website: string | null
          wizard_completed: boolean | null
        }
        Insert: {
          benefits?: string | null
          benefits_rich?: string | null
          careers_page_url?: string | null
          coaching_mode?: boolean | null
          company_size?: string | null
          created_at?: string | null
          culture?: string | null
          culture_rich?: string | null
          description?: string | null
          description_rich?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          mission?: string | null
          mission_rich?: string | null
          name: string
          owner_id: string
          status?: Database["public"]["Enums"]["business_status"] | null
          updated_at?: string | null
          values?: string[] | null
          website?: string | null
          wizard_completed?: boolean | null
        }
        Update: {
          benefits?: string | null
          benefits_rich?: string | null
          careers_page_url?: string | null
          coaching_mode?: boolean | null
          company_size?: string | null
          created_at?: string | null
          culture?: string | null
          culture_rich?: string | null
          description?: string | null
          description_rich?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          mission?: string | null
          mission_rich?: string | null
          name?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["business_status"] | null
          updated_at?: string | null
          values?: string[] | null
          website?: string | null
          wizard_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_types: {
        Row: {
          allow_user_suggestions: boolean
          created_at: string
          created_by: string | null
          display_order: Json | null
          field_type: string
          id: string
          name: string
          status: string
          updated_at: string
          use_case: string[]
        }
        Insert: {
          allow_user_suggestions?: boolean
          created_at?: string
          created_by?: string | null
          display_order?: Json | null
          field_type?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          use_case?: string[]
        }
        Update: {
          allow_user_suggestions?: boolean
          created_at?: string
          created_by?: string | null
          display_order?: Json | null
          field_type?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          use_case?: string[]
        }
        Relationships: []
      }
      classifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          use_case: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: string
          type?: string
          updated_at?: string
          use_case?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
          use_case?: string[]
        }
        Relationships: []
      }
      gdpr_deletions: {
        Row: {
          anonymization_data: Json | null
          deletion_completed_at: string | null
          deletion_requested_at: string
          email: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          anonymization_data?: Json | null
          deletion_completed_at?: string | null
          deletion_requested_at?: string
          email?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          anonymization_data?: Json | null
          deletion_completed_at?: string | null
          deletion_requested_at?: string
          email?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          malware_detected: boolean | null
          phone: string | null
          resume_url: string | null
          scan_error_message: string | null
          scan_status: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          malware_detected?: boolean | null
          phone?: string | null
          resume_url?: string | null
          scan_error_message?: string | null
          scan_status?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          malware_detected?: boolean | null
          phone?: string | null
          resume_url?: string | null
          scan_error_message?: string | null
          scan_status?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_classifications: {
        Row: {
          classification_type: string
          classification_value: string
          created_at: string | null
          id: string
          job_id: string
          updated_at: string | null
        }
        Insert: {
          classification_type: string
          classification_value: string
          created_at?: string | null
          id?: string
          job_id: string
          updated_at?: string | null
        }
        Update: {
          classification_type?: string
          classification_value?: string
          created_at?: string | null
          id?: string
          job_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_classifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_visits: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          job_id: string
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          job_id: string
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          job_id?: string
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_visits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          benefits_rich: string | null
          business_id: string
          description: string
          description_rich: string | null
          id: string
          is_active: boolean | null
          job_type: string
          location: string
          posted_at: string | null
          requirements: string | null
          requirements_rich: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string | null
          work_arrangement: string
        }
        Insert: {
          benefits?: string | null
          benefits_rich?: string | null
          business_id: string
          description: string
          description_rich?: string | null
          id?: string
          is_active?: boolean | null
          job_type: string
          location: string
          posted_at?: string | null
          requirements?: string | null
          requirements_rich?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string | null
          work_arrangement: string
        }
        Update: {
          benefits?: string | null
          benefits_rich?: string | null
          business_id?: string
          description?: string
          description_rich?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          location?: string
          posted_at?: string | null
          requirements?: string | null
          requirements_rich?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string | null
          work_arrangement?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      msp_hub_categories: {
        Row: {
          created_at: string
          display_name: string
          display_order: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      msp_hub_links: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type_key: string
          recipient_email: string
          recipient_user_id: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type_key: string
          recipient_email: string
          recipient_user_id?: string | null
          status: string
          subject: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type_key?: string
          recipient_email?: string
          recipient_user_id?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          is_active: boolean | null
          notification_type_id: string | null
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_type_id?: string | null
          subject: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_type_id?: string | null
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          category: string
          created_at: string
          default_enabled: boolean | null
          description: string | null
          id: string
          is_system: boolean | null
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_enabled?: boolean | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_enabled?: boolean | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          custom_template_body: string | null
          custom_template_subject: string | null
          id: string
          is_enabled: boolean | null
          notification_type_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_template_body?: string | null
          custom_template_subject?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_template_body?: string | null
          custom_template_subject?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      virustotal_scan_stats: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          file_size: number
          id: string
          positives: number | null
          quota_exceeded: boolean | null
          response_code: number | null
          scan_result: string
          total_scans: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          file_size: number
          id?: string
          positives?: number | null
          quota_exceeded?: boolean | null
          response_code?: number | null
          scan_result: string
          total_scans?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_size?: number
          id?: string
          positives?: number | null
          quota_exceeded?: boolean | null
          response_code?: number | null
          scan_result?: string
          total_scans?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_business_visit_ips: {
        Args: { p_business_ids: string[] }
        Returns: undefined
      }
      hash_job_visit_ips: { Args: { p_job_ids: string[] }; Returns: undefined }
      hash_sensitive_data: { Args: { data: string }; Returns: string }
      update_business_with_classifications: {
        Args: {
          p_business_data: Json
          p_business_id: string
          p_classifications?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      business_status: "pending" | "approved" | "rejected" | "draft"
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
      app_role: ["admin", "moderator", "user"],
      business_status: ["pending", "approved", "rejected", "draft"],
    },
  },
} as const
