import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 익명 키를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 인스턴스 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 관련 데이터 타입 정의
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  profile_image_url: string | null;
  user_level: UserLevel;
  created_at: string;
  updated_at: string;
}

// 사용자 등급 타입 정의
export enum UserLevel {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

// 데이터베이스 테이블 타입 정의
export type Tables = {
  users: UserProfile;
};

 