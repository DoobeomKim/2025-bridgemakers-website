"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateLocale } from "@/lib/i18n";

export default function ForgotPasswordPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const locale = validateLocale(lang);
  const router = useRouter();
  
  useEffect(() => {
    // 홈 페이지로 리다이렉트
    router.replace(`/${locale}`);
    
    // URL에 비밀번호 찾기 모드임을 알리는 쿼리 파라미터 추가
    // 이 쿼리 파라미터는 홈페이지에서 감지하여 비밀번호 찾기 모달을 열 수 있음
    // router.replace(`/${locale}?auth=forgot`);
  }, [locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070D1B]">
      <div className="text-white text-center">
        <p>잠시만 기다려주세요. 리다이렉트 중입니다...</p>
      </div>
    </div>
  );
} 