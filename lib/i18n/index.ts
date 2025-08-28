import { notFound, redirect } from 'next/navigation';

export const defaultLocale = 'en'; // 한국어에서 영어로 변경
export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

export function getTranslations(locale: Locale, namespace: string) {
  try {
    return require(`../../messages/${locale}/${namespace}.json`);
  } catch (error) {
    console.error(`Failed to load translations for ${locale}/${namespace}`, error);
    return {};
  }
}

export function isValidLocale(locale?: string): locale is Locale {
  return !!locale && locales.includes(locale as Locale);
}

export function validateLocale(locale?: string): Locale {
  if (!isValidLocale(locale)) {
    // 지원하지 않는 언어는 기본 언어(영어)로 리디렉션
    redirect(`/${defaultLocale}`);
  }
  return locale as Locale;
} 