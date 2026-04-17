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
      cargas: {
        Row: {
          costo_gasolina: number
          created_at: string
          fecha_entrega: string | null
          fecha_recogida: string | null
          gastos_comida: number
          hora_entrega: string | null
          hora_recogida: string | null
          hospedaje: number
          id: string
          millas_cargadas: number
          millas_vacias: number
          notas: string | null
          otros_gastos: number
          pago_recibido: number
          ubicacion_entrega: string | null
          ubicacion_recogida: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          costo_gasolina?: number
          created_at?: string
          fecha_entrega?: string | null
          fecha_recogida?: string | null
          gastos_comida?: number
          hora_entrega?: string | null
          hora_recogida?: string | null
          hospedaje?: number
          id?: string
          millas_cargadas?: number
          millas_vacias?: number
          notas?: string | null
          otros_gastos?: number
          pago_recibido?: number
          ubicacion_entrega?: string | null
          ubicacion_recogida?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          costo_gasolina?: number
          created_at?: string
          fecha_entrega?: string | null
          fecha_recogida?: string | null
          gastos_comida?: number
          hora_entrega?: string | null
          hora_recogida?: string | null
          hospedaje?: number
          id?: string
          millas_cargadas?: number
          millas_vacias?: number
          notas?: string | null
          otros_gastos?: number
          pago_recibido?: number
          ubicacion_entrega?: string | null
          ubicacion_recogida?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gasolina: {
        Row: {
          carga_id: string | null
          created_at: string
          fecha: string | null
          galones: number
          gasolinera: string | null
          id: string
          metodo_pago: string | null
          notas: string | null
          precio_por_galon: number
          snack_comida: number
          ubicacion: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carga_id?: string | null
          created_at?: string
          fecha?: string | null
          galones?: number
          gasolinera?: string | null
          id?: string
          metodo_pago?: string | null
          notas?: string | null
          precio_por_galon?: number
          snack_comida?: number
          ubicacion?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carga_id?: string | null
          created_at?: string
          fecha?: string | null
          galones?: number
          gasolinera?: string | null
          id?: string
          metodo_pago?: string | null
          notas?: string | null
          precio_por_galon?: number
          snack_comida?: number
          ubicacion?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gasolina_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          created_at: string
          id: string
          mes: string
          meta_cargas: number
          meta_ganancia_neta: number
          meta_ingreso: number
          meta_millas: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mes: string
          meta_cargas?: number
          meta_ganancia_neta?: number
          meta_ingreso?: number
          meta_millas?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mes?: string
          meta_cargas?: number
          meta_ganancia_neta?: number
          meta_ingreso?: number
          meta_millas?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      peajes: {
        Row: {
          created_at: string
          fecha: string | null
          id: string
          metodo_pago: string | null
          monto: number
          notas: string | null
          ubicacion_carretera: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fecha?: string | null
          id?: string
          metodo_pago?: string | null
          monto?: number
          notas?: string | null
          ubicacion_carretera?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fecha?: string | null
          id?: string
          metodo_pago?: string | null
          monto?: number
          notas?: string | null
          ubicacion_carretera?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
