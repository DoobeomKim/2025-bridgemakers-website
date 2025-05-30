import { Locale } from '@/lib/i18n';
import WeAreSection from './components/WeAreSection';
import OurStorySection from './components/OurStorySection';
import OurOfficesSection from './components/OurOfficesSection';
import ContactBanner from './components/ContactBanner';

interface AboutPageProps {
  params: {
    lang: Locale;
  };
}

export default async function AboutPage({ params: { lang } }: AboutPageProps) {
  return (
    <main className="min-h-screen">
      {/* We Are Section */}
      <WeAreSection />
      
      {/* Our Story Section */}
      <OurStorySection />
      
      {/* Our Offices Section */}
      <OurOfficesSection />
      
      {/* Contact Banner */}
      <ContactBanner locale={lang} />
    </main>
  );
} 