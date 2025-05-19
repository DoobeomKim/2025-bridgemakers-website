import { validateLocale, getTranslations } from "@/lib/i18n";
import { use } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // 서버에서 params 처리
  const resolvedParams = use(Promise.resolve(params));
  const langCode = resolvedParams.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");

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