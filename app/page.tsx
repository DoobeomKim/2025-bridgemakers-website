import { defaultLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default function RootPage() {
  // 기본 언어로 리디렉션
  redirect(`/${defaultLocale}`);
}

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-6">Bridge Makers</h1>
          <p className="text-xl mb-8">
            웹사이트에 오신 것을 환영합니다!
          </p>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              회원가입
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              대시보드
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
