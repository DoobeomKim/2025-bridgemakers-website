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
  const [initialWaitComplete, setInitialWaitComplete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 초기 1초 대기 처리
  useEffect(() => {
    console.log('⏰ NewAuthButtons 진입 - 1초 대기 시작...');
    const timer = setTimeout(() => {
      console.log('✅ NewAuthButtons 1초 대기 완료 - 인증 체크 시작');
      setInitialWaitComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // userProfile을 ProfileDropdownMenu가 기대하는 형식으로 변환
  const compatibleUserProfile = userProfile && user ? {
    id: userProfile.id,
    email: userProfile.email,
    first_name: userProfile.first_name,
    last_name: userProfile.last_name,
    profile_image_url: userProfile.profile_image_url,
    user_level: userProfile.user_level,
    company_name: userProfile.company_name,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at,
    // 이메일 인증 상태는 user_metadata.email_verified만 사용
    email_confirmed_at: user.user_metadata?.email_verified ? new Date().toISOString() : null
  } : null;

  // shouldShowLogin 조건 체크 직전 상태 로그
  useEffect(() => {
    if (initialWaitComplete && !isLoading) {
      console.log('🔍 NewAuthButtons: shouldShowLogin 계산 직전 상태 체크');
      console.log('1️⃣ user 존재:', {
        exists: !!user,
        userId: user?.id || 'null',
        email: user?.email || 'null',
        emailVerified: user?.user_metadata?.email_verified || false
      });
      console.log('2️⃣ userProfile 존재:', {
        exists: !!userProfile,
        profileId: userProfile?.id || 'null',
        email: userProfile?.email || 'null',
        firstName: userProfile?.first_name || 'null',
        lastName: userProfile?.last_name || 'null'
      });
      console.log('3️⃣ compatibleUserProfile 존재:', {
        exists: !!compatibleUserProfile,
        createdSuccessfully: !!(userProfile && user),
        compatibleId: compatibleUserProfile?.id || 'null'
      });
      console.log('🎯 최종 결과:', {
        shouldShowLogin: !user || !userProfile || !compatibleUserProfile,
        조건1_user없음: !user,
        조건2_userProfile없음: !userProfile,
        조건3_compatible없음: !compatibleUserProfile,
        실제표시할내용: (!user || !userProfile || !compatibleUserProfile) ? '로그인버튼' : '프로필'
      });
    }
  }, [initialWaitComplete, isLoading, user, userProfile, compatibleUserProfile]);

  // 디버깅용 로그 추가 (1초 대기 완료 후에만 실행)
  useEffect(() => {
    if (initialWaitComplete) {
      console.log('🔍 NewAuthButtons: 상태 업데이트 (1초 대기 후)', {
        auth: {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          email_verified: user?.user_metadata?.email_verified
        },
        profile: {
          hasProfile: !!userProfile,
          profileId: userProfile?.id,
          email: userProfile?.email,
          first_name: userProfile?.first_name,
          last_name: userProfile?.last_name,
          company_name: userProfile?.company_name || '없음',
          profile_image_url: userProfile?.profile_image_url
        },
        compatible: {
          hasCompatible: !!compatibleUserProfile,
          compatibleId: compatibleUserProfile?.id
        },
        isLoading,
        shouldShowLogin: !user || !userProfile || !compatibleUserProfile,
        initialWaitComplete
      });
    }
  }, [initialWaitComplete, user, userProfile, compatibleUserProfile, isLoading]);

  const handleLoginClick = () => {
    console.log('🖱️ 로그인 버튼 클릭');
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 로그아웃 처리 시작...');
      setIsDropdownOpen(false);
      
      // 로그아웃 처리
      await signOut();
      console.log('✅ 로그아웃 완료, 홈페이지로 이동...');
      
      // 약간의 지연 후 홈페이지로 이동 (상태 업데이트 완료 보장)
      setTimeout(() => {
        window.location.href = `/${locale}`;
      }, 100);
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
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

  // 1초 대기 중이거나 로딩 중일 때는 아무것도 표시하지 않음
  if (!initialWaitComplete || isLoading) {
    return null;
  }

  // 1초 대기 완료 후 인증 상태에 따라 UI 표시
  if (!user || !userProfile || !compatibleUserProfile) {
    if (isMobile) {
      return (
        <>
          <div className="space-y-2">
            <button
              onClick={handleLoginClick}
              className="block w-full py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors text-left"
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

  // 모바일에서는 간소화된 프로필 바 형태
  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between py-3 px-3 text-white bg-[rgba(203,169,103,0.05)] rounded-md">
          {/* 프로필 정보 */}
          <div className="flex items-center space-x-3">
            {compatibleUserProfile?.profile_image_url ? (
              <img 
                src={compatibleUserProfile.profile_image_url} 
                alt={`${compatibleUserProfile.first_name || ''} ${compatibleUserProfile.last_name || ''}`} 
                className="w-8 h-8 rounded-full object-cover border border-[#cba967]"
              />
            ) : (
              <div className="w-8 h-8 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium">
                {compatibleUserProfile?.first_name ? compatibleUserProfile.first_name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <span className="text-sm font-medium">
              {compatibleUserProfile?.first_name && compatibleUserProfile?.last_name 
                ? `${compatibleUserProfile.first_name} ${compatibleUserProfile.last_name}`
                : compatibleUserProfile?.email?.split('@')[0] || '사용자'
              }
            </span>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-1 text-xs">
            <button
              onClick={handleProfileClick}
              className="px-2 py-1 text-[#cba967] hover:text-white hover:bg-[rgba(203,169,103,0.2)] rounded transition-colors"
            >
              설정
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={handleLogout}
              className="px-2 py-1 text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
        
        {/* 프로필 설정 모달 (설정 버튼 클릭 시) */}
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={compatibleUserProfile as UserProfile}
        />
        
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