import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ClientPage from "./page.client";
import { use } from "react";

export const metadata: Metadata = {
  title: "프로젝트 | Bridge Makers",
  description: "Bridge Makers의 다양한 웹사이트, 영상 제작 프로젝트를 소개합니다.",
};

export default function WorkPage({
  params,
}: {
  params: { lang: Locale };
}) {
  // params를 React.use()로 처리
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  
  // supabase에서 프로젝트 데이터 가져오기
  const { data: projects } = use(
    supabase
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
        industry_name
      `)
      .eq('visibility', 'public')
      .order('date', { ascending: false })
  );
  
  return <ClientPage projects={projects || []} lang={lang} />;
} 