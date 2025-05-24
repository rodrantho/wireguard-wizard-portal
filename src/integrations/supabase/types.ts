export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_user_tags: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          priority: number | null
          tag_id: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          priority?: number | null
          tag_id: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          priority?: number | null
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_user_tags_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          id: string
          interfaz: string
          ip_cloud: string
          nombre: string
          public_key: string
          puerto: string
        }
        Insert: {
          created_at?: string
          id?: string
          interfaz: string
          ip_cloud: string
          nombre: string
          public_key: string
          puerto?: string
        }
        Update: {
          created_at?: string
          id?: string
          interfaz?: string
          ip_cloud?: string
          nombre?: string
          public_key?: string
          puerto?: string
        }
        Relationships: []
      }
      user_client_order: {
        Row: {
          cliente_id: string
          created_at: string
          custom_order: number | null
          id: string
          is_favorite: boolean | null
          last_accessed: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          custom_order?: number | null
          id?: string
          is_favorite?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          custom_order?: number | null
          id?: string
          is_favorite?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_client_order_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          default_sort_direction: string | null
          default_sort_field: string | null
          id: string
          items_per_page: number | null
          updated_at: string
          user_id: string
          view_mode: string | null
        }
        Insert: {
          created_at?: string
          default_sort_direction?: string | null
          default_sort_field?: string | null
          id?: string
          items_per_page?: number | null
          updated_at?: string
          user_id: string
          view_mode?: string | null
        }
        Update: {
          created_at?: string
          default_sort_direction?: string | null
          default_sort_field?: string | null
          id?: string
          items_per_page?: number | null
          updated_at?: string
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      vpn_peers: {
        Row: {
          cliente_id: string
          comando_mikrotik: string
          config_texto: string
          estado: string | null
          fecha_creacion: string
          id: string
          ip_asignada: string
          nombre_peer: string
          private_key: string | null
          public_key: string | null
          qr_img_url: string
        }
        Insert: {
          cliente_id: string
          comando_mikrotik: string
          config_texto: string
          estado?: string | null
          fecha_creacion?: string
          id?: string
          ip_asignada: string
          nombre_peer: string
          private_key?: string | null
          public_key?: string | null
          qr_img_url: string
        }
        Update: {
          cliente_id?: string
          comando_mikrotik?: string
          config_texto?: string
          estado?: string | null
          fecha_creacion?: string
          id?: string
          ip_asignada?: string
          nombre_peer?: string
          private_key?: string | null
          public_key?: string | null
          qr_img_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vpn_peers_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
