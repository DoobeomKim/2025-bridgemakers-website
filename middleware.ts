import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 임시로 모든 요청을 허용하는 미들웨어
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.[\\w]+$|_next).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 