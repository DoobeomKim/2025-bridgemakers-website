"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthContext';
import LoginModal from './LoginModal';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import ProfileModal from './ProfileModal';

interface AuthButtonsProps {
  locale: string;
  isMobile?: boolean;
}

const AuthButtons = ({ locale, isMobile = false }: AuthButtonsProps) => {
  const { user, userProfile, signOut, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLoginClick = () => {
    setInitialMode('login');
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setInitialMode('register');
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
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

  if (!userProfile) {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <button
            onClick={handleLoginClick}
            className="block w-full py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors text-left"
          >
            로그인
          </button>
          <button
            onClick={handleRegisterClick}
            className="block w-full py-3 px-3 text-base font-medium text-white hover:text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] rounded-md transition-colors text-left"
          >
            회원가입
          </button>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            initialMode={initialMode}
            locale={locale}
          />
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoginClick}
            className="text-sm text-white hover:text-[#cba967] transition-colors"
          >
            로그인
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={handleRegisterClick}
            className="text-sm text-white hover:text-[#cba967] transition-colors"
          >
            회원가입
          </button>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          initialMode={initialMode}
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
          {userProfile?.profile_image_url ? (
            <div className="relative">
              <img 
                src={userProfile.profile_image_url} 
                alt={`${userProfile.first_name || ''} ${userProfile.last_name || ''}`} 
                className="w-8 h-8 rounded-full object-cover border border-[#cba967] group-hover:border-white transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-[#cba967] group-hover:border-white transition-colors">
                <ChevronDownIcon className="w-3 h-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-8 h-8 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium group-hover:bg-[#d4b67a] transition-colors">
                {userProfile?.first_name?.charAt(0).toUpperCase() || '?'}
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
              user={userProfile}
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
          user={userProfile}
          locale={locale}
        />
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={initialMode}
        locale={locale}
      />
    </>
  );
};

export default AuthButtons; 