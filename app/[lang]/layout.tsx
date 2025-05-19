import { validateLocale } from "@/lib/i18n";
import { use } from "react";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // React.use()로 params를 처리
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  validateLocale(lang);

  return <>{children}</>;
} 