import { Locale, defaultLocale } from "@/lib/i18n";

// 현재 언어로 경로 생성 (예: /dashboard/profile => /ko/dashboard/profile)
export function getLocalizedPath(path: string, locale: Locale = defaultLocale) {
  // 이미 로케일이 포함된 경로인 경우 (예: /ko/dashboard)
  if (path.match(/^\/[a-z]{2}\//)) {
    const segments = path.split('/');
    segments[1] = locale; // 언어 코드 부분만 변경
    return segments.join('/');
  }
  
  // 로케일이 없는 경로인 경우 (예: /dashboard)
  return `/${locale}${path}`;
}

// 언어 코드가 없는 라우트 경로 추출 (예: /ko/dashboard => /dashboard)
export function getUnlocalizedPath(path: string) {
  // 로케일이 포함된 경로인 경우 (예: /ko/dashboard)
  if (path.match(/^\/[a-z]{2}\//)) {
    const segments = path.split('/');
    segments.splice(1, 1); // 언어 코드 부분 제거
    return segments.join('/');
  }
  
  // 이미 로케일이 없는 경로인 경우
  return path;
} 