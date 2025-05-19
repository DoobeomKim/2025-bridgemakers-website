import Header from "@/components/shared/header/Header";
import Footer from "@/components/shared/footer/Footer";
import { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

export default function PublicLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const translations = getTranslations(locale, "common");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        locale={locale}
        translations={{
          login: translations.login,
          register: translations.register,
          dashboard: translations.dashboard,
          about: translations.about,
          services: translations.services,
          work: translations.work,
          contact: translations.contact,
        }}
      />
      <main className="flex-grow pt-16">{children}</main>
      <Footer locale={locale} />
    </div>
  );
} 