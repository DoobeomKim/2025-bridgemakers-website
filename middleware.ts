import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 공개 경로 정의
const isPublicRoute = createRouteMatcher([
  "/", 
  "/api/webhooks(.*)", 
  "/about", 
  "/(.+)/work", 
  "/(.+)/work/project/(.*)",
  "/(.+)/about",
  "/(.+)/contact",
  "/(.+)/services(.*)"
]);

export default clerkMiddleware((auth, req) => {
  // 모든 대시보드 관련 경로는 보호됩니다
  if (req.url.includes("/dashboard")) {
    auth.protect();
  } else if (!isPublicRoute(req)) {
    // 공개 경로가 아닌 모든 경로도 보호
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.[\\w]+$|_next).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 