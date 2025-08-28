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
  
  // 언어별 메타데이터
  const metadata = {
    ko: {
      title: '브릿지메이커스 - 독일 박람회 영상제작 전문업체 | 20년 경험',
      description: '20년 이상의 경험을 가진 독일 박람회 영상제작 전문업체. 쾰른메쎄(gamescom, Anuga), 뒤셀도르프메쎄(boot, drupa), 뮌헨메쎄(IAA, BAUMA), 프랑크푸르트메쎄(Ambiente, Automechanika) 등 독일 주요 박람회 영상제작. 기업홍보영상, 전시회영상, 메쎄홍보영상 제작.',
      keywords: ['bridgemakers', '독일 박람회 영상제작', '기업홍보영상', '전시회영상', '메쎄촬영', 'gamescom', 'Anuga', 'boot', 'drupa', 'IAA', 'BAUMA', 'Ambiente', 'Automechanika', 'Light + Building', 'Rehacare']
    },
    en: {
      title: 'Bridgemakers - German Trade Fair Video Production Specialist | 20+ Years Experience',
      description: 'Specialized in German trade fair video production with over 20 years of experience. Serving Messe Köln (gamescom, Anuga), Messe Düsseldorf (boot, drupa), Messe München (IAA, BAUMA), Messe Frankfurt (Ambiente, Automechanika). Corporate promotional videos, trade fair films, exhibition videos.',
      keywords: ['bridgemakers','German trade fair video production', 'corporate promotional videos', 'trade fair films', 'exhibition videos', 'gamescom', 'Anuga', 'boot', 'drupa', 'IAA', 'BAUMA', 'Ambiente', 'Automechanika', 'Light + Building', 'Rehacare']
    }
  };
  
  const currentMeta = metadata[locale as keyof typeof metadata] || metadata.en;
  
  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
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