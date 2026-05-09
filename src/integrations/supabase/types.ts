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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      astrologers: {
        Row: {
          bio: string | null
          created_at: string | null
          experience_years: number
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          name: string
          price_per_minute: number
          rating: number | null
          specializations: Database["public"]["Enums"]["astrologer_specialization"][]
          total_consultations: number | null
          total_reviews: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          name: string
          price_per_minute: number
          rating?: number | null
          specializations?: Database["public"]["Enums"]["astrologer_specialization"][]
          total_consultations?: number | null
          total_reviews?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          name?: string
          price_per_minute?: number
          rating?: number | null
          specializations?: Database["public"]["Enums"]["astrologer_specialization"][]
          total_consultations?: number | null
          total_reviews?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount: number
          astrologer_id: string
          birth_date: string | null
          birth_place: string | null
          birth_time: string | null
          booking_date: string
          booking_id: string
          booking_time: string
          claimed_utr: string | null
          consultation_mode:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_proof_url: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          astrologer_id: string
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          booking_date: string
          booking_id: string
          booking_time: string
          claimed_utr?: string | null
          consultation_mode?:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          astrologer_id?: string
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          booking_date?: string
          booking_id?: string
          booking_time?: string
          claimed_utr?: string | null
          consultation_mode?:
            | Database["public"]["Enums"]["consultation_mode"]
            | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologers"
            referencedColumns: ["id"]
          },
        ]
      }
      horoscopes: {
        Row: {
          compatibility: string | null
          created_at: string | null
          date: string
          id: string
          lucky_color: string | null
          lucky_number: number | null
          mood: string | null
          prediction: string
          zodiac_sign: string
        }
        Insert: {
          compatibility?: string | null
          created_at?: string | null
          date?: string
          id?: string
          lucky_color?: string | null
          lucky_number?: number | null
          mood?: string | null
          prediction: string
          zodiac_sign: string
        }
        Update: {
          compatibility?: string | null
          created_at?: string | null
          date?: string
          id?: string
          lucky_color?: string | null
          lucky_number?: number | null
          mood?: string | null
          prediction?: string
          zodiac_sign?: string
        }
        Relationships: []
      }
      menu: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_signature: boolean
          name: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_signature?: boolean
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_signature?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          claimed_utr: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          grand_total: number
          id: string
          items: Json
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_proof_url: string | null
          payment_qr_data: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          sub_total: number
          table_number: number
          tax: number
          updated_at: string
          whatsapp_notified: boolean
        }
        Insert: {
          claimed_utr?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          grand_total: number
          id?: string
          items: Json
          order_id: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_proof_url?: string | null
          payment_qr_data?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sub_total: number
          table_number: number
          tax: number
          updated_at?: string
          whatsapp_notified?: boolean
        }
        Update: {
          claimed_utr?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          grand_total?: number
          id?: string
          items?: Json
          order_id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_proof_url?: string | null
          payment_qr_data?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sub_total?: number
          table_number?: number
          tax?: number
          updated_at?: string
          whatsapp_notified?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          astrologer_id: string | null
          comment: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          astrologer_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          astrologer_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          id: string
          message_type: Database["public"]["Enums"]["whatsapp_message_type"]
          order_id: string | null
          sent_at: string
          status: string | null
        }
        Insert: {
          id?: string
          message_type: Database["public"]["Enums"]["whatsapp_message_type"]
          order_id?: string | null
          sent_at?: string
          status?: string | null
        }
        Update: {
          id?: string
          message_type?: Database["public"]["Enums"]["whatsapp_message_type"]
          order_id?: string | null
          sent_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "owner" | "manager" | "staff"
      astrologer_specialization:
        | "vedic"
        | "numerology"
        | "tarot"
        | "palmistry"
        | "vastu"
        | "kundli"
        | "prashna"
        | "muhurta"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      consultation_mode: "chat" | "call" | "video"
      menu_category:
        | "signature_coffee"
        | "artisan_tea"
        | "pastries"
        | "brunch"
        | "desserts"
        | "beverages"
      order_status:
        | "pending"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "verified" | "rejected"
      whatsapp_message_type:
        | "order_confirmation"
        | "payment_received"
        | "order_ready"
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
      app_role: ["owner", "manager", "staff"],
      astrologer_specialization: [
        "vedic",
        "numerology",
        "tarot",
        "palmistry",
        "vastu",
        "kundli",
        "prashna",
        "muhurta",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      consultation_mode: ["chat", "call", "video"],
      menu_category: [
        "signature_coffee",
        "artisan_tea",
        "pastries",
        "brunch",
        "desserts",
        "beverages",
      ],
      order_status: ["pending", "preparing", "ready", "completed", "cancelled"],
      payment_status: ["pending", "verified", "rejected"],
      whatsapp_message_type: [
        "order_confirmation",
        "payment_received",
        "order_ready",
      ],
    },
  },
} as const
