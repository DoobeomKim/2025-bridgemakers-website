import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// 서버 사이드에서 Supabase 클라이언트 생성
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
} 