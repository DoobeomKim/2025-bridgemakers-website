import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from '@/types/supabase';

// 같은 요청 내에서 중복 호출 방지를 위해 React 캐시 사용
export const createServerClient = cache(() => {
  try {
    // 런타임에서만 쿠키 사용
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // 빌드 타임에는 쿠키 없이 클라이언트 생성
      return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    const cookieStore = cookies();
    return createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });
  } catch (error) {
    console.error('❌ 서버 컴포넌트 Supabase 클라이언트 생성 오류:', error);
    // 쿠키 접근 오류 발생 시 기본 클라이언트 사용
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}); 