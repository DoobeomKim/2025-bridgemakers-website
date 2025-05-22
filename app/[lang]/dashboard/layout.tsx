"use client";

import { validateLocale, getTranslations } from "@/lib/i18n";
import { useEffect } from "react";
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
  const { userProfile, isLoading } = useAuth();
  const langCode = params.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");

  // 인증되지 않은 사용자는 홈페이지로 리다이렉트
  useEffect(() => {
    const redirectUnauthorized = async () => {
      if (!isLoading && !userProfile) {
        router.push(`/${locale}`);
      }
    };

    redirectUnauthorized();
  }, [isLoading, userProfile, locale, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1526]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cba967]"></div>
      </div>
    );
  }

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
          {userProfile ? children : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">로그인이 필요합니다</h2>
                <p className="text-gray-400">대시보드를 이용하기 위해서는 로그인이 필요합니다.</p>
              </div>
            </div>
          )}
        </main>

        {/* 모바일 하단 메뉴 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 safe-bottom z-50 shadow-lg">
          <DashboardSidebar locale={locale} translations={translations} isMobile={true} />
        </div>
      </div>
    </div>
  );
} 