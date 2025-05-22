"use client";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'bridgemakers-auth',
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  return supabaseInstance;
};

// 싱글톤 인스턴스 export
export const supabase = createClient();

// 사용자 프로필 생성 또는 업데이트
export async function upsertProfile(
  id: string,
  email: string,
  username?: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id,
      email,
      username: username || email.split('@')[0],
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }

  return data;
}

// 사용자 프로필 조회
export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
} 