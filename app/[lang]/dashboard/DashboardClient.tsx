"use client";

import { useState, useEffect } from "react";
import { UserRole } from "@/types/supabase";
import { Locale } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthContext";

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
  const { userProfile, isLoading } = useAuth();
  
  // 디버깅용 로그 추가
  useEffect(() => {
    if (userProfile) {
      console.log('🔍 DashboardClient: 사용자 정보 확인', {
        id: userProfile.id,
        email: userProfile.email,
        user_level: userProfile.user_level,
        has_profile_image: userProfile.profile_image_url ? true : false
      });
    }
  }, [userProfile]);
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">{translations.welcome}</h1>
      {userProfile && (
        <div className="bg-[#1a2234] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">{translations.userLevel}</h2>
          <p className="text-[#cba967]">
            {userProfile.user_level === UserRole.ADMIN && translations.admin}
            {userProfile.user_level === UserRole.PREMIUM && translations.premium}
            {userProfile.user_level === UserRole.BASIC && translations.basic}
          </p>
        </div>
      )}
      
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