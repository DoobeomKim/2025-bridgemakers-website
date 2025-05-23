// URL 유틸리티 함수들
export const getURL = () => {
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
  const baseURL = getURL()
  const localePrefix = locale ? `/${locale}` : ''
  return `${baseURL}${localePrefix}/auth/callback`
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