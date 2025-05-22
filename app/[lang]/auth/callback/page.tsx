'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClientComponentClient<Database>();
      
      // URL에서 에러 파라미터 확인
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        // 에러가 있는 경우 에러 페이지로 리다이렉션
        const errorMessage = encodeURIComponent(errorDescription || 'Unknown error');
        router.push(`/auth/error?message=${errorMessage}`);
        return;
      }

      try {
        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // 세션이 있으면 홈페이지로 리다이렉션
          router.push('/');
        } else {
          // 세션이 없으면 로그인 페이지로 리다이렉션
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/error?message=Authentication failed');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="text-lg font-medium text-gray-700">인증 처리 중...</div>
        <div className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
} 