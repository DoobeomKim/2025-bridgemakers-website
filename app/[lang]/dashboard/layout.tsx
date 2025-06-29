"use client";

import { validateLocale, getTranslations } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";
import { useAuth } from "@/components/auth/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, userProfile, isLoading } = useAuth();
  const [initialWaitComplete, setInitialWaitComplete] = useState(false);
  const langCode = params.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");

  // 초기 1초 대기 처리
  useEffect(() => {
    console.log('⏰ 대시보드 진입 - 1초 대기 시작...');
    const timer = setTimeout(() => {
      console.log('✅ 1초 대기 완료 - 인증 체크 시작');
      setInitialWaitComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 대시보드 접근 상태 디버깅
  useEffect(() => {
    if (initialWaitComplete) {
      const isAuthenticatedForDashboard = userProfile && user && (
        userProfile.id === user.id && 
        user.user_metadata?.email_verified
      );

      console.log('🏠 DashboardLayout: 인증 상태 확인', {
        initialWaitComplete,
        isLoading,
        hasUser: !!user,
        hasUserProfile: !!userProfile,
        isEmailVerified: user?.user_metadata?.email_verified,
        isAuthenticated: isAuthenticatedForDashboard
      });
    }
  }, [initialWaitComplete, isLoading, user, userProfile]);

  // 인증되지 않은 사용자는 홈페이지로 리다이렉트
  useEffect(() => {
    const redirectUnauthorized = async () => {
      // 초기 1초 대기가 완료되지 않았으면 대기
      if (!initialWaitComplete) {
        return;
      }

      // 로딩 중이면 대기
      if (isLoading) {
        console.log('⏳ 아직 로딩 중이므로 리다이렉트 대기...');
        return;
      }

      const isAuthenticatedForDashboard = userProfile && user && (
        userProfile.id === user.id && 
        user.user_metadata?.email_verified
      );
      
      if (!isAuthenticatedForDashboard) {
        console.log('🚫 인증 실패 또는 이메일 미인증 - 홈페이지로 리다이렉트');
        router.push(`/${locale}`);
        return;
      }
      
      console.log('✅ 인증된 사용자 - 대시보드 접근 허용');
    };

    redirectUnauthorized();
  }, [initialWaitComplete, isLoading, user, userProfile, locale, router]);

  // 초기 1초 대기 중일 때 로딩 화면 표시
  if (!initialWaitComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1526]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cba967] mb-4"></div>
          <p className="text-white text-sm">대시보드 준비 중...</p>
        </div>
      </div>
    );
  }

  // 프로필 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    console.log('⏳ 대시보드 로딩 중...');
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1526]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cba967] mb-4"></div>
          <p className="text-white text-sm">프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 상태일 때 (리다이렉트 전까지 잠시 표시)
  const isAuthenticatedForDashboard = userProfile && user && (
    userProfile.id === user.id && 
    user.user_metadata?.email_verified
  );

  if (!isAuthenticatedForDashboard) {
    console.log('🚫 인증 실패 상태 - 리다이렉트 대기 중...', {
      hasUser: !!user,
      hasUserProfile: !!userProfile,
      isEmailVerified: user?.user_metadata?.email_verified
    });
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1526]">
        <div className="flex flex-col items-center">
          <div className="animate-pulse rounded-full h-12 w-12 bg-[#cba967] mb-4"></div>
          <p className="text-white text-sm">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 대시보드 레이아웃 렌더링');

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0d1526]">
      {/* 데스크톱 좌측 사이드바 */}
      <div className="hidden md:block">
        <DashboardSidebar locale={locale} translations={translations} />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 상단 헤더 */}
        <DashboardHeader locale={locale} translations={translations} />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto p-5 pb-16 md:pb-5">
          {children}
        </main>

        {/* 모바일 하단 메뉴 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 safe-bottom z-50 shadow-lg">
          <DashboardSidebar locale={locale} translations={translations} isMobile={true} />
        </div>
      </div>
    </div>
  );
} 