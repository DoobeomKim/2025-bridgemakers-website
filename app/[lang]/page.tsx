// page.tsx - 서버 컴포넌트
import { validateLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import PublicLayout from "@/components/layouts/public-layout";
import HomeClient from "./HomeClient";

async function getDictionary(locale: string) {
  const dictionary = await import(`./messages/${locale}.ts`);
  return dictionary.default;
}

export default async function Page({ params }: { params: { lang: string } }) {
  const locale = validateLocale(params.lang);
  const dictionary = await getDictionary(locale);

  // 프로젝트 데이터 가져오기
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('visibility', 'public')
    .order('date', { ascending: false })
    .limit(4);

  return (
    <PublicLayout locale={locale}>
      <HomeClient locale={locale} projects={projects || []} dictionary={dictionary} />
    </PublicLayout>
  );
} 