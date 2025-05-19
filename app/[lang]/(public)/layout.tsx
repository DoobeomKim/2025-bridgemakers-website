import PublicLayout from "@/components/layouts/public-layout";
import { validateLocale } from "@/lib/i18n";
import { use } from "react";

export default function PublicSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // params를 React.use()로 처리
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  const locale = validateLocale(lang);

  return <PublicLayout locale={locale}>{children}</PublicLayout>;
} 