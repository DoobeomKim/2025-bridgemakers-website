import type { Database } from '@/types/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'];

export type UserLevel = UserProfile['user_level']; 