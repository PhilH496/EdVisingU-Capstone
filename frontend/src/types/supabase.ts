export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      disability_info: {
        Row: {
          disability_info_id: number;
          disability_type: string;
          disability_verification_date: string | null;
          functional_limitations: string | null;
          needs_psycho_ed_assessment: boolean;
          student_id: number | null;
        };
        Insert: {
          disability_info_id?: number;
          disability_type: string;
          disability_verification_date?: string | null;
          functional_limitations?: string | null;
          needs_psycho_ed_assessment: boolean;
          student_id?: number | null;
        };
        Update: {
          disability_info_id?: number;
          disability_type?: string;
          disability_verification_date?: string | null;
          functional_limitations?: string | null;
          needs_psycho_ed_assessment?: boolean;
          student_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "disability_info_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["student_id"];
          }
        ];
      };
      document: {
        Row: {
          document_id: number;
          document_type: string;
          file_url: string | null;
          student_id: number | null;
          upload_date: string | null;
        };
        Insert: {
          document_id?: number;
          document_type: string;
          file_url?: string | null;
          student_id?: number | null;
          upload_date?: string | null;
        };
        Update: {
          document_id?: number;
          document_type?: string;
          file_url?: string | null;
          student_id?: number | null;
          upload_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["student_id"];
          }
        ];
      };
      email_queue: {
        Row: {
          body: string;
          created_at: string | null;
          email_type: string;
          error_message: string | null;
          id: string;
          max_retries: number | null;
          retry_count: number | null;
          sent_at: string | null;
          status: string | null;
          student_id: string | null;
          student_name: string | null;
          subject: string;
          to_email: string;
          updated_at: string | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          email_type: string;
          error_message?: string | null;
          id?: string;
          max_retries?: number | null;
          retry_count?: number | null;
          sent_at?: string | null;
          status?: string | null;
          student_id?: string | null;
          student_name?: string | null;
          subject: string;
          to_email: string;
          updated_at?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          email_type?: string;
          error_message?: string | null;
          id?: string;
          max_retries?: number | null;
          retry_count?: number | null;
          sent_at?: string | null;
          status?: string | null;
          student_id?: string | null;
          student_name?: string | null;
          subject?: string;
          to_email?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      osap_info: {
        Row: {
          application_type: string;
          federal_need: number;
          has_restrictions: boolean;
          osap_id: number;
          provincial_need: number;
          restriction_type: string | null;
          student_id: number | null;
        };
        Insert: {
          application_type: string;
          federal_need?: number;
          has_restrictions: boolean;
          osap_id?: number;
          provincial_need?: number;
          restriction_type?: string | null;
          student_id?: number | null;
        };
        Update: {
          application_type?: string;
          federal_need?: number;
          has_restrictions?: boolean;
          osap_id?: number;
          provincial_need?: number;
          restriction_type?: string | null;
          student_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "osap_info_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["student_id"];
          }
        ];
      };
      program_info: {
        Row: {
          code: number | null;
          institution_name: string;
          institution_type: string;
          previous_institution: string | null;
          program: string | null;
          program_info_id: number;
          student_id: number | null;
          study_end: string;
          study_start: string;
          study_type: string;
          submitted_disability_elsewhere: boolean;
        };
        Insert: {
          code?: string;
          institution_name: string;
          institution_type: string;
          previous_institution?: string | null;
          program?: string | null;
          program_info_id?: number;
          student_id?: number | null;
          study_end: string;
          study_start: string;
          study_type: string;
          submitted_disability_elsewhere: boolean;
        };
        Update: {
          code?: number | null;
          institution_name?: string;
          institution_type?: string;
          previous_institution?: string | null;
          program?: string | null;
          program_info_id?: number;
          student_id?: number | null;
          study_end?: string;
          study_start?: string;
          study_type?: string;
          submitted_disability_elsewhere?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "program_info_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["student_id"];
          }
        ];
      };
      requested_items: {
        Row: {
          category: string | null;
          cost: number | null;
          funding_source: string | null;
          item: string | null;
          request_id: number;
          student_id: number | null;
        };
        Insert: {
          category?: string | null;
          cost?: number | null;
          funding_source?: string | null;
          item?: string | null;
          request_id?: number;
          student_id?: number | null;
        };
        Update: {
          category?: string | null;
          cost?: number | null;
          funding_source?: string | null;
          item?: string | null;
          request_id?: number;
          student_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "requested_items_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student";
            referencedColumns: ["student_id"];
          }
        ];
      };
      student: {
        Row: {
          address: string;
          city: string;
          country: string;
          dob: string;
          email: string;
          first_name: string;
          has_osap_application: boolean;
          last_name: string;
          oen: number;
          phone: string | null;
          postal_code: string;
          province: string;
          sin: number;
          student_id: number;
        };
        Insert: {
          address: string;
          city: string;
          country: string;
          dob: string;
          email: string;
          first_name: string;
          has_osap_application: boolean;
          last_name: string;
          oen: number;
          phone?: string | null;
          postal_code: string;
          province: string;
          sin: number;
          student_id?: number;
        };
        Update: {
          address?: string;
          city?: string;
          country?: string;
          dob?: string;
          email?: string;
          first_name?: string;
          has_osap_application?: boolean;
          last_name?: string;
          oen?: number;
          phone?: string | null;
          postal_code?: string;
          province?: string;
          sin?: number;
          student_id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      email_stats: {
        Row: {
          count: number | null;
          email_type: string | null;
          first_email: string | null;
          last_email: string | null;
          status: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      cleanup_old_emails: { Args: { days_old?: number }; Returns: number };
      queue_psycho_ed_email: {
        Args: {
          p_student_id: string;
          p_student_name: string;
          p_to_email: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
