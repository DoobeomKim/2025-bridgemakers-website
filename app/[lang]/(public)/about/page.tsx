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
  
  return {
    title: locale === 'ko' ? '회사 소개 | 브릿지메이커스' : 'About Us | Bridgemakers',
    description: locale === 'ko' 
      ? '브릿지메이커스는 창의적인 디지털 솔루션을 제공하는 전문 업체입니다.'
      : 'Bridgemakers is a professional company providing creative digital solutions.',
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