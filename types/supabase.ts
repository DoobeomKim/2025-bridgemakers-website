export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export enum UserRole {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          user_level: UserRole
          created_at: string
          updated_at: string | null
          company_name: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          user_level?: UserRole
          created_at?: string
          updated_at?: string | null
          company_name?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          user_level?: UserRole
          created_at?: string
          updated_at?: string | null
          company_name?: string | null
        }
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
  }
} 