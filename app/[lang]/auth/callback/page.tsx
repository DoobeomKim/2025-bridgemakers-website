'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 동적 임포트로 변경
const AuthCallbackContent = dynamic(() => import('@/components/auth/AuthCallbackContent'), {
  loading: () => <LoadingSpinner />
});

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-lg font-medium text-gray-700">인증 처리 중...</div>
          <div className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 