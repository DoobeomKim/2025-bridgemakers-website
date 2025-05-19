"use client";

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { UserLevel } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// 사용자 권한 확인 훅
export function useUserPermission() {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserPermission = async () => {
      try {
        setIsLoading(true);
        const result = await getCurrentUser();
        
        if (result.success && result.user) {
          setUserLevel(result.user.user_level as UserLevel);
        } else {
          setUserLevel(null);
        }
      } catch (err: any) {
        console.error('권한 확인 오류:', err);
        setError(err.message || '권한을 확인하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPermission();
  }, []);

  return { userLevel, isAdmin: userLevel === UserLevel.ADMIN, isLoading, error };
}

// 관리자 권한 확인 컴포넌트
export function AdminProtected({ children }: { children: React.ReactNode }) {
  const { userLevel, isLoading, error } = useUserPermission();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userLevel !== UserLevel.ADMIN) {
      router.push('/dashboard');
    }
  }, [isLoading, userLevel, router]);

  if (isLoading) {
    return <div className="p-8 text-center">권한을 확인하는 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (userLevel !== UserLevel.ADMIN) {
    return <div className="p-8 text-center">접근 권한이 없습니다.</div>;
  }

  return <>{children}</>;
} 