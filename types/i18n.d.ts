import { Locale } from '../lib/i18n';

declare global {
  namespace I18n {
    interface Namespaces {
      common: typeof import('../messages/ko/common.json');
      auth: typeof import('../messages/ko/auth.json');
      dashboard: typeof import('../messages/ko/dashboard.json');
    }

    type Namespace = keyof Namespaces;
    type TranslationKey<T extends Namespace> = keyof Namespaces[T];
  }
} 