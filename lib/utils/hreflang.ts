import { locales, Locale } from '@/lib/i18n';

// 언어별 URL 매핑 생성
export function generateHreflangUrls(
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://ibridgemakers.de'
): Array<{ lang: string; url: string }> {
  // 현재 경로에서 언어 코드 제거 (예: /en/about -> /about)
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '');
  
  return locales.map(locale => ({
    lang: locale === 'ko' ? 'ko-KR' : 'en-US',
    url: `${baseUrl}/${locale}${pathWithoutLang}`
  }));
}

// hreflang 메타데이터 생성
export function generateHreflangMetadata(
  pathname: string,
  baseUrl?: string
): Array<{ rel: string; href: string; hrefLang: string }> {
  const hreflangUrls = generateHreflangUrls(pathname, baseUrl);
  
  return hreflangUrls.map(({ lang, url }) => ({
    rel: 'alternate',
    href: url,
    hrefLang: lang
  }));
}

// x-default hreflang 추가 (기본 언어 지정)
export function generateHreflangWithDefault(
  pathname: string,
  baseUrl?: string,
  defaultLang: Locale = 'en' // 기본 언어를 영어로 설정
): Array<{ rel: string; href: string; hrefLang?: string }> {
  const hreflangUrls = generateHreflangUrls(pathname, baseUrl);
  const defaultUrl = hreflangUrls.find(url => url.lang === (defaultLang === 'ko' ? 'ko-KR' : 'en-US'));
  
  const hreflangMeta = hreflangUrls.map(({ lang, url }) => ({
    rel: 'alternate',
    href: url,
    hrefLang: lang
  }));
  
  // x-default 추가 (기본 언어 URL)
  if (defaultUrl) {
    hreflangMeta.push({
      rel: 'alternate',
      href: defaultUrl.url,
      hrefLang: 'x-default'
    });
  }
  
  return hreflangMeta;
}
