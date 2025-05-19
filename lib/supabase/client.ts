import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성 - 클라이언트 사이드에서 사용
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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