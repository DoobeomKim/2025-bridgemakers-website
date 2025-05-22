"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/types/supabase';
import { useRouter } from 'next/navigation';

// 사용자 권한 확인 훅
export function useUserPermission() {
  const { userProfile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(authLoading);
    if (!authLoading && !userProfile) {
      setError('사용자 정보를 찾을 수 없습니다.');
    }
  }, [authLoading, userProfile]);

  return { 
    userLevel: userProfile?.user_level || null, 
    isAdmin: userProfile?.user_level === UserRole.ADMIN, 
    isLoading, 
    error 
  };
}

// 관리자 권한 확인 컴포넌트
export function AdminProtected({ children }: { children: React.ReactNode }) {
  const { userLevel, isLoading, error } = useUserPermission();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userLevel !== UserRole.ADMIN) {
      router.push('/dashboard');
    }
  }, [isLoading, userLevel, router]);

  if (isLoading) {
    return <div className="p-8 text-center">권한을 확인하는 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (userLevel !== UserRole.ADMIN) {
    return <div className="p-8 text-center">접근 권한이 없습니다.</div>;
  }

  return <>{children}</>;
} 