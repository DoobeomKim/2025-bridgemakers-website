"use client";

import { useState, useEffect } from "react";
import { UserLevel, UserProfile } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { Locale } from "@/lib/i18n";

// 타입 정의
type Translations = {
  dashboard: string;
  welcome: string;
  userLevel: string;
  admin: string;
  premium: string;
  basic: string;
  [key: string]: string;
};

interface DashboardClientProps {
  locale: Locale;
  translations: Translations;
}

export default function DashboardClient({ locale, translations }: DashboardClientProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase를 통한 인증 상태 확인
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const result = await getCurrentUser();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setUserLevel(result.user.user_level as UserLevel);
        console.log('Supabase 사용자 정보 로드됨:', result.user);
      } else {
        setCurrentUser(null);
        setUserLevel(null);
        console.log('Supabase 사용자 정보 없음:', result.error || '인증되지 않음');
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      {/* 환영 카드 */}
      <div className="bg-[#1A2234] rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-3">{translations.welcome}</h2>
        <p className="text-gray-300 mb-4">
          {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}님, ` : ''} 
          브릿지메이커스 대시보드에 오신 것을 환영합니다.
        </p>
        
        {userLevel && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-400">{translations.userLevel}:</span>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
              bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
              {userLevel === UserLevel.ADMIN ? translations.admin : 
                userLevel === UserLevel.PREMIUM ? translations.premium : 
                translations.basic}
            </div>
          </div>
        )}
      </div>
      
      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1A2234] rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">프로젝트</h3>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">진행중인 프로젝트</p>
        </div>
        
        <div className="bg-[#1A2234] rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">알림</h3>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">새로운 알림</p>
        </div>
        
        <div className="bg-[#1A2234] rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">메시지</h3>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">읽지 않은 메시지</p>
        </div>
      </div>
      
      {/* 최근 활동 */}
      <div className="bg-[#1A2234] rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">최근 활동</h3>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">아직 활동 내역이 없습니다.</div>
          <p className="text-sm text-gray-500">
            새로운 프로젝트를 시작하거나 기존 프로젝트를 확인해보세요.
          </p>
        </div>
      </div>
    </div>
  );
} 