"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/shared/language-switcher/LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import NewAuthButtons from "@/components/auth/NewAuthButtons";

interface HeaderClientProps {
  locale: Locale;
  translations: {
    login: string;
    register: string;
    dashboard: string;
    about: string;
    services: string;
    work: string;
    contact: string;
  };
  headerMenus: Array<{ label: string; href: string }>;
}

export default function HeaderClient({ locale, translations, headerMenus }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { userProfile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // 스크롤 감지하여 헤더 배경 조정
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setIsAuthenticating(true);
      await signOut();
      router.refresh();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const isAuthenticated = !!userProfile;

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* 로고 */}
        <div className="flex-shrink-0">
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold text-white">
              <span>BRIDGE</span>
              <span className="text-[#cba967]">M</span>
              <span>AKERS</span>
            </span>
          </Link>
        </div>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <div className="flex items-center space-x-12">
            {headerMenus.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-[#cba967] px-3 py-2 text-base font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 우측 버튼들 */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          <LanguageSwitcher locale={locale} />
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          ) : (
            <NewAuthButtons locale={locale} />
          )}
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="flex items-center space-x-4 md:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#cba967] focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">메뉴 열기</span>
            {/* 햄버거 메뉴 아이콘 */}
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-black`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-4 space-y-2 border-t border-[#222]">
          {/* 기본 메뉴 */}
          {headerMenus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {/* 구분선 */}
          <div className="border-t border-[#222] my-2"></div>

          {/* 인증 관련 메뉴 */}
          {isLoading ? (
            <div className="py-3 px-3">
              <div className="w-full h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ) : (
            <NewAuthButtons locale={locale} isMobile={true} />
          )}
        </div>
      </div>
    </header>
  );
} 