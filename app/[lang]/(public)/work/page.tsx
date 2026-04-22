import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { supabase } from "@/lib/supabaseClient";
import ClientPage from "./page.client";

// 5분마다 재검증
export const revalidate = 300;

export const metadata: Metadata = {
  title: "프로젝트 | Bridge Makers",
  description: "Bridge Makers의 다양한 웹사이트, 영상 제작 프로젝트를 소개합니다.",
};

export default async function WorkPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params.lang;

  // EN 컬럼 포함 쿼리 시도 (DB 마이그레이션 완료 후 동작)
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      title_en,
      slug,
      description,
      description_en,
      image_url,
      client,
      category,
      category_en,
      date,
      visibility,
      industry
    `)
    .eq('visibility', 'public')
    .order('date', { ascending: false });

  // EN 컬럼 미존재 시 기본 컬럼으로 fallback
  if (error) {
    const { data: fallback } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        slug,
        description,
        image_url,
        client,
        category,
        date,
        visibility,
        industry
      `)
      .eq('visibility', 'public')
      .order('date', { ascending: false });

    return <ClientPage projects={fallback || []} lang={lang} />;
  }

  return <ClientPage projects={data || []} lang={lang} />;
}
