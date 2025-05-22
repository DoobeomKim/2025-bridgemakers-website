"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function LanguageSwitcher({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const [isEnabled, setIsEnabled] = useState(true);
  
  useEffect(() => {
    // 언어 변경 컴포넌트 상태 로드
    const loadLanguageSwitcherState = async () => {
      try {
        const response = await fetch('/api/settings/language-switcher');
        const { enabled } = await response.json();
        setIsEnabled(enabled);
      } catch (error) {
        console.error('Error loading language switcher state:', error);
        setIsEnabled(true); // 에러 발생 시 기본값으로 활성화
      }
    };

    loadLanguageSwitcherState();
  }, []);

  // 컴포넌트가 비활성화된 경우 null 반환
  if (!isEnabled) {
    return null;
  }
  
  // 현재 URL에서 로케일 부분을 바꿔서 새 경로 생성
  function getPathWithLocale(locale: Locale) {
    const segments = pathname.split('/');
    segments[1] = locale; // URL의 첫 세그먼트(언어 코드) 변경
    return segments.join('/');
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {locales.map((l) => (
        <Link
          key={l}
          href={getPathWithLocale(l)}
          className={`px-2 py-1 text-[14px] rounded-[8px] ${
            l === locale
              ? "bg-[#cba967] text-black"
              : "bg-[#8E8E93] bg-opacity-20 text-white hover:bg-opacity-30"
          } transition-colors`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
} 