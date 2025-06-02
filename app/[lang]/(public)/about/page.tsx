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

export default function AboutPage({ params: { lang } }: AboutPageProps) {
  return (
    <main>
      <HeroIntroSection />
      <AboutUsSection />
      <MissionValueSection />
      <TeamSection />
      <CtaSection />
      {/* <OurOfficesSection /> */}
    </main>
  );
} 