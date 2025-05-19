import { defaultLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default function RootPage() {
  // 기본 언어로 리디렉션
  redirect(`/${defaultLocale}`);
}
