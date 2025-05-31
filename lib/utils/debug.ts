// 배포 환경 디버깅 유틸리티
import { getURL, getAuthCallbackURL } from './url';

export const debugEnvironment = () => {
  if (typeof window !== 'undefined') {
    console.group('🔍 브릿지메이커스 환경 정보 디버깅');
    
    console.log('📍 현재 위치:', {
      hostname: window.location.hostname,
      origin: window.location.origin,
      href: window.location.href,
      protocol: window.location.protocol
    });
    
    console.log('🌍 환경변수:', {
      NODE_ENV: process.env.NODE_ENV,
      SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'
    });
    
    console.log('🔗 생성된 URL들:', {
      baseURL: getURL(),
      authCallbackKO: getAuthCallbackURL('ko'),
      authCallbackEN: getAuthCallbackURL('en'),
      authCallbackDE: getAuthCallbackURL('de')
    });
    
    console.log('✅ 도메인 체크:', {
      isProduction: process.env.NODE_ENV === 'production',
      isIbridgemakers: window.location.hostname === 'ibridgemakers.de',
      isVercel: window.location.hostname.includes('vercel.app'),
      isLocalhost: window.location.hostname === 'localhost'
    });
    
    // 이메일 인증 링크 미리보기
    const callbackURL = getAuthCallbackURL('ko');
    console.log('📧 회원가입 이메일 링크 미리보기:', {
      callbackURL,
      isCorrectDomain: callbackURL.includes('ibridgemakers.de'),
      warning: !callbackURL.includes('ibridgemakers.de') ? '⚠️ 잘못된 도메인이 사용되고 있습니다!' : '✅ 올바른 도메인'
    });
    
    console.groupEnd();
  }
};

export const validateEmailAuthFlow = () => {
  if (typeof window === 'undefined') return;
  
  const currentHostname = window.location.hostname;
  const expectedDomain = 'ibridgemakers.de';
  const callbackURL = getAuthCallbackURL('ko');
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // 도메인 체크
  if (process.env.NODE_ENV === 'production' && currentHostname !== expectedDomain) {
    issues.push(`현재 도메인 (${currentHostname})이 예상 도메인 (${expectedDomain})과 다릅니다.`);
    recommendations.push('Vercel에서 커스텀 도메인 설정을 확인하세요.');
  }
  
  // 환경변수 체크
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    issues.push('NEXT_PUBLIC_SITE_URL 환경변수가 설정되지 않았습니다.');
    recommendations.push('Vercel 환경변수에 NEXT_PUBLIC_SITE_URL=https://ibridgemakers.de를 추가하세요.');
  } else if (!process.env.NEXT_PUBLIC_SITE_URL.includes(expectedDomain)) {
    issues.push(`SITE_URL (${process.env.NEXT_PUBLIC_SITE_URL})이 올바른 도메인을 가리키지 않습니다.`);
    recommendations.push(`NEXT_PUBLIC_SITE_URL을 https://${expectedDomain}로 수정하세요.`);
  }
  
  // 콜백 URL 체크
  if (!callbackURL.includes(expectedDomain) && process.env.NODE_ENV === 'production') {
    issues.push(`생성된 인증 콜백 URL (${callbackURL})이 올바른 도메인을 사용하지 않습니다.`);
    recommendations.push('환경변수 설정을 확인하고 재배포하세요.');
  }
  
  // 결과 출력
  if (issues.length > 0) {
    console.group('⚠️ 이메일 인증 설정 문제 발견');
    console.error('발견된 문제들:', issues);
    console.warn('권장사항:', recommendations);
    console.groupEnd();
    return false;
  } else {
    console.log('✅ 이메일 인증 설정이 올바르게 구성되었습니다.');
    return true;
  }
};

// 개발용: 환경변수 강제 설정 (테스트용)
export const setTestEnvironment = (domain: string = 'https://ibridgemakers.de') => {
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore - 테스트용으로만 사용
    process.env.NEXT_PUBLIC_SITE_URL = domain;
    console.log(`🧪 테스트용 SITE_URL 설정: ${domain}`);
    debugEnvironment();
  } else {
    console.warn('⚠️ setTestEnvironment는 개발환경에서만 사용할 수 있습니다.');
  }
}; 