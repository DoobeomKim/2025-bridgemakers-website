import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function DashboardRootRedirect() {
  // 기본 언어의 대시보드로 리디렉션
  redirect(`/${defaultLocale}/dashboard`);
} 