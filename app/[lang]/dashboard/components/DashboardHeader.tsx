"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { UserProfile } from "@/lib/supabase";
import LanguageSwitcher from "@/components/shared/language-switcher/LanguageSwitcher";
import { Locale } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
  translations: {
    dashboard: string;
    profile: string;
    settings: string;
    logout: string;
    [key: string]: string;
  };
}

export default function DashboardHeader({ locale, translations }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  // 프로필 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="bg-[#111827] shadow-md text-white border-b border-[#1f2937]">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* 페이지 제목 (좌측) */}
        <h1 className="text-xl font-semibold">{translations.dashboard || "대시보드"}</h1>

        {/* 우측 메뉴들 */}
        <div className="flex items-center space-x-4">
          {/* 언어 선택 */}
          <LanguageSwitcher locale={locale} />

          {/* 프로필 메뉴 */}
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
          ) : currentUser ? (
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {currentUser.profile_image_url ? (
                  <div className="relative">
                    <img 
                      src={currentUser.profile_image_url} 
                      alt={`${currentUser.first_name} ${currentUser.last_name}`} 
                      className="w-9 h-9 rounded-full object-cover border border-[#cba967] group-hover:border-white transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#111827] rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                      <ChevronDownIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-9 h-9 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium group-hover:bg-[#d4b67a] transition-colors">
                      {currentUser.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#111827] rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                      <ChevronDownIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* 프로필 드롭다운 메뉴 */}
              {isProfileMenuOpen && (
                <div 
                  ref={profileMenuRef}
                  className="absolute top-10 right-0 w-64 bg-[#0d1526] border border-[rgba(203,169,103,0.3)] shadow-lg rounded-lg overflow-hidden z-50 animate-fadeIn"
                  style={{ animationDuration: '0.2s' }}
                >
                  <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center space-x-3">
                      {currentUser.profile_image_url ? (
                        <img 
                          src={currentUser.profile_image_url} 
                          alt={`${currentUser.first_name} ${currentUser.last_name}`} 
                          className="w-10 h-10 rounded-full object-cover border border-[#cba967]"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium">
                          {currentUser.first_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{currentUser.first_name} {currentUser.last_name}</div>
                        <div className="text-[#C7C7CC] text-xs">{currentUser.email}</div>
                        {currentUser.company_name && (
                          <div className="text-[#cba967] text-xs mt-1">{currentUser.company_name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      href={`/${locale}/dashboard/profile`}
                      className="block px-4 py-2 text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {translations.profile || "프로필 설정"}
                    </Link>
                    <Link 
                      href={`/${locale}/dashboard/settings`}
                      className="block px-4 py-2 text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {translations.settings || "계정 관리"}
                    </Link>
                    <div className="my-1 border-t border-[rgba(255,255,255,0.1)]"></div>
                    <Link 
                      href={`/${locale}`}
                      className="block px-4 py-2 text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      홈으로 이동
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={`/${locale}/sign-in`}
              className="text-sm bg-[#cba967] text-black px-3 py-1.5 rounded-md hover:bg-[#d4b67a] transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 