"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { signOut } from "@/lib/auth";
import { UserProfile } from "@/lib/supabase";
import LanguageSwitcher from "@/components/shared/language-switcher/LanguageSwitcher";
import { Locale } from "@/lib/i18n";
import ProfileDropdownMenu from "@/components/auth/ProfileDropdownMenu";
import ProfileModal from "@/components/auth/ProfileModal";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { session, userProfile, loading } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      // 로그아웃 후 메인 페이지로 이동
      window.location.href = `/${locale}`;
    }
  };

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
          {loading ? (
            <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
          ) : userProfile ? (
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {userProfile.profile_image_url ? (
                  <div className="relative">
                    <img 
                      src={userProfile.profile_image_url} 
                      alt={`${userProfile.first_name} ${userProfile.last_name}`} 
                      className="w-9 h-9 rounded-full object-cover border border-[#cba967] group-hover:border-white transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#111827] rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                      <ChevronDownIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-9 h-9 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium group-hover:bg-[#d4b67a] transition-colors">
                      {userProfile.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#111827] rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                      <ChevronDownIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* 프로필 드롭다운 메뉴 */}
              {isProfileMenuOpen && (
                <div ref={profileMenuRef} className="absolute top-12 right-0">
                  <ProfileDropdownMenu
                    user={userProfile}
                    locale={locale}
                    onClose={() => setIsProfileMenuOpen(false)}
                    onLogout={handleLogout}
                    onProfileClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    isDashboard={true}
                  />
                </div>
              )}

              {/* 프로필 설정 모달 */}
              <ProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={userProfile}
              />
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