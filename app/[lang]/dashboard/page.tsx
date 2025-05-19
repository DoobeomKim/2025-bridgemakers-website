// 서버 컴포넌트 (기본 페이지 컴포넌트)
import { use } from "react";
import { validateLocale, getTranslations } from "@/lib/i18n";
import DashboardClient from "./DashboardClient";

export default function DashboardPage({
  params,
}: {
  params: { lang: string };
}) {
  // 서버에서 params 처리
  const resolvedParams = use(Promise.resolve(params));
  const langCode = resolvedParams.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");

  // 처리된 값을 클라이언트 컴포넌트로 전달
  return <DashboardClient locale={locale} translations={translations} />;
} 