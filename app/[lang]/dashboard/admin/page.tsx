import { use } from "react";
import { validateLocale, getTranslations } from "@/lib/i18n";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboardPage({ params }: { params: { lang: string } }) {
  // 서버에서 params 처리 - use()를 사용하여 Promise 처리
  const resolvedParams = use(Promise.resolve(params));
  const langCode = resolvedParams.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");

  // 인증은 미들웨어에서 처리됨. 권한 체크는 클라이언트에서!
  return <AdminDashboardClient locale={locale} translations={translations} />;
} 