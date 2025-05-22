import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from '@/types/supabase';

// 같은 요청 내에서 중복 호출 방지를 위해 React 캐시 사용
export const createServerClient = cache(() => {
  try {
    const cookieStore = cookies();
    return createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });
  } catch (error) {
    console.error('❌ 서버 컴포넌트 Supabase 클라이언트 생성 오류:', error);
    // 쿠키 접근 오류 발생 시 빈 쿠키 컨테이너 사용
    return createServerComponentClient<Database>({ 
      cookies: () => new Map() as any 
    });
  }
}); 