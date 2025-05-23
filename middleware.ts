import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// 인증 미들웨어 (쿠키 갱신 및 세션 관리)
export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    
    // 인증 관련 경로는 허용
    const isAuthRoute = req.nextUrl.pathname.startsWith('/auth/') || 
                       req.nextUrl.pathname.includes('/auth/confirm') ||
                       req.nextUrl.pathname.includes('/auth/callback') ||
                       req.nextUrl.pathname.includes('/ko/auth/callback');
                       
    if (isAuthRoute) {
      console.log('🔑 인증 경로 허용:', {
        pathname: req.nextUrl.pathname,
        search: req.nextUrl.search,
        hash: req.nextUrl.hash
      });
      return res;
    }
    
    // 미들웨어 클라이언트 생성
    const supabase = createMiddlewareClient<Database>({ req, res })
    
    // 세션 새로고침 (필요한 경우)
    await supabase.auth.getSession()
    
    return res
  } catch (error) {
    console.error('⚠️ 미들웨어 오류:', error)
    // 오류 발생 시 기본 응답 반환
    return NextResponse.next()
  }
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 