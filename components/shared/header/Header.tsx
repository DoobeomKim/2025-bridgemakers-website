"use client";

import Link from "next/link";
import LanguageSwitcher from "../language-switcher/LanguageSwitcher";
import { Locale } from "@/lib/i18n";
import { useState, useEffect } from "react";
import AuthButtons from '@/components/auth/AuthButtons';
import { getCurrentUser } from "@/lib/auth";
import { UserProfile } from "@/lib/supabase";

interface NavItem {
  label: string;
  href: string;
}

export default function Header({
  locale,
  translations,
}: {
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
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      setIsUserLoading(true);
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setCurrentUser(null);
      }
      setIsUserLoading(false);
    };

    fetchUser();
  }, []);

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

  const publicNavItems: NavItem[] = [
    { label: translations.about, href: `/${locale}/about` },
    { label: translations.services, href: `/${locale}/services` },
    { label: translations.work, href: `/${locale}/work` },
    { label: translations.contact, href: `/${locale}/contact` },
  ];

  const isAuthenticated = !!currentUser;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-300 ${scrolled ? 'bg-black shadow-[0_2px_4px_rgba(0,0,0,0.1)]' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${locale}`} className="font-bold tracking-[0.5px] leading-[1.2] text-white font-roboto">
              <span className="text-[20px] md:text-[24px]">BRIDGE</span>
              <span className="text-[20px] md:text-[24px] text-[#cba967]">M</span>
              <span className="text-[20px] md:text-[24px]">AKERS</span>
            </Link>
          </div>

          {/* 데스크탑 네비게이션 - 900px 이상에서만 표시 */}
          <nav className="hidden lg:ml-16 lg:flex lg:space-x-8">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center px-1 pt-1 text-[16px] font-medium text-white hover:text-[#cba967] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 데스크탑 우측 메뉴 (언어 선택, 로그인 등) - 900px 이상에서만 표시 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <LanguageSwitcher locale={locale} />
            {isUserLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
            ) : (
              <AuthButtons locale={locale} />
            )}
          </div>

          {/* 모바일과 태블릿 메뉴 토글 버튼 - 900px 미만에서 표시 */}
          <div className="flex items-center space-x-4 lg:hidden">
            <LanguageSwitcher locale={locale} />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#cba967] focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* 아이콘: 메뉴 닫힘 (햄버거) */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* 아이콘: 메뉴 열림 (X) */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 및 태블릿 메뉴 - 900px 미만에서 표시 */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-black`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-4 space-y-2 border-t border-[#222]">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href={`/${locale}/dashboard`}
              className="block py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {translations.dashboard}
            </Link>
          )}
          <div className="pt-2 border-t border-[#222]">
            {isUserLoading ? (
              <div className="w-8 h-8 ml-3 rounded-full bg-gray-600 animate-pulse"></div>
            ) : (
              <AuthButtons locale={locale} isMobile={true} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 