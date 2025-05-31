// URL 유틸리티 함수들
export const getURL = () => {
  // 프로덕션 환경에서는 실제 도메인 강제 사용
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션 환경에서는 실제 도메인 사용
    const productionURL = process?.env?.NEXT_PUBLIC_SITE_URL || 'https://ibridgemakers.de';
    return productionURL.endsWith('/') ? productionURL : `${productionURL}/`;
  }
  
  let url = 
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 프로덕션 환경에서 설정
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel 자동 설정
    'http://localhost:3000/' // 로컬 개발환경

  // 프로토콜 처리 - 로컬호스트는 HTTP, 나머지는 HTTPS
  if (!url.startsWith('http')) {
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    url = isLocalhost ? `http://${url}` : `https://${url}`;
  }
  
  // 마지막 슬래시 보장
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

export const getAuthCallbackURL = (locale?: string) => {
  let baseURL: string;
  
  // 클라이언트 사이드에서는 현재 origin 사용
  if (typeof window !== 'undefined') {
    // 현재 도메인이 ibridgemakers.de인지 확인
    if (window.location.hostname === 'ibridgemakers.de') {
      baseURL = 'https://ibridgemakers.de/';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      baseURL = `${window.location.protocol}//${window.location.host}/`;
    } else {
      // 기타 도메인 (예: Vercel 미리보기)
      baseURL = `${window.location.protocol}//${window.location.host}/`;
    }
  } else {
    // 서버 사이드에서는 getURL() 사용
    baseURL = getURL();
  }
  
  const localePrefix = locale ? `${locale}/` : '';
  const callbackURL = `${baseURL}${localePrefix}auth/callback`;
  
  console.log('🔗 생성된 인증 콜백 URL:', {
    baseURL,
    locale,
    localePrefix,
    callbackURL,
    isClient: typeof window !== 'undefined',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
  
  return callbackURL;
}

export const getOAuthRedirectURL = () => {
  const baseURL = getURL()
  return `${baseURL}auth/callback`
}

// 환경 정보 확인
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development'
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

// 디버깅용 환경 정보 로그
export const logEnvironmentInfo = () => {
  if (typeof window !== 'undefined') {
    console.log('🌍 환경 정보:', {
      NODE_ENV: process.env.NODE_ENV,
      SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      current_origin: window.location.origin,
      generated_url: getURL(),
      oauth_redirect: getOAuthRedirectURL()
    })
  }
} 