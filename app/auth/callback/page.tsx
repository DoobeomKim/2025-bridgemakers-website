'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 인증 후 홈페이지로 리다이렉트
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">인증 처리 중...</h2>
        <p>잠시만 기다려주세요. 곧 메인 페이지로 이동합니다.</p>
      </div>
    </div>
  );
} 