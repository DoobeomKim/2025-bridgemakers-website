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
      contact_inquiries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          inquiry_type: 'quote' | 'general'
          client_type: 'individual' | 'company'
          name: string
          email: string
          phone: string
          company_name: string | null
          selected_fields: string[] | null
          budget: string | null
          project_date: string | null
          content: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes: string | null
          privacy_consent: boolean
          processed_at: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          inquiry_type: 'quote' | 'general'
          client_type: 'individual' | 'company'
          name: string
          email: string
          phone: string
          company_name?: string | null
          selected_fields?: string[] | null
          budget?: string | null
          project_date?: string | null
          content: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          privacy_consent?: boolean
          processed_at?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          inquiry_type?: 'quote' | 'general'
          client_type?: 'individual' | 'company'
          name?: string
          email?: string
          phone?: string
          company_name?: string | null
          selected_fields?: string[] | null
          budget?: string | null
          project_date?: string | null
          content?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          privacy_consent?: boolean
          processed_at?: string | null
          assigned_to?: string | null
        }
      }
      inquiry_files: {
        Row: {
          id: string
          inquiry_id: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_extension: string
          storage_path: string
          uploaded_by_ip: string | null
          is_processed: boolean
        }
        Insert: {
          id?: string
          inquiry_id: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_extension: string
          storage_path: string
          uploaded_by_ip?: string | null
          is_processed?: boolean
        }
        Update: {
          id?: string
          inquiry_id?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_extension?: string
          storage_path?: string
          uploaded_by_ip?: string | null
          is_processed?: boolean
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