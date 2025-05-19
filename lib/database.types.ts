export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          updated_at?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          content: string
          category: string
          client: string
          date: string
          country: string
          industry: string
          image_url: string
          video_url?: string
          video_thumbnail_url?: string
          visibility: 'public' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          content: string
          category: string
          client: string
          date: string
          country: string
          industry: string
          image_url: string
          video_url?: string
          video_thumbnail_url?: string
          visibility?: 'public' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          content?: string
          category?: string
          client?: string
          date?: string
          country?: string
          industry?: string
          image_url?: string
          video_url?: string
          video_thumbnail_url?: string
          visibility?: 'public' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      project_tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      project_tag_relations: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_related_projects: {
        Args: {
          project_id: string;
          limit_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          slug: string;
          description: string;
          content: string;
          category: string;
          client: string;
          date: string;
          country: string;
          industry: string;
          image_url: string;
          visibility: 'public' | 'private'
          created_at: string;
          updated_at: string;
        }[];
      };
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectImage = Database['public']['Tables']['project_images']['Row'];
export type ProjectTag = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
};

export interface ProjectWithDetails extends Project {
  images?: ProjectImage[];
  tags?: ProjectTag[];
  related_projects?: Project[];
} 