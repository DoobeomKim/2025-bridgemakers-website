import type { Metadata } from 'next';
import { validateLocale } from "@/lib/i18n";
import { generateHreflangWithDefault } from "@/lib/utils/hreflang";
import { Locale } from '@/lib/i18n';
import HeroIntroSection from './components/HeroIntroSection';
import AboutUsSection from './components/AboutUsSection';
import MissionValueSection from './components/MissionValueSection';
import TeamSection from './components/TeamSection';
import CtaSection from './components/CtaSection';
// import OurOfficesSection from './components/OurOfficesSection';

interface AboutPageProps {
  params: {
    lang: Locale;
  };
}

export async function generateMetadata({ params: { lang } }: AboutPageProps): Promise<Metadata> {
  const locale = validateLocale(lang);
  const pathname = `/${locale}/about`;
  
  // 언어별 메타데이터
  const metadata = {
    ko: {
      title: '회사 소개 | 브릿지메이커스 - 독일 박람회 영상제작 전문업체',
      description: '20년 이상의 경험을 가진 독일 박람회 영상제작 전문업체. 쾰른메쎄, 뒤셀도르프메쎄, 뮌헨메쎄, 프랑크푸르트메쎄 등 독일 주요 박람회에서 기업홍보영상, 전시회영상 제작. 글로벌 네트워크 기반 프로젝트 진행.',
      keywords: ['브릿지메이커스 회사소개', '독일 박람회 영상제작', '기업홍보영상', '전시회영상', '20년 경험', '글로벌 네트워크']
    },
    en: {
      title: 'About Us | Bridgemakers - German Trade Fair Video Production Specialist',
      description: 'Specialized in German trade fair video production with over 20 years of experience. Serving major German trade fairs including Messe Köln, Messe Düsseldorf, Messe München, and Messe Frankfurt. Corporate promotional videos and exhibition films with global network.',
      keywords: ['Bridgemakers about us', 'German trade fair video production', 'corporate promotional videos', 'exhibition films', '20+ years experience', 'global network']
    }
  };
  
  const currentMeta = metadata[locale as keyof typeof metadata] || metadata.en;
  
  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    alternates: {
      languages: {
        'ko-KR': `https://ibridgemakers.de/ko/about`,
        'en-US': `https://ibridgemakers.de/en/about`,
        'x-default': `https://ibridgemakers.de/en/about` // 기본 언어를 영어로 설정
      }
    },
    other: {
      ...Object.fromEntries(
        generateHreflangWithDefault(pathname).map((meta, index) => [
          `hreflang-${index}`, 
          `${meta.hrefLang}:${meta.href}`
        ])
      )
    }
  };
}

export default function AboutPage({ params: { lang } }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <HeroIntroSection />
      <AboutUsSection />
      <MissionValueSection />
      <TeamSection />
      <CtaSection />
      {/* <OurOfficesSection /> */}
    </div>
  );
} 