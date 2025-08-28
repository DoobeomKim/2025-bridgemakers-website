import { validateLocale } from "@/lib/i18n";
import { use } from "react";
import { Metadata } from "next";
import { generateHreflangWithDefault } from "@/lib/utils/hreflang";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  // React.use()로 params를 처리
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  validateLocale(lang);

  return <>{children}</>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } 
}): Promise<Metadata> {
  const locale = validateLocale(params.lang);
  const pathname = `/${locale}`;
  
  return {
    alternates: {
      languages: {
        'ko-KR': `https://ibridgemakers.de/ko`,
        'en-US': `https://ibridgemakers.de/en`,
        'x-default': `https://ibridgemakers.de/en` // 기본 언어를 영어로 설정
      }
    }
  };
} 