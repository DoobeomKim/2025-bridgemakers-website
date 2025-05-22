import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 임시로 모든 요청을 허용하는 미들웨어
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 세션 갱신 시도
  const { data: { session }, error } = await supabase.auth.getSession()

  // 보호된 경로 설정
  const protectedPaths = ['/dashboard/site-management']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // 보호된 경로에 대한 접근 제어
  if (isProtectedPath) {
    if (!session) {
      // 세션이 없으면 로그인 모달을 표시하도록 플래그 설정
      const url = new URL(request.url)
      url.searchParams.set('showLogin', 'true')
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 관리자 권한 확인 (users 테이블에서)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      // 권한이 없으면 대시보드로 리다이렉트
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 