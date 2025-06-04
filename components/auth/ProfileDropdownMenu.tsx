"use client";

import { UserProfile } from '@/components/auth/AuthContext';
import { UserRole } from '@/types/supabase';
import { HomeIcon, UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useMessages } from '@/hooks/useMessages';

interface ProfileDropdownMenuProps {
  user: UserProfile;
  locale: string;
  onClose: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  isDashboard?: boolean;
}

const ProfileDropdownMenu = ({ 
  user, 
  locale, 
  onClose, 
  onLogout, 
  onProfileClick,
  isDashboard = false
}: ProfileDropdownMenuProps) => {
  const messages = useMessages();
  
  return (
    <div 
      className="w-64 bg-[#0d1526] border border-[rgba(203,169,103,0.3)] shadow-lg rounded-lg overflow-hidden z-50 animate-fadeIn"
      style={{ animationDuration: '0.2s' }}
    >
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-start space-x-3">
          {user.profile_image_url ? (
            <img 
              src={user.profile_image_url} 
              alt={`${user.first_name || ''} ${user.last_name || ''}`} 
              className="w-10 h-10 rounded-full object-cover border border-[#cba967] mt-1"
            />
          ) : (
            <div className="w-10 h-10 bg-[#cba967] rounded-full flex items-center justify-center text-black font-medium mt-1">
              {(user.first_name || '').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-white font-medium">{user.first_name || ''} {user.last_name || ''}</div>
            <div className="text-[#C7C7CC] text-xs">{user.email}</div>
            <div className="text-[#cba967] text-xs mt-1 flex items-center">
              {user.user_level === UserRole.ADMIN 
                ? (messages?.profile?.role?.admin || '관리자')
                : (messages?.profile?.role?.member || '기본 회원')
              }
              {user.email_confirmed_at ? (
                <span className="ml-2 text-[#4CAF50]">{messages?.profile?.emailStatus?.verified || '✓ 인증됨'}</span>
              ) : (
                <span className="ml-2 text-[#ff6b6b]">{messages?.profile?.emailStatus?.unverified || '미인증'}</span>
              )}
            </div>
            {user.company_name && (
              <div className="text-[#C7C7CC] text-xs mt-1">
                {user.company_name}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="py-2">
        <button 
          onClick={() => {
            onClose();
            if (isDashboard) {
              window.open(`/${locale}`, '_blank');
            } else {
              window.open(`/${locale}/dashboard`, '_blank');
            }
          }}
          className="w-full px-4 py-2 text-left text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm flex items-center"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          {isDashboard 
            ? (messages?.profile?.menu?.mainPage || '메인페이지로')
            : (messages?.profile?.menu?.dashboard || '대시보드')
          }
        </button>
        <button 
          onClick={() => {
            onClose();
            onProfileClick();
          }}
          className="w-full px-4 py-2 text-left text-white hover:bg-[rgba(203,169,103,0.1)] hover:text-[#cba967] transition-all text-sm flex items-center"
        >
          <UserIcon className="w-4 h-4 mr-2" />
          {messages?.profile?.menu?.settings || '프로필 설정'}
        </button>
        <div className="my-1 border-t border-[rgba(255,255,255,0.1)]"></div>
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full px-4 py-2 text-left text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] transition-all text-sm flex items-center"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          {messages?.profile?.menu?.logout || '로그아웃'}
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdownMenu; 