import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from '@/types/supabase';

// 같은 요청 내에서 중복 호출 방지를 위해 React 캐시 사용
export const createServerClient = cache(() => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase 환경 변수가 누락되었습니다:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      });
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }

    // 쿠키 스토어 가져오기
    const cookieStore = cookies();
    
    return createSupabaseServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // 서버 컴포넌트에서는 쿠키 쓰기 불가 — 미들웨어가 처리
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // 서버 컴포넌트에서는 쿠키 삭제 불가 — 미들웨어가 처리
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('❌ 서버 컴포넌트 Supabase 클라이언트 생성 오류:', error);
    
    // 쿠키 접근 오류 발생 시 기본 클라이언트 사용 (익명 모드)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    console.log('🔄 기본 Supabase 클라이언트로 폴백');
    
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
});

// 관리자용 서비스 롤 클라이언트 (선택사항)
export const createAdminClient = cache(() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('관리자 클라이언트 환경 변수가 설정되지 않았습니다.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}); 