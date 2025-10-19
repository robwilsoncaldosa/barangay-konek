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
      mBarangay: {
        Row: {
          city: string
          created_at: string | null
          del_flag: number | null
          id: number
          name: string
          province: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          del_flag?: number | null
          id?: number
          name: string
          province: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          del_flag?: number | null
          id?: number
          name?: string
          province?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mCertificate: {
        Row: {
          created_at: string | null
          del_flag: number | null
          fee: number | null
          id: number
          name: string
          processing_time: string | null
          requirements: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          del_flag?: number | null
          fee?: number | null
          id?: number
          name: string
          processing_time?: string | null
          requirements?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          del_flag?: number | null
          fee?: number | null
          id?: number
          name?: string
          processing_time?: string | null
          requirements?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mRequest: {
        Row: {
          created_at: string | null
          del_flag: number | null
          document_type: string
          id: number
          mCertificateId: number | null
          payment_status: string | null
          priority: string | null
          purpose: string
          request_date: string
          resident_id: number
          status: string | null
          tx_hash: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          del_flag?: number | null
          document_type: string
          id?: number
          mCertificateId?: number | null
          payment_status?: string | null
          priority?: string | null
          purpose: string
          request_date?: string
          resident_id: number
          status?: string | null
          tx_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          del_flag?: number | null
          document_type?: string
          id?: number
          mCertificateId?: number | null
          payment_status?: string | null
          priority?: string | null
          purpose?: string
          request_date?: string
          resident_id?: number
          status?: string | null
          tx_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mRequest_mCertificateId_fkey"
            columns: ["mCertificateId"]
            isOneToOne: false
            referencedRelation: "mCertificate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mRequest_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "mUsers"
            referencedColumns: ["id"]
          },
        ]
      }
      mUsers: {
        Row: {
          birthdate: string
          contact_no: string
          created_at: string | null
          current_address: string
          current_barangay: string
          del_flag: number | null
          email: string
          first_name: string
          id: number
          last_name: string
          mbarangayid: number | null
          middle_name: string | null
          password: string
          permanent_address: string
          permanent_barangay: string
          request_status: string | null
          selfie_holding_id: string | null
          sign_up_status: string | null
          updated_at: string | null
          uploaded_id_image: string | null
          user_type: string
        }
        Insert: {
          birthdate: string
          contact_no: string
          created_at?: string | null
          current_address: string
          current_barangay: string
          del_flag?: number | null
          email: string
          first_name: string
          id?: number
          last_name: string
          mbarangayid?: number | null
          middle_name?: string | null
          password: string
          permanent_address: string
          permanent_barangay: string
          request_status?: string | null
          selfie_holding_id?: string | null
          sign_up_status?: string | null
          updated_at?: string | null
          uploaded_id_image?: string | null
          user_type: string
        }
        Update: {
          birthdate?: string
          contact_no?: string
          created_at?: string | null
          current_address?: string
          current_barangay?: string
          del_flag?: number | null
          email?: string
          first_name?: string
          id?: number
          last_name?: string
          mbarangayid?: number | null
          middle_name?: string | null
          password?: string
          permanent_address?: string
          permanent_barangay?: string
          request_status?: string | null
          selfie_holding_id?: string | null
          sign_up_status?: string | null
          updated_at?: string | null
          uploaded_id_image?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "musers_mbarangayid_fkey"
            columns: ["mbarangayid"]
            isOneToOne: false
            referencedRelation: "mBarangay"
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
