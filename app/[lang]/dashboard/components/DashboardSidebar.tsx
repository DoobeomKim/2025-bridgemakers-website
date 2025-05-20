"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import ProfileModal from "@/components/auth/ProfileModal";

interface SidebarProps {
  locale: Locale;
  translations: {
    dashboard: string;
    profile: string;
    settings: string;
    projects: string;
    logout: string;
    admin: string;
    [key: string]: string;
  };
  isMobile?: boolean;
}

export default function DashboardSidebar({ locale, translations, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 사용자 권한 체크
  useEffect(() => {
    getCurrentUser().then(res => {
      if (res.success && res.user) {
        setUserLevel(res.user.user_level);
        setCurrentUser(res.user);
      } else {
        setUserLevel(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });
  }, []);

  const isActive = (path: string) => {
    return pathname === `/${locale}/dashboard${path}`;
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push(`/${locale}`);
    } else {
      console.error('로그아웃 실패:', result.error);
      // 실패하더라도 홈으로 리다이렉트
      router.push(`/${locale}`);
    }
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  // 기본 메뉴 아이템
  const menuItems = [
    {
      name: translations.dashboard || "대시보드",
      href: `/${locale}/dashboard`,
      icon: HomeIcon,
      active: isActive(""),
      onClick: undefined
    },
    {
      name: translations.profile || "프로필 설정",
      icon: UserIcon,
      active: isActive("/profile"),
      onClick: handleProfileClick
    },
    {
      name: translations.projects || "프로젝트",
      href: `/${locale}/dashboard/projects`,
      icon: DocumentTextIcon,
      active: isActive("/projects"),
      onClick: undefined
    },
    {
      name: translations.settings || "계정 관리",
      href: `/${locale}/dashboard/settings`,
      icon: Cog6ToothIcon,
      active: isActive("/settings"),
      onClick: undefined
    },
  ];

  // Admin 권한이 있으면 관리자 메뉴 추가
  if (userLevel?.toLowerCase() === "admin") {
    menuItems.unshift({
      name: translations.admin || "관리자",
      href: `/${locale}/dashboard/admin`,
      icon: ShieldCheckIcon,
      active: isActive("/admin"),
      onClick: undefined
    });
  }

  if (isMobile) {
    return (
      <>
        <div className="bg-[#111827] text-white border-t border-[#1f2937]">
          <nav className="flex justify-between items-center h-14 px-2">
            {!loading && menuItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-medium transition-colors ${
                    item.active
                      ? "text-[#cba967]"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-medium transition-colors ${
                    item.active
                      ? "text-[#cba967]"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </Link>
              )
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-16 py-1 text-[10px] font-medium text-red-400 hover:text-red-300"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mb-0.5" />
              <span className="truncate w-full text-center">{translations.logout || "로그아웃"}</span>
            </button>
          </nav>
        </div>
        {isProfileModalOpen && currentUser && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={currentUser}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-64 h-full bg-[#111827] text-white flex flex-col">
        {/* 로고 섹션 */}
        <div className="p-4 border-b border-[#1f2937]">
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold text-white">
              <span>BRIDGE</span>
              <span className="text-[#cba967]">M</span>
              <span>AKERS</span>
            </span>
          </Link>
        </div>

        {/* 메뉴 섹션 */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {!loading && menuItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    item.active
                      ? "bg-[#1f2937] text-[#cba967]"
                      : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    item.active
                      ? "bg-[#1f2937] text-[#cba967]"
                      : "text-gray-300 hover:bg-[#1f2937] hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            ))}
          </nav>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="p-4 border-t border-[#1f2937]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-[#1f2937] rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            {translations.logout || "로그아웃"}
          </button>
        </div>
      </div>

      {/* 프로필 설정 모달 */}
      {isProfileModalOpen && currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      )}
    </>
  );
} 