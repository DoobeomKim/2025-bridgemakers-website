import { Locale } from '.';

export interface TranslationParams {
  [key: string]: string | number;
}

export interface Dictionary {
  [key: string]: string | Dictionary;
}

export interface TranslationContextType {
  locale: Locale;
  t: (key: string, params?: TranslationParams) => string;
  changeLocale: (locale: Locale) => void;
} 