import { notFound } from 'next/navigation';

export const defaultLocale = 'ko';
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
    notFound();
  }
  return locale as Locale;
} 