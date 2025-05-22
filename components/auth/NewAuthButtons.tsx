"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth, UserProfile } from '@/components/auth/AuthContext';
import AuthLoginModal from './AuthLoginModal';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import ProfileModal from './ProfileModal';
import { UserRole } from '@/types/supabase';

interface AuthButtonsProps {
  locale: string;
  isMobile?: boolean;
}

const NewAuthButtons = ({ locale, isMobile = false }: AuthButtonsProps) => {
  const { user, userProfile, signOut, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // userProfile을 ProfileDropdownMenu가 기대하는 형식으로 변환
  const compatibleUserProfile = userProfile ? {
    id: userProfile.id,
    email: userProfile.email,
    first_name: userProfile.first_name,
    last_name: userProfile.last_name,
    profile_image_url: userProfile.profile_image_url,
    user_level: userProfile.user_level,
    company_name: userProfile.company_name,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at
  } : null;

  // 디버깅용 로그 추가
  useEffect(() => {
    if (userProfile) {
      console.log('🔍 NewAuthButtons: userProfile 데이터', {
        id: userProfile.id,
        email: userProfile.email,
        company_name: userProfile.company_name || '없음',
        created_at: userProfile.created_at
      });
    }
  }, [userProfile]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.refresh();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user || !userProfile || !compatibleUserProfile) {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <button
            onClick={handleLoginClick}
            className="block w-full py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors text-left"
          >
            로그인
          </button>
          <AuthLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            initialMode="login"
            locale={locale}
          />
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center">
          <button
            onClick={handleLoginClick}
            className="text-sm text-white hover:text-[#cba967] transition-colors"
          >
            로그인
          </button>
        </div>
        <AuthLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          initialMode="login"
          locale={locale}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {compatibleUserProfile?.profile_image_url ? (
            <div className="relative">
              <img 
                src={compatibleUserProfile.profile_image_url} 
                alt={`${compatibleUserProfile.first_name || ''} ${compatibleUserProfile.last_name || ''}`} 
                className="w-8 h-8 rounded-full object-cover border border-[#cba967] group-hover:border-white transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                <ChevronDownIcon className="w-3 h-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-8 h-8 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium group-hover:bg-[#d4b67a] transition-colors">
                {compatibleUserProfile?.first_name ? compatibleUserProfile.first_name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                <ChevronDownIcon className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* 프로필 설정 메뉴 */}
        {isDropdownOpen && (
          <div ref={dropdownRef} className="absolute top-10 right-0">
            <ProfileDropdownMenu
              user={compatibleUserProfile as UserProfile}
              locale={locale}
              onClose={() => setIsDropdownOpen(false)}
              onLogout={handleLogout}
              onProfileClick={handleProfileClick}
            />
          </div>
        )}

        {/* 프로필 설정 모달 */}
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={compatibleUserProfile as UserProfile}
        />
      </div>
      <AuthLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode="login"
        locale={locale}
      />
    </>
  );
};

export default NewAuthButtons; 