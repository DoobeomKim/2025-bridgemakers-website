import Link from "next/link";
import LanguageSwitcher from "../language-switcher/LanguageSwitcher";
import { Locale } from "@/lib/i18n";
import AuthButtons from '@/components/auth/AuthButtons';
import { getHeaderMenus } from "@/lib/constants/menus";
import HeaderClient from "./HeaderClient";

interface HeaderProps {
  locale: Locale;
  translations: {
    login: string;
    register: string;
    dashboard: string;
    about: string;
    services: string;
    work: string;
    contact: string;
  };
}

export default async function Header({ locale, translations }: HeaderProps) {
  const headerMenus = await getHeaderMenus(locale);

  return <HeaderClient locale={locale} translations={translations} headerMenus={headerMenus} />;
} 