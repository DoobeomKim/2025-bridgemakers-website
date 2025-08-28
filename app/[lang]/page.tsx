// page.tsx - 서버 컴포넌트
import { validateLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import PublicLayout from "@/components/layouts/public-layout";
import HomeClient from "./HomeClient";
import { Metadata } from "next";
import { generateHreflangWithDefault } from "@/lib/utils/hreflang";

async function getDictionary(locale: string) {
  const dictionary = await import(`./messages/${locale}.ts`);
  return dictionary.default;
}

// 메타데이터 생성 함수
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } 
}): Promise<Metadata> {
  const locale = validateLocale(params.lang);
  const pathname = `/${locale}`;
  
  return {
    title: locale === 'ko' ? '브릿지메이커스 - 디지털 컨텐츠 제작 전문업체' : 'Bridgemakers - Digital Content Creation Specialist',
    description: locale === 'ko' 
      ? '영상 제작, 웹 디자인, 브로셔 디자인 및 온라인 마케팅 서비스를 제공하는 Bridgemakers 공식 웹사이트입니다.'
      : 'Official website of Bridgemakers, providing video production, web design, brochure design, and online marketing services.',
    alternates: {
      languages: {
        'ko-KR': `https://ibridgemakers.de/ko`,
        'en-US': `https://ibridgemakers.de/en`,
        'x-default': `https://ibridgemakers.de/en` // 기본 언어를 영어로 설정
      }
    },
    other: {
      // hreflang 태그들을 other 필드에 추가
      ...Object.fromEntries(
        generateHreflangWithDefault(pathname).map((meta, index) => [
          `hreflang-${index}`, 
          `${meta.hrefLang}:${meta.href}`
        ])
      )
    }
  };
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