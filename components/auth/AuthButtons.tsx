"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { validateLocale } from "@/lib/i18n";
import LoginModal from "./LoginModal";
import ProfileModal from "./ProfileModal";
import { UserProfile } from "@/lib/supabase";
import { ChevronDownIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, HomeIcon } from "@heroicons/react/24/outline";

interface AuthButtonsProps {
  locale: string;
  isMobile?: boolean;
}

const AuthButtons = ({ locale, isMobile = false }: AuthButtonsProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
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

  const handleLoginClick = () => {
    setInitialMode('login');
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setInitialMode('register');
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      setUser(null);
      setIsProfileMenuOpen(false);
      // 로그아웃 후 페이지 새로고침
      window.location.reload();
    }
  };

  const handleProfileClick = () => {
    if (!isMobile) {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    }
  };

  const navigateTo = (path: string) => {
    setIsProfileMenuOpen(false);
    router.push(`/${locale}${path}`);
  };

  const openProfileModal = () => {
    setIsProfileMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <div className="w-8 h-8 animate-pulse bg-gray-300 rounded-full"></div>;
  }

  // 로그인된 사용자가 있을 때 표시할 UI
  if (user) {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-2 w-full mt-4">
          <div className="flex items-center space-x-2 px-3 py-2">
            <div className="w-8 h-8 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium">
              {user.first_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              {user.first_name} {user.last_name}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 text-left bg-transparent text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] transition-colors text-sm rounded-lg"
          >
            로그아웃
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={handleProfileClick}
          >
            {user.profile_image_url ? (
              <div className="relative">
                <img 
                  src={user.profile_image_url} 
                  alt={`${user.first_name} ${user.last_name}`} 
                  className="w-8 h-8 rounded-full object-cover border border-[#cba967] group-hover:border-white transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                  <ChevronDownIcon className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-8 h-8 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium group-hover:bg-[#d4b67a] transition-colors">
                  {user.first_name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                  <ChevronDownIcon className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* 프로필 설정 메뉴 */}
          {isProfileMenuOpen && (
            <div 
              ref={profileMenuRef}
              className="absolute top-10 right-0 w-64 bg-[#0d1526] border border-[rgba(203,169,103,0.3)] shadow-lg rounded-lg overflow-hidden z-50 animate-fadeIn"
              style={{ animationDuration: '0.2s' }}
            >
              <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center space-x-3">
                  {user.profile_image_url ? (
                    <img 
                      src={user.profile_image_url} 
                      alt={`${user.first_name} ${user.last_name}`} 
                      className="w-10 h-10 rounded-full object-cover border border-[#cba967]"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-[#C7C7CC] text-xs">{user.email}</div>
                    {user.company_name && (
                      <div className="text-[#cba967] text-xs mt-1">{user.company_name}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => navigateTo('/dashboard')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm flex items-center"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  대시보드
                </button>
                <button 
                  onClick={openProfileModal}
                  className="w-full px-4 py-2 text-left text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm flex items-center"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  프로필 설정
                </button>
                <button 
                  onClick={() => navigateTo('/settings')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm flex items-center"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  계정 관리
                </button>
                <div className="my-1 border-t border-[rgba(255,255,255,0.1)]"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] transition-all text-sm flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 프로필 설정 모달 */}
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
        />
      </>
    );
  }

  // 모바일 메뉴에 표시되는 버튼 (세로 방향)
  if (isMobile) {
    return (
      <>
        <div className="flex flex-col space-y-2 w-full mt-4">
          <button
            onClick={handleLoginClick}
            className="w-full py-2.5 px-4 bg-transparent border border-[#cba967] text-[#cba967] rounded-lg hover:bg-[rgba(203,169,103,0.1)] transition-colors text-sm"
          >
            로그인
          </button>
          <button
            onClick={handleRegisterClick}
            className="w-full py-2.5 px-4 bg-[#cba967] text-black rounded-lg hover:bg-[#b99a58] transition-colors text-center text-sm font-medium"
          >
            회원가입
          </button>
        </div>
        
        {/* 로그인 모달 */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          locale={locale}
          initialMode={initialMode}
        />
      </>
    );
  }

  // 데스크톱 메뉴에 표시되는 버튼 (가로 방향)
  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={handleLoginClick}
          className="py-2 px-4 bg-transparent border border-[#cba967] text-[#cba967] rounded-full hover:bg-[rgba(203,169,103,0.1)] transition-colors text-sm"
        >
          로그인
        </button>
        <button
          onClick={handleRegisterClick}
          className="py-2 px-4 bg-[#cba967] text-black rounded-full hover:bg-[#b99a58] transition-colors text-sm font-medium"
        >
          회원가입
        </button>
      </div>
      
      {/* 로그인 모달 */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        locale={locale}
        initialMode={initialMode}
      />
    </>
  );
};

export default AuthButtons; 