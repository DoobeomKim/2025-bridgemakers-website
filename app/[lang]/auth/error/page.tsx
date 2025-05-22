'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || '인증 처리 중 오류가 발생했습니다.';
  
  // 에러 메시지를 사용자 친화적으로 변환
  const getUserFriendlyMessage = (message: string) => {
    if (message.includes('Email link is invalid or has expired')) {
      return '이메일 인증 링크가 만료되었거나 유효하지 않습니다.';
    }
    if (message.includes('access_denied')) {
      return '인증이 거부되었습니다.';
    }
    return message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            인증 오류
          </h2>
          <p className="text-gray-600 mb-8">
            {getUserFriendlyMessage(decodeURIComponent(errorMessage))}
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full py-2 px-4 bg-[#cba967] text-white rounded-lg hover:bg-[#b99a58] transition-colors text-center"
            >
              로그인 페이지로 이동
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-[#cba967] text-[#cba967] rounded-lg hover:bg-[rgba(203,169,103,0.1)] transition-colors text-center"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 